import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import "./style/AdminUser.css";
import { getUserAdmin } from "../../services/userService";
import { getUploadUrl } from "../../config/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faUserSlash,
  faUserCheck,
  faUserClock,
  faShieldHalved,
  faPhone,
  faLocationDot,
  faIdCard,
  faClock,
  faCircleCheck,
  faCircleXmark,
  faCircleInfo,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";

function getInisial(nama = "") {
  const parts = nama.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

const VERIF_META = {
  pending: {
    label: "Menunggu Verifikasi",
    className: "pending",
    icon: faClock,
  },
  verified: {
    label: "Terverifikasi",
    className: "verified",
    icon: faCircleCheck,
  },
  rejected: {
    label: "Ditolak",
    className: "rejected",
    icon: faCircleXmark,
  },
};

function AdminUser() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await getUserAdmin();
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Reset page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const stats = useMemo(() => {
    const totalUsers = users.length;
    const pendingUsers = users.filter(
      (u) => (u.status_verifikasi || "pending") === "pending"
    ).length;
    const verifiedUsers = users.filter(
      (u) => u.status_verifikasi === "verified"
    ).length;
    const rejectedUsers = users.filter(
      (u) => u.status_verifikasi === "rejected"
    ).length;

    return {
      totalUsers,
      pendingUsers,
      verifiedUsers,
      rejectedUsers,
    };
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const userStatus = user.status_verifikasi || "pending";
      if (statusFilter !== "Semua" && userStatus !== statusFilter) {
        return false;
      }

      if (!search.trim()) return true;
      const kw = search.toLowerCase();
      return (
        user.nama?.toLowerCase().includes(kw) ||
        user.username?.toLowerCase().includes(kw) ||
        user.nik?.includes(kw) ||
        user.no_hp?.includes(kw) ||
        user.alamat?.toLowerCase().includes(kw)
      );
    });
  }, [users, search, statusFilter]);

  // Pagination slice
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const currentUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleOpenWa = (e, user) => {
    e.stopPropagation();
    if (!user.no_hp) return;
    const cleanPhone = user.no_hp.replace(/^0/, "").replace(/[^0-9]/g, "");
    const text = encodeURIComponent(
      `Halo Kak ${user.nama}, kami dari tim verifikasi data Depo SDU terkait pendaftaran akun warga Anda.`
    );
    window.open(`https://wa.me/62${cleanPhone}?text=${text}`, "_blank");
  };

  // Header Right Stats Chips
  const headerRight = (
    <div className="sdu-admin-header-chips">
      <div className="sdu-header-chip-box">
        <div className="sdu-chip-icon-wrap blue">
          <FontAwesomeIcon icon={faUserCheck} />
        </div>
        <div className="sdu-chip-text-wrap">
          <span className="sdu-chip-sub">TERVERIFIKASI</span>
          <span className="sdu-chip-val green">{stats.verifiedUsers} Warga</span>
        </div>
      </div>

      {stats.pendingUsers > 0 && (
        <div className="sdu-header-chip-box pending">
          <div className="sdu-chip-icon-wrap amber">
            <FontAwesomeIcon icon={faUserClock} />
          </div>
          <div className="sdu-chip-text-wrap">
            <span className="sdu-chip-sub">PERLU VERIFIKASI KTP</span>
            <span className="sdu-chip-val amber">{stats.pendingUsers} Pendaftar</span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <AdminLayout
      eyebrow="DATABASE & VERIFIKASI KTP WARGA • SDU Security"
      title="Kelola & Verifikasi Data Warga"
      subtitle="Periksa kesesuaian identitas formal dan foto KTP pendaftar baru sebelum menyetujui akses login dan transaksi."
      rightActions={headerRight}
    >
      <div className="sdu-admin-user-container">
        {/* Pending Verification Alert Banner */}
        {stats.pendingUsers > 0 && statusFilter !== "pending" && (
          <div className="sdu-verif-alert-banner">
            <div className="sdu-verif-banner-left">
              <FontAwesomeIcon icon={faShieldHalved} />
              <span>
                Terdapat <strong>{stats.pendingUsers} akun pendaftar baru</strong>{" "}
                yang menunggu pemeriksaan & verifikasi KTP oleh Admin.
              </span>
            </div>
            <button
              className="sdu-verif-banner-btn"
              onClick={() => setStatusFilter("pending")}
            >
              Tampilkan Antrean Verifikasi
            </button>
          </div>
        )}

        {/* Verification Status Filter Tabs */}
        <div className="sdu-user-status-tabs">
          {[
            { key: "Semua", label: "Semua Pendaftar", count: stats.totalUsers },
            {
              key: "pending",
              label: "Menunggu Verifikasi",
              count: stats.pendingUsers,
              alert: stats.pendingUsers > 0,
            },
            {
              key: "verified",
              label: "Terverifikasi",
              count: stats.verifiedUsers,
            },
            {
              key: "rejected",
              label: "Ditolak",
              count: stats.rejectedUsers,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              className={`sdu-user-tab-pill ${
                statusFilter === tab.key ? "active" : ""
              } ${tab.alert ? "has-pending" : ""}`}
              onClick={() => setStatusFilter(tab.key)}
            >
              <span>{tab.label}</span>
              <span className="sdu-tab-count">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Search and Filter bar */}
        <div className="sdu-user-filter-toolbar">
          <div className="sdu-user-search-wrapper">
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="sdu-search-icon"
            />
            <input
              type="text"
              placeholder="Cari nama warga, username, NIK, nomor HP, atau alamat..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="sdu-user-count-badge">
            Menampilkan <strong>{currentUsers.length}</strong> dari{" "}
            {filteredUsers.length} pendaftar terfilter
          </div>
        </div>

        {/* User Table List View */}
        {loading ? (
          <div className="sdu-user-loading">
            <div className="sdu-spinner" />
            <p>Memuat direktori & antrean verifikasi warga...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="user-empty">
            <FontAwesomeIcon icon={faUserSlash} className="empty-icon" />
            <h3>Tidak Ada Data Warga</h3>
            <p>
              {statusFilter === "pending"
                ? "Semua pendaftar saat ini sudah selesai diverifikasi."
                : "Belum ada data warga yang cocok dengan filter pencarian ini."}
            </p>
          </div>
        ) : (
          <div className="sdu-admin-user-table-card">
            <div className="sdu-admin-table-scroll">
              <table className="sdu-admin-user-table">
                <thead>
                  <tr>
                    <th>Warga & Akun</th>
                    <th>Identitas Formal & Kontak</th>
                    <th>Alamat Penjemputan</th>
                    <th>Aktivitas Sampah</th>
                    <th>Total Pencairan</th>
                    <th>Status Verifikasi</th>
                    <th className="text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.map((user) => {
                    const statusKey = user.status_verifikasi || "pending";
                    const statusInfo =
                      VERIF_META[statusKey] || VERIF_META.pending;
                    const beratKg = (
                      Number(user.totalBerat || 0) / 1000
                    ).toLocaleString("id-ID", {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1,
                    });
                    const nominalRp = Number(
                      user.totalPendapatan || 0
                    ).toLocaleString("id-ID");

                    return (
                      <tr
                        key={user.id}
                        onClick={() => navigate(`/admin/user/${user.id}`)}
                        className={`sdu-user-row ${
                          statusKey === "pending" ? "row-pending" : ""
                        }`}
                      >
                        <td>
                          <div className="sdu-user-identity-cell">
                            {user.foto_profil ? (
                              <img
                                src={getUploadUrl("profil", user.foto_profil)}
                                alt={user.nama}
                                className="sdu-user-avatar-table"
                              />
                            ) : (
                              <div className="sdu-user-avatar-table placeholder">
                                {getInisial(user.nama)}
                              </div>
                            )}
                            <div className="sdu-user-name-col">
                              <strong className="sdu-user-name">
                                {user.nama}
                              </strong>
                              <span className="sdu-user-handle">
                                @{user.username || "warga"}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="sdu-user-contact-col">
                            {user.nik ? (
                              <div className="sdu-user-nik-tag">
                                <FontAwesomeIcon icon={faIdCard} />
                                <span>{user.nik}</span>
                              </div>
                            ) : (
                              <span className="sdu-no-nik">NIK Belum Ada</span>
                            )}
                            <div className="sdu-user-phone-row">
                              <span className="sdu-phone-text">
                                <FontAwesomeIcon icon={faPhone} />{" "}
                                {user.no_hp || "-"}
                              </span>
                              {user.no_hp && (
                                <button
                                  className="sdu-user-mini-wa"
                                  onClick={(e) => handleOpenWa(e, user)}
                                  title="Chat WhatsApp"
                                >
                                  <FontAwesomeIcon icon={faWhatsapp} />
                                </button>
                              )}
                            </div>
                          </div>
                        </td>

                        <td>
                          <div
                            className="sdu-user-address-cell"
                            title={user.alamat}
                          >
                            <FontAwesomeIcon icon={faLocationDot} />
                            <span>
                              {user.alamat
                                ? user.alamat.length > 34
                                  ? user.alamat.slice(0, 34) + "..."
                                  : user.alamat
                                : "Alamat belum diatur"}
                            </span>
                          </div>
                        </td>

                        <td>
                          <div className="sdu-user-stats-cell">
                            <strong>{user.totalTransaksi || 0}x Transaksi</strong>
                            <span className="sdu-user-weight-sub">
                              {beratKg} Kg terpilah
                            </span>
                          </div>
                        </td>

                        <td>
                          <strong className="sdu-user-payout">
                            Rp {nominalRp}
                          </strong>
                        </td>

                        <td>
                          <span
                            className={`sdu-verif-badge ${statusInfo.className}`}
                          >
                            <FontAwesomeIcon icon={statusInfo.icon} />
                            <span>{statusInfo.label}</span>
                          </span>
                        </td>

                        <td className="text-right">
                          {statusKey === "pending" ? (
                            <button
                              className="sdu-btn-verif-action pending"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/admin/user/${user.id}`);
                              }}
                            >
                              <FontAwesomeIcon icon={faShieldHalved} />
                              <span>Verifikasi KTP</span>
                            </button>
                          ) : (
                            <button
                              className="sdu-btn-verif-action"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/admin/user/${user.id}`);
                              }}
                            >
                              <FontAwesomeIcon icon={faCircleInfo} />
                              <span>Detail</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination Bar */}
        {filteredUsers.length > 0 && (
          <div className="sdu-admin-pagination-bar">
            <span className="sdu-pagination-info">
              Menampilkan {currentUsers.length} dari {filteredUsers.length} pendaftar terfilter
            </span>

            <div className="sdu-pagination-controls">
              <button
                className="sdu-pagination-btn nav"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                ‹ Sebelumnya
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    className={`sdu-pagination-btn num ${
                      currentPage === page ? "active" : ""
                    }`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                className="sdu-pagination-btn nav"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Selanjutnya ›
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminUser;
