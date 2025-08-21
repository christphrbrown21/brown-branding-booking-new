import { NextResponse } from 'next/server';

// Environment variables used to connect to GoHighLevel (GHL). These should be
// configured in your deployment platform. See the project README for
// instructions on obtaining and setting these values.
const GHL_API_BASE = process.env.GHL_API_BASE ?? 'https://services.leadconnectorhq.com';
const GHL_API_KEY = process.env.GHL_API_KEY;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;
const GHL_PIPELINE_ID = process.env.GHL_PIPELINE_ID;
const GHL_STAGE_ID = process.env.GHL_STAGE_ID;

/**
 * Handle booking submissions. This endpoint receives the booking details from
 * the client, upserts the contact in GoHighLevel, and optionally creates an
 * opportunity in a specified pipeline stage. Returning a simple OK response
 * tells the frontend that the CRM update was attempted. Any errors are
 * logged and an error response is returned.
 */
export async function POST(req: Request) {
  try {
    const booking = await req.json();
    if (!GHL_API_KEY || !GHL_LOCATION_ID) {
      console.warn('GHL environment variables are not configured');
      return NextResponse.json({ ok: false, error: 'GHL not configured' }, { status: 500 });
    }

    // Prepare the contact payload using booking details. We map basic fields and
    // include custom fields for category and package to help with segmentation.
    const contactPayload: any = {
      locationId: GHL_LOCATION_ID,
      email: booking.details?.email,
      phone: booking.details?.phone,
      firstName: booking.details?.name,
      customFields: [
        { id: 'category', value: booking.category },
        { id: 'package', value: booking.package?.label || '' },
      ],
      tags: ['Booking', 'BrownBranding'],
    };

    // Create or update the contact in GoHighLevel. The API will handle
    // deduplication based on email or phone.
    const contactRes = await fetch(`${GHL_API_BASE}/contacts/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GHL_API_KEY}`,
        Version: '2021-07-28',
        Accept: 'application/json',
      },
      body: JSON.stringify(contactPayload),
    });
    const contactData = await contactRes.json();
    const contactId = contactData?.contact?.id;

    // Optionally create an opportunity in a pipeline if IDs are provided.
    if (GHL_PIPELINE_ID && GHL_STAGE_ID && contactId) {
      const oppPayload = {
        locationId: GHL_LOCATION_ID,
        pipelineId: GHL_PIPELINE_ID,
        stageId: GHL_STAGE_ID,
        name: `Booking: ${booking.category} — ${booking.package?.label || ''}`,
        monetaryValue: booking.total || 0,
        status: 'open',
        contactId,
      };
      await fetch(`${GHL_API_BASE}/opportunities/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${GHL_API_KEY}`,
          Version: '2021-07-28',
          Accept: 'application/json',
        },
        body: JSON.stringify(oppPayload),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Error processing booking', err);
    return NextResponse.json({ ok: false, error: err.message || 'Invalid request' }, { status: 400 });
  }
}