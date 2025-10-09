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
    auth.uid() IS NOT NULL AND
    (auth.jwt()->>'role' = 'admin' OR auth.jwt()->>'role' = 'super_admin')
  )
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    (auth.jwt()->>'role' = 'admin' OR auth.jwt()->>'role' = 'super_admin')
  );

-- Products policies
CREATE POLICY "Public can view active products"
  ON products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  TO authenticated
  USING (
    auth.uid() IS NOT NULL AND
    (auth.jwt()->>'role' = 'admin' OR auth.jwt()->>'role' = 'super_admin')
  )
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    (auth.jwt()->>'role' = 'admin' OR auth.jwt()->>'role' = 'super_admin')
  );

-- Orders policies
CREATE POLICY "Users can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    auth.uid() IS NOT NULL AND
    (auth.jwt()->>'role' = 'admin' OR auth.jwt()->>'role' = 'super_admin')
  );

CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IS NOT NULL AND
    (auth.jwt()->>'role' = 'admin' OR auth.jwt()->>'role' = 'super_admin')
  )
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    (auth.jwt()->>'role' = 'admin' OR auth.jwt()->>'role' = 'super_admin')
  );

-- Order items policies
CREATE POLICY "Users can create order items"
  ON order_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    auth.uid() IS NOT NULL AND
    (auth.jwt()->>'role' = 'admin' OR auth.jwt()->>'role' = 'super_admin')
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
    auth.uid() IS NOT NULL AND
    (auth.jwt()->>'role' = 'admin' OR auth.jwt()->>'role' = 'super_admin')
  );

CREATE POLICY "Admins can update all customers"
  ON customers FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IS NOT NULL AND
    (auth.jwt()->>'role' = 'admin' OR auth.jwt()->>'role' = 'super_admin')
  )
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    (auth.jwt()->>'role' = 'admin' OR auth.jwt()->>'role' = 'super_admin')
  );

-- Step 4: Ensure your admin user has the role in auth.users user_metadata
-- In Supabase Auth > Users, edit your admin user and set user_metadata to:
-- {"role": "super_admin", "full_name": "Admin User"}

-- Step 5: Verify the setup
-- Check that your admin user has role in user_metadata in auth.users

