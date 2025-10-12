'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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
  const { toast } = useToast();

  const fetchCustomer = async (userId: string, userEmail?: string, userMetadata?: any, retryCount = 0) => {
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

    const setupSessionRefresh = async () => {
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
    };

    if (user) {
      setupSessionRefresh();
    }

    return () => {
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }
    };
  }, [user]);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        setLoading(true);
        
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setUser(null);
          setCustomer(null);
          setLoading(false);
          return;
        }

        // Check if session exists and is valid
        if (session?.user) {
          // Validate session is not expired
          if (session.expires_at && session.expires_at * 1000 < Date.now()) {
            console.log('Session expired, signing out');
            await supabase.auth.signOut();
            setUser(null);
            setCustomer(null);
            setLoading(false);
            return;
          }

          // Validate the session with the server by making an authenticated request
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          
          if (userError || !user) {
            console.log('Session invalid, signing out:', userError?.message);
            await supabase.auth.signOut();
            setUser(null);
            setCustomer(null);
            setLoading(false);
            return;
          }

          // Set user first
          setUser(user);
          
          // Fetch customer data
          const customerData = await fetchCustomer(user.id, user.email, user.user_metadata);
          
          // Only set customer if data was successfully fetched
          if (customerData) {
            setCustomer(customerData);
          } else {
            console.log('Failed to fetch customer data, signing out');
            await supabase.auth.signOut();
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
            setUser(null);
            setCustomer(null);
            setLoading(false);
            return;
          }

          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            setUser(session.user);
            const customerData = await fetchCustomer(session.user.id, session.user.email, session.user.user_metadata);
            
            if (customerData) {
              setCustomer(customerData);
            } else {
              console.log('Failed to fetch customer data after auth change');
              await supabase.auth.signOut();
              setUser(null);
              setCustomer(null);
            }
          }
        } catch (error) {
          console.error('Error handling auth state change:', error);
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

        // Create customer record - using current schema for now
        // TODO: Update this after running the migration
        const { error: customerError } = await supabase
          .from('customers')
          .upsert({
            email: email.toLowerCase().trim(),
            full_name: fullName,
            phone: phone || '',
          }, {
            onConflict: 'email'
          });

        if (customerError) {
          console.error('Error creating customer record:', customerError);
          // Don't delete the auth user, just log the error
          console.error('Customer record creation failed, but auth user created');
        }

        console.log('Customer record created successfully');

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
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: 'Signed out',
        description: 'You have been signed out successfully.',
      });
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