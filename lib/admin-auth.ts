'use client';

import { supabase } from './supabase';

export const signInAdmin = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  // Check if user is the specific sales user
  if (data.user.id === 'de819e4d-efe6-4633-8498-0a1532efd965') {
    return {
      user: data.user,
      customer: {
        id: data.user.id,
        email: data.user.email || '',
        full_name: 'Pauline Seruya',
        phone: '+254 742 617 839',
        role: 'admin',
        is_active: true,
        created_at: data.user.created_at,
      }
    };
  }

  const { data: customerData } = await supabase
    .from('customers')
    .select('*')
    .eq('id', data.user.id)
    .eq('is_active', true)
    .maybeSingle();

  if (!customerData || (customerData.role !== 'admin' && customerData.role !== 'super_admin')) {
    await supabase.auth.signOut();
    throw new Error('Unauthorized: Not an admin user');
  }

  return { user: data.user, customer: customerData };
};

export const signOutAdmin = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentAdmin = async () => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Check if user is the specific sales user
  if (user.id === 'de819e4d-efe6-4633-8498-0a1532efd965') {
    return {
      user,
      customer: {
        id: user.id,
        email: user.email || '',
        full_name: 'Pauline Seruya',
        phone: '+254 742 617 839',
        role: 'admin',
        is_active: true,
        created_at: user.created_at,
      }
    };
  }

  const { data: customerData } = await supabase
    .from('customers')
    .select('*')
    .eq('id', user.id)
    .eq('is_active', true)
    .maybeSingle();

  if (!customerData || (customerData.role !== 'admin' && customerData.role !== 'super_admin')) return null;

  return { user, customer: customerData };
};
