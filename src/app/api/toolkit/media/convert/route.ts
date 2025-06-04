
// src/app/api/toolkit/media/convert/route.ts
import { type NextRequest, NextResponse } from 'next/server';

const TOOLKIT_API_BASE_URL = process.env.TOOLKIT_API_BASE_URL;
const TOOLKIT_API_KEY = process.env.TOOLKIT_API_KEY;

export async function POST(request: NextRequest) {
  if (!TOOLKIT_API_BASE_URL || !TOOLKIT_API_KEY) {
    return NextResponse.json({ error: 'Toolkit API environment variables not configured.' }, { status: 500 });
  }

  try {
    // In a real scenario, you'd extract specific parameters for conversion
    // For now, we'll assume it might take a generic payload or specific fields
    const payload = await request.json(); 

    if (!payload) { // Basic check, refine as needed
      return NextResponse.json({ error: 'Missing payload for media conversion.' }, { status: 400 });
    }

    const response = await fetch(`${TOOLKIT_API_BASE_URL}/v1/media/convert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': TOOLKIT_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Error from toolkit API (media/convert):', errorData);
      return NextResponse.json({ error: `Toolkit API error: ${response.statusText}`, details: errorData }, { status: response.status });
    }

    const data = await response.json(); // Assuming this might return a jobId or direct result
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error calling toolkit media/convert API:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to call the toolkit media/convert API.', details: errorMessage }, { status: 500 });
  }
}
