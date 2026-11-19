import { useState, useEffect } from "react";
import "./style/Login.css";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faUser,
  faLock,
  faLeaf,
  faRecycle,
  faClock,
  faCircleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import logo from "../assets/Logo.png";
import { getLoginAuth } from "../services/authService";

function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (user.role === "kurir") {
        navigate("/kurir/dashboard");
      } else if (!user.status_verifikasi || user.status_verifikasi === "verified") {
        navigate("/dashboard");
      } else {
        localStorage.removeItem("user");
      }
    }
  }, [navigate]);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [alertBox, setAlertBox] = useState(null); // { type: 'warning' | 'error', title: string, message: string }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlertBox(null);

    if (!identifier.trim() || !password) {
      setAlertBox({
        type: "error",
        title: "Form Belum Lengkap",
        message: "Masukkan Username atau Nomor HP serta Password Anda.",
      });
      return;
    }

    try {
      setLoading(true);
      const data = await getLoginAuth(identifier.trim(), password);

      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (data.user.role === "kurir") {
        navigate("/kurir/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      if (err.status_verifikasi === "pending") {
        setAlertBox({
          type: "warning",
          title: "Menunggu Verifikasi Admin",
          message: err.message,
        });
      } else if (err.status_verifikasi === "rejected") {
        setAlertBox({
          type: "error",
          title: "Pendaftaran Ditolak",
          message: err.message,
        });
      } else {
        setAlertBox({
          type: "error",
          title: "Login Gagal",
          message: err.message || "Username / Nomor HP atau Password salah.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* ===== PANEL KIRI - BRANDING ===== */}
      <div className="auth-branding">
        <div className="branding-blob branding-blob-1" />
        <div className="branding-blob branding-blob-2" />

        <div className="branding-content">
          <div
            className="branding-logo"
            onClick={() => navigate("/")}
            style={{ cursor: "pointer" }}
          >
            <img src={logo} alt="Logo SDU" />
          </div>
          <h2>SDU</h2>
          <p className="branding-tagline">
            Transaksi Sampah Daur Ulang Yang Mudah
          </p>

          <div className="branding-quote">
            <FontAwesomeIcon icon={faLeaf} className="quote-icon" />
            <p>
              Setiap sampah yang kamu daur ulang, adalah langkah kecil untuk
              perubahan besar.
            </p>
          </div>
        </div>
      </div>

      {/* ===== PANEL KANAN - FORM ===== */}
      <div className="auth-form-section">
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-icon-badge">
            <FontAwesomeIcon icon={faRecycle} />
          </div>
          <h1>Selamat Datang Kembali</h1>
          <p className="form-subtitle">
            Masuk dengan username atau nomor HP terverifikasi Anda
          </p>

          {alertBox && (
            <div className={`sdu-login-alert ${alertBox.type}`}>
              <FontAwesomeIcon
                icon={
                  alertBox.type === "warning" ? faClock : faCircleExclamation
                }
                className="alert-icon"
              />
              <div>
                <strong>{alertBox.title}</strong>
                <p>{alertBox.message}</p>
              </div>
            </div>
          )}

          <div className="input-group">
            <label>
              <FontAwesomeIcon icon={faUser} /> Username atau Nomor HP
            </label>
            <input
              type="text"
              placeholder="Contoh: budi_santoso atau 08xxxxxxxxxx"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>
              <FontAwesomeIcon icon={faLock} /> Password
            </label>
            <div className="input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="eye-btn-login"
                onClick={() => setShowPassword(!showPassword)}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Memverifikasi Akun..." : "Masuk"}
          </button>

          <p className="link-regis">
            Belum punya akun? <Link to="/register">Registrasi Warga</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
