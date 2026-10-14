import { redirect } from 'next/navigation';
import { getSesi } from '@/lib/session';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { tanggalWita } from '@/lib/waktu';
import CheckinClient from './CheckinClient';

export default async function CheckinPage() {
  const sesi = await getSesi();
  if (!sesi) {
    redirect('/login');
  }
  // Owner tidak perlu check-in
  if (sesi.peran === 'owner') {
    redirect('/admin');
  }
  // Sudah check-in hari ini → langsung ke dashboard
  const { data } = await getSupabaseAdmin()
    .from('absensi')
    .select('id')
    .eq('pegawai_id', sesi.id)
    .eq('tanggal', tanggalWita())
    .maybeSingle();
  if (data) {
    redirect('/dashboard');
  }
  return <CheckinClient />;
}
