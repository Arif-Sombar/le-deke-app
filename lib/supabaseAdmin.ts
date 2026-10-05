import { createClient } from '@supabase/supabase-js';

// Dipakai HANYA di server (Server Actions / Route Handlers).
// Jangan pernah import file ini dari komponen yang berjalan di browser.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const secretKey = process.env.SUPABASE_SECRET_KEY!;

export function getSupabaseAdmin() {
  if (!supabaseUrl || !secretKey) {
    throw new Error('Supabase URL atau secret key belum di-set di .env.local');
  }
  return createClient(supabaseUrl, secretKey, {
    auth: { persistSession: false },
  });
}
