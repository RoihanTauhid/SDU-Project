import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import {
  getUserDetailAdmin,
  verifikasiUserAdmin,
} from "../../services/userService";
import { getUploadUrl } from "../../config/api";
import "./style/AdminUserDetail.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faPhone,
  faLocationDot,
  faCalendarDays,
  faLocationArrow,
  faIdCard,
  faAt,
  faUser,
  faCircleCheck,
  faCircleXmark,
  faClock,
  faMagnifyingGlassPlus,
  faXmark,
  faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";

function getInisial(nama = "") {
  const parts = nama.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

const VERIF_STATUS_META = {
  pending: {
    label: "Menunggu Verifikasi KTP",
    className: "pending",
    icon: faClock,
  },
  verified: {
    label: "Mitra Terverifikasi SDU",
    className: "verified",
    icon: faCircleCheck,
  },
  rejected: {
    label: "Pendaftaran Ditolak",
    className: "rejected",
    icon: faCircleXmark,
  },
};

function AdminUserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [transaksi, setTransaksi] = useState([]);
  const [loading, setLoading] = useState(true);

  // Verification actions state
  const [verifying, setVerifying] = useState(false);
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [ktpZoomOpen, setKtpZoomOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getUserDetailAdmin(id);
      setUser(data.user);
      setTransaksi(Array.isArray(data.transaksi) ? data.transaksi : []);
    } catch (err) {
      console.error("Error loading user detail:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleVerifikasi = async (newStatus, catatan = "") => {
    if (newStatus === "rejected" && !catatan.trim()) {
      alert("Harap tuliskan alasan penolakan verifikasi.");
      return;
    }

    try {
      setVerifying(true);
      const res = await verifikasiUserAdmin(user.id, newStatus, catatan.trim());
      setUser((prev) => ({
        ...prev,
        status_verifikasi: res.status_verifikasi,
        catatan_verifikasi: res.catatan_verifikasi,
      }));
      setShowRejectBox(false);
      setRejectReason("");
      alert(res.message);
    } catch (err) {
      alert(err.message || "Gagal memproses verifikasi.");
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Detail & Verifikasi Warga">
        <div className="sdu-user-detail-loading">
          <div className="sdu-spinner" />
          <p>Memuat profil, dokumen KTP, dan transaksi warga...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!user) {
    return (
      <AdminLayout title="User Tidak Ditemukan">
        <div className="sdu-user-detail-loading">
          <p>Data warga tidak ditemukan di sistem.</p>
          <button
            className="sdu-btn-back"
            onClick={() => navigate("/admin/user")}
          >
            Kembali ke Daftar Warga
          </button>
        </div>
      </AdminLayout>
    );
  }

  const beratKg = (Number(user.totalBerat || 0) / 1000).toLocaleString(
    "id-ID",
    {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }
  );

  const nominalRp = Number(user.totalPendapatan || 0).toLocaleString("id-ID");

  const statusKey = user.status_verifikasi || "pending";
  const statusInfo = VERIF_STATUS_META[statusKey] || VERIF_STATUS_META.pending;

  const handleOpenWa = () => {
    if (!user.no_hp) return;
    const cleanPhone = user.no_hp.replace(/^0/, "").replace(/[^0-9]/g, "");
    const text = encodeURIComponent(
      `Halo Kak ${user.nama}, kami dari tim admin Depo SDU. Terkait pendaftaran / transaksi akun Anda di SDU.`
    );
    window.open(`https://wa.me/62${cleanPhone}?text=${text}`, "_blank");
  };

  const backButton = (
    <button
      className="sdu-btn-header-outline"
      onClick={() => navigate("/admin/user")}
    >
      <FontAwesomeIcon icon={faArrowLeft} />
      <span>Kembali ke Data Warga</span>
    </button>
  );

  return (
    <AdminLayout
      eyebrow="VERIFIKASI KTP & AUDIT DATA WARGA"
      title={user.nama}
      subtitle={`Username: ${
        user.username ? "@" + user.username : "-"
      } • No. WhatsApp: ${user.no_hp}`}
      rightActions={backButton}
    >
      <div className="sdu-admin-user-detail-body">
        {/* Top Profile Card */}
        <div className="sdu-citizen-profile-card">
          <div className="sdu-citizen-avatar-box">
            {user.foto_profil ? (
              <img
                src={getUploadUrl("profil", user.foto_profil)}
                alt={user.nama}
                className="sdu-citizen-img"
              />
            ) : (
              <div className="sdu-citizen-initial">{getInisial(user.nama)}</div>
            )}
          </div>

          <div className="sdu-citizen-profile-info">
            <div className="sdu-citizen-headline">
              <h2>{user.nama}</h2>
              <span className={`sdu-verif-pill ${statusInfo.className}`}>
                <FontAwesomeIcon icon={statusInfo.icon} />
                <span>{statusInfo.label}</span>
              </span>
            </div>

            <div className="sdu-citizen-meta-list">
              {user.username && (
                <span className="sdu-meta-item">
                  <FontAwesomeIcon icon={faAt} /> {user.username}
                </span>
              )}
              {user.nik && (
                <span className="sdu-meta-item">
                  <FontAwesomeIcon icon={faIdCard} /> NIK: {user.nik}
                </span>
              )}
              <span className="sdu-meta-item">
                <FontAwesomeIcon icon={faPhone} /> {user.no_hp}
              </span>
              <span className="sdu-meta-item">
                <FontAwesomeIcon icon={faLocationDot} />{" "}
                {user.alamat || "Belum melengkapi alamat rumah"}
              </span>
            </div>
          </div>

          <button className="sdu-btn-wa-direct" onClick={handleOpenWa}>
            <FontAwesomeIcon icon={faWhatsapp} />
            <span>Chat WhatsApp</span>
          </button>
        </div>

        {/* ========================================================
            PANEL VERIFIKASI IDENTITAS & KTP WARGA
        ======================================================== */}
        <div className={`sdu-ktp-verif-panel ${statusInfo.className}`}>
          <div className="sdu-ktp-panel-header">
            <div className="sdu-ktp-title-wrap">
              <div className={`sdu-ktp-shield ${statusInfo.className}`}>
                <FontAwesomeIcon icon={faShieldHalved} />
              </div>
              <div>
                <h3>Panel Pemeriksaan Identitas Formal & KTP</h3>
                <p>
                  Cocokkan data pendaftar dengan foto KTP untuk memastikan
                  keaslian warga dan menghindari akun fiktif/dummy.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="sdu-ktp-action-buttons">
              {statusKey !== "verified" && (
                <button
                  className="sdu-btn-approve-verif"
                  disabled={verifying}
                  onClick={() => handleVerifikasi("verified")}
                >
                  <FontAwesomeIcon icon={faCircleCheck} />
                  <span>
                    {verifying ? "Memproses..." : "Setujui & Verifikasi Akun"}
                  </span>
                </button>
              )}

              {statusKey !== "rejected" && (
                <button
                  className="sdu-btn-reject-verif"
                  disabled={verifying}
                  onClick={() => setShowRejectBox(!showRejectBox)}
                >
                  <FontAwesomeIcon icon={faCircleXmark} />
                  <span>Tolak Pendaftaran</span>
                </button>
              )}
            </div>
          </div>

          {/* Inline Reject Reason Box */}
          {showRejectBox && (
            <div className="sdu-reject-reason-box">
              <label>Alasan Penolakan (Akan tampil saat warga mencoba login):</label>
              <div className="sdu-quick-reason-chips">
                {[
                  "Foto KTP buram / tidak terbaca jelas",
                  "Nama atau NIK tidak sesuai dengan foto KTP",
                  "Alamat tidak lengkap / di luar jangkauan pengantaran",
                  "Terindikasi akun duplikat atau akun dummy",
                ].map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    className="sdu-reason-chip"
                    onClick={() => setRejectReason(reason)}
                  >
                    {reason}
                  </button>
                ))}
              </div>
              <textarea
                rows="2"
                placeholder="Tuliskan alasan penolakan verifikasi..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <div className="sdu-reject-actions">
                <button
                  type="button"
                  className="sdu-btn-cancel-reject"
                  onClick={() => setShowRejectBox(false)}
                >
                  Batal
                </button>
                <button
                  type="button"
                  className="sdu-btn-confirm-reject"
                  disabled={verifying}
                  onClick={() => handleVerifikasi("rejected", rejectReason)}
                >
                  {verifying ? "Menyimpan..." : "Konfirmasi Tolak Akun"}
                </button>
              </div>
            </div>
          )}

          {/* Show rejection note if rejected */}
          {statusKey === "rejected" && user.catatan_verifikasi && (
            <div className="sdu-rejected-note-banner">
              <strong>Catatan Penolakan Admin:</strong> {user.catatan_verifikasi}
            </div>
          )}

          {/* Side-by-side Data Formal vs Foto KTP */}
          <div className="sdu-ktp-compare-grid">
            <div className="sdu-formal-data-card">
              <h4>Data Formal Pendaftaran</h4>
              <div className="sdu-formal-list">
                <div className="sdu-formal-item">
                  <span>
                    <FontAwesomeIcon icon={faUser} /> Nama Lengkap
                  </span>
                  <strong>{user.nama}</strong>
                </div>
                <div className="sdu-formal-item highlight">
                  <span>
                    <FontAwesomeIcon icon={faIdCard} /> NIK (Sesuai KTP)
                  </span>
                  <strong>{user.nik || "-"}</strong>
                </div>
                <div className="sdu-formal-item">
                  <span>
                    <FontAwesomeIcon icon={faAt} /> Username Login
                  </span>
                  <strong>{user.username || "-"}</strong>
                </div>
                <div className="sdu-formal-item">
                  <span>
                    <FontAwesomeIcon icon={faPhone} /> Nomor HP / WhatsApp
                  </span>
                  <strong>{user.no_hp}</strong>
                </div>
                <div className="sdu-formal-item">
                  <span>
                    <FontAwesomeIcon icon={faCalendarDays} /> Tanggal Daftar
                  </span>
                  <strong>
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "-"}
                  </strong>
                </div>
                <div className="sdu-formal-item full">
                  <span>
                    <FontAwesomeIcon icon={faLocationDot} /> Alamat Lengkap Acuan Pengantaran
                  </span>
                  <strong>{user.alamat || "-"}</strong>
                </div>
              </div>
            </div>

            <div className="sdu-ktp-preview-card">
              <div className="sdu-ktp-preview-header">
                <h4>Dokumen Foto KTP Pendaftar</h4>
                {user.foto_ktp && (
                  <button
                    type="button"
                    className="sdu-btn-zoom-ktp"
                    onClick={() => setKtpZoomOpen(true)}
                  >
                    <FontAwesomeIcon icon={faMagnifyingGlassPlus} />
                    <span>Perbesar KTP</span>
                  </button>
                )}
              </div>

              {user.foto_ktp ? (
                <div
                  className="sdu-ktp-image-frame"
                  onClick={() => setKtpZoomOpen(true)}
                >
                  <img
                    src={getUploadUrl("ktp", user.foto_ktp)}
                    alt={`KTP ${user.nama}`}
                  />
                </div>
              ) : (
                <div className="sdu-ktp-empty">
                  <FontAwesomeIcon icon={faIdCard} />
                  <span>Tidak ada berkas foto KTP terunggah</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="sdu-user-stats-summary-grid">
          <div className="sdu-user-stat-card">
            <span className="sdu-stat-sub">TOTAL SETORAN PENJEMPUTAN</span>
            <strong className="sdu-stat-val">
              {user.totalTransaksi || 0} Kali
            </strong>
          </div>

          <div className="sdu-user-stat-card">
            <span className="sdu-stat-sub">AKUMULASI BOBOT SAMPAH</span>
            <strong className="sdu-stat-val green">{beratKg} Kg</strong>
          </div>

          <div className="sdu-user-stat-card">
            <span className="sdu-stat-sub">TOTAL DANA DICAIRKAN</span>
            <strong className="sdu-stat-val blue">Rp {nominalRp}</strong>
          </div>
        </div>

        {/* Transaction History Table */}
        <div className="sdu-user-trx-history-card">
          <div className="sdu-history-card-header">
            <h3>Riwayat Transaksi Warga Ini ({transaksi.length})</h3>
            <span className="sdu-history-sub">
              Semua log transaksi penjemputan terdaftar
            </span>
          </div>

          {transaksi.length === 0 ? (
            <div className="sdu-trx-empty-inline">
              Belum ada riwayat transaksi untuk warga ini.
            </div>
          ) : (
            <div className="sdu-user-trx-table-wrap">
              <table className="sdu-user-trx-table">
                <thead>
                  <tr>
                    <th>ID / Waktu</th>
                    <th>Kategori Sampah</th>
                    <th>Bobot</th>
                    <th>Total Payout</th>
                    <th>Status</th>
                    <th>Lokasi Penjemputan</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {transaksi.map((t) => {
                    const tBeratKg = (Number(t.berat || 0) / 1000).toFixed(1);
                    const tNominal = Number(t.totalharga || 0).toLocaleString(
                      "id-ID"
                    );
                    const statusClass = t.status?.toLowerCase() || "menunggu";

                    return (
                      <tr key={t.id}>
                        <td>
                          <strong>
                            #SDU-TRX-{String(t.id).padStart(4, "0")}
                          </strong>
                          <div className="sdu-t-time">
                            {t.created_at
                              ? new Date(t.created_at).toLocaleDateString(
                                  "id-ID",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )
                              : "-"}
                          </div>
                        </td>
                        <td>
                          <strong>{t.kategori}</strong>
                          {t.keterangan && (
                            <div className="sdu-t-desc">{t.keterangan}</div>
                          )}
                        </td>
                        <td>
                          <strong>{tBeratKg} Kg</strong>
                        </td>
                        <td>
                          <strong className="sdu-payout-text">
                            Rp {tNominal}
                          </strong>
                        </td>
                        <td>
                          <span
                            className={`sdu-item-status-pill ${statusClass}`}
                          >
                            {t.status}
                          </span>
                        </td>
                        <td>
                          <div className="sdu-loc-text">{t.lokasi || "-"}</div>
                        </td>
                        <td>
                          <button
                            className="sdu-btn-table-map"
                            onClick={() => {
                              if (t.latitude && t.longitude) {
                                window.open(
                                  `https://www.google.com/maps/dir/?api=1&destination=${t.latitude},${t.longitude}`,
                                  "_blank"
                                );
                              } else {
                                window.open(
                                  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                    t.lokasi || "Padang"
                                  )}`,
                                  "_blank"
                                );
                              }
                            }}
                          >
                            <FontAwesomeIcon icon={faLocationArrow} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* KTP ZOOM LIGHTBOX MODAL */}
      {ktpZoomOpen && user.foto_ktp && (
        <div
          className="sdu-ktp-lightbox"
          onClick={() => setKtpZoomOpen(false)}
        >
          <div
            className="sdu-ktp-lightbox-inner"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sdu-ktp-lightbox-bar">
              <span>
                Pemeriksaan Foto KTP — <strong>{user.nama}</strong> (NIK:{" "}
                {user.nik || "-"})
              </span>
              <button
                type="button"
                onClick={() => setKtpZoomOpen(false)}
                aria-label="Tutup Zoom"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
            <img
              src={getUploadUrl("ktp", user.foto_ktp)}
              alt={`Zoom KTP ${user.nama}`}
            />
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminUserDetail;
