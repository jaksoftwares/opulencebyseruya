/*
  # Seed Initial Data for Opulence by Seruya

  ## Description
  Populates the database with initial categories, sample products, and admin user.

  ## Data Inserted
    - 13 product categories
    - Sample products including kitchen ware items
    - Admin user (requires auth user to be created first)

  ## Admin Setup
  Before running this migration, create an admin user in Supabase Auth:
  Email: admin@opulence.com
  Password: Admin123!

  Then this migration will add them to the admin_users table.
*/

-- Insert categories
INSERT INTO categories (name, slug, description, display_order, is_active) VALUES
  ('Kitchen Ware', 'kitchen-ware', 'Premium cookware, dinnerware, and kitchen essentials for the modern home', 1, true),
  ('Travel Essentials', 'travel-essentials', 'Bags, luggage, and travel accessories for your adventures', 2, true),
  ('Kids Must Have', 'kids-must-have', 'Delightful items for children including toys, jewelry making sets, and more', 3, true),
  ('Bathroom Accessories', 'bathroom-accessories', 'Organize and beautify your bathroom with our stylish accessories', 4, true),
  ('Home Decor', 'home-decor', 'Elegant decorative pieces to enhance your living spaces', 5, true),
  ('Bedroom Essentials', 'bedroom-essentials', 'Comfortable and stylish bedroom furniture and accessories', 6, true),
  ('Health & Wellness', 'health-wellness', 'Products to support your health and well-being', 7, true),
  ('Storage Organizers', 'storage-organizers', 'Smart storage solutions to keep your home tidy', 8, true),
  ('Cleaning Tools', 'cleaning-tools', 'Efficient cleaning equipment for home and car', 9, true),
  ('Serving & Dining', 'serving-dining', 'Beautiful serving pieces and dining accessories', 10, true),
  ('Storage & Kitchen', 'storage-kitchen', 'Kitchen organization and storage solutions', 11, true),
  ('Travel & Lifestyle', 'travel-lifestyle', 'Lifestyle products for the modern traveler', 12, true),
  ('Gift Sets', 'gift-sets', 'Curated gift sets perfect for any occasion', 13, true)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample products
INSERT INTO products (category_id, name, slug, description, price, sku, stock_quantity, images, specifications, is_featured, is_active) 
SELECT 
  c.id,
  '24PCS Marble Ceramic Dinner Set',
  '24pcs-marble-ceramic-dinner-set',
  'Add a touch of luxury to your dining table with this 24-piece Marble Ceramic Dinner Set — perfect for everyday meals and entertaining in style.

✅ Includes:
• 6 Dinner Plates
• 6 Side Plates
• 6 Bowls
• 6 Cups (250ml each)

✅ Elegant marble pattern finish
✅ High-quality ceramic — durable & microwave safe

🚚 Delivery available countrywide.',
  8500.00,
  'DIN-24MCS-001',
  15,
  '[]'::jsonb,
  '{"material": "Ceramic", "finish": "Marble Pattern", "microwave_safe": true, "pieces": 24, "includes": ["6 Dinner Plates", "6 Side Plates", "6 Bowls", "6 Cups (250ml)"]}'::jsonb,
  true,
  true
FROM categories c WHERE c.slug = 'kitchen-ware'
ON CONFLICT (sku) DO NOTHING;

-- Insert admin user (requires auth user to exist first)
-- Note: Create the user in Supabase Auth dashboard first with email: admin@opulence.com
INSERT INTO admin_users (id, email, full_name, role, is_active)
SELECT
  au.id,
  'admin@opulence.com',
  'Opulence Admin',
  'super_admin',
  true
FROM auth.users au
WHERE au.email = 'admin@opulence.com'
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (category_id, name, slug, description, price, sku, stock_quantity, images, specifications, is_featured, is_active)
SELECT 
  c.id,
  '13PCS Granite Coating Kitchen Cookware Set',
  '13pcs-granite-coating-cookware-set',
  'Cook like a pro with this premium 13-piece Granite Coated Cookware Set — perfect for everyday home chefs and modern kitchen setups.

✅ Includes:
• 20cm Casserole
• 24cm Casserole
• 28cm Casserole
• 32cm Casserole
• 28cm Deep Frypan (without lid)
• 2pcs Cooking Shovels
• 2pcs Insulation Pads

✅ Durable granite coating — non-stick & easy to clean
✅ Heat-efficient & scratch-resistant

🚚 Delivery available countrywide.',
  16000.00,
  'COOK-13GCS-001',
  10,
  '[]'::jsonb,
  '{"material": "Granite Coating", "pieces": 13, "non_stick": true, "scratch_resistant": true, "includes": ["20cm Casserole", "24cm Casserole", "28cm Casserole", "32cm Casserole", "28cm Deep Frypan", "2 Cooking Shovels", "2 Insulation Pads"]}'::jsonb,
  true,
  true
FROM categories c WHERE c.slug = 'kitchen-ware'
ON CONFLICT (sku) DO NOTHING;
