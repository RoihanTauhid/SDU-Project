import React, { useState, useEffect } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import "./style/AdminDashboard.css";
import StatusDataComponent from "./components/StatusDataComponent";
import {
  getTotalTransaksi,
  getStatusDataDashboard,
  getTransaksiTerbaru,
  getUserTerbaru,
} from "../../services/transaksiService";

import CardTotalTransaksi from "./components/CardTotalTransaksi";
import CardGrafik from "./components/CardGrafik";
import TransaksiTerbaru from "./components/TransaksiTerbaru";
import UserTerbaru from "./components/UserTerbaru";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBolt,
  faPlus,
  faTruckFast,
  faArrowRight,
  faClockRotateLeft,
  faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";

function AdminDashboard() {
  const user = JSON.parse(localStorage.getItem("user")) || { nama: "Admin" };

  const [dashboard, setDashboard] = useState({
    totalUser: 0,
    pendingVerifikasi: 0,
    totalTransaksi: 0,
    totalBerat: 0,
    totalPendapatan: 0,
  });

  const [transaksiTerbaru, setTransaksiTerbaru] = useState([]);
  const [userTerbaru, setUserTerbaru] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const dataDashboard = await getTotalTransaksi(setDashboard);
        if (dataDashboard) setDashboard(dataDashboard);

        const dataTerbaru = await getTransaksiTerbaru(setTransaksiTerbaru);
        if (Array.isArray(dataTerbaru)) setTransaksiTerbaru(dataTerbaru);

        const dataUserTerbaru = await getUserTerbaru(setUserTerbaru);
        if (Array.isArray(dataUserTerbaru)) setUserTerbaru(dataUserTerbaru);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      }
    };

    loadData();
  }, []);

  // Quick Action Buttons on header right
  const headerRight = (
    <div className="sdu-admin-header-actions-group">
      <Link to="/admin/transaksi" className="sdu-btn-header-solid">
        <FontAwesomeIcon icon={faTruckFast} />
        <span>Kelola Penjemputan</span>
      </Link>
    </div>
  );

  return (
    <AdminLayout
      eyebrow="PANEL OPERASIONAL PUSAT • Ringkasan Kinerja Depo"
      title={`Selamat Datang, ${user.nama} 👋`}
      subtitle="Pantau volume transaksi daur ulang, pergerakan armada penjemputan, dan distribusi saldo warga hari ini."
      rightActions={headerRight}
    >
      <div className="sdu-admin-dashboard-body">
        {Number(dashboard.pendingVerifikasi) > 0 && (
          <div className="sdu-dash-verif-banner">
            <div className="sdu-dash-verif-left">
              <div className="sdu-dash-verif-icon">
                <FontAwesomeIcon icon={faShieldHalved} />
              </div>
              <div>
                <strong>
                  {dashboard.pendingVerifikasi} Akun Warga Baru Menunggu
                  Verifikasi KTP
                </strong>
                <span>
                  Periksa kesesuaian nama, NIK, dan foto KTP pendaftar agar mereka
                  dapat login dan menyetor sampah.
                </span>
              </div>
            </div>
            <Link to="/admin/user" className="sdu-dash-verif-btn">
              <span>Periksa & Verifikasi</span>
              <FontAwesomeIcon icon={faArrowRight} />
            </Link>
          </div>
        )}

        {/* 1. 4 Primary KPI Summary Cards */}
        <CardTotalTransaksi dashboard={dashboard} />

        {/* 2. Operational Pipeline Status Tiles */}
        <StatusDataComponent />

        {/* 3. 2-Column Split: Transaksi Terkini & User Terdaftar */}
        <div className="sdu-dashboard-split-grid">
          <TransaksiTerbaru transactions={transaksiTerbaru} />
          <UserTerbaru userTerbaru={userTerbaru} />
        </div>

        {/* 4. Interactive Analytical Charts */}
        <CardGrafik />
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;
