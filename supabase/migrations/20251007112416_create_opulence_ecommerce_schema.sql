/*
  # Opulence by Seruya E-Commerce Database Schema

  ## Overview
  Complete database schema for a luxury e-commerce platform with product management, 
  order processing, customer data, and admin functionality.

  ## New Tables
  
  ### 1. categories
    - `id` (uuid, primary key) - Unique category identifier
    - `name` (text) - Category name (e.g., "Kitchen Ware")
    - `slug` (text, unique) - URL-friendly category identifier
    - `description` (text) - Category description
    - `image_url` (text) - Category banner/thumbnail image
    - `display_order` (integer) - Sort order for display
    - `is_active` (boolean) - Whether category is visible
    - `created_at` (timestamptz) - Creation timestamp
    - `updated_at` (timestamptz) - Last update timestamp

  ### 2. products
    - `id` (uuid, primary key) - Unique product identifier
    - `category_id` (uuid, foreign key) - Reference to categories table
    - `name` (text) - Product name
    - `slug` (text, unique) - URL-friendly product identifier
    - `description` (text) - Product description
    - `price` (decimal) - Product price in KES
    - `compare_at_price` (decimal) - Original price for discount display
    - `sku` (text, unique) - Stock keeping unit
    - `stock_quantity` (integer) - Available inventory
    - `images` (jsonb) - Array of product images
    - `specifications` (jsonb) - Product specs and features
    - `is_featured` (boolean) - Featured product flag
    - `is_active` (boolean) - Product visibility
    - `created_at` (timestamptz) - Creation timestamp
    - `updated_at` (timestamptz) - Last update timestamp

  ### 3. customers
    - `id` (uuid, primary key) - Unique customer identifier
    - `email` (text, unique) - Customer email
    - `phone` (text) - Customer phone number
    - `full_name` (text) - Customer full name
    - `created_at` (timestamptz) - Registration timestamp
    - `updated_at` (timestamptz) - Last update timestamp

  ### 4. orders
    - `id` (uuid, primary key) - Unique order identifier
    - `order_number` (text, unique) - Human-readable order number
    - `customer_id` (uuid, foreign key) - Reference to customers table
    - `customer_name` (text) - Customer name at time of order
    - `customer_email` (text) - Customer email
    - `customer_phone` (text) - Customer phone
    - `delivery_address` (text) - Delivery address
    - `delivery_city` (text) - Delivery city
    - `subtotal` (decimal) - Order subtotal
    - `delivery_fee` (decimal) - Delivery cost
    - `total` (decimal) - Total order amount
    - `status` (text) - Order status (pending, confirmed, shipped, delivered, cancelled)
    - `payment_method` (text) - Payment method
    - `payment_status` (text) - Payment status (pending, paid, failed)
    - `notes` (text) - Order notes/special instructions
    - `created_at` (timestamptz) - Order creation timestamp
    - `updated_at` (timestamptz) - Last update timestamp

  ### 5. order_items
    - `id` (uuid, primary key) - Unique order item identifier
    - `order_id` (uuid, foreign key) - Reference to orders table
    - `product_id` (uuid, foreign key) - Reference to products table
    - `product_name` (text) - Product name at time of order
    - `product_sku` (text) - Product SKU at time of order
    - `quantity` (integer) - Quantity ordered
    - `unit_price` (decimal) - Price per unit at time of order
    - `total_price` (decimal) - Total line item price
    - `created_at` (timestamptz) - Creation timestamp

  ### 6. admin_users
    - `id` (uuid, primary key) - Links to auth.users
    - `email` (text) - Admin email
    - `full_name` (text) - Admin full name
    - `role` (text) - Admin role (super_admin, admin)
    - `is_active` (boolean) - Admin account status
    - `created_at` (timestamptz) - Creation timestamp
    - `updated_at` (timestamptz) - Last update timestamp

  ## Security
    - RLS enabled on all tables
    - Public read access for products and categories
    - Authenticated admin access for management operations
    - Customer access restricted to own data
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  image_url text DEFAULT '',
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  price decimal(10,2) NOT NULL DEFAULT 0,
  compare_at_price decimal(10,2),
  sku text UNIQUE NOT NULL,
  stock_quantity integer DEFAULT 0,
  images jsonb DEFAULT '[]'::jsonb,
  specifications jsonb DEFAULT '{}'::jsonb,
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  phone text,
  full_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  delivery_address text NOT NULL,
  delivery_city text NOT NULL,
  subtotal decimal(10,2) NOT NULL DEFAULT 0,
  delivery_fee decimal(10,2) NOT NULL DEFAULT 0,
  total decimal(10,2) NOT NULL DEFAULT 0,
  status text DEFAULT 'pending',
  payment_method text DEFAULT 'mpesa',
  payment_status text DEFAULT 'pending',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_sku text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price decimal(10,2) NOT NULL DEFAULT 0,
  total_price decimal(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  role text DEFAULT 'admin',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Categories policies (public read, admin write)
CREATE POLICY "Anyone can view active categories"
  ON categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid() 
      AND admin_users.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid() 
      AND admin_users.is_active = true
    )
  );

-- Products policies (public read, admin write)
CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid() 
      AND admin_users.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid() 
      AND admin_users.is_active = true
    )
  );

-- Customers policies
CREATE POLICY "Customers can view own data"
  ON customers FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Admins can view all customers"
  ON customers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid() 
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Anyone can create customer record"
  ON customers FOR INSERT
  WITH CHECK (true);

-- Orders policies
CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid() 
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid() 
      AND admin_users.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid() 
      AND admin_users.is_active = true
    )
  );

-- Order items policies
CREATE POLICY "Anyone can create order items"
  ON order_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid() 
      AND admin_users.is_active = true
    )
  );

-- Admin users policies
CREATE POLICY "Admins can view other admins"
  ON admin_users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid() 
      AND admin_users.is_active = true
    )
  );

CREATE POLICY "Super admins can manage admins"
  ON admin_users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid() 
      AND admin_users.role = 'super_admin'
      AND admin_users.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid() 
      AND admin_users.role = 'super_admin'
      AND admin_users.is_active = true
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
