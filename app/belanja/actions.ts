'use server';

import { redirect } from 'next/navigation';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { getSesi } from '@/lib/session';
import { tanggalWita } from '@/lib/waktu';
import { KATEGORI_BELANJA } from '@/lib/kategori';

export type BelanjaState = { error?: string } | null;

export async function catatBelanjaAction(
  prev: BelanjaState,
  formData: FormData
): Promise<BelanjaState> {
  try {
    return await proses(prev, formData);
  } catch (e) {
    if (e instanceof Error && 'digest' in e && String((e as { digest?: string }).digest).startsWith('NEXT_REDIRECT')) {
      throw e;
    }
    console.error('catatBelanjaAction gagal:', e);
    return { error: 'Terjadi kesalahan di server: ' + (e instanceof Error ? e.message : String(e)) };
  }
}

async function proses(_prev: BelanjaState, formData: FormData): Promise<BelanjaState> {
  const sesi = await getSesi();
  if (!sesi) redirect('/login');
  if (sesi.peran === 'owner') redirect('/admin');

  const kategori = String(formData.get('kategori') ?? '');
  const nominal = Number(formData.get('nominal'));
  const keterangan = String(formData.get('keterangan') ?? '').trim();
  const foto = formData.get('foto') as File | null;

  if (!(KATEGORI_BELANJA as readonly string[]).includes(kategori)) return { error: 'Pilih kategori belanja dulu.' };
  if (!Number.isFinite(nominal) || nominal <= 0) return { error: 'Isi nominal dengan angka yang benar.' };
  if (keterangan.length < 2) return { error: 'Isi keterangan belanja (apa yang dibeli).' };
  if (!foto || foto.size === 0) return { error: 'Foto struk/barang wajib diambil dulu.' };

  const supabase = getSupabaseAdmin();
  const tanggal = tanggalWita();
  const path = `belanja/${tanggal}/${Date.now()}.jpg`;

  const { error: uploadError } = await supabase.storage
    .from('foto-transaksi')
    .upload(path, await foto.arrayBuffer(), { contentType: foto.type || 'image/jpeg', upsert: false });
  if (uploadError) return { error: 'Gagal upload foto: ' + uploadError.message };
  const { data: urlData } = supabase.storage.from('foto-transaksi').getPublicUrl(path);

  const { error } = await supabase.from('pengeluaran').insert({
    tanggal,
    kategori,
    nominal,
    keterangan,
    foto_struk: urlData.publicUrl,
    dicatat_oleh: sesi.id,
  });
  if (error) return { error: 'Gagal simpan belanja: ' + error.message };

  redirect('/dashboard');
}
