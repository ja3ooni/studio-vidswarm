
// src/app/api/assets/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

// This should match the client-side Asset interface in EditorPageClient
interface ApiAsset {
  id: string;
  fileName: string;
  url: string;
  r2Key: string;
  mimeType: string;
  size: number;
  assetType: 'image' | 'video' | 'audio' | 'other';
  createdAt?: string; 
  // userId?: string; // For future use
}

export async function GET() {
  if (!supabaseAdmin) {
    return NextResponse.json({ message: 'Supabase admin client not initialized. Check server logs.' }, { status: 500 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('assets')
      .select('id, file_name, url, r2_key, mime_type, size, asset_type, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch error:', error);
      throw new Error(`Failed to fetch assets from database: ${error.message}`);
    }
    
    const assets: ApiAsset[] = data.map(item => ({
        id: item.id,
        fileName: item.file_name,
        url: item.url,
        r2Key: item.r2_key,
        mimeType: item.mime_type,
        size: item.size,
        assetType: item.asset_type as 'image' | 'video' | 'audio' | 'other',
        createdAt: item.created_at,
    }));

    return NextResponse.json(assets, { status: 200 });
  } catch (error) {
    console.error('Error fetching assets:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: 'Failed to fetch assets.', details: errorMessage }, { status: 500 });
  }
}
