'use server';

import { redirect } from 'next/navigation';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { getSesi } from '@/lib/session';
import { tanggalWita, rentangHariWita } from '@/lib/waktu';
import { JENIS_LAYANAN, bagiHarga, type JenisLayanan } from '@/lib/harga';

export type CuciState = { error?: string } | null;

export async function catatCuciAction(
  _prev: CuciState,
  formData: FormData
): Promise<CuciState> {
  const sesi = await getSesi();
  if (!sesi) redirect('/login');
  if (sesi.peran === 'owner') redirect('/admin');

  const plat = String(formData.get('plat') ?? '')
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .trim();
  const jenis = String(formData.get('jenis') ?? '') as JenisLayanan;
  const foto = formData.get('foto') as File | null;

  if (plat.length < 3) return { error: 'Plat nomor wajib diisi.' };
  if (!(jenis in JENIS_LAYANAN)) return { error: 'Pilih jenis cuci dulu.' };
  if (!foto || foto.size === 0) return { error: 'Foto mobil wajib diambil dulu.' };

  let harga: number;
  if (jenis === 'custom') {
    harga = Number(formData.get('harga_custom'));
    if (!Number.isFinite(harga) || harga <= 0) {
      return { error: 'Isi harga khusus dengan angka yang benar.' };
    }
  } else {
    harga = JENIS_LAYANAN[jenis].harga as number;
  }

  const supabase = getSupabaseAdmin();
  const tanggal = tanggalWita();
  const { awal, akhir } = rentangHariWita(tanggal);

  // Pegawai harus sudah check-in hari ini dan belum pulang
  const { data: absen } = await supabase
    .from('absensi')
    .select('waktu_checkin, waktu_checkout')
    .eq('pegawai_id', sesi.id)
    .eq('tanggal', tanggal)
    .maybeSingle();

  if (!absen?.waktu_checkin) redirect('/checkin');
  if (absen.waktu_checkout) {
    return { error: 'Anda sudah tercatat pulang hari ini, tidak bisa mencatat mobil.' };
  }

  // Nomor antrian = urutan mobil hari ini
  const { count } = await supabase
    .from('transaksi_cuci')
    .select('id', { count: 'exact', head: true })
    .gte('waktu_masuk', awal)
    .lt('waktu_masuk', akhir);
  const nomorAntrian = (count ?? 0) + 1;

  // Upload foto
  const platAman = plat.replace(/[^A-Z0-9]/g, '');
  const path = `${tanggal}/${Date.now()}-${platAman}.jpg`;
  const { error: uploadError } = await supabase.storage
    .from('foto-transaksi')
    .upload(path, await foto.arrayBuffer(), {
      contentType: foto.type || 'image/jpeg',
      upsert: false,
    });
  if (uploadError) return { error: 'Gagal upload foto: ' + uploadError.message };
  const { data: urlData } = supabase.storage.from('foto-transaksi').getPublicUrl(path);

  const { data: baris, error: insertError } = await supabase
    .from('transaksi_cuci')
    .insert({
      plat_nomor: plat,
      jenis_layanan: jenis,
      harga,
      ...bagiHarga(harga),
      foto_url: urlData.publicUrl,
      nomor_antrian: nomorAntrian,
    })
    .select('id')
    .single();

  if (insertError || !baris) {
    return { error: 'Gagal simpan transaksi: ' + (insertError?.message ?? 'tidak diketahui') };
  }

  redirect(`/cuci/berhasil?id=${baris.id}`);
}
