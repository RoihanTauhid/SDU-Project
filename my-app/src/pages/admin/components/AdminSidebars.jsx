import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "./style/AdminSidebar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRecycle,
  faGaugeHigh,
  faCashRegister,
  faTag,
  faUsers,
  faArrowRightFromBracket,
  faUserGear,
  faBars,
  faXmark,
  faTruckFast,
} from "@fortawesome/free-solid-svg-icons";
import Ellipse from "../../../assets/Ellipse 395.png";
import { getUploadUrl, API_URL } from "../../../config/api";

function AdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingTrx, setPendingTrx] = useState(0);
  const [pendingUsers, setPendingUsers] = useState(0);
  const [activeKurirCount, setActiveKurirCount] = useState(0);
  const admin = JSON.parse(localStorage.getItem("user")) || {};
  const navigate = useNavigate();

  useEffect(() => {
    const loadBadges = async () => {
      try {
        const [dashRes, statusRes, kurirRes] = await Promise.all([
          fetch(`${API_URL}admin/dashboard`).then((r) => r.json()).catch(() => null),
          fetch(`${API_URL}admin/status-transaksi`).then((r) => r.json()).catch(() => []),
          fetch(`${API_URL}admin/kurir`).then((r) => r.json()).catch(() => []),
        ]);
        if (dashRes && dashRes.pendingVerifikasi !== undefined) {
          setPendingUsers(Number(dashRes.pendingVerifikasi) || 0);
        }
        if (Array.isArray(statusRes)) {
          const waiting = statusRes.find(
            (s) => s.status?.toLowerCase() === "menunggu"
          );
          setPendingTrx(Number(waiting?.total) || 0);
        }
        if (Array.isArray(kurirRes)) {
          const onDuty = kurirRes.filter(
            (k) => Number(k.active_tasks) > 0 || k.status === "bertugas"
          ).length;
          setActiveKurirCount(onDuty);
        }
      } catch (err) {
        console.error("Failed loading sidebar badges:", err);
      }
    };
    loadBadges();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <>
      {/* Mobile Sticky Toggle Header */}
      <div className="sdu-admin-mobile-bar">
        <div className="sdu-admin-mobile-brand">
          <div className="sdu-admin-icon-box">
            <FontAwesomeIcon icon={faRecycle} />
          </div>
          <div>
            <strong>SDU ADMIN</strong>
            <span>Admin Panel</span>
          </div>
        </div>

        <button
          className="sdu-admin-hamburger"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle Navigation"
        >
          <FontAwesomeIcon icon={mobileOpen ? faXmark : faBars} />
        </button>
      </div>

      {/* Main Admin Sidebar */}
      <aside className={`sdu-admin-sidebar ${mobileOpen ? "open" : ""}`}>
        {/* Sidebar Brand Header */}
        <div className="sdu-aside-header">
          <div className="sdu-aside-brand">
            <div className="sdu-admin-icon-box">
              <FontAwesomeIcon icon={faRecycle} />
            </div>
            <div className="sdu-aside-title-col">
              <span className="sdu-aside-title">SDU</span>
              <span className="sdu-aside-sub">Sistem Daur Ulang</span>
            </div>
          </div>
          <span className="sdu-aside-panel-badge">ADMIN PANEL</span>
        </div>

        {/* Navigation Menu */}
        <nav className="sdu-aside-nav">
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              `sdu-aside-nav-item ${isActive ? "active" : ""}`
            }
            onClick={() => setMobileOpen(false)}
          >
            <FontAwesomeIcon icon={faGaugeHigh} className="sdu-aside-nav-icon" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/admin/transaksi"
            className={({ isActive }) =>
              `sdu-aside-nav-item ${isActive ? "active" : ""}`
            }
            onClick={() => setMobileOpen(false)}
          >
            <FontAwesomeIcon
              icon={faCashRegister}
              className="sdu-aside-nav-icon"
            />
            <span className="sdu-nav-text">Kelola Transaksi</span>
            {pendingTrx > 0 && (
              <span className="sdu-aside-count-badge">{pendingTrx} Baru</span>
            )}
          </NavLink>

          <NavLink
            to="/admin/harga"
            className={({ isActive }) =>
              `sdu-aside-nav-item ${isActive ? "active" : ""}`
            }
            onClick={() => setMobileOpen(false)}
          >
            <FontAwesomeIcon icon={faTag} className="sdu-aside-nav-icon" />
            <span>Kelola Harga</span>
          </NavLink>

          <NavLink
            to="/admin/kurir"
            className={({ isActive }) =>
              `sdu-aside-nav-item ${isActive ? "active" : ""}`
            }
            onClick={() => setMobileOpen(false)}
          >
            <FontAwesomeIcon icon={faTruckFast} className="sdu-aside-nav-icon" />
            <span className="sdu-nav-text">Kelola Kurir</span>
            {activeKurirCount > 0 && (
              <span className="sdu-aside-count-badge">
                {activeKurirCount} Bertugas
              </span>
            )}
          </NavLink>

          <NavLink
            to="/admin/user"
            className={({ isActive }) =>
              `sdu-aside-nav-item ${isActive ? "active" : ""}`
            }
            onClick={() => setMobileOpen(false)}
          >
            <FontAwesomeIcon icon={faUsers} className="sdu-aside-nav-icon" />
            <span className="sdu-nav-text">Kelola User</span>
            {pendingUsers > 0 && (
              <span className="sdu-aside-count-badge">
                {pendingUsers} Verifikasi
              </span>
            )}
          </NavLink>
        </nav>

        {/* Sidebar Bottom Profile Card */}
        <div className="sdu-aside-profile-card">
          <Link to="/admin/profil" className="sdu-aside-user-link">
            <img
              src={
                admin.foto_profil
                  ? getUploadUrl("profil", admin.foto_profil)
                  : Ellipse
              }
              alt={admin.nama || "Admin SDU"}
              className="sdu-aside-avatar"
            />
            <div className="sdu-aside-user-info">
              <strong className="sdu-aside-admin-name">
                {admin.nama || "Budi Santoso"}
              </strong>
              <span className="sdu-aside-admin-role">
                Kepala Operasional Depo Menteng
              </span>
            </div>
          </Link>

          <button
            className="sdu-aside-logout-btn"
            title="Keluar Akun Admin"
            onClick={handleLogout}
          >
            <FontAwesomeIcon icon={faArrowRightFromBracket} />
          </button>
        </div>
      </aside>
    </>
  );
}

export default AdminSidebar;
