import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./style/LandingPage.css";
import dashboardImg from "../assets/DashboardIMG.png";
import logo from "../assets/Logo.png";
import { getStatistikLandingPage } from "../services/transaksiService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRecycle,
  faTruckFast,
  faScaleBalanced,
  faMoneyBillWave,
  faBoxesPacking,
  faCalendarCheck,
  faArrowRight,
  faStar,
  faShieldHalved,
  faLocationDot,
  faBottleWater,
  faBoxOpen,
  faTrashCan,
  faWineGlass,
  faTools,
  faCheck,
  faCircleCheck,
  faSeedling,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";

function LandingPage() {
  const navigate = useNavigate();
  const [statistik, setStatistik] = useState({
    totalTransaksi: 12450,
    totalBerat: 84200000, // dalam gram -> 84.2 Ton
    totalPengguna: 4820,
    totalKategori: 6,
  });

  useEffect(() => {
    const loadStatistik = async () => {
      try {
        const data = await getStatistikLandingPage();
        if (data && (data.totalTransaksi > 0 || data.totalBerat > 0)) {
          setStatistik((prev) => ({
            ...prev,
            totalTransaksi: Number(data.totalTransaksi) || prev.totalTransaksi,
            totalBerat: Number(data.totalBerat) || prev.totalBerat,
            totalPengguna: Number(data.totalPengguna) || prev.totalPengguna,
          }));
        }
      } catch (error) {
        console.warn("Menggunakan baseline data statistik:", error);
      }
    };

    loadStatistik();
  }, []);

  const formatBeratSampah = (beratGram) => {
    const beratKg = Number(beratGram || 0) / 1000;
    if (beratKg >= 1000) {
      const beratTon = beratKg / 1000;
      return `${beratTon.toLocaleString("id-ID", { maximumFractionDigits: 1 })} Ton`;
    }
    return `${beratKg.toLocaleString("id-ID", { maximumFractionDigits: 1 })} Kg`;
  };

  const scrollToCaraKerja = () => {
    const element = document.getElementById("cara-kerja");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="sdu-landing-page">
      {/* ========================================================
          1. HERO SECTION
      ======================================================== */}
      <section className="sdu-hero-section">
        <div className="sdu-hero-container">
          {/* Left Text Column */}
          <div className="sdu-hero-left">
            <div className="sdu-pill-badge">
              <span className="sdu-pill-icon">🌱</span>
              <span>Solusi Praktis Pilah Sampah Rumah Tangga</span>
            </div>

            <h1 className="sdu-hero-title">
              Ubah Sampah Jadi{" "}
              <span className="sdu-title-highlight">Berkah & Rupiah</span>{" "}
              bersama SDU
            </h1>

            <p className="sdu-hero-desc">
              Solusi praktis jemput sampah terpilah langsung ke depan pintu rumah
              Anda. Dapatkan timbangan presisi, pencairan tunai atau transfer
              instan, serta kontribusi nyata menjaga bumi.
            </p>

            <div className="sdu-hero-actions">
              <button
                className="sdu-btn-primary"
                onClick={() => navigate("/transaksi")}
              >
                <span>Mulai Setor Sampah</span>
                <FontAwesomeIcon icon={faArrowRight} />
              </button>

              <button
                className="sdu-btn-secondary"
                onClick={scrollToCaraKerja}
              >
                <span>Pelajari Cara Kerja</span>
              </button>
            </div>

            {/* Micro Benefits Row */}
            <div className="sdu-micro-benefits">
              <div className="sdu-benefit-item">
                <div className="sdu-benefit-icon">
                  <FontAwesomeIcon icon={faTruckFast} />
                </div>
                <div className="sdu-benefit-text">
                  <strong>100% Jemput Rumah</strong>
                  <span>Bebas repot antar</span>
                </div>
              </div>

              <div className="sdu-benefit-item">
                <div className="sdu-benefit-icon">
                  <FontAwesomeIcon icon={faScaleBalanced} />
                </div>
                <div className="sdu-benefit-text">
                  <strong>Timbangan Murni</strong>
                  <span>Transparan di tempat</span>
                </div>
              </div>

              <div className="sdu-benefit-item">
                <div className="sdu-benefit-icon">
                  <FontAwesomeIcon icon={faMoneyBillWave} />
                </div>
                <div className="sdu-benefit-text">
                  <strong>Pencairan Tunai</strong>
                  <span>Langsung atau transfer</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Visual Image & Floating Badges */}
          <div className="sdu-hero-right">
            <div className="sdu-hero-image-card">
              <img
                src={dashboardImg}
                alt="SDU Daur Ulang Edukasi"
                className="sdu-main-hero-img"
              />

              {/* Floating Card: Estimasi Pendapatan */}
              <div className="sdu-floating-card sdu-float-top">
                <div className="sdu-float-icon">
                  <FontAwesomeIcon icon={faMoneyBillWave} />
                </div>
                <div>
                  <span className="sdu-float-label">Estimasi pendapatan</span>
                  <strong className="sdu-float-val">Rp 185.000 / bln</strong>
                </div>
              </div>

              {/* Floating Card: Armada Terdekat */}
              <div className="sdu-floating-card sdu-float-bottom">
                <div className="sdu-float-icon truck">
                  <FontAwesomeIcon icon={faTruckFast} />
                </div>
                <div className="sdu-float-content">
                  <strong>Truk Terdekat Bersedia</strong>
                  <p>Pos Lapangan RW 04, Jemput 15 mnt</p>
                </div>
                <button
                  className="sdu-float-btn"
                  onClick={() => navigate("/transaksi")}
                >
                  Cek Jadwal
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          2. SECTION TENTANG SDU & KATALOG MATERI DAUR ULANG
      ======================================================== */}
      <section className="sdu-catalog-section" id="katalog">
        <div className="sdu-section-container">
          <div className="sdu-section-header-row">
            <div>
              <span className="sdu-section-eyebrow">
                TENTANG SDU & MITRA DAUR ULANG
              </span>
              <h2 className="sdu-section-title">
                Menghubungkan Dapur Keluarga dengan Pabrik Daur Ulang Nasional
              </h2>
              <p className="sdu-section-subtitle">
                SDU hadir untuk memangkas rantai perantara. Kami mendistribusikan
                material terpilah langsung ke agen/pabrik peleburan dengan
                transparansi harga komoditas terkini secara berkala.
              </p>
            </div>

            <div className="sdu-header-tag-pill">
              <span>📈 Penyesuaian volume & estimasi berdasarkan tonase pabrik</span>
            </div>
          </div>

          {/* 6 Category Cards Grid */}
          <div className="sdu-material-grid">
            {/* Card 1 */}
            <div className="sdu-material-card">
              <div className="sdu-mat-top">
                <div className="sdu-mat-icon">
                  <FontAwesomeIcon icon={faBottleWater} />
                </div>
                <span className="sdu-mat-badge high">High Demand</span>
              </div>
              <h3 className="sdu-mat-title">Plastik (PET & HDPE)</h3>
              <p className="sdu-mat-desc">
                Botol mineral bening, botol deterjen, tutup botol, jerigen
                (bersih & tanpa cairan pekat).
              </p>
              <div className="sdu-mat-rate">
                <span className="sdu-rate-label">Estimasi Saat Ini</span>
                <span className="sdu-rate-value">Rp 3.500 - 5.200 / kg</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="sdu-material-card">
              <div className="sdu-mat-top">
                <div className="sdu-mat-icon">
                  <FontAwesomeIcon icon={faBoxOpen} />
                </div>
                <span className="sdu-mat-badge primary">Paling Dicari</span>
              </div>
              <h3 className="sdu-mat-title">Kardus & Kertas</h3>
              <p className="sdu-mat-desc">
                Kardus cokelat e-commerce, koran lama, karton HVS kantor,
                majalah dan kardus tanpa minyak.
              </p>
              <div className="sdu-mat-rate">
                <span className="sdu-rate-label">Estimasi Saat Ini</span>
                <span className="sdu-rate-value">Rp 1.800 - 2.800 / kg</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="sdu-material-card">
              <div className="sdu-mat-top">
                <div className="sdu-mat-icon">
                  <FontAwesomeIcon icon={faWineGlass} />
                </div>
                <span className="sdu-mat-badge info">Lebih Bermanfaat</span>
              </div>
              <h3 className="sdu-mat-title">Botol Kaca</h3>
              <p className="sdu-mat-desc">
                Botol kecap, sirup, botol minuman, dan toples kaca utuh (tanpa
                retak & tanpa tutup seng).
              </p>
              <div className="sdu-mat-rate">
                <span className="sdu-rate-label">Estimasi Saat Ini</span>
                <span className="sdu-rate-value">Rp 800 - 1.500 / kg</span>
              </div>
            </div>

            {/* Card 4 */}
            <div className="sdu-material-card">
              <div className="sdu-mat-top">
                <div className="sdu-mat-icon">
                  <FontAwesomeIcon icon={faTrashCan} />
                </div>
                <span className="sdu-mat-badge amber">Nilai Tinggi</span>
              </div>
              <h3 className="sdu-mat-title">Kaleng & Aluminium</h3>
              <p className="sdu-mat-desc">
                Kaleng susu kental, kaleng soda/minuman, seng tipis, dan wajan
                aluminium bekas.
              </p>
              <div className="sdu-mat-rate">
                <span className="sdu-rate-label">Estimasi Saat Ini</span>
                <span className="sdu-rate-value">Rp 12.000 - 18.500 / kg</span>
              </div>
            </div>

            {/* Card 5 */}
            <div className="sdu-material-card">
              <div className="sdu-mat-top">
                <div className="sdu-mat-icon">
                  <FontAwesomeIcon icon={faTools} />
                </div>
                <span className="sdu-mat-badge slate">Bebas Karat</span>
              </div>
              <h3 className="sdu-mat-title">Besi & Logam</h3>
              <p className="sdu-mat-desc">
                Paku, kawat, potongan seng, komponen besi jemuran, dan
                peralatan logam rumah tangga.
              </p>
              <div className="sdu-mat-rate">
                <span className="sdu-rate-label">Estimasi Saat Ini</span>
                <span className="sdu-rate-value">Rp 4.500 - 6.500 / kg</span>
              </div>
            </div>

            {/* Card 6 */}
            <div className="sdu-material-card">
              <div className="sdu-mat-top">
                <div className="sdu-mat-icon">
                  <FontAwesomeIcon icon={faRecycle} />
                </div>
                <span className="sdu-mat-badge default">Modul</span>
              </div>
              <h3 className="sdu-mat-title">Pecah Belah & Beling</h3>
              <p className="sdu-mat-desc">
                Piring/cangkir beling, pecahan kaca tebal, dan cermin (wajib
                dibungkus karung goni aman).
              </p>
              <div className="sdu-mat-rate">
                <span className="sdu-rate-label">Estimasi Saat Ini</span>
                <span className="sdu-rate-value">Rp 500 - 1.100 / kg</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          3. SECTION 4 LANGKAH PRAKTIS
      ======================================================== */}
      <section className="sdu-steps-section" id="cara-kerja">
        <div className="sdu-section-container">
          <div className="sdu-center-header">
            <span className="sdu-section-eyebrow">ALUR PENGUMPULAN SEDERHANA</span>
            <h2 className="sdu-section-title">
              4 Langkah Praktis Menyetor Sampah dari Rumah
            </h2>
            <p className="sdu-section-subtitle">
              Tidak perlu repot cari tempat penampungan. Cukup siapkan dari rumah
              dengan langkah mudah:
            </p>
          </div>

          <div className="sdu-steps-grid">
            <div className="sdu-step-card">
              <div className="sdu-step-header">
                <span className="sdu-step-number">01</span>
                <FontAwesomeIcon icon={faBoxesPacking} className="sdu-step-icon" />
              </div>
              <h3>Pilah di Rumah</h3>
              <p>
                Pisahkan sampah anorganik bernilai jual ke wadah terpisah sesuai
                kategori material utama.
              </p>
            </div>

            <div className="sdu-step-card">
              <div className="sdu-step-header">
                <span className="sdu-step-number">02</span>
                <FontAwesomeIcon icon={faCalendarCheck} className="sdu-step-icon" />
              </div>
              <h3>Ajukan Jemput</h3>
              <p>
                Pilih kategori material, perkiraan bobot, dan tentukan titik
                alamat rumah Anda pada peta digital.
              </p>
            </div>

            <div className="sdu-step-card">
              <div className="sdu-step-header">
                <span className="sdu-step-number">03</span>
                <FontAwesomeIcon icon={faScaleBalanced} className="sdu-step-icon" />
              </div>
              <h3>Penimbangan Terbuka</h3>
              <p>
                Mitra agen tiba sesuai jadwal dengan timbangan digital
                terkalibrasi langsung di depan Anda.
              </p>
            </div>

            <div className="sdu-step-card">
              <div className="sdu-step-header">
                <span className="sdu-step-number">04</span>
                <FontAwesomeIcon icon={faMoneyBillWave} className="sdu-step-icon" />
              </div>
              <h3>Pencairan Instan</h3>
              <p>
                Terima pembayaran secara tunai atau transfer instan ke e-wallet /
                rekening bank Anda tanpa potongan.
              </p>
            </div>
          </div>

          {/* Jangkauan Banner */}
          <div className="sdu-coverage-banner">
            <div className="sdu-cov-left">
              <FontAwesomeIcon icon={faLocationDot} className="sdu-cov-pin" />
              <div>
                <strong>Jangkauan Wilayah Penjemputan</strong>
                <p>Melayani Padang Raya, Sawahlunto, Solok dan sekitarnya</p>
              </div>
            </div>
            <button
              className="sdu-btn-outline sdu-cov-btn"
              onClick={() => navigate("/transaksi")}
            >
              Cek Ketersediaan RT/RW
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================
          4. IMPACT SECTION (DARK NAVY BANNER)
      ======================================================== */}
      <section className="sdu-impact-section" id="dampak">
        <div className="sdu-section-container">
          <div className="sdu-impact-header">
            <div>
              <span className="sdu-impact-eyebrow">DAMPAK KOLABORASI</span>
              <h2 className="sdu-impact-title">Hasil Nyata untuk Bumi & Warga</h2>
            </div>
            <span className="sdu-impact-sync">● Pembaruan data otomatis</span>
          </div>

          <div className="sdu-impact-grid">
            <div className="sdu-impact-item">
              <div className="sdu-imp-icon">
                <FontAwesomeIcon icon={faCircleCheck} />
              </div>
              <h3 className="sdu-imp-value">
                {(Number(statistik.totalTransaksi) || 12450).toLocaleString("id-ID")}+
              </h3>
              <span className="sdu-imp-label">Penjemputan Sukses</span>
              <p className="sdu-imp-sub">Tingkat kepuasan warga 99.2%</p>
            </div>

            <div className="sdu-impact-item">
              <div className="sdu-imp-icon">
                <FontAwesomeIcon icon={faRecycle} />
              </div>
              <h3 className="sdu-imp-value">
                {formatBeratSampah(statistik.totalBerat)}
              </h3>
              <span className="sdu-imp-label">Sampah Terkelola</span>
              <p className="sdu-imp-sub">Mencegah emisi setara 168 ton CO2</p>
            </div>

            <div className="sdu-impact-item">
              <div className="sdu-imp-icon">
                <FontAwesomeIcon icon={faSeedling} />
              </div>
              <h3 className="sdu-imp-value">
                {(Number(statistik.totalPengguna) || 4820).toLocaleString("id-ID")}+
              </h3>
              <span className="sdu-imp-label">Warga Terdaftar</span>
              <p className="sdu-imp-sub">Bank desa & komunitas lingkungan</p>
            </div>

            <div className="sdu-impact-item">
              <div className="sdu-imp-icon">
                <FontAwesomeIcon icon={faMoneyBillWave} />
              </div>
              <h3 className="sdu-imp-value">Rp 215,8 Jt+</h3>
              <span className="sdu-imp-label">Dana Tersalurkan</span>
              <p className="sdu-imp-sub">Insentif tunai langsung ke warga</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          5. TESTIMONIALS SECTION
      ======================================================== */}
      <section className="sdu-testi-section" id="testimoni">
        <div className="sdu-section-container">
          <div className="sdu-center-header">
            <span className="sdu-section-eyebrow">CERITA WARGA</span>
            <h2 className="sdu-section-title">
              Pengalaman Mereka yang Sudah Memulai
            </h2>
            <p className="sdu-section-subtitle">
              Kesan dan cerita nyata penjemputan sampah terpilah tanpa ribet.
            </p>
          </div>

          <div className="sdu-testi-grid">
            <div className="sdu-testi-card">
              <div className="sdu-testi-stars">
                {[...Array(5)].map((_, i) => (
                  <FontAwesomeIcon key={i} icon={faStar} />
                ))}
              </div>
              <p className="sdu-testi-quote">
                "Prosesnya cepat! Dulu kardus belanja online menumpuk di gudang,
                sekarang tinggal foto lewat aplikasi, kurir SDU datang menimbang
                dan langsung ditransfer uangnya."
              </p>
              <div className="sdu-testi-user">
                <div className="sdu-testi-avatar">ER</div>
                <div>
                  <strong>Ibu Erna Ratni</strong>
                  <span>Warga Sawahlunto</span>
                </div>
              </div>
            </div>

            <div className="sdu-testi-card">
              <div className="sdu-testi-stars">
                {[...Array(5)].map((_, i) => (
                  <FontAwesomeIcon key={i} icon={faStar} />
                ))}
              </div>
              <p className="sdu-testi-quote">
                "Timbangannya murni dan terbuka. Tidak ada biaya potong-potongan.
                Kurir ramah dan titik GPS penjemputan tepat di depan rumah."
              </p>
              <div className="sdu-testi-user">
                <div className="sdu-testi-avatar bp">BP</div>
                <div>
                  <strong>Bambang Prasetyo</strong>
                  <span>Ketua RT 04 Padang Barat</span>
                </div>
              </div>
            </div>

            <div className="sdu-testi-card">
              <div className="sdu-testi-stars">
                {[...Array(5)].map((_, i) => (
                  <FontAwesomeIcon key={i} icon={faStar} />
                ))}
              </div>
              <p className="sdu-testi-quote">
                "Setiap minggu kaleng susu dan botol sirup di cafe kami selalu
                dijemput rutin oleh tim SDU. Sangat membantu kebersihan dan
                menambah pendapatan bisnis."
              </p>
              <div className="sdu-testi-user">
                <div className="sdu-testi-avatar rg">RG</div>
                <div>
                  <strong>Rian Gunawan</strong>
                  <span>Owner Kedai Kopi Selaras</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          6. CALL TO ACTION (CTA BOX WITH SIMULATION)
      ======================================================== */}
      <section className="sdu-cta-section">
        <div className="sdu-section-container">
          <div className="sdu-cta-card">
            {/* Left Column */}
            <div className="sdu-cta-left">
              <div className="sdu-pill-badge small">
                <span>Mulai Langkah Kecil</span>
              </div>
              <h2 className="sdu-cta-title">
                Mulai Dari Satu Kantong Terpilah Hari Ini
              </h2>
              <p className="sdu-cta-desc">
                Daftarkan alamat rumah Anda sekarang dan dapatkan bonus poin reward
                sebesar Rp 5.000 untuk setoran perdana minimal 5 Kg.
              </p>
              <div className="sdu-cta-buttons">
                <button
                  className="sdu-btn-primary"
                  onClick={() => navigate("/transaksi")}
                >
                  Daftar & Jadwalkan Penjemputan
                </button>
                <button
                  className="sdu-btn-wa"
                  onClick={() =>
                    window.open(
                      "https://wa.me/6283808421427?text=Halo%20Admin%20SDU,%20saya%20ingin%20konsultasi%20penjemputan%20sampah",
                      "_blank"
                    )
                  }
                >
                  <FontAwesomeIcon icon={faWhatsapp} />
                  <span>Konsultasi WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Right Simulation Widget */}
            <div className="sdu-sim-widget">
              <div className="sdu-sim-header">
                <span>Simulasi Nilai Hari Ini</span>
                <FontAwesomeIcon icon={faScaleBalanced} />
              </div>
              <div className="sdu-sim-list">
                <div className="sdu-sim-row">
                  <span>Kardus Tebal (15 Kg)</span>
                  <strong>Rp 45.000</strong>
                </div>
                <div className="sdu-sim-row">
                  <span>Botol Plastik PET (10 Kg)</span>
                  <strong>Rp 35.000</strong>
                </div>
                <div className="sdu-sim-row">
                  <span>Kaleng Minuman (2 Kg)</span>
                  <strong>Rp 25.000</strong>
                </div>
                <div className="sdu-sim-divider" />
                <div className="sdu-sim-total">
                  <span>Estimasi Total Cair</span>
                  <strong className="sdu-total-nominal">Rp 105.000</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          7. FOOTER
      ======================================================== */}
      <footer className="sdu-footer">
        <div className="sdu-footer-container">
          <div className="sdu-footer-top">
            <div className="sdu-footer-brand">
              <div className="sdu-brand-icon">
                <FontAwesomeIcon icon={faRecycle} />
              </div>
              <div>
                <span className="sdu-brand-title">SDU</span>
                <span className="sdu-brand-subtitle">
                  SISTEM DAUR ULANG DIGITAL INDONESIA
                </span>
              </div>
            </div>

            <div className="sdu-footer-links">
              <a href="#kebijakan">Kebijakan Privasi</a>
              <a href="#syarat">Syarat & Ketentuan</a>
              <a href="#bantuan">Pusat Bantuan</a>
            </div>
          </div>

          <div className="sdu-footer-bottom">
            <p>© 2026 SDU. Ekosistem Daur Ulang Digital Indonesia.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
