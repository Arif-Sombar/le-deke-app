-- Schema database untuk aplikasi Cuci Mobil Le-Deke
-- Jalankan di Supabase SQL Editor (Project > SQL Editor > New query)

create extension if not exists pgcrypto;

-- ========================================
-- 1. PEGAWAI
-- ========================================
create table if not exists pegawai (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  username text not null unique,
  pin text not null,
  status text not null default 'aktif' check (status in ('aktif', 'nonaktif')),
  created_at timestamptz not null default now()
);

-- ========================================
-- 2. ABSENSI
-- ========================================
create table if not exists absensi (
  id uuid primary key default gen_random_uuid(),
  pegawai_id uuid not null references pegawai(id) on delete cascade,
  tanggal date not null default current_date,
  waktu_checkin timestamptz,
  lokasi_checkin_lat numeric,
  lokasi_checkin_lng numeric,
  status_lokasi text check (status_lokasi in ('sesuai', 'di_luar_radius')),
  foto_stok_kopi text,
  waktu_checkout timestamptz,
  checkout_manual boolean not null default false,
  created_at timestamptz not null default now(),
  unique (pegawai_id, tanggal)
);

-- ========================================
-- 3. TRANSAKSI_CUCI
-- ========================================
create table if not exists transaksi_cuci (
  id uuid primary key default gen_random_uuid(),
  plat_nomor text not null,
  jenis_layanan text not null check (jenis_layanan in ('full', 'luar_saja', 'bus', 'custom')),
  harga numeric not null,
  bagian_pegawai numeric not null,
  bagian_owner numeric not null,
  bagian_kas numeric not null,
  waktu_masuk timestamptz not null default now(),
  foto_url text,
  kondisi_cuaca text,
  nomor_antrian integer,
  created_at timestamptz not null default now()
);

create index if not exists idx_transaksi_cuci_waktu_masuk on transaksi_cuci (waktu_masuk);

-- ========================================
-- 4. PENGELUARAN
-- ========================================
create table if not exists pengeluaran (
  id uuid primary key default gen_random_uuid(),
  tanggal date not null default current_date,
  kategori text not null,
  nominal numeric not null,
  keterangan text,
  foto_struk text,
  created_at timestamptz not null default now()
);

-- ========================================
-- 5. CLOSING_HARIAN
-- ========================================
create table if not exists closing_harian (
  tanggal date primary key,
  status text not null default 'belum_closing' check (status in ('belum_closing', 'sudah_closing')),
  total_mobil integer,
  waktu_closing timestamptz
);

-- ========================================
-- 6. SALDO_PEGAWAI (hutang gaji ke pegawai)
-- ========================================
create table if not exists saldo_pegawai (
  pegawai_id uuid primary key references pegawai(id) on delete cascade,
  total_terkumpul numeric not null default 0,
  total_dicairkan numeric not null default 0,
  updated_at timestamptz not null default now()
);

-- ========================================
-- 7. PENGAJUAN_PENCAIRAN
-- ========================================
create table if not exists pengajuan_pencairan (
  id uuid primary key default gen_random_uuid(),
  pegawai_id uuid not null references pegawai(id) on delete cascade,
  tanggal_ajuan timestamptz not null default now(),
  jumlah numeric not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  tanggal_approve timestamptz,
  approved_by uuid references pegawai(id)
);

-- ========================================
-- Catatan keamanan (penting dibaca, bukan untuk dijalankan):
-- Tabel di atas belum mengaktifkan Row Level Security (RLS).
-- Untuk MVP tahap awal ini tidak masalah karena akses hanya lewat
-- backend aplikasi dengan secret key. Sebelum aplikasi dipakai
-- oleh banyak orang / terbuka ke publik, RLS wajib diaktifkan.
-- ========================================
