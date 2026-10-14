import { cookies } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export type Sesi = { id: string; nama: string; peran: 'pegawai' | 'owner' };

// Ambil sesi dari cookie, lalu cek peran langsung ke database
// (supaya tidak bisa dipalsukan lewat cookie).
export async function getSesi(): Promise<Sesi | null> {
  const cookieStore = await cookies();
  const id = cookieStore.get('pegawai_id')?.value;
  if (!id) return null;

  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('pegawai')
    .select('id, nama, peran, status')
    .eq('id', id)
    .maybeSingle();

  if (!data || data.status !== 'aktif') return null;
  return { id: data.id, nama: data.nama, peran: data.peran };
}
