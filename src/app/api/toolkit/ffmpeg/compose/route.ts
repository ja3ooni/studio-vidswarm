
// src/app/api/toolkit/ffmpeg/compose/route.ts
import { type NextRequest, NextResponse } from 'next/server';

const TOOLKIT_API_BASE_URL = process.env.TOOLKIT_API_BASE_URL;
const TOOLKIT_API_KEY = process.env.TOOLKIT_API_KEY;

export async function POST(request: NextRequest) {
  if (!TOOLKIT_API_BASE_URL || !TOOLKIT_API_KEY) {
    return NextResponse.json({ error: 'Toolkit API environment variables not configured.' }, { status: 500 });
  }

  try {
    const { jsonDefinition } = await request.json();

    if (!jsonDefinition) {
      return NextResponse.json({ error: 'Missing jsonDefinition in request body.' }, { status: 400 });
    }

    const response = await fetch(`${TOOLKIT_API_BASE_URL}/v1/ffmpeg/compose`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': TOOLKIT_API_KEY,
      },
      body: JSON.stringify(jsonDefinition), // Send the whole jsonDefinition object
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Error from toolkit API (ffmpeg/compose):', errorData);
      return NextResponse.json({ error: `Toolkit API error: ${response.statusText}`, details: errorData }, { status: response.status });
    }

    const data = await response.json(); // Assuming this returns { jobId: "someId" }
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error calling toolkit ffmpeg/compose API:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to call the toolkit ffmpeg/compose API.', details: errorMessage }, { status: 500 });
  }
}
