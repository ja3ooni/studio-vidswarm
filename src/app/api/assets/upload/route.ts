
// src/app/api/assets/upload/route.ts
import { type NextRequest, NextResponse } from 'next/server';
import AWS from 'aws-sdk';

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_ACCESS_KEY_ID = process.env.CLOUDFLARE_ACCESS_KEY_ID;
const CLOUDFLARE_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_URL_BASE = process.env.R2_PUBLIC_URL_BASE; 

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

function getAssetType(mimeType: string): 'image' | 'video' | 'audio' | 'other' {
  if (mimeType.startsWith('image/')) {
    return 'image';
  }
  if (mimeType.startsWith('video/')) {
    return 'video';
  }
  if (mimeType.startsWith('audio/')) {
    return 'audio';
  }
  return 'other';
}

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
    const fileNameKey = `uploads/${Date.now()}-${file.name.replace(/\s+/g, '_')}`; // Sanitize and prefix file name for R2 key

    const uploadParams = {
      Bucket: R2_BUCKET_NAME,
      Key: fileNameKey,
      Body: fileBuffer,
      ContentType: file.type,
      ACL: 'public-read', 
    };

    const r2UploadResponse = await s3.upload(uploadParams).promise();
    
    let storageUrl = r2UploadResponse.Location; // Default from S3 SDK

    if (R2_PUBLIC_URL_BASE) {
        storageUrl = `${R2_PUBLIC_URL_BASE.replace(/\/$/, '')}/${fileNameKey}`; // Ensure no double slashes
    } else {
        // Fallback or alternative public URL construction if R2_PUBLIC_URL_BASE is not set
        // This might be specific to your R2 setup if not using a custom domain or the pub- URL.
        // For instance: `https://<bucket_name>.<account_id>.r2.cloudflarestorage.com/<key>`
        // However, relying on r2UploadResponse.Location or R2_PUBLIC_URL_BASE is preferred.
    }

    // Placeholder for Database Interaction:
    // 1. Save asset metadata (originalName, fileNameKey, storageUrl, mimeType, size, userId, etc.) to your database.
    //    const dbResponse = await saveToDatabase({ ... });
    //    const assetIdFromDb = dbResponse.id; // Get the ID from the database

    const assetType = getAssetType(file.type);

    const assetData = {
      id: `r2-asset-${Date.now()}`, // Placeholder ID; in reality, this would come from your database
      fileName: file.name,          // Original file name
      r2Key: fileNameKey,           // Key in R2
      url: storageUrl,              // Publicly accessible URL from R2
      mimeType: file.type,
      size: file.size,
      assetType: assetType,         // Derived asset type
      // userId: 'temp-user-id',    // TODO: Replace with actual user ID after authentication
      // createdAt: new Date().toISOString(), // This would be set by the database or here
    };

    console.log(`File uploaded to R2: ${file.name} at ${storageUrl}`);

    return NextResponse.json(assetData, { status: 201 });

  } catch (error) {
    console.error('Error in asset R2 upload API:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during R2 upload.';
    return NextResponse.json({ message: 'Asset R2 upload failed.', details: errorMessage }, { status: 500 });
  }
}
