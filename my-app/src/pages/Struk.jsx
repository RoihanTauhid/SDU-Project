import { useState, useEffect, useMemo } from "react";
import Navbar from "../components/Navbar";
import { getRiwayatTransaksiUser } from "../services/transaksiService";
import { getUploadUrl } from "../config/api";
import "./style/Struk.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faReceipt,
  faPrint,
  faMagnifyingGlass,
  faRotateRight,
  faCheck,
  faCircleCheck,
  faXmark,
  faRecycle,
  faScaleBalanced,
  faWallet,
  faBoxOpen,
  faArrowRight,
  faCalendarDays,
  faLocationDot,
  faUser,
  faPhone,
  faIdCard,
  faGift,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

function Struk() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const [transaksi, setTransaksi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua"); // 'Semua' | 'Selesai' | 'Aktif'
  const [selectedStruk, setSelectedStruk] = useState(null);

  // Load user transactions
  useEffect(() => {
    if (!user.id) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        const data = await getRiwayatTransaksiUser(user.id);
        if (Array.isArray(data)) {
          setTransaksi(data);
        }
      } catch (err) {
        console.error("Gagal memuat daftar struk:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user.id]);

  // Metrics
  const metrics = useMemo(() => {
    const selesaiItems = transaksi.filter((t) => t.status === "Selesai");
    const totalDanaCair = selesaiItems.reduce(
      (sum, t) => sum + (Number(t.totalharga) || 0),
      0
    );
    const totalBeratGr = selesaiItems.reduce(
      (sum, t) => sum + (Number(t.berat) || 0),
      0
    );

    return {
      totalStruk: transaksi.length,
      selesaiCount: selesaiItems.length,
      totalDanaCair,
      totalKg: (totalBeratGr / 1000).toFixed(1),
    };
  }, [transaksi]);

  // Filtering list
  const filteredList = useMemo(() => {
    const q = search.trim().toLowerCase();
    return transaksi.filter((item) => {
      // Filter status
      if (filterStatus === "Selesai" && item.status !== "Selesai") return false;
      if (filterStatus === "Aktif" && item.status === "Selesai") return false;

      // Filter search
      if (q) {
        const strukCode = `struk-sdu-${String(item.id).padStart(4, "0")}`;
        const matchCode = strukCode.includes(q) || String(item.id).includes(q);
        const matchKat = (item.kategori || "").toLowerCase().includes(q);
        const matchLok = (item.lokasi || "").toLowerCase().includes(q);
        if (!matchCode && !matchKat && !matchLok) return false;
      }

      return true;
    });
  }, [transaksi, search, filterStatus]);

  const formatTanggal = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatJam = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="sdu-struk-page">
      <Navbar />

      <main className="sdu-struk-main">
        <div className="sdu-struk-container">
          {/* Header Section */}
          <div className="sdu-struk-header">
            <div className="sdu-struk-header-info">
              <span className="sdu-struk-eyebrow">
                <FontAwesomeIcon icon={faReceipt} /> DOKUMEN RESMI TRANSAKSI
              </span>
              <h1 className="sdu-struk-title">Struk & Bukti Penimbangan</h1>
              <p className="sdu-struk-subtitle">
                Arsip digital resmi seluruh bukti penimbangan, slip tebusan, dan
                pencairan dana sampah daur ulang Anda.
              </p>
            </div>

            {/* Right KPI Summary */}
            <div className="sdu-struk-summary-chips">
              <div className="sdu-struk-kpi">
                <span className="sdu-kpi-lbl">TOTAL STRUK TERBIT</span>
                <strong className="sdu-kpi-val green">{metrics.totalStruk} Slip</strong>
              </div>
              <div className="sdu-struk-kpi">
                <span className="sdu-kpi-lbl">TOTAL DANA DICAIRKAN</span>
                <strong className="sdu-kpi-val emerald">
                  Rp {metrics.totalDanaCair.toLocaleString("id-ID")}
                </strong>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="sdu-struk-filter-bar">
            <div className="sdu-struk-search-box">
              <FontAwesomeIcon icon={faMagnifyingGlass} />
              <input
                type="text"
                placeholder="Cari nomor struk, kategori, atau lokasi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  className="sdu-clear-search"
                  onClick={() => setSearch("")}
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              )}
            </div>

            <div className="sdu-struk-status-tabs">
              <button
                className={`sdu-tab-btn ${filterStatus === "Semua" ? "active" : ""}`}
                onClick={() => setFilterStatus("Semua")}
              >
                Semua Struk ({transaksi.length})
              </button>
              <button
                className={`sdu-tab-btn ${filterStatus === "Selesai" ? "active" : ""}`}
                onClick={() => setFilterStatus("Selesai")}
              >
                Tuntas / Selesai ({metrics.selesaiCount})
              </button>
              <button
                className={`sdu-tab-btn ${filterStatus === "Aktif" ? "active" : ""}`}
                onClick={() => setFilterStatus("Aktif")}
              >
                Sedang Berjalan ({transaksi.length - metrics.selesaiCount})
              </button>
            </div>
          </div>

          {/* Table List View */}
          {loading ? (
            <div className="sdu-struk-loading">
              <div className="sdu-spinner" />
              <p>Memuat daftar arsip struk Anda...</p>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="sdu-struk-empty">
              <FontAwesomeIcon icon={faBoxOpen} className="sdu-empty-icon" />
              <h3>Belum Ada Struk Ditemukan</h3>
              <p>
                {transaksi.length === 0
                  ? "Anda belum memiliki transaksi. Setiap transaksi yang Anda ajukan akan otomatis tercatat struk resminya di sini."
                  : "Tidak ada struk yang sesuai dengan filter atau kata kunci pencarian Anda."}
              </p>
              {transaksi.length === 0 ? (
                <button
                  className="sdu-btn-primary"
                  onClick={() => navigate("/transaksi")}
                >
                  Ajukan Setor Sampah Sekarang
                </button>
              ) : (
                <button
                  className="sdu-btn-outline-reset"
                  onClick={() => {
                    setSearch("");
                    setFilterStatus("Semua");
                  }}
                >
                  <FontAwesomeIcon icon={faRotateRight} /> Reset Filter
                </button>
              )}
            </div>
          ) : (
            <div className="sdu-struk-table-card">
              <div className="sdu-struk-table-scroll">
                <table className="sdu-struk-table">
                  <thead>
                    <tr>
                      <th>No. Struk & Tanggal</th>
                      <th>Kategori Sampah</th>
                      <th>Bobot Timbang</th>
                      <th>Total Tebusan</th>
                      <th>Metode Pencairan</th>
                      <th>Status Pembayaran</th>
                      <th className="text-right">Aksi Struk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredList.map((item) => {
                      const strukCode = `STRUK-SDU-${String(item.id).padStart(4, "0")}`;
                      const beratKg = (Number(item.berat || 0) / 1000).toFixed(1);
                      const nominal = Number(item.totalharga || 0).toLocaleString("id-ID");
                      const isSelesai = item.status === "Selesai";

                      return (
                        <tr key={item.id}>
                          <td>
                            <div className="sdu-struk-code-wrap">
                              <FontAwesomeIcon icon={faReceipt} className="sdu-icon-code" />
                              <strong className="sdu-struk-code">{strukCode}</strong>
                            </div>
                            <span className="sdu-struk-date">
                              {formatTanggal(item.created_at)} • {formatJam(item.created_at)} WIB
                            </span>
                          </td>
                          <td>
                            <span className="sdu-struk-kat">{item.kategori}</span>
                            {item.lokasi && (
                              <div className="sdu-struk-loc-sub" title={item.lokasi}>
                                {item.lokasi.length > 30
                                  ? item.lokasi.slice(0, 30) + "..."
                                  : item.lokasi}
                              </div>
                            )}
                          </td>
                          <td>
                            <strong className="sdu-struk-weight">
                              {beratKg} Kg
                            </strong>
                            <span className="sdu-struk-gr">({item.berat || 0} gram)</span>
                          </td>
                          <td>
                            <strong className="sdu-struk-nominal">
                              Rp {nominal}
                            </strong>
                            {Number(item.bonus) > 0 && (
                              <div
                                className="sdu-struk-bonus-tag"
                                style={{
                                  fontSize: "11px",
                                  color: "#059669",
                                  fontWeight: 700,
                                  marginTop: "2px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                }}
                              >
                                <FontAwesomeIcon icon={faGift} />
                                + Rp {Number(item.bonus).toLocaleString("id-ID")} (bonus target)
                              </div>
                            )}
                          </td>
                          <td>
                            <span className="sdu-struk-method">
                              {isSelesai ? "Tunai Langsung / Transfer" : "Estimasi SDU"}
                            </span>
                          </td>
                          <td>
                            {isSelesai ? (
                              <span className="sdu-status-chip selesai">
                                <FontAwesomeIcon icon={faCheck} /> LUNAS & DITERIMA
                              </span>
                            ) : (
                              <span
                                className={`sdu-status-chip ${(
                                  item.status || "menunggu"
                                ).toLowerCase()}`}
                              >
                                {item.status || "Menunggu"}
                              </span>
                            )}
                          </td>
                          <td className="text-right">
                            <button
                              className="sdu-btn-view-struk"
                              onClick={() => setSelectedStruk(item)}
                            >
                              <FontAwesomeIcon icon={faReceipt} />
                              <span>Lihat Struk</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ========================================================
          POP-UP MODAL: SLIP PENIMBANGAN & PEMBAYARAN DIGITAL
      ======================================================== */}
      {selectedStruk && (
        <div
          className="sdu-slip-overlay"
          onClick={() => setSelectedStruk(null)}
        >
          <div
            className="sdu-slip-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sdu-slip-header">
              <div className="sdu-slip-brand">
                <div className="sdu-slip-logo">
                  <FontAwesomeIcon icon={faRecycle} />
                </div>
                <div>
                  <h3>SLIP DIGITAL PENIMBANGAN</h3>
                  <span>SDU - Sistem Daur Ulang Digital Indonesia</span>
                </div>
              </div>
              <button
                className="sdu-slip-close"
                onClick={() => setSelectedStruk(null)}
                aria-label="Tutup Modal"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="sdu-slip-body">
              <div className="sdu-slip-top-meta">
                <div>
                  <span className="sdu-slip-lbl">Nomor Struk Resmi</span>
                  <strong className="sdu-slip-code">
                    STRUK-SDU-{String(selectedStruk.id).padStart(4, "0")}
                  </strong>
                </div>
                <span
                  className={`sdu-status-chip ${(
                    selectedStruk.status || "menunggu"
                  ).toLowerCase()}`}
                >
                  {selectedStruk.status === "Selesai"
                    ? "✓ LUNAS TERCATAT"
                    : selectedStruk.status || "Menunggu"}
                </span>
              </div>

              {/* Citizen info on receipt */}
              <div className="sdu-slip-citizen-box">
                <div className="sdu-citizen-field">
                  <span className="sdu-slip-lbl">Penyetor (Warga):</span>
                  <strong>{user.nama || selectedStruk.nama || "Warga SDU"}</strong>
                </div>
                <div className="sdu-citizen-field">
                  <span className="sdu-slip-lbl">Nomor Kontak:</span>
                  <span>{user.no_hp || selectedStruk.no_hp || "-"}</span>
                </div>
                {user.nik && (
                  <div className="sdu-citizen-field">
                    <span className="sdu-slip-lbl">NIK Terverifikasi:</span>
                    <span>{user.nik}</span>
                  </div>
                )}
                <div className="sdu-citizen-field full">
                  <span className="sdu-slip-lbl">Alamat Penjemputan:</span>
                  <span>{selectedStruk.lokasi || user.alamat || "Alamat penjemputan warga"}</span>
                </div>
              </div>

              {/* Breakdown Table */}
              {(() => {
                const totalAmount = Number(selectedStruk.totalharga || 0);
                const bonusAmount = Number(selectedStruk.bonus || 0);
                const baseAmount = Math.max(0, totalAmount - bonusAmount);

                return (
                  <>
                    <table className="sdu-slip-table">
                      <thead>
                        <tr>
                          <th>Deskripsi Material & Rincian</th>
                          <th className="text-right">Bobot</th>
                          <th className="text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
                            <strong>{selectedStruk.kategori}</strong>
                            <div className="sdu-slip-subdesc">
                              {selectedStruk.keterangan || "Sampah terpilah bersih siap daur ulang"}
                            </div>
                          </td>
                          <td className="text-right">
                            {((Number(selectedStruk.berat) || 0) / 1000).toFixed(1)} Kg
                            <div className="sdu-slip-subdesc">
                              ({selectedStruk.berat || 0} gram)
                            </div>
                          </td>
                          <td className="text-right">
                            <strong>
                              Rp {baseAmount.toLocaleString("id-ID")}
                            </strong>
                          </td>
                        </tr>

                        {bonusAmount > 0 && (
                          <tr className="sdu-slip-bonus-row" style={{ background: "#f0fdf4" }}>
                            <td colSpan="2">
                              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#065f46" }}>
                                <FontAwesomeIcon icon={faGift} style={{ color: "#10b981" }} />
                                <strong>Bonus Target Setor Banyak</strong>
                              </div>
                              <div className="sdu-slip-subdesc" style={{ color: "#047857" }}>
                                Insentif pemenuhan target berat transaksi
                              </div>
                            </td>
                            <td className="text-right" style={{ verticalAlign: "middle" }}>
                              <strong style={{ color: "#059669", fontSize: "0.95rem" }}>
                                + Rp {bonusAmount.toLocaleString("id-ID")} (bonus target)
                              </strong>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>

                    {/* Photo preview if exists */}
                    {selectedStruk.foto && (
                      <div className="sdu-slip-photo">
                        <span className="sdu-slip-lbl">Foto Bukti Penjemputan:</span>
                        <img
                          src={getUploadUrl("transaksi", selectedStruk.foto)}
                          alt="Bukti Sampah"
                        />
                      </div>
                    )}

                    {/* Total Settlement Box */}
                    <div className="sdu-slip-total-box">
                      <div>
                        <span>TOTAL DANA DITERIMA WARGA:</span>
                        {bonusAmount > 0 && (
                          <div style={{ fontSize: "11px", color: "#059669", fontWeight: 700, marginTop: "2px" }}>
                            (Termasuk bonus target Rp {bonusAmount.toLocaleString("id-ID")})
                          </div>
                        )}
                      </div>
                      <strong>
                        Rp{" "}
                        {totalAmount.toLocaleString(
                          "id-ID"
                        )}
                      </strong>
                    </div>
                  </>
                );
              })()}

              <div className="sdu-slip-auth-note">
                <FontAwesomeIcon icon={faCircleCheck} />
                <p>
                  Struk ini adalah bukti resmi dari SDU. Timbangan telah
                  dikalibrasi presisi dan dana telah diserahkan langsung ke warga
                  tanpa potongan biaya penjemputan.
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="sdu-slip-footer">
              <button
                className="sdu-btn-outline-slip"
                onClick={handlePrint}
              >
                <FontAwesomeIcon icon={faPrint} /> Cetak Struk (PDF)
              </button>
              <button
                className="sdu-btn-primary-slip"
                onClick={() => setSelectedStruk(null)}
              >
                Selesai / Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Struk;
