import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getProfilUser,
  ubahProfilUser,
  uploadProfilUser,
} from "../services/userService";
import { getUploadUrl } from "../config/api";
import "./style/ProfilComponent.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCamera,
  faUser,
  faPhone,
  faLocationDot,
  faFloppyDisk,
  faCheck,
  faShieldHalved,
  faIdCard,
  faAt,
} from "@fortawesome/free-solid-svg-icons";

function ProfilComponent({ redirecTo = "/dashboard", isEmbedded = false }) {
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const [nama, setNama] = useState("");
  const [noHp, setNoHp] = useState("");
  const [alamat, setAlamat] = useState("");
  const [nik, setNik] = useState("");
  const [username, setUsername] = useState("");
  const [fotoProfil, setFotoProfil] = useState("");
  const [fotoFile, setFotoFile] = useState(null);
  const [previewFoto, setPreviewFoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      if (!user.id) return;
      try {
        const data = await getProfilUser(user.id);
        if (data) {
          setNama(data.nama || "");
          setNoHp(data.no_hp || "");
          setAlamat(data.alamat || "");
          setNik(data.nik || "");
          setUsername(data.username || "");
          setFotoProfil(data.foto_profil || "");
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      }
    };

    loadData();
  }, [user.id]);

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFotoFile(file);
      setPreviewFoto(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let namaFileFoto = fotoProfil;

      if (fotoFile) {
        const formData = new FormData();
        formData.append("foto", fotoFile);

        const uploadData = await uploadProfilUser(formData);
        namaFileFoto = uploadData.filename;
      }

      const data = await ubahProfilUser(user.id, {
        nama,
        no_hp: noHp,
        alamat,
        foto_profil: namaFileFoto,
      });

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...user,
          nama,
          no_hp: noHp,
          alamat,
          foto_profil: namaFileFoto,
        }),
      );

      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        navigate(redirecTo);
      }, 1200);
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan profil.");
    } finally {
      setLoading(false);
    }
  };

  const fotoTampil = previewFoto
    ? previewFoto
    : fotoProfil
      ? getUploadUrl("profil", fotoProfil)
      : null;

  const content = (
    <div className="sdu-profile-card-container">
      {/* Cover Header */}
      <div className="sdu-profile-card-cover">
        <span className="sdu-profile-badge">
          <FontAwesomeIcon icon={faShieldHalved} />
          {user.role === "admin" ? "Akun Pengelola Depo" : "Warga Terverifikasi SDU"}
        </span>
      </div>

      {/* Floating Avatar & User Name */}
      <div className="sdu-profile-avatar-row">
        <div className="sdu-profile-avatar-wrap">
          {fotoTampil ? (
            <img src={fotoTampil} alt="Foto Profil" className="sdu-profile-avatar-img" />
          ) : (
            <div className="sdu-avatar-placeholder">
              <FontAwesomeIcon icon={faUser} />
            </div>
          )}

          <button
            type="button"
            className="sdu-btn-avatar-camera"
            title="Ubah Foto Profil"
            onClick={() => fileInputRef.current.click()}
          >
            <FontAwesomeIcon icon={faCamera} />
          </button>

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFotoChange}
          />
        </div>

        <div className="sdu-profile-display-meta">
          <h2 className="sdu-profile-name-title">{nama || "Nama Pengguna"}</h2>
          <span className="sdu-profile-role-sub">
            {user.role === "admin" ? "Administrator Operasional Depo" : "Mitra Penjemputan Rumah Tangga"}
          </span>
        </div>
      </div>

      {/* Form Fields */}
      <form className="sdu-profile-edit-form" onSubmit={handleSave}>
        {(username || nik) && (
          <div className="sdu-profile-formal-grid">
            {username && (
              <div className="sdu-profile-field-group">
                <label className="sdu-profile-label">
                  <FontAwesomeIcon icon={faAt} /> Username
                </label>
                <input
                  type="text"
                  className="sdu-profile-input readonly"
                  value={username}
                  disabled
                />
              </div>
            )}
            {nik && (
              <div className="sdu-profile-field-group">
                <label className="sdu-profile-label">
                  <FontAwesomeIcon icon={faIdCard} /> NIK Terdaftar
                </label>
                <input
                  type="text"
                  className="sdu-profile-input readonly"
                  value={nik}
                  disabled
                />
              </div>
            )}
          </div>
        )}

        <div className="sdu-profile-field-group">
          <label className="sdu-profile-label">
            <FontAwesomeIcon icon={faUser} /> Nama Lengkap
          </label>
          <input
            type="text"
            className="sdu-profile-input"
            placeholder="Masukkan nama lengkap Anda"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            required
          />
        </div>

        <div className="sdu-profile-field-group">
          <label className="sdu-profile-label">
            <FontAwesomeIcon icon={faPhone} /> Nomor WhatsApp Aktif
          </label>
          <input
            type="tel"
            className="sdu-profile-input"
            placeholder="Contoh: 081234567890"
            value={noHp}
            onChange={(e) => setNoHp(e.target.value)}
            required
          />
          <span className="sdu-field-hint">
            Digunakan oleh kurir untuk konfirmasi jadwal & pengiriman bukti penimbangan.
          </span>
        </div>

        <div className="sdu-profile-field-group">
          <label className="sdu-profile-label">
            <FontAwesomeIcon icon={faLocationDot} /> Alamat Lengkap & Patokan
          </label>
          <textarea
            rows="3"
            className="sdu-profile-textarea"
            placeholder="Jl. Mawar No. 12, RT 03 / RW 05, Kel. Sukamaju (Pagar hitam samping pos)"
            value={alamat}
            onChange={(e) => setAlamat(e.target.value)}
            required
          />
        </div>

        {savedSuccess && (
          <div className="sdu-profile-alert-success">
            <FontAwesomeIcon icon={faCheck} />
            <span>Perubahan profil berhasil disimpan!</span>
          </div>
        )}

        <button
          type="submit"
          className="sdu-btn-save-profile"
          disabled={loading}
        >
          <FontAwesomeIcon icon={faFloppyDisk} />
          <span>{loading ? "Menyimpan Data..." : "Simpan Perubahan Profil"}</span>
        </button>
      </form>
    </div>
  );

  if (isEmbedded) {
    return content;
  }

  return <div className="sdu-profile-page-wrapper">{content}</div>;
}

export default ProfilComponent;
