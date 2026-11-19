import { API_URL } from "../config/api";

export const getAllKurir = async () => {
  const response = await fetch(`${API_URL}admin/kurir`);
  if (!response.ok) throw new Error("Gagal mengambil daftar kurir");
  return response.json();
};

export const createKurir = async (formData) => {
  const response = await fetch(`${API_URL}admin/kurir`, {
    method: "POST",
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Gagal menambahkan kurir");
  return data;
};

export const updateKurir = async (id, formData) => {
  const response = await fetch(`${API_URL}admin/kurir/${id}`, {
    method: "PUT",
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Gagal memperbarui kurir");
  return data;
};

export const updateStatusKurir = async (id, status) => {
  const response = await fetch(`${API_URL}admin/kurir/${id}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Gagal memperbarui status kurir");
  return data;
};

export const deleteKurir = async (id) => {
  const response = await fetch(`${API_URL}admin/kurir/${id}`, {
    method: "DELETE",
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Gagal menghapus kurir");
  return data;
};

export const assignKurirToTransaksi = async (transaksiId, kurirId, status = "Dijemput") => {
  const response = await fetch(`${API_URL}admin/transaksi/${transaksiId}/tugaskan-kurir`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kurir_id: kurirId, status }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Gagal menugaskan kurir");
  return data;
};

export const getKurirProfil = async (userId) => {
  const response = await fetch(`${API_URL}kurir/profil/${userId}`);
  if (!response.ok) throw new Error("Gagal mengambil profil kurir");
  return response.json();
};

export const getKurirTugas = async (kurirId) => {
  const response = await fetch(`${API_URL}kurir/tugas/${kurirId}`);
  if (!response.ok) throw new Error("Gagal mengambil tugas kurir");
  return response.json();
};

export const updateStatusTugas = async (transaksiId, status, kurirId) => {
  const response = await fetch(`${API_URL}kurir/transaksi/${transaksiId}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, kurir_id: kurirId }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Gagal mengupdate status tugas");
  return data;
};
