'use client';

import { useActionState, useRef, useState } from 'react';
import Link from 'next/link';
import { catatCuciAction } from './actions';
import { kompresFoto, pasangFile } from '@/lib/kompres';
import { JENIS_LAYANAN, rupiah, type JenisLayanan } from '@/lib/harga';

export default function CuciClient() {
  const [state, formAction, pending] = useActionState(catatCuciAction, null);
  const [plat, setPlat] = useState('');
  const [jenis, setJenis] = useState<JenisLayanan | ''>('');
  const [hargaCustom, setHargaCustom] = useState('');
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

  const hargaOk = jenis !== 'custom' || Number(hargaCustom) > 0;
  const siap = plat.trim().length >= 3 && jenis !== '' && hargaOk && Boolean(fotoPreview);

  return (
    <div className="w-full min-h-screen flex flex-col" style={{ background: 'var(--bg)', padding: '20px 24px 32px' }}>
      <div className="flex items-center justify-between" style={{ height: 40, maxWidth: 420, margin: '0 auto', width: '100%' }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>Catat Mobil</div>
        <Link href="/dashboard" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)' }}>Batal</Link>
      </div>

      <form action={formAction} className="flex flex-col gap-4" style={{ maxWidth: 420, margin: '16px auto 0', width: '100%' }}>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="plat" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>Plat Nomor</label>
          <input
            id="plat"
            name="plat"
            type="text"
            value={plat}
            onChange={(e) => setPlat(e.target.value.toUpperCase())}
            placeholder="DH 1234 AB"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            required
            className="rounded-lg"
            style={{ height: 52, border: '1px solid var(--border)', padding: '0 14px', fontSize: 20, fontWeight: 700, letterSpacing: 1, background: '#fff' }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>Jenis Cuci</div>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(JENIS_LAYANAN) as JenisLayanan[]).map((k) => {
              const aktif = jenis === k;
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setJenis(k)}
                  className="rounded-xl text-left"
                  style={{
                    padding: '12px 14px',
                    border: aktif ? '2px solid var(--primary)' : '1px solid var(--border)',
                    background: aktif ? '#EEF3FF' : '#fff',
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{JENIS_LAYANAN[k].label}</div>
                  <div style={{ fontSize: 13, color: 'var(--text2)' }}>
                    {JENIS_LAYANAN[k].harga ? rupiah(JENIS_LAYANAN[k].harga as number) : 'Isi sendiri'}
                  </div>
                </button>
              );
            })}
          </div>
          <input type="hidden" name="jenis" value={jenis} />
          {jenis === 'custom' && (
            <input
              name="harga_custom"
              type="number"
              inputMode="numeric"
              min={1}
              value={hargaCustom}
              onChange={(e) => setHargaCustom(e.target.value)}
              placeholder="Harga (Rp)"
              className="rounded-lg"
              style={{ height: 48, border: '1px solid var(--border)', padding: '0 14px', fontSize: 16, background: '#fff' }}
            />
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>Foto Mobil (wajib)</div>
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
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>Ketuk untuk foto mobil</div>
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
          {pending ? 'Menyimpan...' : 'Simpan & Ambil Nomor Antrian'}
        </button>
      </form>
    </div>
  );
}
