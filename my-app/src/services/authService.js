import { API_URL } from "../config/api";

export async function getLoginAuth(identifier, password) {
  const response = await fetch(`${API_URL}login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    const err = new Error(data.message || "Login gagal");
    err.status_verifikasi = data.status_verifikasi;
    err.catatan_verifikasi = data.catatan_verifikasi;
    throw err;
  }

  return data;
}

export async function getRegisAuth(formDataPayload) {
  const response = await fetch(`${API_URL}register`, {
    method: "POST",
    body: formDataPayload,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Registrasi gagal");
  }

  return data;
}
