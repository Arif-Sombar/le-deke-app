'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { checkinAction } from '@/app/actions';

export default function CheckinPage() {
  const [state, formAction, pending] = useActionState(checkinAction, null);

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locError, setLocError] = useState<string | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocError('Browser ini tidak mendukung GPS.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setLocError('Gagal mendapatkan lokasi. Izinkan akses lokasi lalu muat ulang halaman.'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setFotoPreview(URL.createObjectURL(file));
    }
  }

  const siap = Boolean(coords) && Boolean(fotoPreview);

  return (
    <div
      className="w-full min-h-screen flex flex-col"
      style={{ background: 'var(--bg)', padding: '20px 24px 32px' }}
    >
      <div className="flex items-center gap-3" style={{ height: 40 }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>Check-in</div>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center gap-5" style={{ maxWidth: 420, margin: '0 auto', width: '100%' }}>
        <div
          className="flex items-center justify-center rounded-full"
          style={{ width: 96, height: 96, background: coords ? 'var(--success-bg)' : 'var(--warning-bg)' }}
        >
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={coords ? 'var(--success)' : 'var(--warning)'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s7-7.58 7-12A7 7 0 0 0 5 10c0 4.42 7 12 7 12Z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
        </div>

        <div className="text-center flex flex-col gap-1.5">
          <div style={{ fontSize: 17, fontWeight: 700 }}>Pastikan Anda di Lokasi</div>
          <div style={{ fontSize: 13, color: 'var(--text2)', maxWidth: 260 }}>
            Verifikasi lokasi GPS dilakukan satu kali saat check-in
          </div>
        </div>

        <div
          className="w-full rounded-2xl flex items-center gap-2.5"
          style={{ background: coords ? 'var(--success-bg)' : 'var(--danger-bg)', padding: '14px 16px' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={coords ? 'var(--success)' : 'var(--danger)'} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: coords ? 'var(--success)' : 'var(--danger)' }}>
              {coords ? 'Lokasi terverifikasi' : locError ? 'Lokasi gagal terdeteksi' : 'Mendeteksi lokasi...'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text2)' }}>
              {coords ? `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}` : locError ?? 'Mohon tunggu sebentar'}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full rounded-2xl flex flex-col items-center justify-center gap-2"
          style={{
            height: 150,
            border: fotoPreview ? 'none' : '2px dashed var(--border)',
            background: fotoPreview ? `center / cover no-repeat url(${fotoPreview})` : 'var(--card)',
          }}
        >
          {!fotoPreview && (
            <>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--text2)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2Z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>Foto Stok Kopi (wajib)</div>
            </>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          name="foto"
          accept="image/*"
          capture="environment"
          required
          onChange={handleFotoChange}
          className="hidden"
          form="checkin-form"
        />
      </div>

      <form id="checkin-form" action={formAction} className="w-full flex flex-col gap-2" style={{ maxWidth: 420, margin: '0 auto', width: '100%' }}>
        <input type="hidden" name="lat" value={coords?.lat ?? ''} />
        <input type="hidden" name="lng" value={coords?.lng ?? ''} />

        {state?.error && (
          <div style={{ fontSize: 12, color: 'var(--danger)', background: 'var(--danger-bg)', padding: '8px 12px', borderRadius: 8 }}>
            {state.error}
          </div>
        )}

        <button
          type="submit"
          disabled={!siap || pending}
          className="rounded-xl"
          style={{
            height: 52,
            background: siap ? 'var(--primary)' : '#D8D3C7',
            color: siap ? '#fff' : '#8A8371',
            fontWeight: 700,
            fontSize: 15,
          }}
        >
          {pending ? 'Menyimpan...' : 'Check-in Sekarang'}
        </button>
        {!siap && (
          <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--warning)', fontWeight: 700 }}>
            {!coords ? 'Menunggu lokasi GPS...' : 'Ambil foto stok kopi dulu untuk melanjutkan'}
          </div>
        )}
      </form>
    </div>
  );
}
