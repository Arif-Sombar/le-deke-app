import { redirect } from 'next/navigation';
import { getSesi } from '@/lib/session';
import BelanjaClient from './BelanjaClient';

export default async function BelanjaPage() {
  const sesi = await getSesi();
  if (!sesi) redirect('/login');
  if (sesi.peran === 'owner') redirect('/admin');
  return <BelanjaClient />;
}
