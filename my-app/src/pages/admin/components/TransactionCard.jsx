import React from "react";
import "./style/TransactionCard.css";
import StatusDropdown from "./StatusDropdown";
import { getUploadUrl } from "../../../config/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLocationDot,
  faPhone,
  faRecycle,
  faBoxOpen,
  faTrashCan,
  faWineGlass,
  faTools,
  faCamera,
  faCheck,
  faCircleCheck,
  faMotorcycle,
  faReceipt,
  faLocationArrow,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";

// Helper category icons
const getCategoryIcon = (kat = "") => {
  const k = kat.toLowerCase();
  if (k.includes("kardus") || k.includes("kertas")) return faBoxOpen;
  if (k.includes("plastik")) return faRecycle;
  if (k.includes("kaleng") || k.includes("aluminium")) return faTrashCan;
  if (k.includes("kaca") || k.includes("botol") || k.includes("beling")) return faWineGlass;
  if (k.includes("besi") || k.includes("logam")) return faTools;
  return faRecycle;
};

// Fallback sample photos per category
const getFallbackPhoto = (kat = "") => {
  const k = kat.toLowerCase();
  if (k.includes("kardus") || k.includes("kertas"))
    return "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=300&auto=format&fit=crop&q=80";
  if (k.includes("plastik"))
    return "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=300&auto=format&fit=crop&q=80";
  if (k.includes("kaleng") || k.includes("logam"))
    return "https://images.unsplash.com/photo-1582408921715-18e7806365c1?w=300&auto=format&fit=crop&q=80";
  if (k.includes("kaca") || k.includes("botol"))
    return "https://images.unsplash.com/photo-1516594798947-e65505dbb29d?w=300&auto=format&fit=crop&q=80";
  return "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=300&auto=format&fit=crop&q=80";
};

