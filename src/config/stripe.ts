import { loadStripe, Stripe } from '@stripe/stripe-js';

// Stripe publishable key - should be added to .env
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_publishable_key_here';

// Initialize Stripe
let stripePromise: Promise<Stripe | null>;

const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(stripePublishableKey);
  }
  return stripePromise;
};

export default getStripe;

// Stripe configuration constants
export const STRIPE_CONFIG = {
  publishableKey: stripePublishableKey,
  currency: 'usd',
  country: 'US',
};