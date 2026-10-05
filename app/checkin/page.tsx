import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import CheckinClient from './CheckinClient';

export default async function CheckinPage() {
  const cookieStore = await cookies();
  const pegawaiId = cookieStore.get('pegawai_id')?.value;
  if (!pegawaiId) {
    redirect('/login');
  }
  return <CheckinClient />;
}
