-- Add testimonials management and emergency services settings to admin_settings
INSERT INTO admin_settings (key, value, description) VALUES 
('customer_testimonials', '{
  "title": "What Our Customers Say",
  "subtitle": "Real experiences from thousands of satisfied customers across the city",
  "testimonials": [
    {
      "name": "Sarah Johnson",
      "location": "Downtown",
      "service": "House Cleaning",
      "rating": 5,
      "comment": "Exceptional service! The team was professional, thorough, and left my home spotless. I will definitely book again."
    },
    {
      "name": "Mike Chen",
      "location": "Suburbs",
      "service": "Plumbing",
      "rating": 5,
      "comment": "Quick response and fixed the issue perfectly. Great communication and fair pricing. Highly recommended!"
    },
    {
      "name": "Emma Davis",
      "location": "Midtown",
      "service": "Electrical",
      "rating": 5,
      "comment": "Professional electrician arrived on time and completed the work efficiently. Very satisfied with the quality."
    },
    {
      "name": "James Wilson",
      "location": "East Side",
      "service": "AC Repair",
      "rating": 5,
      "comment": "Excellent service during a hot summer day. Fast, reliable, and reasonably priced. Thank you!"
    }
  ]
}', 'Customer testimonials section configuration'),

('site_stats', '{
  "happy_customers": "50K",
  "happy_customers_label": "Happy Customers",
  "happy_customers_subtitle": "Served with excellence",
  "average_rating": "4.9/5",
  "average_rating_label": "Average Rating", 
  "average_rating_subtitle": "From verified reviews",
  "redo_rate": "< 1%",
  "redo_rate_label": "Redo Rate",
  "redo_rate_subtitle": "Exceptional first-time success",
  "cities": "50"
}', 'Site statistics configuration'),

('emergency_services', '{
  "title": "Need immediate assistance?",
  "subtitle": "Our 24/7 emergency services are ready to help"
}', 'Emergency services section configuration')

ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = now();