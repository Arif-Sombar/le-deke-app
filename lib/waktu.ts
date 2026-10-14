// Semua perhitungan hari memakai WITA (UTC+8), bukan UTC server.
const WITA_MS = 8 * 60 * 60 * 1000;

export function tanggalWita(d: Date = new Date()): string {
  return new Date(d.getTime() + WITA_MS).toISOString().slice(0, 10);
}

export function rentangHariWita(tanggal: string): { awal: string; akhir: string } {
  const awal = new Date(`${tanggal}T00:00:00+08:00`);
  const akhir = new Date(awal.getTime() + 24 * 60 * 60 * 1000);
  return { awal: awal.toISOString(), akhir: akhir.toISOString() };
}

export function jamWita(iso: string): string {
  return new Date(new Date(iso).getTime() + WITA_MS).toISOString().slice(11, 16);
}
