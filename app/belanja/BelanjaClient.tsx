'use client';

import { useActionState, useRef, useState } from 'react';
import Link from 'next/link';
import { catatBelanjaAction } from './actions';
import { kompresFoto, pasangFile } from '@/lib/kompres';
import { KATEGORI_BELANJA } from '@/lib/kategori';

export default function BelanjaClient() {
  const [state, formAction, pending] = useActionState(catatBelanjaAction, null);
  const [kategori, setKategori] = useState('');
  const [nominal, setNominal] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const file = input.files?.[0];
    if (file) {
      const kecil = await kompresFoto(file);
      pasangFile(input, kecil);
      setFotoPreview(URL.createObjectURL(kecil));
    }
  }

  const siap = kategori !== '' && Number(nominal) > 0 && keterangan.trim().length >= 2 && Boolean(fotoPreview);

  return (
    <div className="w-full min-h-screen flex flex-col" style={{ background: 'var(--bg)', padding: '20px 24px 32px' }}>
      <div className="flex items-center justify-between" style={{ height: 40, maxWidth: 420, margin: '0 auto', width: '100%' }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>Catat Belanja</div>
        <Link href="/dashboard" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)' }}>Batal</Link>
      </div>

      <form action={formAction} className="flex flex-col gap-4" style={{ maxWidth: 420, margin: '16px auto 0', width: '100%' }}>
        <div style={{ fontSize: 12, color: 'var(--text2)', background: '#FFF8E6', padding: '8px 12px', borderRadius: 8 }}>
          Uang belanja diambil dari kas.
        </div>

        <div className="flex flex-col gap-1.5">
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>Kategori</div>
          <div className="flex flex-wrap gap-2">
            {KATEGORI_BELANJA.map((k) => {
              const aktif = kategori === k;
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKategori(k)}
                  className="rounded-full"
                  style={{
                    padding: '8px 14px', fontSize: 13, fontWeight: 600,
                    border: aktif ? '2px solid var(--primary)' : '1px solid var(--border)',
                    background: aktif ? '#EEF3FF' : '#fff',
                  }}
                >
                  {k}
                </button>
              );
            })}
          </div>
          <input type="hidden" name="kategori" value={kategori} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="nominal" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>Nominal (Rp)</label>
          <input
            id="nominal" name="nominal" type="number" inputMode="numeric" min={1}
            value={nominal} onChange={(e) => setNominal(e.target.value)}
            placeholder="50000" required className="rounded-lg"
            style={{ height: 52, border: '1px solid var(--border)', padding: '0 14px', fontSize: 20, fontWeight: 700, background: '#fff' }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="keterangan" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>Keterangan (apa yang dibeli)</label>
          <input
            id="keterangan" name="keterangan" type="text"
            value={keterangan} onChange={(e) => setKeterangan(e.target.value)}
            placeholder="contoh: kopi sachet 2 renceng" required className="rounded-lg"
            style={{ height: 48, border: '1px solid var(--border)', padding: '0 14px', fontSize: 15, background: '#fff' }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>Foto struk / barang (wajib)</div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full rounded-2xl flex flex-col items-center justify-center gap-2"
            style={{
              height: 150,
              border: fotoPreview ? 'none' : '2px dashed var(--border)',
              background: fotoPreview ? `center / cover no-repeat url(${fotoPreview})` : '#fff',
            }}
          >
            {!fotoPreview && (
              <>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--text2)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2Z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>Foto struk. Kalau tidak ada struk, foto barangnya</div>
              </>
            )}
          </button>
          <input ref={fileRef} type="file" name="foto" accept="image/*" capture="environment" required onChange={onFoto} className="hidden" />
        </div>

        {state?.error && (
          <div style={{ fontSize: 12, color: 'var(--danger)', background: 'var(--danger-bg)', padding: '8px 12px', borderRadius: 8 }}>
            {state.error}
          </div>
        )}

        <button
          type="submit" disabled={!siap || pending} className="rounded-xl"
          style={{ height: 52, background: siap ? 'var(--primary)' : '#D8D3C7', color: siap ? '#fff' : '#8A8371', fontWeight: 700, fontSize: 15 }}
        >
          {pending ? 'Menyimpan...' : 'Simpan Belanja'}
        </button>
      </form>
    </div>
  );
}
