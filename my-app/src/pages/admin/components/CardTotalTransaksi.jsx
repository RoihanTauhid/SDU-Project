import React from "react";
import "./style/CardTotalTransaksi.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faReceipt,
  faUsers,
  faScaleBalanced,
  faWallet,
  faArrowTrendUp,
} from "@fortawesome/free-solid-svg-icons";

function CardTotalTransaksi({ dashboard }) {
  const beratKg = (Number(dashboard.totalBerat || 0) / 1000).toLocaleString("id-ID", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  const totalRp = Number(dashboard.totalPendapatan || 0).toLocaleString("id-ID");

  return (
    <div className="sdu-admin-kpi-grid">
      {/* 1. Total Transaksi */}
      <div className="sdu-admin-kpi-card green">
        <div className="sdu-kpi-top">
          <span className="sdu-kpi-label">TOTAL TRANSAKSI</span>
          <div className="sdu-kpi-icon-wrap green">
            <FontAwesomeIcon icon={faReceipt} />
          </div>
        </div>
        <div className="sdu-kpi-main">
          <strong className="sdu-kpi-value">{dashboard.totalTransaksi || 0}</strong>
          <span className="sdu-kpi-badge green">
            <FontAwesomeIcon icon={faArrowTrendUp} /> Transaksi Sukses
          </span>
        </div>
        <span className="sdu-kpi-sub">Total siklus penjemputan selesai & berjalan</span>
      </div>

      {/* 2. Total User Warga */}
      <div className="sdu-admin-kpi-card blue">
        <div className="sdu-kpi-top">
          <span className="sdu-kpi-label">WARGA TERDAFTAR</span>
          <div className="sdu-kpi-icon-wrap blue">
            <FontAwesomeIcon icon={faUsers} />
          </div>
        </div>
        <div className="sdu-kpi-main">
          <strong className="sdu-kpi-value">{dashboard.totalUser || 0}</strong>
          <span className="sdu-kpi-badge blue">Mitra Rumah Tangga</span>
        </div>
        <span className="sdu-kpi-sub">Akun warga aktif dalam radius depo</span>
      </div>

      {/* 3. Total Sampah Terpilah (Kg) */}
      <div className="sdu-admin-kpi-card amber">
        <div className="sdu-kpi-top">
          <span className="sdu-kpi-label">TOTAL BOBOT TERKUMPUL</span>
          <div className="sdu-kpi-icon-wrap amber">
            <FontAwesomeIcon icon={faScaleBalanced} />
          </div>
        </div>
        <div className="sdu-kpi-main">
          <strong className="sdu-kpi-value">{beratKg} <span className="sdu-unit">Kg</span></strong>
          <span className="sdu-kpi-badge amber">100% Didaur Ulang</span>
        </div>
        <span className="sdu-kpi-sub">Material bersih siap kirim ke pabrik mitra</span>
      </div>

      {/* 4. Total Dana Tersalurkan */}
      <div className="sdu-admin-kpi-card forest">
        <div className="sdu-kpi-top">
          <span className="sdu-kpi-label">TOTAL DANA DISALURKAN</span>
          <div className="sdu-kpi-icon-wrap forest">
            <FontAwesomeIcon icon={faWallet} />
          </div>
        </div>
        <div className="sdu-kpi-main">
          <strong className="sdu-kpi-value">
            <span className="sdu-prefix">Rp</span> {totalRp}
          </strong>
          <span className="sdu-kpi-badge forest">Payout Instan Warga</span>
        </div>
        <span className="sdu-kpi-sub">Hak ekonomi warga terbayar tuntas via depo</span>
      </div>
    </div>
  );
}

export default CardTotalTransaksi;
