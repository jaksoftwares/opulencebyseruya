-- Temporary fix for RLS policies to work with migrated admin users
-- Run this in your Supabase SQL editor if categories are not loading

-- Drop old policies
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;

-- Create new policy that works with customers table
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

-- Also update products policies
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

-- Update orders policies
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;

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

-- Update order_items policies
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

-- Update customers policies (for admin access)
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