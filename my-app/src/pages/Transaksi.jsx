import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./style/Transaksi.css";
import Navbar from "../components/Navbar";
import MapPicker from "../components/MapPicker";
import { createTransaksi, uploadFoto } from "../services/transaksiService";
import { getHargaSampah, getTargetBonus } from "../services/hargaServices";
import { getAlamatUser } from "../services/userService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRecycle,
  faBoxOpen,
  faWineGlass,
  faTrashCan,
  faTools,
  faMinus,
  faPlus,
  faWallet,
  faCamera,
  faLocationDot,
  faSun,
  faMoon,
  faShieldHalved,
  faLeaf,
  faCheck,
  faInfoCircle,
  faTrash,
  faArrowRight,
  faRotateRight,
  faCrosshairs,
  faCircleQuestion,
  faCircleCheck,
  faClock,
  faScaleBalanced,
  faSpinner,
  faXmark,
  faGift,
} from "@fortawesome/free-solid-svg-icons";

const CATEGORY_ITEMS = [
  { key: "plastik", name: "Plastik", icon: faRecycle, defaultPrice: 3500 },
  { key: "kardus", name: "Kardus", icon: faBoxOpen, defaultPrice: 3000 },
  { key: "botol", name: "Botol Kaca", icon: faWineGlass, defaultPrice: 1500 },
  { key: "kaleng", name: "Kaleng", icon: faTrashCan, defaultPrice: 8000 },
  { key: "besi", name: "Besi", icon: faTools, defaultPrice: 5000 },
  { key: "pecah_belah", name: "Pecah Belah", icon: faWineGlass, defaultPrice: 1200 },
];

