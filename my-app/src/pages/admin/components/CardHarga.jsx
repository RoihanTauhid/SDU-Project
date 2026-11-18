import React, { useState } from "react";
import { API_URL } from "../../../config/api";
import "./style/CardHarga.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRecycle,
  faBoxOpen,
  faTrashCan,
  faTools,
  faWineGlass,
  faFloppyDisk,
  faCheck,
  faCircleCheck,
  faShieldHalved,
  faWeightHanging,
  faFire,
  faStar,
} from "@fortawesome/free-solid-svg-icons";

// Metadata mapping matching Reference Image 5
const categoryMeta = {
  plastik: {
    title: "Plastik",
    tag: "High Demand",
    tagClass: "tag-orange",
    icon: faRecycle,
    iconColor: "#059669",
    code: "ID: PLS-001",
    sub: "PET, HDPE, Galon, Gelas Mineral",
    statusNote: "Status: Aktif di kalkulator setor mandiri & penjemputan",
    statusType: "info",
  },
  kardus: {
    title: "Kardus & Kertas",
    tag: "Paling Dicari",
    tagClass: "tag-blue",
    icon: faBoxOpen,
    iconColor: "#2563eb",
    code: "ID: KRD-002",
    sub: "Kardus Cokelat, HVS, Koran, Dupleks",
    statusNote: "Status: Aktif / Kering & rapi terikat per bendel",
    statusType: "info",
  },
  kaleng: {
    title: "Kaleng & Aluminium",
    tag: "Ekonomis Tinggi",
    tagClass: "tag-amber",
    icon: faTrashCan,
    iconColor: "#d97706",
    code: "ID: ALM-003",
    sub: "Kaleng Soda, Seng Tipis, Plat Minuman",
    statusNote: "Status: Aktif / Diutamakan kaleng yang telah dipipihkan",
    statusType: "info",
  },
  besi: {
    title: "Besi & Logam Berat",
    tag: "Bobot Berat",
    tagClass: "tag-indigo",
    icon: faTools,
    iconColor: "#4f46e5",
    code: "ID: BSI-004",
    sub: "Paku, Pipa Bekas, Rangka, Besi Beton",
    statusNote: "Status: Aktif / Penanganan khusus bobot >10 Kg di depo",
    statusType: "warn",
  },
  botol: {
    title: "Botol Kaca",
    tag: "Koleksi Utuh",
    tagClass: "tag-cyan",
    icon: faWineGlass,
    iconColor: "#0891b2",
    code: "ID: BOT-005",
    sub: "Botol Sirup, Botol Kecap, Toples Kaca Utuh",
    statusNote: "Syarat: Wajib utuh dan bersih dari minyak",
    statusType: "warn",
  },
  pecah_belah: {
    title: "Pecah Belah & Beling",
    tag: "Safety Bag",
    tagClass: "tag-red",
    icon: faWineGlass,
    iconColor: "#e11d48",
    code: "ID: BLG-006",
    sub: "Serpihan Kaca Bening, Piring/Gelas Pecah",
    statusNote: "Syarat: Wajib dibungkus karung goni tebal",
    statusType: "alert",
  },
};

function getMeta(kat = "") {
  const k = kat.toLowerCase().replace(/\s+/g, "_");
  return (
    categoryMeta[k] || {
      title: kat,
      tag: "Standar",
      tagClass: "tag-blue",
      icon: faRecycle,
      iconColor: "#059669",
      code: `ID: ${kat.substring(0, 3).toUpperCase()}-00`,
      sub: "Material daur ulang terpilah",
      statusNote: "Status: Aktif dalam sistem",
      statusType: "info",
    }
  );
}

