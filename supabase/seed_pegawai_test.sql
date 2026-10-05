-- Data pegawai contoh untuk testing login & check-in.
-- Jalankan di Supabase SQL Editor setelah schema.sql berhasil.
-- Boleh diganti/ditambah sesuai pegawai asli nanti.

insert into pegawai (nama, username, pin, status)
values ('Budi Santoso', 'budi', '1234', 'aktif')
on conflict (username) do nothing;
