import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSesi } from '@/lib/session';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { logoutAction, pulangAction } from '@/app/actions';
import { tanggalWita, rentangHariWita, jamWita } from '@/lib/waktu';
import { hitungUpahPerPegawai } from '@/lib/upah';
import { JENIS_LAYANAN, rupiah, type JenisLayanan } from '@/lib/harga';

export default async function DashboardPage() {
  const sesi = await getSesi();
  if (!sesi) redirect('/login');
  if (sesi.peran === 'owner') redirect('/admin');

  const supabase = getSupabaseAdmin();
  const tanggal = tanggalWita();
  const { awal, akhir } = rentangHariWita(tanggal);

  const { data: absensiHariIni } = await supabase
    .from('absensi')
    .select('pegawai_id, waktu_checkin, waktu_checkout')
    .eq('tanggal', tanggal);

  const saya = absensiHariIni?.find((a) => a.pegawai_id === sesi.id);
  if (!saya?.waktu_checkin) redirect('/checkin');

  const { data: transaksi } = await supabase
    .from('transaksi_cuci')
    .select('id, plat_nomor, jenis_layanan, harga, bagian_pegawai, waktu_masuk, nomor_antrian')
    .gte('waktu_masuk', awal)
    .lt('waktu_masuk', akhir)
    .order('waktu_masuk', { ascending: false });

  const daftar = transaksi ?? [];
  const upah = hitungUpahPerPegawai(tanggal, daftar, absensiHariIni ?? []);
  const upahSaya = upah.get(sesi.id) ?? 0;
  const sudahPulang = Boolean(saya.waktu_checkout);

  return (
    <div className="w-full min-h-screen flex flex-col" style={{ background: 'var(--bg)', padding: '20px 24px 32px' }}>
      <div className="flex flex-col gap-4" style={{ maxWidth: 420, margin: '0 auto', width: '100%' }}>
        <div className="flex items-center justify-between">
          <div>
            <div style={{ fontSize: 12, color: 'var(--text2)' }}>Cuci Mobil Le-Deke</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>Halo, {sesi.nama}</div>
          </div>
          <form action={logoutAction}>
            <button type="submit" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)' }}>Keluar</button>
          </form>
        </div>

        <div className="rounded-2xl" style={{ background: 'var(--primary)', color: '#fff', padding: 18 }}>
          <div style={{ fontSize: 12, opacity: 0.85 }}>Perkiraan upah hari ini</div>
          <div style={{ fontSize: 32, fontWeight: 800 }}>{rupiah(upahSaya)}</div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 4 }}>
            {daftar.length} mobil hari ini · masuk {jamWita(saya.waktu_checkin)}
            {sudahPulang && saya.waktu_checkout ? ` · pulang ${jamWita(saya.waktu_checkout)}` : ''}
          </div>
          <div style={{ fontSize: 11, opacity: 0.75, marginTop: 6 }}>
            Angka final ditentukan saat closing jam 17:00.
          </div>
        </div>

        {!sudahPulang && (
          <Link href="/cuci" className="rounded-xl flex items-center justify-center" style={{ height: 56, background: 'var(--success)', color: '#fff', fontWeight: 800, fontSize: 16 }}>
            + Catat Mobil
          </Link>
        )}

        <div>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Mobil hari ini</div>
          {daftar.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--text2)', padding: '12px 0' }}>Belum ada mobil dicatat.</div>
          ) : (
            <div className="flex flex-col gap-2">
              {daftar.map((t) => (
                <div key={t.id} className="rounded-xl flex items-center gap-3" style={{ background: '#fff', border: '1px solid var(--border)', padding: '10px 14px' }}>
                  <div className="flex items-center justify-center rounded-lg" style={{ width: 40, height: 40, background: '#EEF3FF', color: 'var(--primary)', fontWeight: 800 }}>
                    {t.nomor_antrian}
                  </div>
                  <div className="flex-grow">
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{t.plat_nomor}</div>
                    <div style={{ fontSize: 12, color: 'var(--text2)' }}>
                      {JENIS_LAYANAN[t.jenis_layanan as JenisLayanan]?.label ?? t.jenis_layanan} · {jamWita(t.waktu_masuk)}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{rupiah(Number(t.harga))}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!sudahPulang && (
          <form action={pulangAction}>
            <button type="submit" className="w-full rounded-xl" style={{ height: 48, border: '1px solid var(--border)', background: '#fff', fontWeight: 600, color: 'var(--text2)' }}>
              Saya Pulang Sekarang
            </button>
            <div style={{ fontSize: 11, color: 'var(--text2)', textAlign: 'center', marginTop: 6 }}>
              Kalau tidak ditekan, Anda dianggap bekerja sampai jam 17:00.
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
