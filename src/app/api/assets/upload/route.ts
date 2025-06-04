
// src/app/api/assets/upload/route.ts
import { type NextRequest, NextResponse } from 'next/server';
import AWS from 'aws-sdk';

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_ACCESS_KEY_ID = process.env.CLOUDFLARE_ACCESS_KEY_ID;
const CLOUDFLARE_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_URL_BASE = process.env.R2_PUBLIC_URL_BASE; // Optional: For custom domains

if (
  !CLOUDFLARE_ACCOUNT_ID ||
  !CLOUDFLARE_ACCESS_KEY_ID ||
  !CLOUDFLARE_SECRET_ACCESS_KEY ||
  !R2_BUCKET_NAME
) {
  console.error('Cloudflare R2 environment variables not fully configured.');
}

const s3 = new AWS.S3({
  endpoint: `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  accessKeyId: CLOUDFLARE_ACCESS_KEY_ID,
  secretAccessKey: CLOUDFLARE_SECRET_ACCESS_KEY,
  signatureVersion: 'v4',
  s3ForcePathStyle: true, // Required for R2
});

export async function POST(request: NextRequest) {
  if (
    !CLOUDFLARE_ACCOUNT_ID ||
    !CLOUDFLARE_ACCESS_KEY_ID ||
    !CLOUDFLARE_SECRET_ACCESS_KEY ||
    !R2_BUCKET_NAME
  ) {
    return NextResponse.json({ message: 'Cloudflare R2 environment variables not configured on the server.' }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ message: 'No file provided.' }, { status: 400 });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileName = `uploads/${Date.now()}-${file.name.replace(/\s+/g, '_')}`; // Sanitize and prefix file name

    const uploadParams = {
      Bucket: R2_BUCKET_NAME,
      Key: fileName,
      Body: fileBuffer,
      ContentType: file.type,
      ACL: 'public-read', // Make file publicly accessible
    };

    const r2UploadResponse = await s3.upload(uploadParams).promise();
    
    let storageUrl = r2UploadResponse.Location;

    // If a custom public URL base is defined, construct the URL with it.
    // Otherwise, R2 public URL structure is typically: https://<bucket>.<account_id>.r2.cloudflarestorage.com/<key>
    // Or if you have a public bucket URL configured: https://pub-<bucket_id>.r2.dev/<key>
    // The .Location from S3 SDK for R2 often gives the direct endpoint URL, which might not be what you want for public access if you use a custom domain or public bucket URL.
    // Adjust this logic based on how you've configured your R2 bucket for public access.
    if (R2_PUBLIC_URL_BASE) {
        storageUrl = `${R2_PUBLIC_URL_BASE}/${fileName}`;
    } else {
        // Default public URL for R2 (may need adjustment based on bucket settings)
        // Check your R2 bucket's public access settings.
        // If you have a "Public URL" like pub-xxxxxxxx.r2.dev, use that pattern.
        // For now, we'll assume the Location is correct or you'll set R2_PUBLIC_URL_BASE if needed.
        // A common pattern for public access without a custom domain if bucket is public:
        // storageUrl = `https://pub-${R2_BUCKET_NAME.toLowerCase()}.${CLOUDFLARE_ACCOUNT_ID}.r2.dev/${fileName}`;
        // However, r2UploadResponse.Location should ideally give the accessible URL if ACL is public-read.
    }


    // --- Placeholder for Database Interaction ---
    // In a real implementation:
    // 1. Save asset metadata (fileName, storageUrl, mimeType, size, userId, etc.) to your database.
    //    const assetMetadata = { originalName: file.name, storageKey: fileName, storageUrl, mimeType: file.type, size: file.size, userId: 'temp-user' /* Get actual user ID */ };
    //    // const dbResponse = await saveToDatabase(assetMetadata);
    // --- End Placeholder ---

    console.log(`File uploaded to R2: ${file.name} at ${storageUrl}`);

    const assetData = {
      id: `r2-asset-${Date.now()}`, // Generate a unique ID (DB would do this)
      fileName: file.name, // Original file name
      r2Key: fileName, // Key in R2
      url: storageUrl, // Publicly accessible URL from R2
      mimeType: file.type,
      size: file.size,
      // userId: 'user123', // Add user association later
      // createdAt: new Date().toISOString(),
    };

    return NextResponse.json(assetData, { status: 201 });

  } catch (error) {
    console.error('Error in asset R2 upload API:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during R2 upload.';
    return NextResponse.json({ message: 'Asset R2 upload failed.', details: errorMessage }, { status: 500 });
  }
}
