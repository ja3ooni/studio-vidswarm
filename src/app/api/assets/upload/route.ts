
// src/app/api/assets/upload/route.ts
import { type NextRequest, NextResponse } from 'next/server';
import AWS from 'aws-sdk';
import { supabaseAdmin } from '@/lib/supabase/server';

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

  if (!supabaseAdmin) {
    return NextResponse.json({ message: 'Supabase admin client not initialized. Check server logs for details.' }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ message: 'No file provided.' }, { status: 400 });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_'); // Sanitize file name
    const fileNameKey = `uploads/${Date.now()}-${sanitizedFileName}`;

    const uploadParams = {
      Bucket: R2_BUCKET_NAME,
      Key: fileNameKey,
      Body: fileBuffer,
      ContentType: file.type,
      ACL: 'public-read', 
    };

    await s3.upload(uploadParams).promise();
    
    let storageUrl = `${R2_PUBLIC_URL_BASE}/${fileNameKey}`;
    if (R2_PUBLIC_URL_BASE && !R2_PUBLIC_URL_BASE.endsWith('/')) {
        storageUrl = `${R2_PUBLIC_URL_BASE}/${fileNameKey}`;
    } else if (R2_PUBLIC_URL_BASE) {
        storageUrl = `${R2_PUBLIC_URL_BASE}${fileNameKey}`;
    } else {
        // Fallback if R2_PUBLIC_URL_BASE is somehow not set, though it should be by now.
        storageUrl = `https://${R2_BUCKET_NAME}.${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com/${fileNameKey}`;
        console.warn("R2_PUBLIC_URL_BASE not set, using constructed R2 URL. Please set it in .env");
    }


    const assetType = getAssetType(file.type);

    const assetToInsert = {
      file_name: file.name,
      r2_key: fileNameKey,
      url: storageUrl,
      mime_type: file.type,
      size: file.size,
      asset_type: assetType,
      // user_id: null, // Add user_id when authentication is implemented
    };
    
    const { data: dbData, error: dbError } = await supabaseAdmin
      .from('assets')
      .insert(assetToInsert)
      .select()
      .single();

    if (dbError) {
      console.error('Supabase insert error:', dbError);
      throw new Error(`Failed to save asset metadata to database: ${dbError.message}`);
    }

    if (!dbData) {
        throw new Error('Failed to save asset metadata: No data returned from database.');
    }

    console.log(`File uploaded to R2: ${file.name} at ${storageUrl} and metadata saved to Supabase.`);

    // Return the structure expected by the client (map Supabase fields to client Asset interface)
    const clientAssetData = {
        id: dbData.id,
        fileName: dbData.file_name,
        r2Key: dbData.r2_key,
        url: dbData.url,
        mimeType: dbData.mime_type,
        size: dbData.size,
        assetType: dbData.asset_type as 'image' | 'video' | 'audio' | 'other',
        createdAt: dbData.created_at,
    };


    return NextResponse.json(clientAssetData, { status: 201 });

  } catch (error) {
    console.error('Error in asset R2 upload API:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during R2 upload.';
    return NextResponse.json({ message: 'Asset R2 upload failed.', details: errorMessage }, { status: 500 });
  }
}
