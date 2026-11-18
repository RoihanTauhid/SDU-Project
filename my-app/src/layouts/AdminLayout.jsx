import React from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminSidebar from "../pages/admin/components/AdminSidebars";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faArrowUpRightFromSquare,
  faBell,
} from "@fortawesome/free-solid-svg-icons";
import Ellipse from "../assets/Ellipse 395.png";
import { getUploadUrl } from "../config/api";
import "./style/AdminLayout.css";

function AdminLayout({ icon, eyebrow, title, subtitle, rightActions, children }) {
  const admin = JSON.parse(localStorage.getItem("user")) || {};
  const navigate = useNavigate();

  return (
    <div className="sdu-admin-wrapper">
      <AdminSidebar />

      <main className="sdu-admin-main-container">
        {/* ========================================================
            TOP MICRO-BAR (Match Image 4 & 5)
        ======================================================== */}
        <header className="sdu-admin-top-microbar">
          <div className="sdu-topbar-left-tags">
            <span className="sdu-tag-badge brand">SDU ADMIN</span>
            <span className="sdu-tag-badge neutral">Operasional Depo</span>
            <span className="sdu-tag-badge active-live">
              <span className="sdu-live-dot" /> Sistem Operasional Aktif (Depo Pusat)
            </span>
          </div>

          <div className="sdu-topbar-right-actions">
            {/* Search Input */}
            <div className="sdu-topbar-search">
              <FontAwesomeIcon icon={faMagnifyingGlass} />
              <input
                type="text"
                placeholder="Cari tiket, transaksi, atau mitra..."
              />
            </div>

            {/* Portal Publik Link */}
            <Link to="/" className="sdu-topbar-link" target="_blank">
              <span>Portal Publik</span>
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
            </Link>

            {/* Notification Bell */}
            <button
              className="sdu-topbar-icon-btn"
              title="Notifikasi Penjemputan"
              onClick={() => navigate("/admin/transaksi")}
            >
              <FontAwesomeIcon icon={faBell} />
              <span className="sdu-notif-ping" />
            </button>

            {/* Admin Avatar */}
            <Link to="/admin/profil" className="sdu-topbar-avatar-btn">
              <img
                src={
                  admin.foto_profil
                    ? getUploadUrl("profil", admin.foto_profil)
                    : Ellipse
                }
                alt={admin.nama || "Admin"}
                className="sdu-admin-topbar-avatar"
              />
            </Link>
          </div>
        </header>

        {/* ========================================================
            PAGE HEADER (IF PROVIDED)
        ======================================================== */}
        <div className="sdu-admin-page-body">
          {(eyebrow || title) && (
            <div className="sdu-admin-header-row">
              <div className="sdu-admin-header-left">
                {eyebrow && (
                  <span className="sdu-admin-header-eyebrow">{eyebrow}</span>
                )}
                <div className="sdu-admin-title-group">
                  {icon && (
                    <div className="sdu-admin-header-icon-box">
                      <FontAwesomeIcon icon={icon} />
                    </div>
                  )}
                  {title && <h1 className="sdu-admin-main-title">{title}</h1>}
                </div>
                {subtitle && (
                  <p className="sdu-admin-main-subtitle">{subtitle}</p>
                )}
              </div>

              {rightActions && (
                <div className="sdu-admin-header-right">{rightActions}</div>
              )}
            </div>
          )}

          {/* PAGE CONTENT */}
          {children}
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;
