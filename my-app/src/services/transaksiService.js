import { API_URL } from "../config/api";

// ==========================
// AdminTransaksi.jsx
export async function getAllTransaksi() {
  const response = await fetch(`${API_URL}admin/transaksi`);

  if (!response.ok) {
    throw new Error("Gagal mengambil data transaksi");
  }

  return response.json();
}

export async function updateStatusTransaksi(id, status) {
  const response = await fetch(`${API_URL}admin/transaksi/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      status,
    }),
  });

  if (!response.ok) {
    throw new Error("Gagal mengubah status Transaksi");
  }

  return response.json();
}

// ===============================
// AdminDashboard.jsx

export async function getTotalTransaksi(setDasboard) {
  const response = await fetch(`${API_URL}admin/dashboard`);

  if (!response.ok) {
    throw new Error("Gagal mengambil data transaksi");
  }

  return response.json();
}

export async function getStatusDataDashboard() {
  const response = await fetch(`${API_URL}admin/status-transaksi`);

  if (!response.ok) {
    throw new Error("Gagal mengambil data transaksi");
  }

  return response.json();
}

export async function getTransaksiTerbaru(SetTransaksiTerbaru) {
  const response = await fetch(`${API_URL}admin/transaksi-terbaru`);

  if (!response.ok) {
    throw new Error("Gagal mengambil data transaksi");
  }

  return response.json();
}

export async function getUserTerbaru(setUserTerbaru) {
  const response = await fetch(`${API_URL}admin/user-terbaru`);

  if (!response.ok) {
    throw new Error("Gagal mengambil data transaksi");
  }

  return response.json();
}

export async function getGrafikTransaksi(setGrafikData) {
  const response = await fetch(`${API_URL}admin/grafik-transaksi`);

  if (!response.ok) {
    throw new Error("Gagal mengambil data transaksi");
  }

  return response.json();
}

export async function getGrafikKategori(setKategoriData) {
  const response = await fetch(`${API_URL}admin/grafik-kategori`);

  if (!response.ok) {
    throw new Error("Gagal mengambil data transaksi");
  }

  return response.json();
}

// ==========================
// FETCH Transaksi.jsx
export async function createTransaksi(transaksiBaru) {
  const response = await fetch(`${API_URL}transaksi`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(transaksiBaru),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Gagal menyimpan transaksi");
  }

  return data;
}

export async function uploadFoto(formData) {
  const response = await fetch(`${API_URL}upload-foto`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Gagal mengambil data transaksi");
  }

  return response.json();
}

// ==========================
// Riwayat Transaksi.jsx

export async function getRiwayatTransaksiUser(id) {
  const response = await fetch(`${API_URL}transaksi/user/${id}`);

  if (!response.ok) {
    throw new Error("Gagal mengambil data transaksi");
  }

  return response.json();
}

// =====================
// Dashboard.jsx

export async function getDashboardUser(id) {
  const response = await fetch(`${API_URL}dashboard/user/${id}`);

  if (!response.ok) {
    throw new Error("Gagal mengambil data transaksi");
  }

  return response.json();
}

export async function getTransaksiDahboard(id) {
  const response = await fetch(`${API_URL}transaksi/user/${id}`);

  if (!response.ok) {
    throw new Error("Gagal mengambil data transaksi");
  }

  return response.json();
}

export async function getStatistikLandingPage() {
  const response = await fetch(`${API_URL}statistik-landing-page`);

  if (!response.ok) {
    throw new Error("Gagal mengambil data statistik landing page");
  }

  return response.json();
}

export async function getStatusTransaksiUser() {
  const response = await fetch(`${API_URL}admin/status-transaksi`);

  if (!response.ok) {
    throw new Error("Gagal Mengambil Data Status Transaksi");
  }

  const data = await response.json();
  const statusResult = {
    Menunggu: 0,
    Diproses: 0,
    Dijemput: 0,
    Selesai: 0,
  };

  data.forEach((item) => {
    statusResult[item.status] = item.total;
  });

  return statusResult;
}
