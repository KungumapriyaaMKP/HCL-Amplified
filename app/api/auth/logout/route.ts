import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (_err) {
    // Graceful logout
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.delete('sb-access-token');
  response.cookies.delete('sb-refresh-token');
  return response;
}
