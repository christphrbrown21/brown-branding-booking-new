import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-08-16',
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { total, description } = body;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http:' + '/' + '/localhost:3000';
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Booking Deposit',
              description: description || 'Service booking deposit',
            },
            unit_amount: Math.round((total ?? 0) * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/?success=true`,
      cancel_url: `${baseUrl}/?canceled=true`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
