-- Ensure all admin permissions are properly seeded
INSERT INTO admin_permissions (section, display_name, description, is_enabled, sort_order) VALUES
  ('users', 'User Management', 'Manage customer accounts and profiles', true, 1),
  ('providers', 'Provider Management', 'Manage service providers and approvals', true, 2),
  ('services', 'Service Management', 'Approve/reject provider services', true, 3),
  ('bookings', 'Booking Management', 'View and manage all bookings', true, 4),
  ('categories', 'Category Management', 'Manage service categories and subcategories', true, 5),
  ('locations', 'Location Management', 'Manage service locations', true, 6),
  ('reports', 'Reports & Analytics', 'View system reports and analytics', true, 7),
  ('payments', 'Payment Management', 'Manage payments and transactions', true, 8),
  ('notifications', 'Notification Center', 'Send system notifications', true, 9),
  ('settings', 'System Settings', 'Configure system-wide settings', true, 10),
  ('admins', 'Admin Management', 'Manage admin users and their system permissions', true, 11)
ON CONFLICT (section) 
DO UPDATE SET 
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  is_enabled = EXCLUDED.is_enabled,
  sort_order = EXCLUDED.sort_order;