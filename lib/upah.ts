export type AbsenRow = {
  pegawai_id: string;
  waktu_checkin: string | null;
  waktu_checkout: string | null;
};
export type TrxRow = { id: string; waktu_masuk: string; bagian_pegawai: number };

// Upah per mobil dibagi rata ke pegawai yang "aktif" saat mobil dicatat:
// sudah check-in sebelum mobil dicatat, dan belum pulang (manual / otomatis 17:00).
export function hitungUpahPerPegawai(
  tanggal: string,
  transaksi: TrxRow[],
  absensi: AbsenRow[]
): Map<string, number> {
  const jam17 = new Date(`${tanggal}T17:00:00+08:00`).getTime();
  const hasil = new Map<string, number>();

  for (const t of transaksi) {
    const waktu = new Date(t.waktu_masuk).getTime();
    const aktif = absensi.filter((a) => {
      if (!a.waktu_checkin) return false;
      const masuk = new Date(a.waktu_checkin).getTime();
      const keluar = a.waktu_checkout ? new Date(a.waktu_checkout).getTime() : jam17;
      return masuk <= waktu && keluar > waktu;
    });
    if (aktif.length === 0) continue;
    const bagi = Number(t.bagian_pegawai) / aktif.length;
    for (const a of aktif) {
      hasil.set(a.pegawai_id, (hasil.get(a.pegawai_id) ?? 0) + bagi);
    }
  }
  return hasil;
}