function TransactionCard({ item, updateStatus }) {
  const codeTrx = `#SDU-TRX-${String(item.id).padStart(4, "0")}`;
  const beratKg = (Number(item.berat || 0) / 1000).toFixed(1);
  const nominal = Number(item.totalharga || 0).toLocaleString("id-ID");
  const photoUrl = item.foto
    ? getUploadUrl("transaksi", item.foto)
    : getFallbackPhoto(item.kategori);

  // Format date time
  let timeStr = "Hari ini, 08:45 WIB";
  if (item.created_at) {
    const d = new Date(item.created_at);
    timeStr = `${d.toLocaleDateString("id-ID", { day: "numeric", month: "short" })}, ${d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB`;
  }

  // Handle GPS / Maps
  const handleOpenMaps = () => {
    let url = "";
    if (item.latitude && item.longitude) {
      url = `https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}`;
    } else {
      url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.lokasi || "Surabaya")}`;
    }
    window.open(url, "_blank");
  };

  // Handle WhatsApp
  const handleOpenWa = () => {
    if (!item?.no_hp) return;
    const cleanPhone = item.no_hp.replace(/^0/, "").replace(/[^0-9]/g, "");
    const namaWarga = item.nama || "Bapak/Ibu";
    const status = item.status || "Menunggu";

    let pesanStatus = "";
    if (status === "Menunggu" || status === "Diproses") {
      pesanStatus = "jadwal armada penjemputan sampah terpilah Anda sedang disiapkan.";
    } else if (status === "Dijemput") {
      pesanStatus = "kurir SDU sedang dalam perjalanan menuju alamat Anda dengan motor listrik berstempel timbang resmi.";
    } else if (status === "Selesai") {
      pesanStatus = "setoran sampah daur ulang Anda telah ditimbang & dana telah dicairkan secara instan. Terima kasih!";
    }

    const templatePesan = `Halo Kak ${namaWarga}, dari Depo Operasional SDU.\n\nDetail Penjemputan (${codeTrx}):\n- Kategori: ${item.kategori}\n- Bobot: ${beratKg} Kg\n- Nilai Tebusan: Rp ${nominal}\n- Titik: ${item.lokasi || "-"}\n\nStatus: *${status}*, ${pesanStatus}`;
    const url = `https://wa.me/62${cleanPhone}?text=${encodeURIComponent(templatePesan)}`;
    window.open(url, "_blank");
  };

  // Determine button labels based on status
  let mapBtnLabel = "Lihat Lokasi";
  let waBtnLabel = "Hubungi Warga";

  if (item.status === "Dijemput") {
    mapBtnLabel = "Pantau GPS Rute";
    waBtnLabel = "Hubungi Warga";
  } else if (item.status === "Diproses") {
    mapBtnLabel = "Titik Penjemputan";
    waBtnLabel = "Hubungi Mitra";
  } else if (item.status === "Selesai") {
    mapBtnLabel = "Riwayat Titik GPS";
    waBtnLabel = "Kirim Struk WA";
  }

  return (
    <div className="sdu-admin-trx-card">
      {/* 1. Header Card: TRX Code + Date + Status Dropdown */}
      <div className="sdu-card-topbar">
        <div className="sdu-card-code-time">
          <span className="sdu-trx-code">{codeTrx}</span>
          <span className="sdu-dot-sep">•</span>
          <span className="sdu-trx-time">{timeStr}</span>
        </div>
        <StatusDropdown item={item} updateStatus={updateStatus} />
      </div>

      {/* 2. Citizen Profile Info */}
      <div className="sdu-card-citizen-row">
        <div className="sdu-citizen-main">
          <h3 className="sdu-citizen-name">
            {item.nama || "Warga SDU"}
            {item.status === "Selesai" && (
              <span className="sdu-verified-tick" title="Warga Terverifikasi">
                ✓
              </span>
            )}
          </h3>
          <span className="sdu-citizen-phone">
            <FontAwesomeIcon icon={faPhone} /> {item.no_hp || "-"}
          </span>
        </div>
      </div>

      {/* 3. Address Detail */}
      <div className="sdu-card-address-row">
        <div className="sdu-address-icon">
          <FontAwesomeIcon icon={faLocationDot} />
        </div>
        <div className="sdu-address-text">
          <strong className="sdu-address-primary">{item.lokasi || "Alamat penjemputan warga terdaftar"}</strong>
          <p className="sdu-address-notes">
            {item.detail_alamat ||
              (item.latitude
                ? `Koordinat GPS: ${Number(item.latitude).toFixed(4)}, ${Number(item.longitude).toFixed(4)} • Titik Warga Akurat`
                : "Akses gerobak/motor pickup mudah, titik koordinat terkonfirmasi.")}
          </p>
        </div>
      </div>

      {/* 4. Inner Waste Details Box */}
      <div className="sdu-inner-waste-box">
        {/* Left: Waste Photo Thumbnail */}
        <div className="sdu-waste-thumb-wrap">
          <img
            src={photoUrl}
            alt={item.kategori}
            className="sdu-waste-thumb-img"
          />
          <div className="sdu-waste-photo-badge">
            {item.status === "Selesai" ? (
              <>
                <FontAwesomeIcon icon={faCircleCheck} /> Bukti Timbang
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faCamera} /> 1 Foto
              </>
            )}
          </div>
        </div>

        {/* Right: Category, Weight, Notes, Payout */}
        <div className="sdu-waste-details-col">
          <div className="sdu-waste-headline-row">
            <div>
              <span className="sdu-detail-micro-label">KATEGORI BARANG</span>
              <div className="sdu-waste-kat-title">
                <FontAwesomeIcon icon={getCategoryIcon(item.kategori)} />
                <span>{item.kategori}</span>
              </div>
            </div>
            <div className="sdu-waste-weight-col">
              <span className="sdu-detail-micro-label">
                {item.status === "Selesai" ? "TIMBANG RIIL" : "BOBOT EST."}
              </span>
              <span className="sdu-waste-weight-val">{beratKg} Kg</span>
            </div>
          </div>

          {/* Conditional Courier / Inspection Notes */}
          <div className="sdu-waste-inspection-note">
            {item.status === "Dijemput" ? (
              <div className="sdu-courier-assigned-info">
                <strong>Kurir Ditugaskan: Pak Joko</strong>
                <span>🛵 Gerobak Motor Listrik • Plat B 4821 KLO</span>
              </div>
            ) : item.status === "Selesai" ? (
              <div className="sdu-completed-settlement-info">
                <span className="sdu-green-badge-check">
                  <FontAwesomeIcon icon={faCheck} /> Tuntas Divalidasi Kurir
                </span>
                <span className="sdu-cash-receipt-tag">Tunai Diterima Warga</span>
              </div>
            ) : (
              <p className="sdu-citizen-waste-note">
                "{item.keterangan || "Barang daur ulang telah dipilah kering dan siap ditimbang di depan pagar."}"
              </p>
            )}
          </div>

          {/* Price Payout */}
          <div className="sdu-waste-payout-row">
            <span className="sdu-payout-label">
              {item.status === "Selesai" ? "Total Dana Dicairkan:" : "Estimasi Pembayaran:"}
            </span>
            <span className="sdu-payout-value">Rp {nominal}</span>
          </div>
        </div>
      </div>

      {/* 5. Bottom Action Buttons */}
      <div className="sdu-card-actions-grid">
        <button className="sdu-btn-action-map" onClick={handleOpenMaps}>
          <FontAwesomeIcon icon={faLocationArrow} />
          <span>{mapBtnLabel}</span>
        </button>

        <button className={`sdu-btn-action-wa ${item.status === "Selesai" ? "receipt-mode" : ""}`} onClick={handleOpenWa}>
          <FontAwesomeIcon icon={item.status === "Selesai" ? faReceipt : faWhatsapp} />
          <span>{waBtnLabel}</span>
        </button>
      </div>
    </div>
  );
}

export default TransactionCard;
