// Konfigurasi endpoint API sentral
// Membaca URL dari file environment (.env), fallback ke backend lokal jika tidak diatur
const rawUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/";
export const API_URL = rawUrl.endsWith("/") ? rawUrl : `${rawUrl}/`;

/**
 * Helper untuk mengambil URL lengkap berkas upload (foto profil / transaksi / ktp)
 * @param {'profil' | 'transaksi' | 'ktp'} folder
 * @param {string} filename
 * @returns {string} URL lengkap gambar
 */
export const getUploadUrl = (folder, filename) => {
  if (!filename) return "";
  if (filename.startsWith("http://") || filename.startsWith("https://")) {
    return filename;
  }
  return `${API_URL}uploads/${folder}/${filename}`;
};
