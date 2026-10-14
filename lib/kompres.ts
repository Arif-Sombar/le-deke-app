// Kompres foto di HP sebelum dikirim: sisi terpanjang 1280px, JPEG kualitas 0.7.
export async function kompresFoto(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const skala = Math.min(1, 1280 / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * skala);
    const h = Math.round(bitmap.height * skala);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.7));
    if (!blob) return file;
    return new File([blob], 'foto.jpg', { type: 'image/jpeg' });
  } catch {
    return file;
  }
}

// Ganti file di <input type="file"> dengan versi terkompres
export function pasangFile(input: HTMLInputElement, file: File) {
  const dt = new DataTransfer();
  dt.items.add(file);
  input.files = dt.files;
}
