'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface Customer {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: 'user' | 'admin' | 'super_admin';
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  customer: Customer | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, phone?: string, isAdmin?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  refetchCustomer: () => Promise<void>;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const { toast } = useToast();

  // Inactivity timeout (30 minutes)
  const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

  // Activity tracking functions
  const updateActivity = useCallback(() => {
    setLastActivity(Date.now());
  }, []);

  const checkInactivity = useCallback(async () => {
    const now = Date.now();
    if (now - lastActivity > INACTIVITY_TIMEOUT && user) {
      console.log('User inactive for too long, signing out');
      await signOut();
    }
  }, [lastActivity, user]);

  // Activity event listeners
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    const handleActivity = () => updateActivity();

    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [updateActivity]);

  // Inactivity check interval
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(checkInactivity, 60 * 1000); // Check every minute
    return () => clearInterval(interval);
  }, [checkInactivity, user]);

  const fetchCustomer = async (userId: string, userEmail?: string, userMetadata?: any, retryCount = 0): Promise<Customer | null> => {
    if (!userEmail) {
      console.log('No email provided to fetchCustomer');
      return null;
    }

    try {
      // Normalize email for comparison
      const normalizedEmail = userEmail.toLowerCase().trim();

      // Check user metadata for role
      let adminData = null;
      if (userMetadata?.role === 'admin' || userMetadata?.role === 'super_admin') {
        adminData = { role: userMetadata.role, is_active: true };
      }

      // Also check for known admin emails as fallback
      if (!adminData && normalizedEmail === 'admin@opulence.com') {
        adminData = { role: 'super_admin', is_active: true };
      }

      // Get customer data with cache control
      const { data: customerData, error } = await supabase
        .from('customers')
        .select('*')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (error) {
        console.error('Error fetching customer:', error);
        
        // Retry once on network errors
        if (retryCount === 0 && (error.message.includes('network') || error.message.includes('timeout'))) {
          console.log('Retrying customer fetch...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          return fetchCustomer(userId, userEmail, userMetadata, 1);
        }
        
        return null;
      }

      if (customerData) {
        // Return customer with role information
        return {
          ...customerData,
          role: adminData ? adminData.role : 'user',
          is_active: adminData ? adminData.is_active : true,
        };
      }

      // Customer record not found
      console.log('No customer found for email:', userEmail);
      return null;
    } catch (error) {
      console.error('Unexpected error in fetchCustomer:', error);
      return null;
    }
  };

  // Session refresh mechanism
  const refreshSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Session refresh failed:', error);
        return false;
      }
      return !!session;
    } catch (error) {
      console.error('Error refreshing session:', error);
      return false;
    }
  };

  // Auto-refresh session before expiry
  useEffect(() => {
    let refreshTimer: NodeJS.Timeout;
    let refreshInterval: NodeJS.Timeout;

    const setupSessionRefresh = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.expires_at) {
          const expiresAt = session.expires_at * 1000;
          const now = Date.now();
          const timeUntilExpiry = expiresAt - now;

          // Refresh 5 minutes before expiry
          const refreshTime = Math.max(timeUntilExpiry - 5 * 60 * 1000, 60 * 1000);

          if (refreshTime > 0) {
            refreshTimer = setTimeout(async () => {
              console.log('Auto-refreshing session...');
              const refreshed = await refreshSession();
              if (refreshed) {
                setupSessionRefresh(); // Setup next refresh
              }
            }, refreshTime);
          }
        }
      } catch (error) {
        console.error('Error setting up session refresh:', error);
      }
    };

    // Also set up periodic session validation every 10 minutes
    const setupPeriodicCheck = () => {
      refreshInterval = setInterval(async () => {
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error || !session) {
            console.log('Periodic session check failed, signing out');
            await supabase.auth.signOut();
            setUser(null);
            setCustomer(null);
            return;
          }

          // Validate session is still valid
          if (session.expires_at && session.expires_at * 1000 < Date.now()) {
            console.log('Session expired during periodic check, signing out');
            await supabase.auth.signOut();
            setUser(null);
            setCustomer(null);
            return;
          }

          console.log('Periodic session check passed');
        } catch (error) {
          console.error('Error during periodic session check:', error);
        }
      }, 10 * 60 * 1000); // Check every 10 minutes
    };

    if (user) {
      setupSessionRefresh();
      setupPeriodicCheck();
    }

    return () => {
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [user]);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        setLoading(true);

        // Check localStorage for persisted auth state
        const persistedAuth = localStorage.getItem('opulence_auth');
        let persistedData = null;

        if (persistedAuth) {
          try {
            persistedData = JSON.parse(persistedAuth);
            // Check if persisted data is still valid (not expired - 7 days)
            const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
            if (persistedData.expiresAt && persistedData.expiresAt < Date.now()) {
              localStorage.removeItem('opulence_auth');
              persistedData = null;
            }
          } catch (error) {
            console.error('Error parsing persisted auth:', error);
            localStorage.removeItem('opulence_auth');
          }
        }

        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Session error:', sessionError);
          setUser(null);
          setCustomer(null);
          setLoading(false);
          return;
        }

        // Check if session exists
        if (session?.user) {
          // Set user first
          setUser(session.user);

          // Fetch customer data
          const customerData = await fetchCustomer(session.user.id, session.user.email, session.user.user_metadata);

          // Only set customer if data was successfully fetched
          if (customerData) {
            setCustomer(customerData);
            // Persist auth state for 7 days
            const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
            localStorage.setItem('opulence_auth', JSON.stringify({
              user: session.user,
              customer: customerData,
              expiresAt: Date.now() + sevenDaysMs,
            }));
          } else {
            console.log('Failed to fetch customer data, signing out');
            await supabase.auth.signOut();
            setUser(null);
            setCustomer(null);
          }
        } else if (persistedData) {
          // Use persisted data if no active session but we have persisted data
          console.log('Using persisted auth data, validating session...');

          // Try to refresh the session to ensure it's still valid
          const refreshed = await refreshSession();
          if (refreshed) {
            console.log('Session refreshed successfully with persisted data');
            // Get the refreshed session data
            const { data: { session: newSession } } = await supabase.auth.getSession();
            if (newSession?.user) {
              setUser(newSession.user);
              // Re-fetch customer data to ensure it's current
              const customerData = await fetchCustomer(newSession.user.id, newSession.user.email, newSession.user.user_metadata);
              if (customerData) {
                setCustomer(customerData);
                // Update persisted data with fresh session
                const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
                localStorage.setItem('opulence_auth', JSON.stringify({
                  user: newSession.user,
                  customer: customerData,
                  expiresAt: Date.now() + sevenDaysMs,
                }));
              } else {
                console.log('Failed to fetch customer data after refresh, clearing persisted data');
                localStorage.removeItem('opulence_auth');
                setUser(null);
                setCustomer(null);
              }
            } else {
              console.log('No valid session after refresh, clearing persisted data');
              localStorage.removeItem('opulence_auth');
              setUser(null);
              setCustomer(null);
            }
          } else {
            console.log('Session refresh failed, clearing persisted data');
            localStorage.removeItem('opulence_auth');
            setUser(null);
            setCustomer(null);
          }
        } else {
          setUser(null);
          setCustomer(null);
        }
      } catch (error) {
        console.error('Error during session initialization:', error);
        setUser(null);
        setCustomer(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);

        try {
          if (event === 'SIGNED_OUT' || !session?.user) {
            console.log('User signed out or no session');
            setUser(null);
            setCustomer(null);
            localStorage.removeItem('opulence_auth');
            setLoading(false);
            return;
          }

          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            console.log('User signed in or token refreshed');

            // For TOKEN_REFRESHED, assume the session is already refreshed and valid
            // Only check expiry for SIGNED_IN events
            let currentSession = session;

            if (event === 'SIGNED_IN' && session.expires_at && session.expires_at * 1000 < Date.now()) {
              console.log('Session expired, attempting to refresh...');
              const refreshed = await refreshSession();
              if (refreshed) {
                // Get the refreshed session
                const { data: { session: newSession } } = await supabase.auth.getSession();
                if (newSession) {
                  currentSession = newSession;
                  console.log('Session refreshed successfully');
                } else {
                  console.log('Refresh failed, signing out');
                  await supabase.auth.signOut();
                  setUser(null);
                  setCustomer(null);
                  localStorage.removeItem('opulence_auth');
                  setLoading(false);
                  return;
                }
              } else {
                console.log('Refresh failed, signing out');
                await supabase.auth.signOut();
                setUser(null);
                setCustomer(null);
                localStorage.removeItem('opulence_auth');
                setLoading(false);
                return;
              }
            }

            setUser(currentSession.user);
            const customerData = await fetchCustomer(currentSession.user.id, currentSession.user.email, currentSession.user.user_metadata);

            if (customerData) {
              setCustomer(customerData);
              // Persist auth state for 7 days
              const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
              localStorage.setItem('opulence_auth', JSON.stringify({
                user: currentSession.user,
                customer: customerData,
                expiresAt: Date.now() + sevenDaysMs,
              }));
              console.log('Customer data loaded successfully');
            } else {
              console.log('Failed to fetch customer data after auth change, signing out');
              await supabase.auth.signOut();
              setUser(null);
              setCustomer(null);
              localStorage.removeItem('opulence_auth');
            }
          }
        } catch (error) {
          console.error('Error handling auth state change:', error);
          // On error, sign out to be safe
          try {
            await supabase.auth.signOut();
          } catch (signOutError) {
            console.error('Error signing out after auth error:', signOutError);
          }
          setUser(null);
          setCustomer(null);
        } finally {
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Check if it's an email confirmation error
        if (error.message.includes('Email not confirmed') || error.message.includes('confirm')) {
          throw new Error('Please check your email and click the confirmation link before signing in.');
        }
        throw error;
      }

      // Check if user email is confirmed
      if (!data.user.email_confirmed_at) {
        await supabase.auth.signOut();
        throw new Error('Please confirm your email address before signing in.');
      }

      console.log('Sign in successful, user:', data.user.id, data.user.email);

      let customerData = await fetchCustomer(data.user.id, data.user.email, data.user.user_metadata);
      console.log('Initial fetchCustomer result:', customerData);

      // If no customer record exists, try to create one (fallback for signup issues)
      if (!customerData) {
        console.log('No customer record found, attempting to create one...');
        const userEmail = data.user.email || email;
        console.log('Creating customer with email:', userEmail.toLowerCase().trim());

        // Try to insert first
        let { data: newCustomer, error: customerError } = await supabase
          .from('customers')
          .insert({
            email: userEmail.toLowerCase().trim(),
            full_name: data.user.user_metadata?.full_name || userEmail.split('@')[0],
            phone: data.user.user_metadata?.phone || '',
          })
          .select()
          .single();

        // If insert failed due to duplicate, try to update instead
        if (customerError && customerError.code === '23505') { // unique constraint violation
          console.log('Email already exists, updating instead...');
          const { data: updatedCustomer, error: updateError } = await supabase
            .from('customers')
            .update({
              full_name: data.user.user_metadata?.full_name || userEmail.split('@')[0],
              phone: data.user.user_metadata?.phone || '',
            })
            .eq('email', userEmail.toLowerCase().trim())
            .select()
            .single();

          newCustomer = updatedCustomer;
          customerError = updateError;
        }

        console.log('Customer creation result:', { newCustomer, customerError });

        if (!customerError && newCustomer) {
          console.log('Customer created successfully:', newCustomer);

          // Check if this user is an admin from metadata
          let adminData = null;
          const userMetadata = data.user.user_metadata;
          if (userMetadata?.role === 'admin' || userMetadata?.role === 'super_admin') {
            adminData = { role: userMetadata.role, is_active: true };
          }

          // Also check for known admin emails as fallback
          const userEmail = data.user.email || email;
          if (!adminData && userEmail.toLowerCase() === 'admin@opulence.com') {
            console.log('Recognized known admin email, granting super_admin access');
            adminData = { role: 'super_admin', is_active: true };
          }

          console.log('Admin check result:', adminData);

          // Use the newly created customer data directly
          customerData = {
            ...newCustomer,
            role: adminData ? adminData.role : 'user',
            is_active: adminData ? adminData.is_active : true,
          };

          console.log('Final customerData:', customerData);
        } else {
          console.error('Failed to create customer record:', customerError);
          console.error('Error details:', customerError?.message, customerError?.details, customerError?.hint);
        }
      }

      if (!customerData) {
        console.error('Still no customerData after creation attempt');
        await supabase.auth.signOut();
        throw new Error('Account setup incomplete. Please try again or contact support.');
      }

      console.log('Login successful with customerData:', customerData);

      toast({
        title: 'Welcome back!',
        description: `Hi ${customerData.full_name}!`,
      });
    } catch (error) {
      console.error('Sign in error:', error);
      toast({
        title: 'Sign in failed',
        description: (error as AuthError).message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    phone?: string,
    isAdmin = false
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        console.log('Creating customer record for:', { email, fullName, phone, isAdmin });

        // Create customer record with the auth user ID as the primary key
        const { error: customerError } = await supabase
          .from('customers')
          .insert({
            id: data.user.id, // Use the auth user ID as the customer ID
            email: email.toLowerCase().trim(),
            full_name: fullName,
            phone: phone || '',
            role: 'user',
            is_active: true,
          });

        if (customerError) {
          console.error('Error creating customer record:', customerError);
          // Don't delete the auth user, just log the error
          console.error('Customer record creation failed, but auth user created');
        } else {
          console.log('Customer record created successfully');
        }

        // If admin signup, also create admin_users record
        if (isAdmin) {
          const { error: adminError } = await supabase
            .from('admin_users')
            .insert({
              id: data.user.id,
              email,
              full_name: fullName,
              role: 'admin',
              is_active: true,
            });

          if (adminError) {
            console.error('Error creating admin record:', adminError);
            // Don't fail the signup if admin creation fails, just log it
          }
        }

        toast({
          title: 'Account created!',
          description: 'Please check your email to verify your account.',
        });
      }
    } catch (error) {
      console.error('Sign up error:', error);
      toast({
        title: 'Sign up failed',
        description: (error as AuthError).message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('Starting sign out process...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase sign out error:', error);
        throw error;
      }
      console.log('Supabase sign out successful');

      // Force clear local state immediately
      setUser(null);
      setCustomer(null);
      localStorage.removeItem('opulence_auth');

      toast({
        title: 'Signed out',
        description: 'You have been signed out successfully.',
      });
      console.log('Sign out completed successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: 'Sign out failed',
        description: (error as AuthError).message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const refetchCustomer = async () => {
    if (user) {
      const customerData = await fetchCustomer(user.id, user.email, user.user_metadata);
      setCustomer(customerData);
    }
  };

  const isAdmin = customer?.role === 'admin' || customer?.role === 'super_admin';
  const isSuperAdmin = customer?.role === 'super_admin';

  const value = {
    user,
    customer,
    loading,
    signIn,
    signUp,
    signOut,
    refetchCustomer,
    isAdmin,
    isSuperAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}