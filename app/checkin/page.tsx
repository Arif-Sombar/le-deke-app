import { redirect } from 'next/navigation';
import { getSesi } from '@/lib/session';
import CheckinClient from './CheckinClient';

export default async function CheckinPage() {
  const sesi = await getSesi();
  if (!sesi) {
    redirect('/login');
  }
  // Owner tidak perlu check-in
  if (sesi.peran === 'owner') {
    redirect('/admin');
  }
  return <CheckinClient />;
}
