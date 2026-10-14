import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { tanggalWita } from '@/lib/waktu';

export const dynamic = 'force-dynamic';

const UMUR_HARI = 60;
const BATAS_PER_JALAN = 500; // per jenis foto, sisanya dibersihkan pada jadwal berikutnya

// Ambil path file di Storage dari URL publik
function pathDariUrl(url: string, bucket: string): string | null {
  const penanda = `/object/public/${bucket}/`;
  const i = url.indexOf(penanda);
  if (i === -1) return null;
  return decodeURIComponent(url.slice(i + penanda.length).split('?')[0]);
}

type Target = {
  tabel: string;
  kolomFoto: string;
  kolomTanggal: string;
  bucket: string;
  tipeTanggal: 'tanggal' | 'waktu';
};

const TARGET: Target[] = [
  { tabel: 'transaksi_cuci', kolomFoto: 'foto_url', kolomTanggal: 'waktu_masuk', bucket: 'foto-transaksi', tipeTanggal: 'waktu' },
  { tabel: 'absensi', kolomFoto: 'foto_stok_kopi', kolomTanggal: 'tanggal', bucket: 'foto-absensi', tipeTanggal: 'tanggal' },
  { tabel: 'pengeluaran', kolomFoto: 'foto_struk', kolomTanggal: 'tanggal', bucket: 'foto-transaksi', tipeTanggal: 'tanggal' },
];

export async function GET(request: Request) {
  // Hanya boleh dipanggil oleh Vercel Cron (membawa CRON_SECRET)
  const rahasia = process.env.CRON_SECRET;
  if (!rahasia || request.headers.get('authorization') !== `Bearer ${rahasia}`) {
    return new Response('Tidak diizinkan', { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const batas = tanggalWita(new Date(Date.now() - UMUR_HARI * 24 * 60 * 60 * 1000));
  const batasWaktu = new Date(`${batas}T00:00:00+08:00`).toISOString();
  const laporan: Record<string, { dihapus: number; error?: string }> = {};

  for (const t of TARGET) {
    try {
      const { data, error } = await supabase
        .from(t.tabel)
        .select(`id, ${t.kolomFoto}`)
        .not(t.kolomFoto, 'is', null)
        .lt(t.kolomTanggal, t.tipeTanggal === 'waktu' ? batasWaktu : batas)
        .limit(BATAS_PER_JALAN);
      if (error) throw new Error(error.message);

      const baris = ((data ?? []) as unknown) as Array<Record<string, string>>;
      const peta = baris
        .map((b) => ({ id: b.id, path: pathDariUrl(b[t.kolomFoto], t.bucket) }))
        .filter((x): x is { id: string; path: string } => x.path !== null);

      if (peta.length > 0) {
        const { error: errHapus } = await supabase.storage.from(t.bucket).remove(peta.map((x) => x.path));
        if (errHapus) throw new Error(errHapus.message);

        // Foto sudah terhapus: kosongkan alamatnya supaya tidak muncul gambar rusak
        const { error: errUpdate } = await supabase
          .from(t.tabel)
          .update({ [t.kolomFoto]: null })
          .in('id', peta.map((x) => x.id));
        if (errUpdate) throw new Error(errUpdate.message);
      }
      laporan[`${t.tabel}.${t.kolomFoto}`] = { dihapus: peta.length };
    } catch (e) {
      laporan[`${t.tabel}.${t.kolomFoto}`] = { dihapus: 0, error: e instanceof Error ? e.message : String(e) };
    }
  }

  return Response.json({ batasTanggal: batas, umurHari: UMUR_HARI, laporan });
}
