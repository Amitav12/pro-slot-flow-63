import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Create checkout session function started');

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Try to get authenticated user (optional for guest checkout)
    let userEmail = "guest@example.com";
    let userId = null;
    let isAuthenticated = false;
    
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      try {
        const token = authHeader.replace("Bearer ", "");
        const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
        
        if (!userError && userData.user?.email) {
          userEmail = userData.user.email;
          userId = userData.user.id;
          isAuthenticated = true;
          console.log('👤 User authenticated:', userEmail);
        }
      } catch (authError) {
        console.log('🔄 Auth failed, proceeding with guest checkout');
      }
    }

    if (!isAuthenticated) {
      console.log('👤 Processing guest checkout');
    }

    // Parse request body
    const { amount, currency = "usd", cartItems, metadata = {} } = await req.json();
    
    if (!amount || !cartItems || cartItems.length === 0) {
      throw new Error("Missing required parameters: amount and cartItems");
    }

    console.log('💰 Processing payment for:', { amount, currency, itemCount: cartItems.length });

    // Initialize Stripe
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // Check if customer exists (only for authenticated users)
    let customerId;
    if (isAuthenticated) {
      const customers = await stripe.customers.list({ 
        email: userEmail, 
        limit: 1 
      });
      
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        console.log('👤 Found existing customer:', customerId);
      } else {
        console.log('👤 No existing customer found, will create new one');
      }
    }

    // Convert cart items to Stripe line items
    const lineItems = cartItems.map((item: any) => ({
      price_data: {
        currency: currency,
        product_data: {
          name: item.serviceName,
          description: item.providerName ? `Service by ${item.providerName}` : 'Professional service',
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity || 1,
    }));

    console.log('🛒 Line items prepared:', lineItems.length);

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : userEmail,
      line_items: lineItems,
      mode: "payment", // One-time payment
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/cart`,
      metadata: {
        user_id: userId || 'guest',
        user_email: userEmail,
        is_authenticated: isAuthenticated.toString(),
        ...metadata,
      },
    });

    console.log('✅ Checkout session created:', session.id);

    return new Response(JSON.stringify({ 
      url: session.url,
      sessionId: session.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("❌ Create checkout session error:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "Failed to create checkout session" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});