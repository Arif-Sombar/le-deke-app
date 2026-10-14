export const JENIS_LAYANAN = {
  full: { label: 'Cuci Full', harga: 50000 },
  luar_saja: { label: 'Luar Saja', harga: 35000 },
  bus: { label: 'Bus', harga: 75000 },
  custom: { label: 'Harga Khusus', harga: null },
} as const;

export type JenisLayanan = keyof typeof JENIS_LAYANAN;

// Pembagian tetap: 40% pegawai, 40% owner, 20% kas (tanpa pembulatan)
export function bagiHarga(harga: number) {
  return {
    bagian_pegawai: harga * 0.4,
    bagian_owner: harga * 0.4,
    bagian_kas: harga * 0.2,
  };
}

export function rupiah(n: number): string {
  return 'Rp' + Math.round(n).toLocaleString('id-ID');
}
