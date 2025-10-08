'use client';

import { supabase } from './supabase';

export const signInAdmin = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

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

  const { data: customerData } = await supabase
    .from('customers')
    .select('*')
    .eq('id', user.id)
    .eq('is_active', true)
    .maybeSingle();

  if (!customerData || (customerData.role !== 'admin' && customerData.role !== 'super_admin')) return null;

  return { user, customer: customerData };
};
