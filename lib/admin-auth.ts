'use client';

import { supabase } from './supabase';

export const signInAdmin = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  const { data: adminData } = await supabase
    .from('admin_users')
    .select('*')
    .eq('id', data.user.id)
    .eq('is_active', true)
    .maybeSingle();

  if (!adminData) {
    await supabase.auth.signOut();
    throw new Error('Unauthorized: Not an admin user');
  }

  return { user: data.user, admin: adminData };
};

export const signOutAdmin = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentAdmin = async () => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: adminData } = await supabase
    .from('admin_users')
    .select('*')
    .eq('id', user.id)
    .eq('is_active', true)
    .maybeSingle();

  if (!adminData) return null;

  return { user, admin: adminData };
};
