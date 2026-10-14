import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSesi } from '@/lib/session';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { JENIS_LAYANAN, rupiah, type JenisLayanan } from '@/lib/harga';

export default async function BerhasilPage({ searchParams }: PageProps<'/cuci/berhasil'>) {
  const sesi = await getSesi();
  if (!sesi) redirect('/login');

  const sp = await searchParams;
  const id = typeof sp.id === 'string' ? sp.id : '';
  const { data: t } = await getSupabaseAdmin()
    .from('transaksi_cuci')
    .select('plat_nomor, jenis_layanan, harga, nomor_antrian')
    .eq('id', id)
    .maybeSingle();
  if (!t) redirect('/dashboard');

  const jenis = JENIS_LAYANAN[t.jenis_layanan as JenisLayanan]?.label ?? t.jenis_layanan;

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: 'var(--bg)', padding: 24 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)' }}>Nomor Antrian</div>
      <div style={{ fontSize: 88, fontWeight: 800, lineHeight: 1, color: 'var(--primary)' }}>{t.nomor_antrian}</div>
      <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: 1 }}>{t.plat_nomor}</div>
      <div style={{ fontSize: 14, color: 'var(--text2)' }}>
        {jenis} · {rupiah(Number(t.harga))}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text2)', textAlign: 'center', maxWidth: 280 }}>
        Cetak struk ke printer akan ditambahkan di tahap berikutnya.
      </div>
      <div className="flex flex-col gap-2 w-full" style={{ maxWidth: 320, marginTop: 8 }}>
        <Link href="/cuci" className="rounded-xl flex items-center justify-center" style={{ height: 52, background: 'var(--primary)', color: '#fff', fontWeight: 700 }}>
          Catat Mobil Berikutnya
        </Link>
        <Link href="/dashboard" className="rounded-xl flex items-center justify-center" style={{ height: 48, border: '1px solid var(--border)', background: '#fff', fontWeight: 600 }}>
          Ke Dashboard
        </Link>
      </div>
    </div>
  );
}