function CardHarga({ hargaList, onUpdateSuccess }) {
  const [localHarga, setLocalHarga] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [successId, setSuccessId] = useState(null);

  const handleInputChange = (id, val) => {
    setLocalHarga((prev) => ({
      ...prev,
      [id]: val,
    }));
  };

  const getEffectivePrice = (item) => {
    return localHarga[item.id] !== undefined ? localHarga[item.id] : item.harga;
  };

  const handleSave = async (item) => {
    const newPrice = getEffectivePrice(item);
    const admin = JSON.parse(localStorage.getItem("user")) || {};
    setSavingId(item.id);
    try {
      const response = await fetch(`${API_URL}admin/harga/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          harga: Number(newPrice),
          diubah_oleh: admin.nama || "Admin Utama",
          role: "Admin Operasional",
        }),
      });
      if (!response.ok) {
        throw new Error("Gagal memperbarui tarif");
      }
      await response.json();
      setSuccessId(item.id);
      setTimeout(() => setSuccessId(null), 2500);

      if (onUpdateSuccess) {
        onUpdateSuccess(item, newPrice);
      }
    } catch (err) {
      console.error(err);
      alert("Gagal memperbarui tarif master.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="sdu-master-pricing-grid">
      {hargaList.map((item) => {
        const meta = getMeta(item.kategori);
        const current100g = Number(getEffectivePrice(item)) || 0;
        const currentKg = current100g * 10;
        const isSaving = savingId === item.id;
        const isSaved = successId === item.id;

        return (
          <div key={item.id} className="sdu-pricing-card">
            {/* 1. Header with Icon, Title, Subtitle and Tag */}
            <div className="sdu-pricing-card-header">
              <div className="sdu-pricing-card-top-row">
                <div className="sdu-pricing-title-group">
                  <div
                    className="sdu-pricing-icon-box"
                    style={{ color: meta.iconColor }}
                  >
                    <FontAwesomeIcon icon={meta.icon} />
                  </div>
                  <div>
                    <h3 className="sdu-pricing-title">{meta.title}</h3>
                    <p className="sdu-pricing-sub">{meta.sub}</p>
                  </div>
                </div>

                <span className={`sdu-pricing-tag ${meta.tagClass}`}>
                  {meta.tag}
                </span>
              </div>
            </div>

            {/* 2. Rate per 100g Input Group */}
            <div className="sdu-rate-input-section">
              <label className="sdu-rate-input-label">Tarif Beli per 100 Gram</label>
              <div className="sdu-rate-input-box">
                <span className="sdu-currency-prefix">Rp</span>
                <input
                  type="number"
                  min="0"
                  step="10"
                  className="sdu-rate-number-input"
                  value={current100g}
                  onChange={(e) => handleInputChange(item.id, e.target.value)}
                />
                <span className="sdu-unit-suffix">/100g</span>
              </div>
            </div>

            {/* 3. Automatic Live Calc (10x per Kg) */}
            <div className="sdu-auto-calc-box">
              <div className="sdu-calc-label-col">
                <span className="sdu-calc-badge">Kalkulasi Otomatis (10x)</span>
                <span className="sdu-calc-desc">Harga Acuan per Kilogram</span>
              </div>
              <div className="sdu-calc-result-val">
                <span className="sdu-calc-rp">Rp</span>
                <strong className="sdu-calc-num">{currentKg.toLocaleString("id-ID")}</strong>
                <span className="sdu-calc-kg">/ Kg</span>
              </div>
            </div>

            {/* 4. Quality condition / Status note */}
            <div className={`sdu-pricing-status-note ${meta.statusType}`}>
              <span>{meta.statusNote}</span>
            </div>

            {/* 5. Card Footer: ID Code + Save button */}
            <div className="sdu-pricing-card-footer">
              <span className="sdu-category-code">{meta.code}</span>
              <button
                className={`sdu-btn-save-pricing ${isSaved ? "saved" : ""}`}
                onClick={() => handleSave(item)}
                disabled={isSaving}
              >
                <FontAwesomeIcon icon={isSaved ? faCheck : faFloppyDisk} />
                <span>
                  {isSaving ? "Menyimpan..." : isSaved ? "Tersimpan" : "Simpan Perubahan"}
                </span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default CardHarga;
