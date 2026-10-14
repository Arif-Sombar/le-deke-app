import { redirect } from 'next/navigation';
import { getSesi } from '@/lib/session';
import CuciClient from './CuciClient';

export default async function CuciPage() {
  const sesi = await getSesi();
  if (!sesi) redirect('/login');
  if (sesi.peran === 'owner') redirect('/admin');
  return <CuciClient />;
}
