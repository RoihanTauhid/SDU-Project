import { API_URL } from "../config/api";

// Halaman Transaksi.jsx
export async function getHargaSampah() {
  const response = await fetch(`${API_URL}harga`);

  if (!response.ok) {
    throw new Error("Gagal mengambil data harga");
  }

  return response.json();
}

// ====================
// AdminHarga.jsx
export async function getHargaAdmin() {
  const response = await fetch(`${API_URL}admin/harga`);

  if (!response.ok) {
    throw new Error("Gagal mengambil data harga");
  }

  return response.json();
}

export async function getHargaLogsAdmin() {
  const response = await fetch(`${API_URL}admin/harga/logs`);

  if (!response.ok) {
    throw new Error("Gagal mengambil riwayat log tarif");
  }

  return response.json();
}

export async function createHargaAdmin(kategori, harga) {
  const response = await fetch(`${API_URL}admin/harga`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kategori, harga }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Gagal menambah kategori");
  }

  return data;
}

// ====================
// Target Bonus Transaksi
export async function getTargetBonus() {
  const response = await fetch(`${API_URL}target-bonus`);

  if (!response.ok) {
    throw new Error("Gagal mengambil data target bonus");
  }

  return response.json();
}

export async function updateTargetBonusAdmin(min_berat, bonus, is_active) {
  const response = await fetch(`${API_URL}admin/target-bonus`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ min_berat, bonus, is_active }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Gagal memperbarui target bonus");
  }

  return data;
}
