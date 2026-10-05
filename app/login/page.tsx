'use client';

import { useActionState } from 'react';
import { loginAction } from '@/app/actions';

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, null);

  return (
    <div
      className="w-full min-h-screen flex flex-col items-center"
      style={{ background: 'var(--bg)', padding: '64px 28px 40px' }}
    >
      <div className="flex flex-col items-center gap-1.5" style={{ marginBottom: 48 }}>
        <div
          className="flex items-center justify-center rounded-2xl"
          style={{ width: 56, height: 56, background: 'var(--primary)' }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 13l2-5a2 2 0 0 1 2-1h10a2 2 0 0 1 2 1l2 5" />
            <path d="M5 13h14v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-5Z" />
            <circle cx="7.5" cy="16.5" r="1" />
            <circle cx="16.5" cy="16.5" r="1" />
          </svg>
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em' }}>Le-Deke</div>
        <div style={{ fontSize: 13, color: 'var(--text2)' }}>Cuci Mobil Le-Deke</div>
      </div>

      <form
        action={formAction}
        className="w-full max-w-sm flex flex-col gap-4 rounded-2xl"
        style={{ background: 'var(--card)', border: '1px solid var(--border)', padding: 24 }}
      >
        <div style={{ fontSize: 15, fontWeight: 700 }}>Masuk sebagai Pegawai</div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="username" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            placeholder="budi.santoso"
            required
            className="rounded-lg"
            style={{ height: 44, border: '1px solid var(--border)', padding: '0 14px', fontSize: 14 }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="pin" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)' }}>
            PIN (4 digit)
          </label>
          <input
            id="pin"
            name="pin"
            type="password"
            inputMode="numeric"
            placeholder="••••"
            required
            className="rounded-lg"
            style={{ height: 44, border: '1px solid var(--border)', padding: '0 14px', fontSize: 14 }}
          />
        </div>

        {state?.error && (
          <div style={{ fontSize: 12, color: 'var(--danger)', background: 'var(--danger-bg)', padding: '8px 12px', borderRadius: 8 }}>
            {state.error}
          </div>
        )}

        <button
          type="submit"
          disabled={pending}
          className="rounded-xl"
          style={{
            height: 48,
            background: pending ? '#9CA3AF' : 'var(--primary)',
            color: '#fff',
            fontWeight: 700,
            fontSize: 14,
            marginTop: 4,
          }}
        >
          {pending ? 'Memeriksa...' : 'Masuk'}
        </button>
      </form>

      <div style={{ marginTop: 20, fontSize: 12, color: 'var(--text2)' }}>
        Lupa PIN? Hubungi owner toko.
      </div>
    </div>
  );
}
