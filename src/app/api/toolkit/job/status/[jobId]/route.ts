
// src/app/api/toolkit/job/status/[jobId]/route.ts
import { type NextRequest, NextResponse } from 'next/server';

const TOOLKIT_API_BASE_URL = process.env.TOOLKIT_API_BASE_URL;
const TOOLKIT_API_KEY = process.env.TOOLKIT_API_KEY;

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  if (!TOOLKIT_API_BASE_URL || !TOOLKIT_API_KEY) {
    return NextResponse.json({ error: 'Toolkit API environment variables not configured.' }, { status: 500 });
  }

  const jobId = params.jobId;

  if (!jobId) {
    return NextResponse.json({ error: 'Job ID is required.' }, { status: 400 });
  }

  try {
    const response = await fetch(`${TOOLKIT_API_BASE_URL}/v1/toolkit/job/status/${jobId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': TOOLKIT_API_KEY,
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`Error from toolkit API (job/status/${jobId}):`, errorData);
      return NextResponse.json({ error: `Toolkit API error: ${response.statusText}`, details: errorData }, { status: response.status });
    }

    const data = await response.json(); 
    // Assuming data structure like: { status: "processing" | "completed" | "failed", outputUrl?: "...", error?: "..." }
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error calling toolkit job/status API for job ${jobId}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: `Failed to get job status for ${jobId}.`, details: errorMessage }, { status: 500 });
  }
}