function Transaksi() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [hargaSampah, setHargaSampah] = useState([]);
  const [kategori, setKategori] = useState("kardus");
  const [keterangan, setKeterangan] = useState("");
  const [berat, setBerat] = useState(15.0);
  const [lokasi, setLokasi] = useState("");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [waktuJemput, setWaktuJemput] = useState("pagi");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [targetBonusConfig, setTargetBonusConfig] = useState({
    min_berat: 20,
    bonus: 5000,
    is_active: 1,
  });
  // Stepper dynamic completion calculations
  const isStep1Done = Boolean(kategori);
  const isStep2Done = Number(berat) >= 2;
  const isStep3Done = Boolean(latitude && longitude && lokasi && lokasi.trim());
  const isStep4Done = Boolean(foto);
  const isStep5Done = Boolean(showConfirmModal || isSubmitting);

  let activeStep = 1;
  if (!isStep1Done) activeStep = 1;
  else if (!isStep2Done) activeStep = 2;
  else if (!isStep3Done) activeStep = 3;
  else if (!isStep4Done) activeStep = 4;
  else activeStep = 5;

  const stepperItems = [
    {
      num: 1,
      tag: "LANGKAH 1",
      title: "Pilih Sampah",
      isDone: isStep1Done,
      isActive: activeStep === 1 && !isStep1Done,
    },
    {
      num: 2,
      tag: "LANGKAH 2",
      title: "Masukkan Berat",
      isDone: isStep2Done,
      isActive: activeStep === 2 && !isStep2Done,
    },
    {
      num: 3,
      tag: "LANGKAH 3",
      title: "Titik Peta",
      isDone: isStep3Done,
      isActive: activeStep === 3 && !isStep3Done,
    },
    {
      num: 4,
      tag: "LANGKAH 4",
      title: "Foto Sampah",
      isDone: isStep4Done,
      isActive: activeStep === 4 && !isStep4Done,
    },
    {
      num: 5,
      tag: "LANGKAH 5",
      title: "Konfirmasi",
      isDone: isStep5Done,
      isActive: activeStep === 5 && !isStep5Done,
    },
  ];

  // Cari rate harga berdasarkan kategori
  const dataKategori = hargaSampah.find(
    (item) => item.kategori?.toLowerCase() === kategori?.toLowerCase()
  );

  const harga100gr = dataKategori ? Number(dataKategori.harga) : 300;
  const hargaPerKg = harga100gr * 10;
  const beratKg = Number(berat) || 0;
  const beratGram = beratKg * 1000;
  const baseTotalHarga = Math.round((beratGram / 100) * harga100gr);

  // Perhitungan Target Bonus
  const minBeratBonus = Number(targetBonusConfig.min_berat) || 20;
  const nominalBonus = Number(targetBonusConfig.bonus) || 0;
  const isBonusActive =
    Boolean(targetBonusConfig.is_active) && nominalBonus > 0 && minBeratBonus > 0;
  const isTargetBonusAchieved = isBonusActive && beratKg >= minBeratBonus;
  const bonusDiterima = isTargetBonusAchieved ? nominalBonus : 0;
  const totalharga = baseTotalHarga + bonusDiterima;

  useEffect(() => {
    const loadData = async () => {
      try {
        const [data, bonusData] = await Promise.all([
          getHargaSampah(),
          getTargetBonus().catch(() => ({ min_berat: 20, bonus: 5000, is_active: 1 })),
        ]);

        if (data && data.length > 0) {
          setHargaSampah(data);
        }

        if (bonusData) {
          setTargetBonusConfig(bonusData);
        }

        const user = JSON.parse(localStorage.getItem("user"));
        if (user) {
          const userDetail = await getAlamatUser(user.id);
          if (userDetail && userDetail.alamat) {
            setLokasi(userDetail.alamat);
          }
        }
      } catch (err) {
        console.error("Gagal load data awal transaksi:", err);
      }
    };

    loadData();
  }, []);

  const handleBeratChange = (delta) => {
    setBerat((prev) => {
      const nextVal = Math.max(2, parseFloat((prev + delta).toFixed(1)));
      return nextVal;
    });
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFoto(file);
      setFotoPreview(URL.createObjectURL(file));
    }
  };

  const removeFoto = () => {
    setFoto(null);
    setFotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      alert("Silakan login terlebih dahulu.");
      navigate("/login");
      return;
    }

    if (!kategori) {
      alert("Pilih jenis sampah terlebih dahulu.");
      return;
    }

    if (!berat || beratKg < 2) {
      alert("Minimal berat penjemputan adalah 2 Kg.");
      return;
    }

    if (!lokasi || !lokasi.trim()) {
      alert("Harap masukkan alamat penjemputan.");
      return;
    }

    if (!latitude || !longitude) {
      alert("Silakan pilih/sentuh lokasi penjemputan Anda pada peta.");
      return;
    }

    if (!foto) {
      alert("Harap unggah minimal 1 foto bukti kondisi sampah.");
      return;
    }

    // Buka pop-up konfirmasi detail transaksi
    setShowConfirmModal(true);
  };

  const handleConfirmAndSubmit = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      alert("Silakan login terlebih dahulu.");
      navigate("/login");
      return;
    }

    setIsSubmitting(true);
    try {
      let namaFileFoto = "";
      const formData = new FormData();
      formData.append("foto", foto);

      const uploadData = await uploadFoto(formData);
      namaFileFoto = uploadData.filename;

      const fullKeterangan = waktuJemput === "sore"
        ? `${keterangan} [Waktu: Sore Hari 13.00-16.00 WIB]`
        : `${keterangan} [Waktu: Pagi Hari 09.00-12.00 WIB]`;

      const transaksiBaru = {
        user_id: user.id,
        kategori,
        keterangan: fullKeterangan.trim(),
        berat: beratGram,
        lokasi: lokasi.trim(),
        latitude,
        longitude,
        harga100gr,
        totalharga,
        bonus: bonusDiterima,
        foto: namaFileFoto,
      };

      const result = await createTransaksi(transaksiBaru);
      setShowConfirmModal(false);
      alert(result.message || "Transaksi penjemputan berhasil diajukan!");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Gagal mengirim transaksi: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="sdu-transaksi-page">
      <Navbar />

      <div className="sdu-transaksi-container">
        {/* ========================================================
            PAGE HEADER
        ======================================================== */}
        <div className="sdu-tx-header">
          <div>
            <span className="sdu-tx-eyebrow">
              LAYANAN JEMPUT DAUR ULANG MANDIRI
            </span>
            <h1 className="sdu-tx-title">
              Pengajuan Penjemputan Sampah Daur Ulang
            </h1>
          </div>

          <div className="sdu-tx-guarantee-badge">
            <FontAwesomeIcon icon={faShieldHalved} />
            <span>Gratis Biaya Jemput & Payout Instan</span>
          </div>
        </div>

        {/* ========================================================
            5-STEP DYNAMIC PROGRESS BAR (TOP STEPPER)
        ======================================================== */}
        <div className="sdu-tx-stepper-bar">
          {stepperItems.map((st) => (
            <div
              key={st.num}
              className={`sdu-step-item ${
                st.isDone ? "checked" : st.isActive ? "active" : ""
              }`}
            >
              <div className="sdu-step-bubble">
                {st.isDone ? (
                  <FontAwesomeIcon icon={faCheck} />
                ) : (
                  <span>{st.num}</span>
                )}
              </div>
              <div className="sdu-step-label-group">
                <span
                  className={`sdu-step-tag ${
                    st.isDone ? "completed" : st.isActive ? "active" : ""
                  }`}
                >
                  {st.isDone
                    ? "SELESAI"
                    : st.isActive
                    ? "AKTIF"
                    : st.tag}
                </span>
                <strong>{st.title}</strong>
              </div>
            </div>
          ))}
        </div>

        {/* ========================================================
            2-COLUMN FORM CONTENT
        ======================================================== */}
        <form onSubmit={handleSubmit} className="sdu-tx-grid">
          {/* LEFT COLUMN: MATERI, MASSA & FOTO */}
          <div className="sdu-tx-left-col">
            {/* 1. Kategori Material */}
            <div className="sdu-card-section">
              <div className="sdu-section-title-bar">
                <div>
                  <span className="sdu-card-eyebrow">KATEGORI MATERIAL</span>
                  <h3>Pilih Jenis Sampah</h3>
                </div>
                <span className="sdu-selected-count-tag">1 Terpilih</span>
              </div>

              <div className="sdu-cat-selector-grid">
                {CATEGORY_ITEMS.map((cat) => {
                  const dbItem = hargaSampah.find(
                    (h) => h.kategori?.toLowerCase() === cat.key.toLowerCase()
                  );
                  const ratePerKg = dbItem ? Number(dbItem.harga) * 10 : cat.defaultPrice;
                  const isSelected = kategori?.toLowerCase() === cat.key.toLowerCase();

                  return (
                    <div
                      key={cat.key}
                      className={`sdu-cat-btn ${isSelected ? "selected" : ""}`}
                      onClick={() => setKategori(cat.key)}
                    >
                      {isSelected && (
                        <div className="sdu-cat-check-badge">
                          <FontAwesomeIcon icon={faCheck} />
                        </div>
                      )}
                      <div className="sdu-cat-icon">
                        <FontAwesomeIcon icon={cat.icon} />
                      </div>
                      <strong className="sdu-cat-name">{cat.name}</strong>
                      <span className="sdu-cat-rate">
                        Rp {ratePerKg.toLocaleString("id-ID")}/kg
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="sdu-info-alert-box">
                <FontAwesomeIcon icon={faInfoCircle} />
                <span>
                  Tarif saat ini:{" "}
                  <strong>
                    Rp {harga100gr} per 100 gram (Rp {hargaPerKg.toLocaleString("id-ID")} / Kg)
                  </strong>
                  . Dihitung presisi berdasarkan timbangan saat kurir tiba.
                </span>
              </div>
            </div>

            {/* 2. Perkiraan Massa (Estimasi Berat) */}
            <div className="sdu-card-section">
              <div className="sdu-section-title-bar">
                <div>
                  <span className="sdu-card-eyebrow">PERKIRAAN MASSA</span>
                  <h3>Estimasi Berat</h3>
                </div>
                <span className="sdu-min-tag">Min. Penjemputan 2.0 Kg</span>
              </div>

              {/* Number Stepper Counter */}
              <div className="sdu-stepper-counter-row">
                <div className="sdu-counter-box">
                  <button
                    type="button"
                    className="sdu-counter-btn"
                    onClick={() => handleBeratChange(-1)}
                  >
                    <FontAwesomeIcon icon={faMinus} />
                  </button>

                  <div className="sdu-counter-display">
                    <span className="sdu-counter-num">{beratKg.toFixed(1)}</span>
                    <span className="sdu-counter-unit">Kg</span>
                  </div>

                  <button
                    type="button"
                    className="sdu-counter-btn"
                    onClick={() => handleBeratChange(1)}
                  >
                    <FontAwesomeIcon icon={faPlus} />
                  </button>
                </div>

                {/* Quick Preset Pills */}
                <div className="sdu-preset-pills">
                  {[5, 15, 25, 50].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      className={`sdu-preset-pill ${beratKg === preset ? "active" : ""}`}
                      onClick={() => setBerat(preset)}
                    >
                      {preset} Kg
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Bonus Bar */}
              {isBonusActive && (
                <div className={`sdu-bonus-progress-bar ${isTargetBonusAchieved ? "achieved" : ""}`}>
                  <div className="sdu-bonus-top">
                    <span>
                      Target Bonus: <strong>{beratKg} / {minBeratBonus} Kg</strong>
                    </span>
                    <strong className={isTargetBonusAchieved ? "bonus-active-text" : ""}>
                      {isTargetBonusAchieved
                        ? `🎉 Bonus +Rp ${nominalBonus.toLocaleString("id-ID")} Terbuka!`
                        : `+Rp ${nominalBonus.toLocaleString("id-ID")} di ${minBeratBonus} Kg`}
                    </strong>
                  </div>
                  <div className="sdu-progress-track">
                    <div
                      className={`sdu-progress-fill ${isTargetBonusAchieved ? "achieved" : ""}`}
                      style={{
                        width: `${Math.min(100, (beratKg / minBeratBonus) * 100)}%`,
                      }}
                    />
                  </div>
                  <div className="sdu-bonus-subnote">
                    {isTargetBonusAchieved ? (
                      <span className="sdu-bonus-achieved-badge">
                        <FontAwesomeIcon icon={faCheck} /> Target tercapai! Bonus Rp {nominalBonus.toLocaleString("id-ID")} (bonus target) otomatis ditambahkan ke total tebusan & struk.
                      </span>
                    ) : (
                      <span>
                        Tambah {(minBeratBonus - beratKg).toFixed(1)} Kg lagi untuk klaim bonus target tunai Rp {nominalBonus.toLocaleString("id-ID")}.
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Card Estimasi Pendapatan */}
              <div className="sdu-income-estimate-card">
                <div className="sdu-income-left">
                  <div className="sdu-income-icon">
                    <FontAwesomeIcon icon={faWallet} />
                  </div>
                  <div>
                    <span className="sdu-income-label">ESTIMASI TOTAL PENCAIRAN</span>
                    <h2 className="sdu-income-val">
                      Rp {totalharga.toLocaleString("id-ID")}
                    </h2>
                    {bonusDiterima > 0 && (
                      <div className="sdu-income-bonus-indicator">
                        <FontAwesomeIcon icon={faGift} /> Termasuk bonus target +Rp {bonusDiterima.toLocaleString("id-ID")}
                      </div>
                    )}
                  </div>
                </div>
                <div className="sdu-income-formula-wrap">
                  <span className="sdu-income-formula">
                    ({beratGram.toLocaleString("id-ID")} gr / 100) × Rp {harga100gr}
                  </span>
                  {bonusDiterima > 0 && (
                    <span className="sdu-income-bonus-tag">
                      + Rp {bonusDiterima.toLocaleString("id-ID")} (bonus target)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Detail Kondisi & Foto Material */}
            <div className="sdu-card-section">
              <div className="sdu-section-title-bar">
                <div>
                  <span className="sdu-card-eyebrow">DETAIL KONDISI</span>
                  <h3>Keterangan & Foto Material</h3>
                </div>
              </div>

              <div className="sdu-form-group">
                <label className="sdu-form-label">
                  Keterangan Tambahan (Opsional)
                </label>
                <textarea
                  className="sdu-textarea"
                  rows="3"
                  placeholder="Contoh: Kardus bekas mie instan 3 dus dan kardus belanjaan kering..."
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                />
              </div>

              <div className="sdu-form-group">
                <label className="sdu-form-label">Foto Sampah</label>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleFotoChange}
                />

                {!fotoPreview ? (
                  <div
                    className="sdu-photo-upload-dropzone"
                    onClick={() => fileInputRef.current.click()}
                  >
                    <div className="sdu-upload-icon-circle">
                      <FontAwesomeIcon icon={faCamera} />
                    </div>
                    <strong>Klik untuk Mengunggah Foto Sampah</strong>
                    <p>Mendukung format JPG, PNG, atau WEBP (Maksimal 5MB)</p>
                  </div>
                ) : (
                  <div className="sdu-uploaded-photo-card">
                    <img
                      src={fotoPreview}
                      alt="Pratinjau Sampah"
                      className="sdu-photo-thumb"
                    />
                    <div className="sdu-photo-meta">
                      <strong>{foto?.name || "foto_tumpukan_sampah.jpg"}</strong>
                      <p>Kondisi kering, bersih, dan sudah terpilah rapi.</p>
                      <span className="sdu-photo-status-badge">✓ Tersimpan</span>
                    </div>
                    <div className="sdu-photo-actions">
                      <button
                        type="button"
                        className="sdu-btn-outline-sm"
                        onClick={() => fileInputRef.current.click()}
                      >
                        Ganti Foto
                      </button>
                      <button
                        type="button"
                        className="sdu-btn-danger-sm"
                        onClick={removeFoto}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: TITIK JEMPUT, JADWAL & TOMBOL AJUKAN */}
          <div className="sdu-tx-right-col">
            {/* Lokasi Penjemputan Map */}
            <div className="sdu-card-section">
              <div className="sdu-section-title-bar">
                <div>
                  <span className="sdu-card-eyebrow">LOKASI KURIR</span>
                  <h3>Titik Penjemputan</h3>
                </div>
                <span className="sdu-gps-live-badge">● GPS Aktif</span>
              </div>

              <div className="sdu-form-group">
                <label className="sdu-form-label">Alamat Lengkap</label>
                <div className="sdu-input-icon-wrapper">
                  <FontAwesomeIcon icon={faLocationDot} className="sdu-field-icon" />
                  <input
                    type="text"
                    className="sdu-input-field has-icon"
                    placeholder="Contoh: Jl. Melati No. 12, RT 03/RW 05, Padang"
                    value={lokasi}
                    onChange={(e) => setLokasi(e.target.value)}
                  />
                </div>
              </div>

              {/* MapPicker Component */}
              <div className="sdu-map-wrapper">
                <MapPicker
                  latitude={latitude}
                  longitude={longitude}
                  setLatitude={setLatitude}
                  setLongitude={setLongitude}
                />
              </div>
            </div>

            {/* Waktu Penjemputan */}
            <div className="sdu-card-section">
              <label className="sdu-form-label">Pilih Waktu Penjemputan</label>
              <div className="sdu-time-slots-grid">
                <div
                  className={`sdu-time-slot-card ${waktuJemput === "pagi" ? "selected" : ""}`}
                  onClick={() => setWaktuJemput("pagi")}
                >
                  <div className="sdu-time-icon">
                    <FontAwesomeIcon icon={faSun} />
                  </div>
                  <div>
                    <strong>Pagi Hari</strong>
                    <span>09.00 - 12.00 WIB</span>
                  </div>
                  {waktuJemput === "pagi" && (
                    <div className="sdu-slot-check">
                      <FontAwesomeIcon icon={faCheck} />
                    </div>
                  )}
                </div>

                <div
                  className={`sdu-time-slot-card ${waktuJemput === "sore" ? "selected" : ""}`}
                  onClick={() => setWaktuJemput("sore")}
                >
                  <div className="sdu-time-icon">
                    <FontAwesomeIcon icon={faMoon} />
                  </div>
                  <div>
                    <strong>Sore Hari</strong>
                    <span>13.00 - 16.00 WIB</span>
                  </div>
                  {waktuJemput === "sore" && (
                    <div className="sdu-slot-check">
                      <FontAwesomeIcon icon={faCheck} />
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="sdu-btn-submit-tx"
                disabled={isSubmitting}
              >
                <span>{isSubmitting ? "Sedang Mengirim..." : "Ajukan Penjemputan"}</span>
                <FontAwesomeIcon icon={faArrowRight} />
              </button>

              <p className="sdu-submit-subnote">
                <FontAwesomeIcon icon={faShieldHalved} /> Gratis armada • Tanpa potongan timbangan
              </p>
            </div>

            {/* Dampak Ekologis Card */}
            <div className="sdu-eco-impact-box">
              <div className="sdu-eco-box-icon">
                <FontAwesomeIcon icon={faLeaf} />
              </div>
              <div className="sdu-eco-box-content">
                <strong>{beratKg} Kg {kategori} Diselamatkan</strong>
                <p>
                  Mencegah penebangan {(beratKg * 0.016).toFixed(2)} pohon & hemat{" "}
                  {(beratKg * 2.5).toFixed(1)}L air bersih.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* ========================================================
          MODAL POP-UP KONFIRMASI DETAIL PENJEMPUTAN
      ======================================================== */}
      {showConfirmModal && (
        <div
          className="sdu-slip-overlay"
          onClick={() => !isSubmitting && setShowConfirmModal(false)}
        >
          <div
            className="sdu-confirm-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sdu-confirm-header">
              <div className="sdu-confirm-title-group">
                <span className="sdu-confirm-eyebrow">
                  <FontAwesomeIcon icon={faShieldHalved} /> KONFIRMASI PENJEMPUTAN
                </span>
                <h3>Rincian Pengajuan Penjemputan</h3>
              </div>
              <button
                type="button"
                className="sdu-confirm-close-btn"
                onClick={() => !isSubmitting && setShowConfirmModal(false)}
                disabled={isSubmitting}
                aria-label="Tutup"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="sdu-confirm-body">
              {/* Photo & Main Highlight Box */}
              <div className="sdu-confirm-main-box">
                {fotoPreview && (
                  <div className="sdu-confirm-thumb-wrap">
                    <img
                      src={fotoPreview}
                      alt="Preview Sampah"
                      className="sdu-confirm-thumb"
                    />
                  </div>
                )}
                <div className="sdu-confirm-highlight-text">
                  <div className="sdu-confirm-cat-badge">
                    {CATEGORY_ITEMS.find((c) => c.key === kategori)?.name || kategori}
                  </div>
                  <div className="sdu-confirm-price-row">
                    <span className="sdu-confirm-lbl">ESTIMASI TOTAL TEBUSAN</span>
                    <strong className="sdu-confirm-price-val">
                      Rp {totalharga.toLocaleString("id-ID")}
                    </strong>
                  </div>
                  <div className="sdu-confirm-rate-sub">
                    <span>
                      Dasar: Rp {baseTotalHarga.toLocaleString("id-ID")} ({beratKg} Kg • Rp {harga100gr}/100gr)
                    </span>
                    {bonusDiterima > 0 && (
                      <span className="sdu-confirm-bonus-sub" style={{ color: "#10b981", fontWeight: 700, marginLeft: "6px" }}>
                        • Bonus Target: +Rp {bonusDiterima.toLocaleString("id-ID")} (bonus target)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Rincian Grid Info */}
              <div className="sdu-confirm-details-grid">
                <div className="sdu-confirm-detail-item">
                  <span className="sdu-confirm-item-lbl">
                    <FontAwesomeIcon icon={faScaleBalanced} /> Bobot Estimasi
                  </span>
                  <strong>{beratKg} Kg</strong>
                </div>

                <div className="sdu-confirm-detail-item">
                  <span className="sdu-confirm-item-lbl">
                    <FontAwesomeIcon icon={faClock} /> Jadwal Jemput
                  </span>
                  <strong>
                    {waktuJemput === "sore"
                      ? "Sore Hari (13.00 - 16.00 WIB)"
                      : "Pagi Hari (09.00 - 12.00 WIB)"}
                  </strong>
                </div>

                <div className="sdu-confirm-detail-item full">
                  <span className="sdu-confirm-item-lbl">
                    <FontAwesomeIcon icon={faLocationDot} /> Titik Alamat Penjemputan
                  </span>
                  <strong className="sdu-confirm-address-text">{lokasi}</strong>
                  {latitude && longitude && (
                    <span className="sdu-confirm-coords-text">
                      Koordinat GPS: {Number(latitude).toFixed(5)}, {Number(longitude).toFixed(5)}
                    </span>
                  )}
                </div>

                {keterangan && (
                  <div className="sdu-confirm-detail-item full note">
                    <span className="sdu-confirm-item-lbl">Catatan Tambahan Warga</span>
                    <p className="sdu-confirm-note-p">"{keterangan}"</p>
                  </div>
                )}
              </div>

              {/* The Confirmation Question Banner */}
              <div className="sdu-confirm-question-box">
                <div className="sdu-confirm-q-icon">
                  <FontAwesomeIcon icon={faCircleQuestion} />
                </div>
                <div className="sdu-confirm-q-text">
                  <h4>Apakah data sudah lengkap dan benar?</h4>
                  <p>
                    Jika sudah sesuai, tekan tombol konfirmasi di bawah untuk
                    meneruskan pesanan penjemputan ke petugas armada SDU.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="sdu-confirm-footer">
              <button
                type="button"
                className="sdu-btn-confirm-cancel"
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
              >
                Periksa Kembali
              </button>

              <button
                type="button"
                className="sdu-btn-confirm-submit"
                onClick={handleConfirmAndSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="fa-spin" />
                    <span>Memproses Pengajuan...</span>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faCircleCheck} />
                    <span>Ya, Ajukan Penjemputan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Transaksi;
