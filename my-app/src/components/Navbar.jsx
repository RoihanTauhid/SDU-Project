import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRecycle,
  faBell,
  faChevronDown,
  faUser,
  faClockRotateLeft,
  faPlusCircle,
  faArrowRightFromBracket,
  faArrowRightToBracket,
  faUserPlus,
  faBars,
  faXmark,
  faHouse,
  faReceipt,
} from "@fortawesome/free-solid-svg-icons";
import Logo from "../assets/Logo.png";
import Ellipse from "../assets/Ellipse 395.png";
import { getUploadUrl } from "../config/api";
import "./style/navbar.css";

function Navbar() {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setProfileDropdownOpen(false);
    navigate("/login");
  };

  return (
    <header className="sdu-navbar-wrapper">
      <div className="sdu-navbar-container">
        {/* ===== LOGO BRAND ===== */}
        <Link to="/" className="sdu-brand" title="SDU - Kembali ke Beranda Publik">
          <div className="sdu-brand-icon">
            <FontAwesomeIcon icon={faRecycle} />
          </div>
          <div className="sdu-brand-text">
            <span className="sdu-brand-title">SDU</span>
            <span className="sdu-brand-subtitle">SISTEM DAUR ULANG</span>
          </div>
        </Link>

        {/* ===== CENTER NAV PILLS (DESKTOP) ===== */}
        <nav className="sdu-nav-pills">
          {user ? (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `sdu-nav-pill ${isActive ? "active" : ""}`
                }
              >
                Dashboard Warga
              </NavLink>

              <NavLink
                to="/transaksi"
                className={({ isActive }) =>
                  `sdu-nav-pill ${isActive ? "active" : ""}`
                }
              >
                Setor Sampah
              </NavLink>

              <NavLink
                to="/riwayat"
                className={({ isActive }) =>
                  `sdu-nav-pill ${isActive ? "active" : ""}`
                }
              >
                Riwayat Transaksi
              </NavLink>
            </>
          ) : (
            <>
              <a href="#katalog" className="sdu-nav-pill">
                Katalog Sampah
              </a>
              <a href="#cara-kerja" className="sdu-nav-pill">
                Cara Kerja
              </a>
              <a href="#dampak" className="sdu-nav-pill">
                Dampak Lingkungan
              </a>
              <a href="#testimoni" className="sdu-nav-pill">
                Testimoni
              </a>
            </>
          )}
        </nav>

        {/* ===== RIGHT ACTION / USER PROFILE ===== */}
        <div className="sdu-navbar-actions">
          {user ? (
            <div className="sdu-user-section" ref={dropdownRef}>
              {/* Notification Bell */}
              <button
                className="sdu-icon-btn"
                title="Notifikasi Penjemputan"
                onClick={() => navigate("/riwayat")}
              >
                <FontAwesomeIcon icon={faBell} />
                <span className="sdu-notif-dot" />
              </button>

              {/* Profile Pill */}
              <div
                className="sdu-profile-pill"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              >
                <img
                  src={
                    user.foto_profil
                      ? getUploadUrl("profil", user.foto_profil)
                      : Ellipse
                  }
                  alt={user.nama || "Avatar Warga"}
                  className="sdu-nav-avatar"
                />
                <div className="sdu-profile-info">
                  <span className="sdu-profile-name">
                    {user.nama || "Warga SDU"}
                  </span>
                  <span className="sdu-profile-sub">
                    {user.alamat ? user.alamat.slice(0, 18) + "..." : "Warga Aktif"}
                  </span>
                </div>
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={`sdu-dropdown-arrow ${
                    profileDropdownOpen ? "open" : ""
                  }`}
                />
              </div>

              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="sdu-profile-dropdown">
                  <div className="sdu-dropdown-header">
                    <p className="sdu-user-full-name">{user.nama}</p>
                    <p className="sdu-user-phone">{user.no_hp}</p>
                    <span className="sdu-role-badge">Warga Terdaftar</span>
                  </div>

                  <div className="sdu-dropdown-divider" />

                  <Link
                    to="/profil"
                    className="sdu-dropdown-item"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <FontAwesomeIcon icon={faUser} />
                    <span>Profil Saya</span>
                  </Link>

                  <Link
                    to="/struk"
                    className="sdu-dropdown-item"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <FontAwesomeIcon icon={faReceipt} />
                    <span>Struk Transaksi</span>
                  </Link>

                  <div className="sdu-dropdown-divider" />

                  <button
                    className="sdu-dropdown-item sdu-logout-btn"
                    onClick={handleLogout}
                  >
                    <FontAwesomeIcon icon={faArrowRightFromBracket} />
                    <span>Keluar Akun</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="sdu-auth-actions">
              <Link to="/login" className="sdu-btn-outline">
                <FontAwesomeIcon icon={faArrowRightToBracket} />
                <span>Masuk</span>
              </Link>
              <Link to="/register" className="sdu-btn-solid">
                <FontAwesomeIcon icon={faUserPlus} />
                <span>Daftar Akun</span>
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            className="sdu-hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation"
          >
            <FontAwesomeIcon icon={mobileMenuOpen ? faXmark : faBars} />
          </button>
        </div>
      </div>

      {/* ===== MOBILE DRAWER / MENU ===== */}
      {mobileMenuOpen && (
        <div className="sdu-mobile-menu">
          {user ? (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `sdu-mobile-link ${isActive ? "active" : ""}`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard Warga
              </NavLink>
              <NavLink
                to="/transaksi"
                className={({ isActive }) =>
                  `sdu-mobile-link ${isActive ? "active" : ""}`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                Setor Sampah
              </NavLink>
              <NavLink
                to="/riwayat"
                className={({ isActive }) =>
                  `sdu-mobile-link ${isActive ? "active" : ""}`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                Riwayat Transaksi
              </NavLink>
              <NavLink
                to="/struk"
                className={({ isActive }) =>
                  `sdu-mobile-link ${isActive ? "active" : ""}`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                Struk Transaksi
              </NavLink>
              <NavLink
                to="/profil"
                className={({ isActive }) =>
                  `sdu-mobile-link ${isActive ? "active" : ""}`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                Profil Saya
              </NavLink>
            </>
          ) : (
            <>
              <a
                href="#katalog"
                className="sdu-mobile-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Katalog Sampah
              </a>
              <a
                href="#cara-kerja"
                className="sdu-mobile-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Cara Kerja
              </a>
              <a
                href="#dampak"
                className="sdu-mobile-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dampak Lingkungan
              </a>
              <a
                href="#testimoni"
                className="sdu-mobile-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Testimoni Warga
              </a>
            </>
          )}

          <div className="sdu-mobile-auth">
            {user ? (
              <button
                className="sdu-btn-outline w-full"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
              >
                <FontAwesomeIcon icon={faArrowRightFromBracket} /> Keluar
              </button>
            ) : (
              <div className="sdu-mobile-auth-grid">
                <Link
                  to="/login"
                  className="sdu-btn-outline"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  className="sdu-btn-solid"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
