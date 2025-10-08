-- Update customers table to integrate with Supabase Auth
-- Add role column and make id reference auth.users

ALTER TABLE customers
ADD COLUMN IF NOT EXISTS role text DEFAULT 'user',
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Update existing customers to have role 'user'
UPDATE customers SET role = 'user' WHERE role IS NULL;

-- Migrate admin_users to customers with admin role
INSERT INTO customers (id, email, full_name, phone, role, is_active, created_at, updated_at)
SELECT au.id, au.email, au.full_name, au.phone, 'admin', au.is_active, au.created_at, au.updated_at
FROM admin_users au
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  is_active = EXCLUDED.is_active;

-- Drop admin_users table as it's now integrated into customers
DROP TABLE IF EXISTS admin_users CASCADE;

-- Update RLS policies for customers
DROP POLICY IF EXISTS "Customers can view own data" ON customers;
DROP POLICY IF EXISTS "Admins can view all customers" ON customers;
DROP POLICY IF EXISTS "Anyone can create customer record" ON customers;

-- New policies for customers
CREATE POLICY "Users can view own data"
  ON customers FOR SELECT
  TO authenticated
  USING (id = auth.uid());

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

CREATE POLICY "Anyone can create customer record during signup"
  ON customers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own data"
  ON customers FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Update other policies to use customers table instead of admin_users
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
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

DROP POLICY IF EXISTS "Admins can manage products" ON products;
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

DROP POLICY IF EXISTS "Admins can view all customers" ON customers;
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

DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
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

DROP POLICY IF EXISTS "Admins can update orders" ON orders;
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

DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;
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

-- Remove old admin_users policies
DROP POLICY IF EXISTS "Admins can view other admins" ON admin_users;
DROP POLICY IF EXISTS "Super admins can manage admins" ON admin_users;