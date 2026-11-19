import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getDashboardUser,
  getTransaksiDahboard,
} from "../services/transaksiService";
import { getHargaSampah } from "../services/hargaServices";
import "./style/Dashboard.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faTruckFast,
  faScaleBalanced,
  faWallet,
  faCalendarCheck,
  faRecycle,
  faTag,
  faReceipt,
  faBookOpen,
  faLeaf,
  faArrowRight,
  faCommentDots,
  faCheck,
  faCircleCheck,
  faXmark,
  faChevronRight,
  faBoxOpen,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";

// Chart.js for Donut widget
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const [dashboardData, setDashboardData] = useState({
    totalTransaksi: 0,
    totalBerat: 0,
    totalPendapatan: 0,
  });

  const [transaksiList, setTransaksiList] = useState([]);
  const [hargaList, setHargaList] = useState([]);
  const [showTarifModal, setShowTarifModal] = useState(false);
  const [showPanduanModal, setShowPanduanModal] = useState(false);

  useEffect(() => {
    if (!user.id) return;

    const loadData = async () => {
      try {
        const [dash, trx, harga] = await Promise.all([
          getDashboardUser(user.id),
          getTransaksiDahboard(user.id),
          getHargaSampah(),
        ]);

        if (dash) setDashboardData(dash);
        if (trx) setTransaksiList(trx);
        if (harga) setHargaList(harga);
      } catch (err) {
        console.error("Gagal memuat dashboard:", err);
      }
    };

    loadData();
  }, [user.id]);

  // Cari transaksi yang sedang aktif (belum selesai) atau ambil yang terakhir
  const activeTrx =
    transaksiList.find((t) => t.status !== "Selesai") ||
    transaksiList[0] ||
    null;

  // Chart composition data
  const categoryCounts = {};
  transaksiList.forEach((t) => {
    categoryCounts[t.kategori] = (categoryCounts[t.kategori] || 0) + t.berat;
  });

  const chartLabels = Object.keys(categoryCounts).length > 0
    ? Object.keys(categoryCounts)
    : ["Kardus", "Plastik", "Logam"];

  const chartValues = Object.keys(categoryCounts).length > 0
    ? Object.values(categoryCounts)
    : [50, 30, 20];

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        data: chartValues,
        backgroundColor: ["#0284c7", "#059669", "#f59e0b", "#6366f1", "#ec4899", "#14b8a6"],
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    ],
  };

  const chartOptions = {
    cutout: "70%",
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    maintainAspectRatio: false,
  };

  const totalKg = (dashboardData.totalBerat / 1000).toFixed(1);

  return (
    <div className="sdu-user-dashboard">
      <div className="sdu-dashboard-container">
        {/* ========================================================
            HEADER DASHBOARD WARGA
        ======================================================== */}
        <div className="sdu-dash-header">
          <div className="sdu-dash-header-left">
            <span className="sdu-user-status-pill">● WARGA AKTIF TERDAFTAR</span>
            <h1 className="sdu-dash-greeting">
              Halo, {user.nama || "Warga SDU"} 👋
            </h1>
            <p className="sdu-dash-subtitle">
              Ringkasan saldo daur ulang dan status penjemputan sampah lingkungan
              Anda hari ini.
            </p>
          </div>

          <div className="sdu-dash-header-right">
            <button
              className="sdu-btn-add-setor"
              onClick={() => navigate("/transaksi")}
            >
              <FontAwesomeIcon icon={faPlus} />
              <span>Ajukan Setor Sampah</span>
            </button>
          </div>
        </div>

        {/* ========================================================
            ACTIVE PICKUP TRACKING BANNER (NOTICE CARD)
        ======================================================== */}
        {activeTrx && (
          <div className="sdu-tracking-banner">
            <div className="sdu-track-top">
              <div className="sdu-track-left">
                <div className="sdu-track-icon">
                  <FontAwesomeIcon icon={faTruckFast} />
                </div>
                <div className="sdu-track-details">
                  <div className="sdu-track-title-row">
                    <strong className="sdu-track-heading">
                      {activeTrx.status === "Selesai"
                        ? "Penjemputan Terakhir Berhasil"
                        : "Penjemputan Sedang Berjalan"}
                    </strong>
                    <span
                      className={`sdu-status-chip ${activeTrx.status?.toLowerCase()}`}
                    >
                      {activeTrx.status || "Menunggu"}
                    </span>
                    <span className="sdu-trx-code">
                      #TRX-2026-{String(activeTrx.id).padStart(3, "0")}
                    </span>
                  </div>
                  <p className="sdu-track-sub">
                    {activeTrx.status === "Dijemput"
                      ? activeTrx.nama_kurir
                        ? `Kurir ${activeTrx.nama_kurir} (${activeTrx.plat_kendaraan || activeTrx.jenis_kendaraan || "Armada"}) sedang menuju ke alamat Anda.`
                        : "Kurir armada penjemput sedang menuju ke alamat Anda."
                      : activeTrx.status === "Diproses"
                        ? "Jadwal penjemputan telah diagendakan oleh petugas depo."
                        : activeTrx.status === "Selesai"
                          ? `Transaksi ${activeTrx.kategori} telah ditimbang dan dana berhasil dicairkan.`
                          : "Menunggu konfirmasi admin & penugasan kurir jemput."}
                  </p>
                </div>
              </div>

              <div className="sdu-track-right">
                <div className="sdu-eta-box">
                  <span className="sdu-eta-label">
                    {activeTrx.nama_kurir ? `KURIR: ${activeTrx.nama_kurir}` : "ESTIMASI TIBA"}
                  </span>
                  <strong className="sdu-eta-time">
                    {activeTrx.status === "Dijemput"
                      ? "14.15 WIB (~12 Menit)"
                      : "Sesuai Jadwal"}
                  </strong>
                </div>
                <button
                  className="sdu-track-contact-btn"
                  onClick={() => {
                    if (activeTrx.status === "Dijemput" && activeTrx.no_hp_kurir) {
                      const cleanPhone = activeTrx.no_hp_kurir.replace(/\D/g, "");
                      const intlPhone = cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone;
                      window.open(
                        `https://wa.me/${intlPhone}?text=Halo%20Kak%20${encodeURIComponent(activeTrx.nama_kurir)},%20saya%20pemilik%20order%20TRX-2026-${activeTrx.id}%20menunggu%20penjemputan.`,
                        "_blank"
                      );
                    } else {
                      window.open(
                        `https://wa.me/6283808421427?text=Halo%20Admin%20SDU,%20saya%20ingin%20cek%20status%20transaksi%20TRX-2026-${activeTrx.id}`,
                        "_blank"
                      );
                    }
                  }}
                >
                  <FontAwesomeIcon icon={faWhatsapp} />
                  <span>{activeTrx.status === "Dijemput" && activeTrx.nama_kurir ? "Chat Kurir" : "Kontak"}</span>
                </button>
              </div>
            </div>

            {/* Stepper Progress Bar (Dikonfirmasi > Dijemput > Selesai) */}
            <div className="sdu-track-stepper">
              {["Dikonfirmasi", "Dijemput", "Selesai"].map(
                (step, index) => {
                  const stepIndex =
                    activeTrx.status === "Selesai"
                      ? 2
                      : activeTrx.status === "Dijemput"
                        ? 1
                        : 0;

                  const isPassed = index <= stepIndex;
                  const isCurrent = index === stepIndex;

                  return (
                    <div
                      key={step}
                      className={`sdu-step-node ${isPassed ? "completed" : ""
                        } ${isCurrent ? "active" : ""}`}
                    >
                      <div className="sdu-step-line" />
                      <div className="sdu-step-circle">
                        {isPassed ? (
                          <FontAwesomeIcon icon={faCheck} />
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </div>
                      <span className="sdu-step-title">{step}</span>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            3 METRIC KPI CARDS
        ======================================================== */}
        <div className="sdu-kpi-grid">
          {/* Card 1: Total Pendapatan */}
          <div className="sdu-kpi-card">
            <div className="sdu-kpi-top">
              <span className="sdu-kpi-label">TOTAL PENDAPATAN TERKUMPUL</span>
              <div className="sdu-kpi-icon-box blue">
                <FontAwesomeIcon icon={faWallet} />
              </div>
            </div>
            <h2 className="sdu-kpi-number">
              Rp {(Number(dashboardData.totalPendapatan) || 0).toLocaleString("id-ID")}
            </h2>
            <div className="sdu-kpi-tags">
              <span className="sdu-kpi-tag-pill green">✓ Cair Langsung</span>
              <span className="sdu-kpi-tag-sub">Bank & Gopay</span>
            </div>
          </div>

          {/* Card 2: Total Sampah */}
          <div className="sdu-kpi-card">
            <div className="sdu-kpi-top">
              <span className="sdu-kpi-label">TOTAL SAMPAH TERPILAH</span>
              <div className="sdu-kpi-icon-box green">
                <FontAwesomeIcon icon={faScaleBalanced} />
              </div>
            </div>
            <h2 className="sdu-kpi-number">{totalKg} Kg</h2>
            <div className="sdu-kpi-tags">
              <span className="sdu-kpi-tag-pill">100% didaur ulang</span>
              <span className="sdu-kpi-tag-sub">≈ {(Number(totalKg) * 0.2).toFixed(1)} kg CO2 ditahan</span>
            </div>
          </div>

          {/* Card 3: Total Penjemputan */}
          <div className="sdu-kpi-card">
            <div className="sdu-kpi-top">
              <span className="sdu-kpi-label">TOTAL PENJEMPUTAN</span>
              <div className="sdu-kpi-icon-box amber">
                <FontAwesomeIcon icon={faCalendarCheck} />
              </div>
            </div>
            <h2 className="sdu-kpi-number">
              {dashboardData.totalTransaksi || 0} Transaksi
            </h2>
            <div className="sdu-kpi-tags">
              <span className="sdu-kpi-tag-pill green">+3 bulan ini</span>
              <span className="sdu-kpi-tag-sub">Tingkat sukses 100%</span>
            </div>
          </div>
        </div>

        {/* ========================================================
            LAYANAN CEPAT (QUICK SHORTCUTS)
        ======================================================== */}
        <div className="sdu-quick-services-section">
          <div className="sdu-quick-header">
            <h3>Layanan Cepat</h3>
            <span className="sdu-quick-sub">Pintasan Layanan Warga</span>
          </div>

          <div className="sdu-quick-grid">
            <div
              className="sdu-quick-card"
              onClick={() => navigate("/transaksi")}
            >
              <div className="sdu-quick-icon">
                <FontAwesomeIcon icon={faRecycle} />
              </div>
              <div className="sdu-quick-content">
                <strong>Setor Sampah</strong>
                <p>Jadwalkan jemput sampah baru ke rumah</p>
              </div>
            </div>

            <div
              className="sdu-quick-card"
              onClick={() => setShowTarifModal(true)}
            >
              <div className="sdu-quick-icon">
                <FontAwesomeIcon icon={faTag} />
              </div>
              <div className="sdu-quick-content">
                <strong>Daftar Tarif</strong>
                <p>Cek harga tebusan sampah per Kg terupdate</p>
              </div>
            </div>

            <div
              className="sdu-quick-card"
              onClick={() => navigate("/struk")}
            >
              <div className="sdu-quick-icon">
                <FontAwesomeIcon icon={faReceipt} />
              </div>
              <div className="sdu-quick-content">
                <strong>Bukti Slip Digital</strong>
                <p>Arsip slip penimbangan dan bayaran</p>
              </div>
            </div>

            <div
              className="sdu-quick-card"
              onClick={() => setShowPanduanModal(true)}
            >
              <div className="sdu-quick-icon">
                <FontAwesomeIcon icon={faBookOpen} />
              </div>
              <div className="sdu-quick-content">
                <strong>Panduan Pilah</strong>
                <p>Tips pilah kardus, plastik, dan logam rapi</p>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            LOWER 2-COLUMN GRID (RIWAYAT SETORAN & KOMPOSISI SAMPAH)
        ======================================================== */}
        <div className="sdu-dash-lower-grid">
          {/* Left Column: Riwayat Setoran Terkini */}
          <div className="sdu-recent-orders-card">
            <div className="sdu-card-title-bar">
              <div>
                <h3>Riwayat Setoran Terkini</h3>
                <p className="sdu-card-subtitle">
                  Catatan {Math.min(transaksiList.length, 5)} setoran sampah
                  terakhir Anda
                </p>
              </div>
              <Link to="/riwayat" className="sdu-view-all-link">
                <span>Lihat Semua</span>
                <FontAwesomeIcon icon={faChevronRight} />
              </Link>
            </div>

            <div className="sdu-table-wrapper">
              <table className="sdu-modern-table">
                <thead>
                  <tr>
                    <th>TRANSAKSI</th>
                    <th>KATEGORI</th>
                    <th>BERAT</th>
                    <th>NOMINAL</th>
                    <th>STATUS</th>
                    <th>AKSI</th>
                  </tr>
                </thead>
                <tbody>
                  {transaksiList.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="sdu-empty-row">
                        <div className="sdu-empty-state">
                          <FontAwesomeIcon icon={faBoxOpen} />
                          <p>Belum ada riwayat transaksi setor sampah.</p>
                          <button
                            className="sdu-btn-small"
                            onClick={() => navigate("/transaksi")}
                          >
                            Setor Sekarang
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    transaksiList.slice(0, 5).map((item) => (
                      <tr key={item.id}>
                        <td>
                          <strong className="sdu-trx-id">
                            TRX-2026-{String(item.id).padStart(3, "0")}
                          </strong>
                          <span className="sdu-trx-date">
                            {new Date(item.created_at).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </span>
                        </td>
                        <td>
                          <span className="sdu-kategori-chip">
                            {item.kategori}
                          </span>
                        </td>
                        <td>
                          <strong>{(item.berat / 1000).toFixed(1)} Kg</strong>
                        </td>
                        <td>
                          <strong className="sdu-nominal-text">
                            Rp {Number(item.totalharga).toLocaleString("id-ID")}
                          </strong>
                        </td>
                        <td>
                          <span
                            className={`sdu-status-pill ${item.status?.toLowerCase()}`}
                          >
                            {item.status || "Menunggu"}
                          </span>
                        </td>
                        <td>
                          <button
                            className="sdu-btn-table-action"
                            onClick={() => navigate("/riwayat")}
                          >
                            Detail
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column: Komposisi Sampah & Impact Widget */}
          <div className="sdu-sidebar-widgets">
            {/* Donut Chart Widget */}
            <div className="sdu-donut-widget">
              <div className="sdu-card-title-bar">
                <h3>Komposisi Sampah</h3>
                <span className="sdu-badge-month">Bulan Ini</span>
              </div>

              <div className="sdu-donut-body">
                <div className="sdu-chart-container">
                  <Doughnut data={chartData} options={chartOptions} />
                  <div className="sdu-chart-center-label">
                    <strong>{totalKg}</strong>
                    <span>KG</span>
                  </div>
                </div>

                <div className="sdu-donut-legend">
                  {chartLabels.map((label, idx) => (
                    <div key={label} className="sdu-legend-row">
                      <div className="sdu-legend-left">
                        <span
                          className="sdu-legend-dot"
                          style={{
                            background:
                              chartData.datasets[0].backgroundColor[idx],
                          }}
                        />
                        <span>{label}</span>
                      </div>
                      <strong>
                        {(
                          (chartValues[idx] /
                            (chartValues.reduce((a, b) => a + b, 0) || 1)) *
                          100
                        ).toFixed(0)}
                        %
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          MODAL DAFTAR TARIF
      ======================================================== */}
      {showTarifModal && (
        <div
          className="sdu-modal-overlay"
          onClick={() => setShowTarifModal(false)}
        >
          <div
            className="sdu-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sdu-modal-header">
              <h3>Daftar Tarif Sampah Daur Ulang Terupdate</h3>
              <button
                className="sdu-modal-close"
                onClick={() => setShowTarifModal(false)}
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
            <div className="sdu-modal-body">
              <div className="sdu-tarif-modal-grid">
                {hargaList.map((h) => (
                  <div key={h.id} className="sdu-tarif-modal-item">
                    <strong>{h.kategori}</strong>
                    <div className="sdu-tarif-modal-prices">
                      <span>Rp {h.harga} / 100g</span>
                      <strong className="sdu-kg-rate">
                        Rp {h.harga * 10} / Kg
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL PANDUAN PILAH
      ======================================================== */}
      {showPanduanModal && (
        <div
          className="sdu-modal-overlay"
          onClick={() => setShowPanduanModal(false)}
        >
          <div
            className="sdu-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sdu-modal-header">
              <h3>Panduan Memilah Sampah SDU</h3>
              <button
                className="sdu-modal-close"
                onClick={() => setShowPanduanModal(false)}
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
            <div className="sdu-modal-body">
              <ul className="sdu-panduan-list">
                <li>
                  <strong>1. Plastik:</strong> Lepaskan tutup dan sedotan, cuci
                  bersih dari sisa minyak atau sirup, lalu gepengkan.
                </li>
                <li>
                  <strong>2. Kardus & Kertas:</strong> Lipat rapi atau ikat
                  dengan tali. Pastikan tidak terkena air atau minyak goreng.
                </li>
                <li>
                  <strong>3. Botol Kaca:</strong> Pastikan botol utuh, tanpa
                  tutup logam, dan bersih dari sisa saus/kecap.
                </li>
                <li>
                  <strong>4. Kaleng & Logam:</strong> Bilas bersih dari cairan
                  manis, keringkan agar tidak berkarat.
                </li>
                <li>
                  <strong>5. Pecah Belah:</strong> Bungkus pecahan tebal dalam
                  kardus atau karung goni demi keselamatan kurir.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
