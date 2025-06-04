
// src/app/api/toolkit/test/route.ts
import { type NextRequest, NextResponse } from 'next/server';

// IMPORTANT: Replace this with the actual base URL of your No-Code Architect's Toolkit API
const TOOLKIT_API_BASE_URL = process.env.TOOLKIT_API_BASE_URL || 'YOUR_DIGITAL_OCEAN_API_BASE_URL_HERE';
// IMPORTANT: Replace this with your actual API key or a secure way to fetch it
const TOOLKIT_API_KEY = process.env.TOOLKIT_API_KEY || 'YOUR_TOOLKIT_API_KEY_HERE';

export async function GET(request: NextRequest) {
  if (TOOLKIT_API_BASE_URL === 'YOUR_DIGITAL_OCEAN_API_BASE_URL_HERE') {
    return NextResponse.json({ error: 'Toolkit API base URL not configured.' }, { status: 500 });
  }
  if (TOOLKIT_API_KEY === 'YOUR_TOOLKIT_API_KEY_HERE' && TOOLKIT_API_BASE_URL !== 'http://localhost:8000') { // Allow unauthed for local dev if needed
    return NextResponse.json({ error: 'Toolkit API key not configured.' }, { status: 500 });
  }

  try {
    const response = await fetch(`${TOOLKIT_API_BASE_URL}/v1/toolkit/test`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add Authorization header if your API requires it, e.g., Bearer token
        'X-API-Key': TOOLKIT_API_KEY, // Assuming your API uses an X-API-Key header
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Error from toolkit API:', errorData);
      return NextResponse.json({ error: `Toolkit API error: ${response.statusText}`, details: errorData }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error calling toolkit test API:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to connect to the toolkit API.', details: errorMessage }, { status: 500 });
  }
}
