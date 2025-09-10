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
    console.log('🔍 Verify payment function started');

    // Initialize Supabase clients
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Try to get authenticated user (optional for guest payments)
    let user = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      try {
        const token = authHeader.replace("Bearer ", "");
        const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
        
        if (!userError && userData.user) {
          user = userData.user;
          console.log('👤 User authenticated:', user.email);
        }
      } catch (authError) {
        console.log('🔄 No auth header, processing guest payment verification');
      }
    }

    // Parse request body
    const { sessionId } = await req.json();
    
    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    console.log('🔍 Verifying session:', sessionId);

    // Initialize Stripe
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (!session) {
      throw new Error("Session not found");
    }

    console.log('📋 Session status:', session.payment_status);

    if (session.payment_status === 'paid') {
      console.log('✅ Payment confirmed for session:', sessionId);
      
      // Parse metadata from session
      const cartItems = session.metadata?.cart_items ? JSON.parse(session.metadata.cart_items) : [];
      const guestInfo = session.metadata?.guest_info ? JSON.parse(session.metadata.guest_info) : {};
      const userId = session.metadata?.user_id !== 'guest' ? session.metadata?.user_id : null;
      
      // Create order record
      const { data: orderData, error: orderError } = await supabaseAdmin
        .from('orders')
        .insert({
          user_id: userId,
          total_amount: session.amount_total ? session.amount_total / 100 : 0,
          currency: session.currency || 'usd',
          payment_intent_id: session.payment_intent as string,
          stripe_payment_intent_id: session.payment_intent as string,
          status: 'confirmed',
          payment_status: 'paid',
          cart_items: cartItems,
          customer_info: guestInfo,
          booking_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          booking_time: '10:00:00',
          service_name: cartItems.length > 1 ? `${cartItems.length} Services Booked` : cartItems[0]?.serviceName || 'Service',
          provider_name: cartItems.length > 1 ? 'Multiple Providers' : cartItems[0]?.providerName || 'Provider',
          customer_name: guestInfo?.name || session.customer_details?.name || user?.user_metadata?.full_name || 'Customer',
          customer_phone: guestInfo?.phone || user?.user_metadata?.phone || '',
          customer_address: guestInfo?.address || session.customer_details?.address?.line1 || 'Address not provided',
          special_instructions: guestInfo?.instructions || ''
        })
        .select()
        .single();

      if (orderError) {
        console.error('❌ Error creating order:', orderError);
        throw orderError;
      }

      console.log('✅ Order created successfully:', orderData.id);
      
      return new Response(JSON.stringify({
        success: true,
        orderId: orderData.id,
        sessionId: sessionId,
        paymentStatus: session.payment_status,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      console.log('❌ Payment not completed, status:', session.payment_status);
      
      return new Response(JSON.stringify({
        success: false,
        error: `Payment not completed. Status: ${session.payment_status}`,
        paymentStatus: session.payment_status,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

  } catch (error) {
    console.error("❌ Verify payment error:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message || "Failed to verify payment" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});