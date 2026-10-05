'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { hitungJarakMeter } from '@/lib/distance';

const STORE_LAT = Number(process.env.STORE_LAT ?? 0);
const STORE_LNG = Number(process.env.STORE_LNG ?? 0);
const STORE_RADIUS_METER = Number(process.env.STORE_RADIUS_METER ?? 150);

export type ActionState = { error?: string } | null;

// ========================================
// LOGIN
// ========================================
export async function loginAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const username = String(formData.get('username') ?? '').trim();
  const pin = String(formData.get('pin') ?? '').trim();

  if (!username || !pin) {
    return { error: 'Username dan PIN wajib diisi.' };
  }

  const supabase = getSupabaseAdmin();
  const { data: pegawai, error } = await supabase
    .from('pegawai')
    .select('id, nama, pin, status')
    .eq('username', username)
    .maybeSingle();

  if (error) {
    return { error: 'Terjadi masalah koneksi ke database. Coba lagi.' };
  }
  if (!pegawai || pegawai.status !== 'aktif') {
    return { error: 'Username tidak ditemukan atau nonaktif.' };
  }
  if (pegawai.pin !== pin) {
    return { error: 'PIN salah.' };
  }

  const cookieStore = await cookies();
  cookieStore.set('pegawai_id', pegawai.id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 12, // 12 jam
  });
  cookieStore.set('pegawai_nama', pegawai.nama, {
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 12,
  });

  redirect('/checkin');
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('pegawai_id');
  cookieStore.delete('pegawai_nama');
  redirect('/login');
}

// ========================================
// CHECK-IN
// ========================================
export async function checkinAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const cookieStore = await cookies();
  const pegawaiId = cookieStore.get('pegawai_id')?.value;
  if (!pegawaiId) {
    redirect('/login');
  }

  const latStr = formData.get('lat');
  const lngStr = formData.get('lng');
  const foto = formData.get('foto') as File | null;

  if (!latStr || !lngStr) {
    return { error: 'Lokasi GPS belum terdeteksi. Izinkan akses lokasi lalu coba lagi.' };
  }
  if (!foto || foto.size === 0) {
    return { error: 'Foto stok kopi wajib diambil dulu.' };
  }

  const lat = Number(latStr);
  const lng = Number(lngStr);
  const jarak = hitungJarakMeter(lat, lng, STORE_LAT, STORE_LNG);
  const statusLokasi = jarak <= STORE_RADIUS_METER ? 'sesuai' : 'di_luar_radius';

  const supabase = getSupabaseAdmin();
  const tanggal = new Date().toISOString().slice(0, 10);

  const ext = foto.type === 'image/png' ? 'png' : 'jpg';
  const path = `${pegawaiId}/${tanggal}.${ext}`;
  const arrayBuffer = await foto.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from('foto-absensi')
    .upload(path, arrayBuffer, {
      contentType: foto.type || 'image/jpeg',
      upsert: true,
    });

  if (uploadError) {
    return { error: 'Gagal upload foto: ' + uploadError.message };
  }

  const { data: publicUrlData } = supabase.storage
    .from('foto-absensi')
    .getPublicUrl(path);

  const { error: upsertError } = await supabase.from('absensi').upsert(
    {
      pegawai_id: pegawaiId,
      tanggal,
      waktu_checkin: new Date().toISOString(),
      lokasi_checkin_lat: lat,
      lokasi_checkin_lng: lng,
      status_lokasi: statusLokasi,
      foto_stok_kopi: publicUrlData.publicUrl,
    },
    { onConflict: 'pegawai_id,tanggal' }
  );

  if (upsertError) {
    return { error: 'Gagal simpan absensi: ' + upsertError.message };
  }

  redirect('/dashboard');
}
