
// src/app/api/toolkit/test/route.ts
import { type NextRequest, NextResponse } from 'next/server';

// IMPORTANT: Replace this with the actual base URL of your No-Code Architect's Toolkit API
const TOOLKIT_API_BASE_URL = process.env.TOOLKIT_API_BASE_URL;
// IMPORTANT: Replace this with your actual API key or a secure way to fetch it
const TOOLKIT_API_KEY = process.env.TOOLKIT_API_KEY;

// For debugging: Log to see if the environment variables are loaded on the server
console.log('[API Test Route] TOOLKIT_API_BASE_URL loaded:', !!TOOLKIT_API_BASE_URL);
console.log('[API Test Route] TOOLKIT_API_KEY loaded:', !!TOOLKIT_API_KEY);
if (!TOOLKIT_API_BASE_URL) {
  console.error('[API Test Route] TOOLKIT_API_BASE_URL is not defined. Check your .env file and ensure the server was restarted.');
}
if (!TOOLKIT_API_KEY) {
  console.error('[API Test Route] TOOLKIT_API_KEY is not defined. Check your .env file and ensure the server was restarted.');
}


export async function GET(request: NextRequest) {
  if (TOOLKIT_API_BASE_URL === 'YOUR_DIGITAL_OCEAN_API_BASE_URL_HERE' || !TOOLKIT_API_BASE_URL) {
    return NextResponse.json({ error: 'Toolkit API base URL not configured. Please check server logs and .env file.' }, { status: 500 });
  }
  // Allow unauthed for local dev if needed by setting TOOLKIT_API_KEY to a specific value like "local_dev_unauthed_DEPRECATED"
  // However, for actual testing against your DO API, a key is needed.
  if ((TOOLKIT_API_KEY === 'YOUR_TOOLKIT_API_KEY_HERE' || !TOOLKIT_API_KEY) && TOOLKIT_API_BASE_URL !== 'http://localhost:8000') { 
    return NextResponse.json({ error: 'Toolkit API key not configured. Please check server logs and .env file.' }, { status: 500 });
  }

  try {
    const response = await fetch(`${TOOLKIT_API_BASE_URL}/v1/toolkit/test`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': TOOLKIT_API_KEY, 
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
