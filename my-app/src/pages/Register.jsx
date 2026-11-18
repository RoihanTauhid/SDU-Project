import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./style/Register.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faUser,
  faPhone,
  faLocationDot,
  faLock,
  faLeaf,
  faUserPlus,
  faIdCard,
  faAt,
  faCamera,
  faCloudArrowUp,
  faShieldHalved,
  faCircleCheck,
  faCircleExclamation,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import logo from "../assets/Logo.png";
import { getRegisAuth } from "../services/authService";

function Register() {
  const navigate = useNavigate();
  const profilInputRef = useRef(null);
  const ktpInputRef = useRef(null);

  const [formData, setFormData] = useState({
    nama: "",
    nik: "",
    username: "",
    no_hp: "",
    alamat: "",
    password: "",
    confirmPassword: "",
  });

  const [fotoProfil, setFotoProfil] = useState(null);
  const [previewProfil, setPreviewProfil] = useState("");
  const [fotoKtp, setFotoKtp] = useState(null);
  const [previewKtp, setPreviewKtp] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "nik") {
      // Hanya izinkan angka maksimal 16 digit
      const digitsOnly = value.replace(/\D/g, "").slice(0, 16);
      setFormData((prev) => ({ ...prev, nik: digitsOnly }));
      return;
    }
    if (name === "username") {
      // Hilangkan spasi dan huruf kapital otomatis
      const cleanUser = value.replace(/\s+/g, "").toLowerCase();
      setFormData((prev) => ({ ...prev, username: cleanUser }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Berkas harus berupa gambar (JPG, JPEG, PNG, atau WEBP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Ukuran gambar maksimal 5 MB.");
      return;
    }

    setErrorMsg("");
    const objectUrl = URL.createObjectURL(file);
    if (type === "profil") {
      setFotoProfil(file);
      setPreviewProfil(objectUrl);
    } else {
      setFotoKtp(file);
      setPreviewKtp(objectUrl);
    }
  };

  const removeFile = (type) => {
    if (type === "profil") {
      setFotoProfil(null);
      setPreviewProfil("");
      if (profilInputRef.current) profilInputRef.current.value = "";
    } else {
      setFotoKtp(null);
      setPreviewKtp("");
      if (ktpInputRef.current) ktpInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (
      !formData.nama.trim() ||
      !formData.nik.trim() ||
      !formData.username.trim() ||
      !formData.no_hp.trim() ||
      !formData.alamat.trim() ||
      !formData.password.trim() ||
      !formData.confirmPassword.trim()
    ) {
      setErrorMsg("Semua data formal wajib diisi lengkap.");
      return;
    }

    if (!/^\d{16}$/.test(formData.nik.trim())) {
      setErrorMsg("NIK wajib terdiri dari 16 digit angka sesuai KTP.");
      return;
    }

    if (!/^[a-z0-9_.-]{3,30}$/.test(formData.username.trim())) {
      setErrorMsg(
        "Username minimal 3 karakter (huruf kecil, angka, titik, atau underscore tanpa spasi)."
      );
      return;
    }

    if (!fotoProfil) {
      setErrorMsg("Silakan unggah Foto Profil Anda terlebih dahulu.");
      return;
    }

    if (!fotoKtp) {
      setErrorMsg("Silakan unggah Foto KTP Anda untuk proses verifikasi Admin.");
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg("Password minimal 6 karakter.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg("Konfirmasi password tidak cocok.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = new FormData();
      payload.append("nama", formData.nama.trim());
      payload.append("nik", formData.nik.trim());
      payload.append("username", formData.username.trim());
      payload.append("no_hp", formData.no_hp.trim());
      payload.append("alamat", formData.alamat.trim());
      payload.append("password", formData.password);
      payload.append("foto_profil", fotoProfil);
      payload.append("foto_ktp", fotoKtp);

      await getRegisAuth(payload);
      setIsRegistered(true);
    } catch (err) {
      setErrorMsg(err.message || "Gagal mendaftar. Silakan periksa data Anda.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      {/* ===== PANEL KIRI - BRANDING ===== */}
      <div className="auth-branding">
        <div className="branding-blob branding-blob-1" />
        <div className="branding-blob branding-blob-2" />

        <div className="branding-content">
          <div className="branding-logo" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
            <img src={logo} alt="Logo SDU" />
          </div>
          <h2>SDU</h2>
          <p className="branding-tagline">
            Sistem Daur Ulang Digital — Terpercaya, Transparan & Terverifikasi
          </p>

          <div className="branding-quote">
            <FontAwesomeIcon icon={faLeaf} className="quote-icon" />
            <p>
              Demi keamanan bersama dan ketepatan alamat penjemputan kurir, setiap
              warga pendaftar diverifikasi kesesuaian identitasnya dengan KTP oleh
              Admin SDU.
            </p>
          </div>
        </div>
      </div>

      {/* ===== PANEL KANAN - FORM ===== */}
      <div className="auth-form-section">
        {isRegistered ? (
          <div className="register-form sdu-reg-success-card">
            <div className="sdu-reg-success-icon">
              <FontAwesomeIcon icon={faCircleCheck} />
            </div>
            <h1>Pendaftaran Terkirim!</h1>
            <p className="sdu-reg-success-desc">
              Terima kasih <strong>{formData.nama}</strong>. Data pendaftaran dan
              dokumen KTP Anda telah diterima oleh sistem.
            </p>

            <div className="sdu-reg-status-steps">
              <div className="sdu-step-box done">
                <span className="step-num">✓</span>
                <div>
                  <strong>1. Data & KTP Terunggah</strong>
                  <small>Identitas formal & alamat acuan penjemputan tersimpan</small>
                </div>
              </div>
              <div className="sdu-step-box active">
                <span className="step-num">2</span>
                <div>
                  <strong>2. Menunggu Verifikasi Admin</strong>
                  <small>Admin mencocokkan NIK & nama dengan foto KTP Anda</small>
                </div>
              </div>
              <div className="sdu-step-box">
                <span className="step-num">3</span>
                <div>
                  <strong>3. Login & Mulai Transaksi</strong>
                  <small>Akun aktif setelah disetujui oleh tim Admin SDU</small>
                </div>
              </div>
            </div>

            <div className="sdu-reg-success-actions">
              <button
                type="button"
                className="submit-btn"
                onClick={() => navigate("/login")}
              >
                Ke Halaman Login
              </button>
              <Link to="/" className="sdu-back-home-link">
                Kembali ke Beranda Publik
              </Link>
            </div>
          </div>
        ) : (
          <form className="register-form register-form-wide" onSubmit={handleSubmit}>
            <div className="form-header-inline">
              <div className="form-icon-badge">
                <FontAwesomeIcon icon={faUserPlus} />
              </div>
              <div>
                <h1>Registrasi Akun Warga</h1>
                <p className="form-subtitle">
                  Lengkapi identitas formal dan unggah KTP untuk verifikasi Admin
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="sdu-auth-alert error">
                <FontAwesomeIcon icon={faCircleExclamation} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Identitas Formal */}
            <div className="form-grid-2">
              <div className="input-group">
                <label>
                  <FontAwesomeIcon icon={faUser} /> Nama Lengkap (Sesuai KTP)
                </label>
                <input
                  type="text"
                  name="nama"
                  placeholder="Contoh: Budi Santoso"
                  required
                  value={formData.nama}
                  onChange={handleChange}
                />
              </div>

              <div className="input-group">
                <label>
                  <FontAwesomeIcon icon={faIdCard} /> NIK (16 Digit)
                </label>
                <input
                  type="text"
                  name="nik"
                  inputMode="numeric"
                  placeholder="16 digit NIK KTP"
                  maxLength={16}
                  required
                  value={formData.nik}
                  onChange={handleChange}
                />
                <small className="input-hint">
                  {formData.nik.length}/16 digit angka
                </small>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="input-group">
                <label>
                  <FontAwesomeIcon icon={faAt} /> Username
                </label>
                <input
                  type="text"
                  name="username"
                  placeholder="contoh: budi_santoso"
                  required
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>

              <div className="input-group">
                <label>
                  <FontAwesomeIcon icon={faPhone} /> Nomor HP / WhatsApp
                </label>
                <input
                  type="tel"
                  name="no_hp"
                  placeholder="08xxxxxxxxxx"
                  required
                  value={formData.no_hp}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Alamat Acuan Pengantaran */}
            <div className="input-group">
              <label>
                <FontAwesomeIcon icon={faLocationDot} /> Alamat Lengkap (Acuan Penjemputan / Pengantaran)
              </label>
              <textarea
                name="alamat"
                placeholder="Nama Jalan, No. Rumah, RT/RW, Kelurahan, Kecamatan, Kota, dan patokan rumah"
                required
                value={formData.alamat}
                onChange={handleChange}
                rows="2"
              />
              <small className="input-hint">
                Alamat ini menjadi titik acuan resmi saat kurir menjemput atau mengantar pembayaran.
              </small>
            </div>

            {/* Upload Dokumen Profil & KTP */}
            <div className="form-grid-2">
              {/* Upload Foto Profil */}
              <div className="input-group">
                <label>
                  <FontAwesomeIcon icon={faCamera} /> Upload Foto Profil
                </label>
                <input
                  ref={profilInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden-file-input"
                  onChange={(e) => handleFileChange(e, "profil")}
                />
                {previewProfil ? (
                  <div className="sdu-upload-preview-box">
                    <img src={previewProfil} alt="Preview Profil" />
                    <button
                      type="button"
                      className="sdu-remove-file-btn"
                      onClick={() => removeFile("profil")}
                      title="Ganti foto profil"
                    >
                      <FontAwesomeIcon icon={faXmark} />
                    </button>
                    <span className="sdu-file-tag">Foto Profil Siap</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="sdu-upload-dropzone"
                    onClick={() => profilInputRef.current?.click()}
                  >
                    <FontAwesomeIcon icon={faCloudArrowUp} />
                    <span>Pilih Foto Profil</span>
                    <small>JPG/PNG (Maks 5MB)</small>
                  </button>
                )}
              </div>

              {/* Upload Foto KTP */}
              <div className="input-group">
                <label>
                  <FontAwesomeIcon icon={faIdCard} /> Upload Foto KTP
                </label>
                <input
                  ref={ktpInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden-file-input"
                  onChange={(e) => handleFileChange(e, "ktp")}
                />
                {previewKtp ? (
                  <div className="sdu-upload-preview-box">
                    <img src={previewKtp} alt="Preview KTP" />
                    <button
                      type="button"
                      className="sdu-remove-file-btn"
                      onClick={() => removeFile("ktp")}
                      title="Ganti foto KTP"
                    >
                      <FontAwesomeIcon icon={faXmark} />
                    </button>
                    <span className="sdu-file-tag ktp">Foto KTP Siap</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="sdu-upload-dropzone ktp"
                    onClick={() => ktpInputRef.current?.click()}
                  >
                    <FontAwesomeIcon icon={faIdCard} />
                    <span>Unggah Foto KTP Asli</span>
                    <small>Harus terbaca jelas</small>
                  </button>
                )}
              </div>
            </div>

            {/* Password */}
            <div className="form-grid-2">
              <div className="input-group">
                <label>
                  <FontAwesomeIcon icon={faLock} /> Password
                </label>
                <div className="input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Minimal 6 karakter"
                    required
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
              </div>

              <div className="input-group">
                <label>
                  <FontAwesomeIcon icon={faLock} /> Konfirmasi Password
                </label>
                <div className="input-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Ulangi password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <FontAwesomeIcon
                      icon={showConfirmPassword ? faEyeSlash : faEye}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className="sdu-verif-disclaimer">
              <FontAwesomeIcon icon={faShieldHalved} />
              <span>
                Akun hanya dapat digunakan untuk <strong>Login & Transaksi</strong> setelah
                Admin memverifikasi kesesuaian data Anda dengan KTP.
              </span>
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={submitting}
            >
              {submitting ? "Mengirim Data Pendaftaran..." : "Daftar & Ajukan Verifikasi"}
            </button>

            <p className="btn-reg">
              Sudah punya akun terverifikasi? <Link to="/login">Masuk di sini</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default Register;
