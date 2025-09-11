-- Insert admin settings for all home page sections
INSERT INTO admin_settings (key, value, description) VALUES 
('hero_content', '{
  "title": "What can we help you with today?",
  "subtitle": "Hi there! Services available in your area",
  "description": "Book trusted professionals for cleaning, repairs, beauty and more. Quality service at your doorstep.",
  "trust_indicators": [
    {"icon": "Shield", "text": "Verified professionals"},
    {"icon": "DollarSign", "text": "Transparent pricing"},
    {"icon": "Award", "text": "Quality guaranteed"},
    {"icon": "Star", "text": "Safe & secure"}
  ],
  "service_cards": [
    {"emoji": "🏠", "title": "Home Cleaning", "description": "Deep cleaning & more", "color": "purple"},
    {"emoji": "💄", "title": "Beauty & Wellness", "description": "Salon at home", "color": "orange"},
    {"emoji": "🔧", "title": "Appliance Repair", "description": "AC, fridge & more", "color": "green"},
    {"emoji": "👨‍🍳", "title": "Personal Chef", "description": "Home cooking", "color": "blue"}
  ]
}', 'Hero section content and settings'),

('promotional_offers', '{
  "title": "Special Offers",
  "subtitle": "Limited time deals",
  "offers": [
    {
      "title": "First Time Customer",
      "discount": "20% OFF",
      "description": "Get 20% off your first booking",
      "code": "FIRST20",
      "expires": "2024-12-31"
    },
    {
      "title": "Weekend Special",
      "discount": "15% OFF",
      "description": "Weekend bookings get extra savings",
      "code": "WEEKEND15", 
      "expires": "2024-12-31"
    }
  ]
}', 'Promotional offers section content'),

('how_it_works', '{
  "title": "How It Works",
  "subtitle": "Simple steps to get your service done",
  "steps": [
    {
      "step": 1,
      "title": "Browse Services",
      "description": "Choose from hundreds of services",
      "icon": "Search"
    },
    {
      "step": 2,
      "title": "Book Professional",
      "description": "Select date, time and professional",
      "icon": "Calendar"
    },
    {
      "step": 3,
      "title": "Get Service Done",
      "description": "Professional arrives and completes the job",
      "icon": "CheckCircle"
    }
  ]
}', 'How it works section content'),

('customer_testimonials', '{
  "title": "What Our Customers Say",
  "subtitle": "Real reviews from real customers",
  "testimonials": [
    {
      "name": "Sarah Johnson",
      "rating": 5,
      "comment": "Amazing service! The cleaner was professional and thorough.",
      "service": "Home Cleaning",
      "location": "New York",
      "avatar": "https://images.unsplash.com/photo-1494790108755-2616b612b5bb?w=150&h=150&fit=crop&crop=face"
    },
    {
      "name": "Mike Chen",
      "rating": 5,
      "comment": "Quick AC repair, very satisfied with the work.",
      "service": "AC Repair",
      "location": "California",
      "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    {
      "name": "Lisa Williams",
      "rating": 5,
      "comment": "Best home spa experience ever!",
      "service": "Beauty & Wellness",
      "location": "Texas",
      "avatar": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
    }
  ]
}', 'Customer testimonials section content'),

('service_guarantee', '{
  "title": "Our Service Guarantee",
  "subtitle": "Your satisfaction is our priority",
  "guarantees": [
    {
      "icon": "Shield",
      "title": "Quality Assured",
      "description": "All professionals are verified and insured"
    },
    {
      "icon": "Clock",
      "title": "On-Time Service",
      "description": "We guarantee punctual service delivery"
    },
    {
      "icon": "RefreshCw",
      "title": "Satisfaction Guarantee",
      "description": "Not satisfied? We will make it right"
    },
    {
      "icon": "Star",
      "title": "5-Star Experience",
      "description": "Consistently rated excellent by customers"
    }
  ]
}', 'Service guarantee section content'),

('video_carousel', '{
  "title": "See Our Services in Action",
  "subtitle": "Watch how our professionals work",
  "videos": [
    {
      "title": "Professional Cleaning",
      "thumbnail": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop",
      "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "duration": "2:30"
    },
    {
      "title": "AC Repair Process",
      "thumbnail": "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop",
      "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "duration": "3:45"
    },
    {
      "title": "Beauty Treatment",
      "thumbnail": "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=300&fit=crop",
      "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "duration": "4:20"
    }
  ]
}', 'Video carousel section content'),

('site_stats', '{
  "customers": 15000,
  "providers": 2500,
  "rating": 4.8,
  "cities": 50
}', 'Site statistics displayed across the platform'),

('company_info', '{
  "name": "ServiceHub",
  "tagline": "Your trusted service marketplace",
  "phone": "+1 (555) 123-4567",
  "email": "support@servicehub.com",
  "address": "123 Service Street, Business District, NY 10001"
}', 'Company information and contact details')

ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = now();