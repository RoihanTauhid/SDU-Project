import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import Logo from "../../assets/Logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTruckFast,
  faLocationDot,
  faMapLocationDot,
  faPhone,
  faCircleCheck,
  faClock,
  faWeightHanging,
  faCoins,
  faArrowRightFromBracket,
  faRotateRight,
  faMotorcycle,
  faCar,
  faBoxOpen,
  faUser,
  faCheck,
  faXmark,
  faRoute,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import {
  getKurirProfil,
  getKurirTugas,
  updateStatusTugas,
  updateStatusKurir,
} from "../../services/kurirService";
import { getUploadUrl } from "../../config/api";
import "./style/KurirDashboard.css";

export default function KurirDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });

  const [profil, setProfil] = useState(null);
  const [tugas, setTugas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("aktif"); // 'aktif' | 'selesai'
  const [confirmCompleteId, setConfirmCompleteId] = useState(null);
  const [completing, setCompleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successToast, setSuccessToast] = useState("");

  const fetchData = useCallback(
    async (showSpinner = true) => {
      if (!user?.id) return;
      if (showSpinner) setLoading(true);
      setErrorMsg("");

      try {
        const profilData = await getKurirProfil(user.id);
        setProfil(profilData);

        if (profilData?.id) {
          const tugasData = await getKurirTugas(profilData.id);
          setTugas(Array.isArray(tugasData) ? tugasData : []);
        }
      } catch (err) {
        console.error("Gagal memuat dashboard kurir:", err);
        setErrorMsg(err.message || "Gagal memuat data penjemputan");
      } finally {
        if (showSpinner) setLoading(false);
        setRefreshing(false);
      }
    },
    [user?.id]
  );

  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleToggleStatus = async () => {
    if (!profil) return;
    const newStatus = profil.status === "tersedia" ? "bertugas" : "tersedia";
    try {
      await updateStatusKurir(profil.id, newStatus);
      setProfil((prev) => ({ ...prev, status: newStatus }));
      showToast(`Status operasional diubah menjadi: ${newStatus.toUpperCase()}`);
    } catch (err) {
      alert(err.message || "Gagal memperbarui status operasional");
    }
  };

  const handleSelesaikanTugas = async (trxId) => {
    if (!profil) return;
    try {
      setCompleting(true);
      await updateStatusTugas(trxId, "Selesai", profil.id);
      showToast("Berhasil menyelesaikan penjemputan! Data telah tersimpan.");
      setConfirmCompleteId(null);
      // Refresh tugas & metrics
      await fetchData(false);
    } catch (err) {
      alert(err.message || "Gagal menyelesaikan penjemputan");
    } finally {
      setCompleting(false);
    }
  };

  const showToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast("");
    }, 4000);
  };

  // Grouping tasks
  const tugasAktif = tugas.filter((t) =>
    ["Menunggu", "Diproses", "Dijemput"].includes(t.status)
  );
  const tugasSelesai = tugas.filter((t) => t.status === "Selesai");

  // Summary Metrics
  const totalKgSelesai = (
    (Number(profil?.total_berat_selesai) || 0) / 1000
  ).toFixed(1);

  const openGoogleMaps = (item) => {
    if (item.latitude && item.longitude) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}`,
        "_blank"
      );
    } else {
      const destination = encodeURIComponent(
        item.lokasi || item.alamat_warga || "Pekanbaru"
      );
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${destination}`,
        "_blank"
      );
    }
  };

  const openWhatsApp = (item) => {
    const rawPhone = item.no_hp_warga || item.no_hp || "";
    let cleanPhone = rawPhone.replace(/\D/g, "");
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "62" + cleanPhone.slice(1);
    }
    const namaWarga = item.nama_warga || item.nama || "Bapak/Ibu";
    const orderCode = `#SDU-TRX-${String(item.id).padStart(4, "0")}`;
    const kurirNama = profil?.nama || "Kurir SDU";

    const text = encodeURIComponent(
      `Halo Kak ${namaWarga}, saya ${kurirNama} dari tim penjemput Sampah Jadi Uang (SDU).\n\nSaya sedang menuju lokasi penjemputan untuk order ${orderCode} (${item.kategori || "Sampah"}). Mohon standby di lokasi ya Kak. Terima kasih! 🙏`
    );

    window.open(`https://wa.me/${cleanPhone}?text=${text}`, "_blank");
  };

  return (
    <div className="sdu-kurir-app">
      {/* Toast Notification */}
      {successToast && (
        <div className="sdu-kurir-toast">
          <FontAwesomeIcon icon={faCircleCheck} />
          <span>{successToast}</span>
        </div>
      )}

      {/* Top Mobile Bar Header */}
      <header className="sdu-kurir-header">
        <div className="sdu-kurir-header-top">
          <Link to="/" className="sdu-kurir-brand-link" title="SDU - Menuju ke Landing Page">
            <div className="sdu-kurir-brand-logo-wrap">
              <img src={Logo} alt="Logo SDU" className="sdu-kurir-brand-logo-img" />
            </div>
            <div className="sdu-kurir-brand">
              <span className="sdu-kurir-logo-pill">SDU DISPATCH</span>
              <h1>Dashboard Kurir</h1>
            </div>
          </Link>

          <div className="sdu-kurir-header-actions">
            <button
              className={`sdu-btn-kurir-refresh ${refreshing ? "spin" : ""}`}
              onClick={handleRefresh}
              title="Perbarui Data"
            >
              <FontAwesomeIcon icon={faRotateRight} />
            </button>
            <button
              className="sdu-btn-kurir-logout"
              onClick={handleLogout}
              title="Keluar"
            >
              <FontAwesomeIcon icon={faArrowRightFromBracket} />
            </button>
          </div>
        </div>

        {/* Kurir Identity Card */}
        {profil ? (
          <div className="sdu-kurir-id-banner">
            <div className="sdu-kurir-avatar-wrap">
              {profil.foto_kurir ? (
                <img
                  src={getUploadUrl("kurir", profil.foto_kurir)}
                  alt={profil.nama}
                />
              ) : (
                <div className="sdu-kurir-avatar-fallback">
                  <FontAwesomeIcon icon={faUser} />
                </div>
              )}
            </div>

            <div className="sdu-kurir-bio">
              <div className="sdu-kurir-bio-name-row">
                <h2>{profil.nama}</h2>
                <button
                  className={`sdu-kurir-status-toggle ${profil.status}`}
                  onClick={handleToggleStatus}
                  title="Klik untuk ubah status operasional"
                >
                  <span className="dot" />
                  {profil.status === "bertugas" ? "Sedang Bertugas" : "Tersedia (Siap)"}
                </button>
              </div>

              <div className="sdu-kurir-veh-meta">
                <span className="veh-badge">
                  <FontAwesomeIcon
                    icon={profil.jenis_kendaraan === "Mobil" ? faCar : faMotorcycle}
                  />
                  {profil.jenis_kendaraan || "Motor"} • {profil.plat_kendaraan}
                </span>
                <span className="hp-badge">
                  <FontAwesomeIcon icon={faPhone} />
                  {profil.no_hp}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="sdu-kurir-id-loading">
            <span>Memuat identitas kurir...</span>
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="sdu-kurir-body">
        {/* Metric Counter Summary */}
        <div className="sdu-kurir-metrics-strip">
          <div className="sdu-kmetric-card active">
            <div className="sdu-kmetric-icon">
              <FontAwesomeIcon icon={faTruckFast} />
            </div>
            <div className="sdu-kmetric-info">
              <span className="num">{tugasAktif.length}</span>
              <span className="lbl">Tugas Aktif</span>
            </div>
          </div>

          <div className="sdu-kmetric-card success">
            <div className="sdu-kmetric-icon">
              <FontAwesomeIcon icon={faCircleCheck} />
            </div>
            <div className="sdu-kmetric-info">
              <span className="num">{tugasSelesai.length}</span>
              <span className="lbl">Order Selesai</span>
            </div>
          </div>

          <div className="sdu-kmetric-card weight">
            <div className="sdu-kmetric-icon">
              <FontAwesomeIcon icon={faWeightHanging} />
            </div>
            <div className="sdu-kmetric-info">
              <span className="num">{totalKgSelesai} Kg</span>
              <span className="lbl">Total Sampah</span>
            </div>
          </div>
        </div>

        {/* Tab Filter */}
        <div className="sdu-kurir-tabs-bar">
          <button
            className={`sdu-kurir-tab ${activeTab === "aktif" ? "active" : ""}`}
            onClick={() => setActiveTab("aktif")}
          >
            <FontAwesomeIcon icon={faTruckFast} />
            <span>Tugas Penjemputan</span>
            {tugasAktif.length > 0 && (
              <span className="tab-pill">{tugasAktif.length}</span>
            )}
          </button>

          <button
            className={`sdu-kurir-tab ${activeTab === "selesai" ? "active" : ""}`}
            onClick={() => setActiveTab("selesai")}
          >
            <FontAwesomeIcon icon={faCircleCheck} />
            <span>Riwayat Selesai</span>
            {tugasSelesai.length > 0 && (
              <span className="tab-pill done">{tugasSelesai.length}</span>
            )}
          </button>
        </div>

        {/* Error message banner */}
        {errorMsg && (
          <div className="sdu-kurir-err-banner">
            <span>{errorMsg}</span>
            <button onClick={() => fetchData(true)}>Coba Lagi</button>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="sdu-kurir-loading-wrap">
            <div className="sdu-spinner" />
            <p>Memuat daftar order penjemputan...</p>
          </div>
        )}

        {/* TAB 1: TUGAS AKTIF */}
        {!loading && activeTab === "aktif" && (
          <div className="sdu-kurir-tasks-list">
            {tugasAktif.length === 0 ? (
              <div className="sdu-kurir-empty-state">
                <div className="empty-icon">
                  <FontAwesomeIcon icon={faBoxOpen} />
                </div>
                <h3>Tidak Ada Tugas Aktif</h3>
                <p>
                  Belum ada pesanan penjemputan yang ditugaskan admin kepada Anda.
                  Tetap aktifkan status untuk menerima notifikasi order baru!
                </p>
                <button className="sdu-btn-refresh-state" onClick={handleRefresh}>
                  <FontAwesomeIcon icon={faRotateRight} /> Periksa Tugas Baru
                </button>
              </div>
            ) : (
              tugasAktif.map((item) => {
                const orderCode = `#SDU-TRX-${String(item.id).padStart(4, "0")}`;
                const beratKg = item.berat ? (Number(item.berat) / 1000).toFixed(1) : "0";
                const totalRupiah = Number(item.total_harga) || 0;

                return (
                  <div key={item.id} className="sdu-pickup-card">
                    {/* Header Card */}
                    <div className="sdu-pickup-top">
                      <div className="sdu-pickup-code-box">
                        <span className="order-code">{orderCode}</span>
                        <span className={`status-badge ${item.status?.toLowerCase()}`}>
                          <FontAwesomeIcon icon={faClock} />
                          {item.status === "Dijemput" ? "Perjalanan Jemput" : item.status}
                        </span>
                      </div>
                      <span className="order-date">
                        {item.created_at
                          ? new Date(item.created_at).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            }) + " WIB"
                          : ""}
                      </span>
                    </div>

                    {/* Warga Contact Details */}
                    <div className="sdu-pickup-warga-section">
                      <div className="warga-avatar">
                        <FontAwesomeIcon icon={faUser} />
                      </div>
                      <div className="warga-info">
                        <strong className="warga-name">
                          {item.nama_warga || item.nama || "Warga SDU"}
                        </strong>
                        <span className="warga-phone">
                          <FontAwesomeIcon icon={faPhone} />
                          {item.no_hp_warga || item.no_hp || "-"}
                        </span>
                      </div>
                    </div>

                    {/* Address & Navigation Section */}
                    <div className="sdu-pickup-location-box">
                      <div className="loc-label">
                        <FontAwesomeIcon icon={faLocationDot} />
                        <span>Titik Lokasi Penjemputan</span>
                      </div>
                      <p className="loc-address">
                        {item.lokasi || item.alamat_warga || "Alamat belum ditentukan"}
                      </p>
                      {item.latitude && item.longitude && (
                        <div className="loc-coords">
                          📍 {Number(item.latitude).toFixed(6)},{" "}
                          {Number(item.longitude).toFixed(6)}
                        </div>
                      )}
                    </div>

                    {/* Waste Breakdown Strip */}
                    <div className="sdu-pickup-waste-strip">
                      <div className="waste-col">
                        <span className="sub-lbl">KATEGORI</span>
                        <strong className="val-lbl">{item.kategori || "Campur"}</strong>
                      </div>
                      <div className="waste-col">
                        <span className="sub-lbl">EST. BOBOT</span>
                        <strong className="val-lbl highlight">{beratKg} Kg</strong>
                      </div>
                      <div className="waste-col">
                        <span className="sub-lbl">TEBUSAN WARGA</span>
                        <strong className="val-lbl green">
                          Rp {totalRupiah.toLocaleString("id-ID")}
                        </strong>
                      </div>
                    </div>

                    {/* Action Buttons: Maps, WA, Selesai */}
                    <div className="sdu-pickup-actions-grid">
                      <button
                        className="sdu-btn-action maps"
                        onClick={() => openGoogleMaps(item)}
                      >
                        <FontAwesomeIcon icon={faMapLocationDot} />
                        <span>Rute Maps</span>
                      </button>

                      <button
                        className="sdu-btn-action wa"
                        onClick={() => openWhatsApp(item)}
                      >
                        <FontAwesomeIcon icon={faWhatsapp} />
                        <span>Chat WA</span>
                      </button>

                      <button
                        className="sdu-btn-action complete"
                        onClick={() => setConfirmCompleteId(item.id)}
                      >
                        <FontAwesomeIcon icon={faCheck} />
                        <span>Selesaikan</span>
                      </button>
                    </div>

                    {/* Confirmation Popup Modal Inline */}
                    {confirmCompleteId === item.id && (
                      <div className="sdu-pickup-confirm-box">
                        <p>
                          <strong>Konfirmasi Selesai Penjemputan?</strong>
                          Pastikan sampah sudah dimuat ke kendaraan dan pembayaran telah
                          dikoordinasikan.
                        </p>
                        <div className="confirm-btns">
                          <button
                            className="sdu-btn-cancel-mini"
                            onClick={() => setConfirmCompleteId(null)}
                            disabled={completing}
                          >
                            <FontAwesomeIcon icon={faXmark} /> Batal
                          </button>
                          <button
                            className="sdu-btn-confirm-mini"
                            onClick={() => handleSelesaikanTugas(item.id)}
                            disabled={completing}
                          >
                            {completing ? "Memproses..." : "Ya, Selesaikan!"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: RIWAYAT SELESAI */}
        {!loading && activeTab === "selesai" && (
          <div className="sdu-kurir-tasks-list">
            {tugasSelesai.length === 0 ? (
              <div className="sdu-kurir-empty-state">
                <div className="empty-icon">
                  <FontAwesomeIcon icon={faCircleCheck} />
                </div>
                <h3>Belum Ada Riwayat Selesai</h3>
                <p>
                  Pesanan yang telah Anda selesaikan akan otomatis tercatat di sini
                  sebagai riwayat performa kerja harian.
                </p>
              </div>
            ) : (
              tugasSelesai.map((item) => {
                const orderCode = `#SDU-TRX-${String(item.id).padStart(4, "0")}`;
                const beratKg = item.berat ? (Number(item.berat) / 1000).toFixed(1) : "0";
                const totalRupiah = Number(item.total_harga) || 0;

                return (
                  <div key={item.id} className="sdu-pickup-card completed">
                    <div className="sdu-pickup-top">
                      <div className="sdu-pickup-code-box">
                        <span className="order-code">{orderCode}</span>
                        <span className="status-badge selesai">
                          <FontAwesomeIcon icon={faCircleCheck} /> Selesai
                        </span>
                      </div>
                      <span className="order-date">
                        {item.created_at
                          ? new Date(item.created_at).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : ""}
                      </span>
                    </div>

                    <div className="sdu-pickup-warga-section">
                      <div className="warga-avatar done">
                        <FontAwesomeIcon icon={faUser} />
                      </div>
                      <div className="warga-info">
                        <strong className="warga-name">
                          {item.nama_warga || item.nama || "Warga SDU"}
                        </strong>
                        <span className="warga-phone">{item.lokasi || "-"}</span>
                      </div>
                    </div>

                    <div className="sdu-pickup-waste-strip">
                      <div className="waste-col">
                        <span className="sub-lbl">KATEGORI</span>
                        <strong className="val-lbl">{item.kategori}</strong>
                      </div>
                      <div className="waste-col">
                        <span className="sub-lbl">TOTAL BERAT</span>
                        <strong className="val-lbl highlight">{beratKg} Kg</strong>
                      </div>
                      <div className="waste-col">
                        <span className="sub-lbl">NILAI DITERIMA</span>
                        <strong className="val-lbl green">
                          Rp {totalRupiah.toLocaleString("id-ID")}
                        </strong>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>
    </div>
  );
}
