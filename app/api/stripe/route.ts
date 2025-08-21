import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe with the secret key from environment variables. The key should
// be stored securely in your deployment platform (e.g. Vercel) and never
// exposed in the client code. See README for setup details.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  // The apiVersion must be a valid literal as defined in @types/stripe. Using
  // '2022-11-15' ensures compatibility with the installed Stripe package.
  apiVersion: '2022-11-15',
});

// Handle POST requests to create a new Stripe Checkout session. The client
// should send the total amount (in dollars) and optionally a description to
// describe the service being purchased. The route returns a URL that
// redirects the customer to Stripe’s hosted payment page.
export async function POST(req: Request) {
  try {
    const { total, description } = await req.json();
    if (!total) {
      return NextResponse.json(
        { ok: false, error: 'Missing total amount' },
        { status: 400 }
      );
    }

    // Convert the total into the smallest currency unit (cents) for Stripe.
    const amountInCents = Math.round(Number(total) * 100);

    // Create the checkout session. We use dynamic pricing via price_data. For
    // fixed pricing you could reference a price ID created in your Stripe
    // dashboard instead.
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: description || 'Brown Branding Booking',
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      // These URLs determine where your customer is redirected after payment.
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Stripe session creation error', err);
    return NextResponse.json(
      { ok: false, error: 'Unable to create checkout session' },
      { status: 500 }
    );
  }
}