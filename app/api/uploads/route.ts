import { Buffer } from 'node:buffer';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { supabaseServer } from '@/lib/supabaseServer';

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? 'menu-media';
const MAX_FILE_SIZE = Number(process.env.UPLOAD_MAX_BYTES ?? 5 * 1024 * 1024);

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!supabaseServer) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const formData = await request.formData();
  const file = formData.get('file');
  const path = formData.get('path')?.toString();

  if (!(file instanceof File) || !path) {
    return NextResponse.json({ error: 'Invalid upload payload' }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: `File is too large. Max size is ${(MAX_FILE_SIZE / (1024 * 1024)).toFixed(1)} MB.` },
      { status: 400 }
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error: uploadError } = await supabaseServer.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: publicUrlData } = supabaseServer.storage.from(BUCKET).getPublicUrl(path);

  return NextResponse.json({ url: publicUrlData.publicUrl });
}
