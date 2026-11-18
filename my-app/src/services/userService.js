import { API_URL } from "../config/api";

// Halaman Transaksi.jsx
export async function getAlamatUser(id) {
  const response = await fetch(`${API_URL}user/${id}`);

  if (!response.ok) {
    throw new Error("Gagal mengambil data transaksi");
  }

  return response.json();
}

// ==============================
// Halaman Profil

export async function getProfilUser(id) {
  const response = await fetch(`${API_URL}user/${id}`);

  if (!response.ok) {
    throw new Error("Gagal mengambil data transaksi");
  }

  return response.json();
}

export async function uploadProfilUser(formData) {
  const response = await fetch(`${API_URL}upload-profil`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Gagal mengambil data transaksi");
  }

  return response.json();
}

export async function ubahProfilUser(id, userData) {
  const response = await fetch(`${API_URL}user/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    throw new Error("Gagal mengambil data transaksi");
  }

  return response.json();
}

// =================
// AdminUser.jsx

export async function getUserAdmin(setUsers) {
  const response = await fetch(`${API_URL}admin/user`);

  if (!response.ok) {
    throw new Error("Gagal mengambil data transaksi");
  }

  return response.json();
}

// AdminUserDetail
//======

export async function getUserDetailAdmin(id) {
  const response = await fetch(`${API_URL}admin/user/${id}`);

  if (!response.ok) {
    throw new Error("Gagal mengambil data user");
  }

  return response.json();
}

export async function verifikasiUserAdmin(id, status_verifikasi, catatan_verifikasi = "") {
  const response = await fetch(`${API_URL}admin/user/${id}/verifikasi`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status_verifikasi, catatan_verifikasi }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Gagal memperbarui status verifikasi");
  }

  return data;
}
