// Simple Supabase test script
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://emgrqgsvjcdfqdvojizt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtZ3JxZ3N2amNkZnFkdm9qaXp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MTA3OTMsImV4cCI6MjA3NTM4Njc5M30.fHZJErkBmhjvuhGZtQsaPY4VTuEzpnKa7RrWVZo59fw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test products query
    console.log('Fetching products...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .limit(5);
    
    if (productsError) {
      console.error('Products error:', productsError);
    } else {
      console.log('Products fetched successfully:', products?.length || 0, 'products');
      if (products && products.length > 0) {
        console.log('Sample product:', products[0]);
      }
    }

    // Test categories query
    console.log('Fetching categories...');
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name, slug')
      .eq('is_active', true)
      .limit(5);
    
    if (categoriesError) {
      console.error('Categories error:', categoriesError);
    } else {
      console.log('Categories fetched successfully:', categories?.length || 0, 'categories');
      if (categories && categories.length > 0) {
        console.log('Sample category:', categories[0]);
      }
    }

  } catch (error) {
    console.error('Connection test failed:', error);
  }
}

testConnection();