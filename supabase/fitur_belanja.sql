-- Fitur Catat Belanja. Jalankan SEKALI di Supabase SQL Editor. Aman dijalankan berulang.

-- 1. Catat siapa yang mencatat belanja
alter table pengeluaran
  add column if not exists dicatat_oleh uuid references pegawai(id);

-- 2. Saldo kas total = semua kas masuk (20% tiap cucian) dikurangi semua belanja
create or replace function saldo_kas()
returns numeric
language sql
stable
as $$
  select coalesce((select sum(bagian_kas) from transaksi_cuci), 0)
       - coalesce((select sum(nominal) from pengeluaran), 0);
$$;
