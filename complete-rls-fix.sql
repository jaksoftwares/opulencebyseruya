-- COMPLETE RLS POLICIES FIX
-- This script completely removes old admin_users references and sets up proper policies

-- Step 1: Drop ALL existing policies that reference admin_users
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
DROP POLICY IF EXISTS "Admins can manage products" ON products;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;
DROP POLICY IF EXISTS "Admins can view other admins" ON admin_users;
DROP POLICY IF EXISTS "Super admins can manage admins" ON admin_users;
DROP POLICY IF EXISTS "Admins can view all customers" ON customers;

-- Step 2: Drop the admin_users table entirely since we're not using it
DROP TABLE IF EXISTS admin_users CASCADE;

-- Step 3: Create new policies that ONLY reference customers table
-- Categories policies
CREATE POLICY "Public can view active categories"
  ON categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customers c
      WHERE c.id = auth.uid()
      AND c.role IN ('admin', 'super_admin')
      AND c.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM customers c
      WHERE c.id = auth.uid()
      AND c.role IN ('admin', 'super_admin')
      AND c.is_active = true
    )
  );

-- Products policies
CREATE POLICY "Public can view active products"
  ON products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customers c
      WHERE c.id = auth.uid()
      AND c.role IN ('admin', 'super_admin')
      AND c.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM customers c
      WHERE c.id = auth.uid()
      AND c.role IN ('admin', 'super_admin')
      AND c.is_active = true
    )
  );

-- Orders policies
CREATE POLICY "Users can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customers c
      WHERE c.id = auth.uid()
      AND c.role IN ('admin', 'super_admin')
      AND c.is_active = true
    )
  );

CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customers c
      WHERE c.id = auth.uid()
      AND c.role IN ('admin', 'super_admin')
      AND c.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM customers c
      WHERE c.id = auth.uid()
      AND c.role IN ('admin', 'super_admin')
      AND c.is_active = true
    )
  );

-- Order items policies
CREATE POLICY "Users can create order items"
  ON order_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customers c
      WHERE c.id = auth.uid()
      AND c.role IN ('admin', 'super_admin')
      AND c.is_active = true
    )
  );

-- Customers policies
CREATE POLICY "Users can view own data"
  ON customers FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update own data"
  ON customers FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Anyone can create customer record"
  ON customers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all customers"
  ON customers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM customers c
      WHERE c.id = auth.uid()
      AND c.role IN ('admin', 'super_admin')
      AND c.is_active = true
    )
  );

-- Step 4: Ensure admin user exists in customers table with correct role
-- Replace 'your-admin-user-id-here' with the actual auth.users ID of your admin
-- You can find this in Supabase Auth > Users
INSERT INTO customers (id, email, full_name, role, is_active)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', 'Admin User'),
  'super_admin',
  true
FROM auth.users au
WHERE au.email = 'admin@opulence.com'  -- Replace with your admin email
ON CONFLICT (id) DO UPDATE SET
  role = 'super_admin',
  is_active = true;

-- Step 5: Verify the setup
-- Run this query to check if your admin user is properly set up:
-- SELECT id, email, role, is_active FROM customers WHERE role IN ('admin', 'super_admin');