import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cuci Mobil Le-Deke",
  description: "Aplikasi absensi, transaksi cuci, dan gaji pegawai Cuci Mobil Le-Deke",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
