import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { logoutAction } from '@/app/actions';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const pegawaiId = cookieStore.get('pegawai_id')?.value;
  const nama = cookieStore.get('pegawai_nama')?.value ?? 'Pegawai';
  if (!pegawaiId) {
    redirect('/login');
  }

  return (
    <div
      className="w-full min-h-screen flex flex-col items-center justify-center gap-4"
      style={{ background: 'var(--bg)', padding: 24 }}
    >
      <div
        className="flex items-center justify-center rounded-full"
        style={{ width: 64, height: 64, background: 'var(--success-bg)' }}
      >
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>
      <div style={{ fontSize: 18, fontWeight: 700 }}>Check-in Berhasil, {nama}!</div>
      <div style={{ fontSize: 13, color: 'var(--text2)', textAlign: 'center', maxWidth: 280 }}>
        Dashboard lengkap (upah, riwayat mobil, pencairan) masih dalam pengembangan tahap berikutnya.
      </div>
      <form action={logoutAction}>
        <button
          type="submit"
          style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginTop: 8 }}
        >
          Keluar
        </button>
      </form>
    </div>
  );
}
