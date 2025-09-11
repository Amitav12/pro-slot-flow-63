// UI Text Constants - Align Design System Compliant
// Component-first, multi-platform, RTL-ready home services experience

export const UI_TEXT = {
  // Authentication & Onboarding
  AUTH: {
    WELCOME: {
      headline: "Your home services, simplified",
      subtitle: "Book trusted professionals for cleaning, repairs, beauty and more",
      cta: {
        primary: "Get Started",
        secondary: "Sign In"
      }
    },
    LOGIN: {
      headline: "Welcome back",
      inputs: {
        mobile: "Mobile number",
        password: "Password"
      },
      cta: {
        primary: "Sign In"
      },
      links: {
        forgotPassword: "Forgot password?",
        createAccount: "Create account"
      }
    },
    REGISTER: {
      headline: "Create your account",
      fields: {
        fullName: "Full name",
        mobile: "Mobile number",
        email: "Email (optional)",
        password: "Password"
      },
      cta: {
        primary: "Create Account"
      },
      legal: "By signing up you agree to our Terms & Privacy."
    },
    OTP: {
      headline: "Verify your number",
      subtitle: "Enter the 4-digit code sent to +91 XXXXX XXXXX",
      input: {
        placeholder: "____"
      },
      cta: {
        primary: "Verify"
      },
      links: {
        resend: "Resend code"
      }
    }
  },

  // Home Screen (Post Sign-in)
  HOME: {
    HEADER: {
      locationPicker: "Your location ▼",
      searchPlaceholder: "Search services",
      notifications: "Bell",
      cart: "Cart"
    },
    HERO: {
      greeting: "Hi [Name]!",
      mainMessage: "What can we help you with today?",
      trustBullets: [
        "✓ Verified",
        "✓ Transparent pricing",
        "✓ Quality guaranteed",
        "✓ Safe & secure"
      ]
    },
    CATEGORIES: {
      title: "Services",
      items: [
        {
          icon: "🏠",
          name: "Home Cleaning",
          description: "Deep cleaning & more"
        },
        {
          icon: "💄",
          name: "Beauty & Wellness",
          description: "Salon at home"
        },
        {
          icon: "🔧",
          name: "Appliance Repair",
          description: "AC, fridge & more"
        },
        {
          icon: "🛠️",
          name: "Home Repairs",
          description: "Plumbing, electrical"
        },
        {
          icon: "🐛",
          name: "Pest Control",
          description: "Complete solutions"
        },
        {
          icon: "🎨",
          name: "Paint & Renovate",
          description: "Interior & exterior"
        }
      ],
      browseAll: "Browse all services →"
    },
    QUICK_ACTIONS: {
      items: [
        {
          icon: "📋",
          label: "Book again"
        },
        {
          icon: "🚨",
          label: "Emergency help"
        },
        {
          icon: "📅",
          label: "My bookings"
        },
        {
          icon: "💬",
          label: "Get help"
        }
      ]
    },
    RECOMMENDATIONS: {
      sections: [
        "Popular near you",
        "Recently viewed",
        "New this week"
      ]
    }
  },

  // Service Browsing
  BROWSE: {
    CATEGORY_PAGE: {
      title: "[Category] Services",
      controls: {
        filters: "Filters",
        sort: "Sort: Popularity ▼"
      },
      filterChips: {
        price: "₹0-5k",
        rating: "4+",
        when: ["Today", "Tomorrow", "Week"],
        type: ["Standard", "Premium", "Express"]
      }
    },
    PROVIDER_CARD: {
      rating: "⭐ 4.8 (120)",
      experience: "5 yr exp",
      distance: "2.3 km",
      pricing: "From ₹299",
      availability: "Available today",
      cta: {
        primary: "Book Now",
        secondary: "Details"
      }
    },
    SERVICE_DETAIL: {
      header: {
        title: "[Provider] – Expert [Service]",
        rating: "⭐ 4.8 (120+)",
        badge: "✓ Background verified"
      },
      included: {
        title: "What's included",
        items: [
          "Professional assessment",
          "Quality materials",
          "30-day guarantee",
          "Post-service cleanup"
        ]
      },
      pricing: {
        title: "Transparent pricing",
        startingPrice: "Starts ₹299",
        note: "Final quote after inspection"
      },
      actions: {
        primary: ["Add to Cart", "Book Service"],
        secondary: ["Chat", "Call", "❤️"]
      }
    }
  }
};

// Export individual sections for easier imports
export const { AUTH, HOME, BROWSE } = UI_TEXT;