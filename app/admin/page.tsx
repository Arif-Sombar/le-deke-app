import { redirect } from 'next/navigation';
import { getSesi } from '@/lib/session';
import { logoutAction } from '@/app/actions';

export default async function AdminPage() {
  const sesi = await getSesi();
  if (!sesi) {
    redirect('/login');
  }
  if (sesi.peran !== 'owner') {
    redirect('/dashboard');
  }

  return (
    <div
      className="w-full min-h-screen flex flex-col items-center justify-center gap-4"
      style={{ background: 'var(--bg)', padding: 24 }}
    >
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)' }}>Cuci Mobil Le-Deke</div>
      <div style={{ fontSize: 20, fontWeight: 800 }}>Halo, {sesi.nama} (Owner)</div>
      <div style={{ fontSize: 13, color: 'var(--text2)', textAlign: 'center', maxWidth: 300 }}>
        Anda masuk sebagai owner. Halaman ini bisa dibuka dari mana saja tanpa GPS atau foto.
        Dashboard owner (laporan, persetujuan pencairan, pengeluaran) masih dalam pengembangan.
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
