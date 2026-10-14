import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSesi } from '@/lib/session';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { logoutAction } from '@/app/actions';
import { tanggalWita, rentangHariWita, jamWita } from '@/lib/waktu';
import { hitungUpahPerPegawai } from '@/lib/upah';
import { JENIS_LAYANAN, rupiah, type JenisLayanan } from '@/lib/harga';

function geser(tanggal: string, hari: number): string {
  const d = new Date(`${tanggal}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + hari);
  return d.toISOString().slice(0, 10);
}

function labelTanggal(tanggal: string): string {
  return new Date(`${tanggal}T00:00:00Z`).toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  });
}

const kartu = { background: '#fff', border: '1px solid var(--border)', borderRadius: 16, padding: 16 } as const;

export default async function AdminPage({ searchParams }: PageProps<'/admin'>) {
  const sesi = await getSesi();
  if (!sesi) redirect('/login');
  if (sesi.peran !== 'owner') redirect('/dashboard');

  const sp = await searchParams;
  const hariIni = tanggalWita();
  const param = typeof sp.tanggal === 'string' ? sp.tanggal : '';
  const tanggal = /^\d{4}-\d{2}-\d{2}$/.test(param) ? param : hariIni;
  const { awal, akhir } = rentangHariWita(tanggal);

  const supabase = getSupabaseAdmin();
  const [{ data: semuaPegawai }, { data: absensi }, { data: transaksi }] = await Promise.all([
    supabase.from('pegawai').select('id, nama, status').eq('peran', 'pegawai').eq('status', 'aktif').order('nama'),
    supabase.from('absensi')
      .select('pegawai_id, waktu_checkin, waktu_checkout, checkout_manual, status_lokasi, foto_stok_kopi')
      .eq('tanggal', tanggal),
    supabase.from('transaksi_cuci')
      .select('id, plat_nomor, jenis_layanan, harga, bagian_pegawai, bagian_owner, bagian_kas, waktu_masuk, nomor_antrian, foto_url')
      .gte('waktu_masuk', awal).lt('waktu_masuk', akhir)
      .order('waktu_masuk', { ascending: false }),
  ]);

  const daftarTrx = transaksi ?? [];
  const daftarAbsen = absensi ?? [];
  const pegawai = semuaPegawai ?? [];

  const total = daftarTrx.reduce((s, t) => s + Number(t.harga), 0);
  const totalPegawai = daftarTrx.reduce((s, t) => s + Number(t.bagian_pegawai), 0);
  const totalOwner = daftarTrx.reduce((s, t) => s + Number(t.bagian_owner), 0);
  const totalKas = daftarTrx.reduce((s, t) => s + Number(t.bagian_kas), 0);
  const upah = hitungUpahPerPegawai(tanggal, daftarTrx, daftarAbsen);
  const tidakTerbagi = totalPegawai - [...upah.values()].reduce((s, v) => s + v, 0);

  return (
    <div className="w-full min-h-screen" style={{ background: 'var(--bg)', padding: '20px 16px 40px' }}>
      <div className="flex flex-col gap-4" style={{ maxWidth: 960, margin: '0 auto' }}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div style={{ fontSize: 12, color: 'var(--text2)' }}>Cuci Mobil Le-Deke · Owner</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>Halo, {sesi.nama}</div>
          </div>
          <form action={logoutAction}>
            <button type="submit" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)' }}>Keluar</button>
          </form>
        </div>

        {/* Pemilih tanggal */}
        <div className="flex items-center justify-between" style={kartu}>
          <Link href={`/admin?tanggal=${geser(tanggal, -1)}`} style={{ fontWeight: 700, padding: '6px 12px' }}>‹</Link>
          <div className="text-center">
            <div style={{ fontSize: 14, fontWeight: 700 }}>{labelTanggal(tanggal)}</div>
            {tanggal !== hariIni && (
              <Link href="/admin" style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>Kembali ke hari ini</Link>
            )}
          </div>
          {tanggal < hariIni ? (
            <Link href={`/admin?tanggal=${geser(tanggal, 1)}`} style={{ fontWeight: 700, padding: '6px 12px' }}>›</Link>
          ) : (
            <span style={{ padding: '6px 12px', color: '#C9C4B6' }}>›</span>
          )}
        </div>

        {/* Ringkasan */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div style={{ ...kartu, background: 'var(--primary)', color: '#fff', border: 'none' }}>
            <div style={{ fontSize: 12, opacity: 0.85 }}>Pemasukan</div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{rupiah(total)}</div>
            <div style={{ fontSize: 12, opacity: 0.85 }}>{daftarTrx.length} mobil</div>
          </div>
          <div style={kartu}>
            <div style={{ fontSize: 12, color: 'var(--text2)' }}>Bagian Owner (40%)</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{rupiah(totalOwner)}</div>
          </div>
          <div style={kartu}>
            <div style={{ fontSize: 12, color: 'var(--text2)' }}>Upah Pegawai (40%)</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{rupiah(totalPegawai)}</div>
          </div>
          <div style={kartu}>
            <div style={{ fontSize: 12, color: 'var(--text2)' }}>Kas (20%)</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{rupiah(totalKas)}</div>
          </div>
        </div>
        {tidakTerbagi > 0.5 && (
          <div style={{ fontSize: 12, color: 'var(--warning)', background: 'var(--warning-bg)', padding: '8px 12px', borderRadius: 8 }}>
            {rupiah(tidakTerbagi)} dari upah pegawai belum terbagi ke siapa pun, karena mobil dicatat saat tidak ada pegawai aktif (belum check-in atau sudah lewat jam 17:00).
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {/* Kehadiran */}
          <div style={kartu}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Kehadiran Pegawai</div>
            <div className="flex flex-col gap-2">
              {pegawai.map((p) => {
                const a = daftarAbsen.find((x) => x.pegawai_id === p.id);
                const hadir = Boolean(a?.waktu_checkin);
                return (
                  <div key={p.id} className="flex items-center gap-3" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    {hadir && a?.foto_stok_kopi ? (
                      <a href={a.foto_stok_kopi} target="_blank" rel="noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={a.foto_stok_kopi} alt="Foto stok kopi" width={44} height={44} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 8 }} />
                      </a>
                    ) : (
                      <div style={{ width: 44, height: 44, borderRadius: 8, background: '#EFEBE0' }} />
                    )}
                    <div className="flex-grow">
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{p.nama}</div>
                      <div style={{ fontSize: 12, color: 'var(--text2)' }}>
                        {hadir
                          ? `Masuk ${jamWita(a!.waktu_checkin!)}` +
                            (a!.waktu_checkout ? ` · pulang ${jamWita(a!.waktu_checkout)}${a!.checkout_manual ? ' (manual)' : ''}` : '')
                          : 'Belum hadir'}
                      </div>
                    </div>
                    <div className="text-right">
                      {hadir && (
                        <div style={{
                          fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, display: 'inline-block',
                          color: a!.status_lokasi === 'sesuai' ? 'var(--success)' : 'var(--danger)',
                          background: a!.status_lokasi === 'sesuai' ? 'var(--success-bg)' : 'var(--danger-bg)',
                        }}>
                          {a!.status_lokasi === 'sesuai' ? 'Di lokasi' : 'Di luar radius'}
                        </div>
                      )}
                      <div style={{ fontSize: 12, fontWeight: 700, marginTop: 2 }}>{rupiah(upah.get(p.id) ?? 0)}</div>
                    </div>
                  </div>
                );
              })}
              {pegawai.length === 0 && <div style={{ fontSize: 13, color: 'var(--text2)' }}>Belum ada pegawai aktif.</div>}
            </div>
          </div>

          {/* Mobil */}
          <div style={kartu}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Mobil ({daftarTrx.length})</div>
            <div className="flex flex-col gap-2">
              {daftarTrx.map((t) => {
                const jam = jamWita(t.waktu_masuk);
                return (
                  <div key={t.id} className="flex items-center gap-3" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    {t.foto_url ? (
                      <a href={t.foto_url} target="_blank" rel="noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={t.foto_url} alt={`Foto ${t.plat_nomor}`} width={44} height={44} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 8 }} />
                      </a>
                    ) : (
                      <div style={{ width: 44, height: 44, borderRadius: 8, background: '#EFEBE0' }} />
                    )}
                    <div className="flex-grow">
                      <div style={{ fontSize: 14, fontWeight: 700 }}>
                        #{t.nomor_antrian} · {t.plat_nomor}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text2)' }}>
                        {JENIS_LAYANAN[t.jenis_layanan as JenisLayanan]?.label ?? t.jenis_layanan} · {jam}
                        {jam >= '17:00' && <span style={{ color: 'var(--warning)', fontWeight: 700 }}> · lewat 17:00</span>}
                      </div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{rupiah(Number(t.harga))}</div>
                  </div>
                );
              })}
              {daftarTrx.length === 0 && <div style={{ fontSize: 13, color: 'var(--text2)' }}>Belum ada mobil pada tanggal ini.</div>}
            </div>
          </div>
        </div>

        <div style={{ fontSize: 11, color: 'var(--text2)', textAlign: 'center' }}>
          Upah per pegawai adalah perkiraan sampai closing jam 17:00 (fitur closing, saldo, dan pencairan menyusul).
        </div>
      </div>
    </div>
  );
}
