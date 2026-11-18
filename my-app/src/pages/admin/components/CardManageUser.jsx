import React from "react";
import { useNavigate } from "react-router-dom";
import "./style/CardManageUser.css";
import { getUploadUrl } from "../../../config/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronRight,
  faPhone,
  faLocationDot,
  faIdCard,
  faClock,
  faCircleCheck,
  faCircleXmark,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";

function getInisial(nama = "") {
  const parts = nama.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

const STATUS_META = {
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

function ManageUser({ user }) {
  const navigate = useNavigate();

  const statusKey = user.status_verifikasi || "pending";
  const statusInfo = STATUS_META[statusKey] || STATUS_META.pending;

  const beratKg = (Number(user.totalBerat || 0) / 1000).toLocaleString("id-ID", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  const nominalRp = Number(user.totalPendapatan || 0).toLocaleString("id-ID");

  const handleOpenWa = (e) => {
    e.stopPropagation();
    if (!user.no_hp) return;
    const cleanPhone = user.no_hp.replace(/^0/, "").replace(/[^0-9]/g, "");
    const text = encodeURIComponent(
      `Halo Kak ${user.nama}, kami dari tim admin Depo SDU. Ada yang bisa kami bantu terkait akun atau verifikasi pendaftaran SDU Anda?`
    );
    window.open(`https://wa.me/62${cleanPhone}?text=${text}`, "_blank");
  };

  return (
    <div
      className={`sdu-user-card ${statusKey === "pending" ? "needs-verif" : ""}`}
      onClick={() => navigate(`/admin/user/${user.id}`)}
    >
      {/* Top verification strip */}
      <div className="sdu-user-status-bar">
        <span className={`sdu-user-verif-badge ${statusInfo.className}`}>
          <FontAwesomeIcon icon={statusInfo.icon} />
          <span>{statusInfo.label}</span>
        </span>
        {user.username && (
          <span className="sdu-user-handle">@{user.username}</span>
        )}
      </div>

      {/* Top row: Avatar + Name + Phone + WA */}
      <div className="sdu-user-top">
        {user.foto_profil ? (
          <img
            src={getUploadUrl("profil", user.foto_profil)}
            alt={user.nama}
            className="sdu-user-avatar-img"
          />
        ) : (
          <div className="sdu-user-avatar">{getInisial(user.nama)}</div>
        )}

        <div className="sdu-user-identity">
          <h3 className="sdu-user-fullname">{user.nama}</h3>
          <span className="sdu-user-contact">
            <FontAwesomeIcon icon={faPhone} /> {user.no_hp}
          </span>
          {user.nik && (
            <span className="sdu-user-nik">
              <FontAwesomeIcon icon={faIdCard} /> NIK: {user.nik}
            </span>
          )}
        </div>

        <button
          className="sdu-user-wa-btn"
          title="Chat WhatsApp"
          onClick={handleOpenWa}
        >
          <FontAwesomeIcon icon={faWhatsapp} />
        </button>
      </div>

      {/* Address */}
      <div className="sdu-user-address-snippet">
        <FontAwesomeIcon icon={faLocationDot} />
        <span>{user.alamat || "Alamat belum dilengkapi di profil"}</span>
      </div>

      {/* 3 Metric counters */}
      <div className="sdu-user-metrics-row">
        <div className="sdu-user-metric-col">
          <span className="sdu-user-metric-sub">TRANSAKSI</span>
          <strong className="sdu-user-metric-val">{user.totalTransaksi || 0}x</strong>
        </div>

        <div className="sdu-user-metric-col">
          <span className="sdu-user-metric-sub">TOTAL BOBOT</span>
          <strong className="sdu-user-metric-val">{beratKg} Kg</strong>
        </div>

        <div className="sdu-user-metric-col">
          <span className="sdu-user-metric-sub">PENCAIRAN</span>
          <strong className="sdu-user-metric-val green">Rp {nominalRp}</strong>
        </div>
      </div>

      {/* Action Footer */}
      <div className={`sdu-user-card-footer ${statusKey === "pending" ? "pending-cta" : ""}`}>
        <span>
          {statusKey === "pending"
            ? "Periksa KTP & Verifikasi"
            : "Lihat Rincian & Riwayat"}
        </span>
        <FontAwesomeIcon icon={faChevronRight} />
      </div>
    </div>
  );
}

export default ManageUser;
