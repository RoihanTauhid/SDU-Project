import React, { useState, useEffect, useMemo } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import "./style/AdminHarga.css";
import CardHarga from "./components/CardHarga";
import {
  getHargaAdmin,
  getHargaLogsAdmin,
  createHargaAdmin,
  getTargetBonus,
  updateTargetBonusAdmin,
} from "../../services/hargaServices";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClockRotateLeft,
  faPlus,
  faBookOpen,
  faMagnifyingGlass,
  faDownload,
  faGift,
  faTrophy,
  faCircleCheck,
  faFloppyDisk,
  faSpinner,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";

function formatAuditDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  const tgl = d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const jam = d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${tgl}, ${jam} WIB`;
}

function AdminHarga() {
  const [harga, setHarga] = useState([]);
  const [loading, setLoading] = useState(true);
  const [auditLogs, setAuditLogs] = useState([]);
  const [logSearch, setLogSearch] = useState("");
  const [logPage, setLogPage] = useState(1);
  const logsPerPage = 5;

  const [showAddModal, setShowAddModal] = useState(false);
  const [newKategori, setNewKategori] = useState("");
  const [newHarga, setNewHarga] = useState("");
  const [addingKategori, setAddingKategori] = useState(false);

  // Target Bonus States
  const [targetBonusConfig, setTargetBonusConfig] = useState({
    min_berat: 20,
    bonus: 5000,
    is_active: 1,
  });
  const [bonusMinBerat, setBonusMinBerat] = useState(20);
  const [bonusNominal, setBonusNominal] = useState(5000);
  const [bonusIsActive, setBonusIsActive] = useState(true);
  const [savingBonus, setSavingBonus] = useState(false);
  const [bonusFeedback, setBonusFeedback] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [hargaData, logsData, bonusData] = await Promise.all([
        getHargaAdmin(),
        getHargaLogsAdmin().catch(() => []),
        getTargetBonus().catch(() => ({ min_berat: 20, bonus: 5000, is_active: 1 })),
      ]);
      setHarga(Array.isArray(hargaData) ? hargaData : []);
      setAuditLogs(Array.isArray(logsData) ? logsData : []);
      if (bonusData) {
        setTargetBonusConfig(bonusData);
        setBonusMinBerat(bonusData.min_berat ?? 20);
        setBonusNominal(bonusData.bonus ?? 5000);
        setBonusIsActive(Boolean(bonusData.is_active));
      }
    } catch (err) {
      console.error("Error loading harga:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBonus = async (e) => {
    if (e) e.preventDefault();
    const minB = Number(bonusMinBerat);
    const nomB = Number(bonusNominal);

    if (isNaN(minB) || minB <= 0) {
      alert("Minimal berat target harus berupa angka lebih dari 0 Kg.");
      return;
    }
    if (isNaN(nomB) || nomB < 0) {
      alert("Nominal bonus harus berupa angka positif.");
      return;
    }

    try {
      setSavingBonus(true);
      setBonusFeedback("");
      await updateTargetBonusAdmin(minB, nomB, bonusIsActive);
      setTargetBonusConfig({
        min_berat: minB,
        bonus: nomB,
        is_active: bonusIsActive ? 1 : 0,
      });
      setBonusFeedback("Pengaturan target bonus berhasil disimpan dan berlaku otomatis!");
      setTimeout(() => setBonusFeedback(""), 5000);
    } catch (err) {
      alert(err.message || "Gagal menyimpan pengaturan target bonus.");
    } finally {
      setSavingBonus(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateSuccess = async (item, newPrice) => {
    setHarga((prev) =>
      prev.map((h) => (h.id === item.id ? { ...h, harga: Number(newPrice) } : h))
    );
    try {
      const freshLogs = await getHargaLogsAdmin();
      setAuditLogs(Array.isArray(freshLogs) ? freshLogs : []);
      setLogPage(1);
    } catch (err) {
      console.error("Gagal memuat ulang log tarif:", err);
    }
  };

  const handleCreateKategori = async () => {
    if (!newKategori.trim() || !newHarga || Number(newHarga) <= 0) {
      alert("Nama kategori dan tarif valid per 100 gram wajib diisi.");
      return;
    }
    try {
      setAddingKategori(true);
      await createHargaAdmin(newKategori.trim(), Number(newHarga));
      setShowAddModal(false);
      setNewKategori("");
      setNewHarga("");
      await loadData();
    } catch (err) {
      alert(err.message || "Gagal menambahkan kategori.");
    } finally {
      setAddingKategori(false);
    }
  };

  const formattedLogs = useMemo(() => {
    return auditLogs.map((log) => ({
      id: log.id,
      waktu: formatAuditDate(log.created_at),
      komoditas: log.kategori,
      hargaLama: `Rp ${Number(log.harga_lama).toLocaleString("id-ID")}`,
      hargaBaru: `Rp ${Number(log.harga_baru).toLocaleString("id-ID")}`,
      arah: Number(log.harga_baru) >= Number(log.harga_lama) ? "up" : "down",
      ekuivalen: `Rp ${(Number(log.harga_baru) * 10).toLocaleString("id-ID")} / Kg`,
      diubahOleh: log.diubah_oleh || "Admin Utama",
      role: log.role || "Admin Operasional",
    }));
  }, [auditLogs]);

  const filteredLogs = useMemo(() => {
    if (!logSearch.trim()) return formattedLogs;
    const kw = logSearch.toLowerCase();
    return formattedLogs.filter(
      (l) =>
        l.komoditas.toLowerCase().includes(kw) ||
        l.diubahOleh.toLowerCase().includes(kw)
    );
  }, [formattedLogs, logSearch]);

  useEffect(() => {
    setLogPage(1);
  }, [logSearch]);

  const totalLogPages = Math.max(1, Math.ceil(filteredLogs.length / logsPerPage));
  const paginatedLogs = useMemo(() => {
    const start = (logPage - 1) * logsPerPage;
    return filteredLogs.slice(start, start + logsPerPage);
  }, [filteredLogs, logPage]);

  const handleExportCSV = () => {
    if (filteredLogs.length === 0) {
      alert("Belum ada data riwayat log untuk diunduh.");
      return;
    }
    const headers =
      "Waktu Penyesuaian,Komoditas,Harga Lama (100g),Harga Baru (100g),Ekuivalen (Per Kg),Diubah Oleh\n";
    const rows = filteredLogs
      .map(
        (l) =>
          `"${l.waktu}","${l.komoditas}","${l.hargaLama}","${l.hargaBaru}","${l.ekuivalen}","${l.diubahOleh} (${l.role})"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "SDU_Audit_Tarif_Master.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const latestSubtitle =
    formattedLogs.length > 0
      ? `Terakhir diperbarui: ${formattedLogs[0].waktu} oleh ${formattedLogs[0].diubahOleh}`
      : "Belum ada riwayat perubahan tarif master. Setiap penyesuaian tarif akan tercatat otomatis.";

  const headerRightButtons = (
    <div className="sdu-admin-header-actions-group">
      <button
        className="sdu-btn-header-outline"
        onClick={() => {
          const el = document.getElementById("riwayat-tarif-table");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }}
      >
        <FontAwesomeIcon icon={faClockRotateLeft} />
        <span>Riwayat Perubahan Tarif</span>
      </button>

      <button
        className="sdu-btn-header-solid"
        onClick={() => setShowAddModal(true)}
      >
        <FontAwesomeIcon icon={faPlus} />
        <span>Tambah Kategori Baru</span>
      </button>
    </div>
  );

  return (
    <AdminLayout
      eyebrow="MASTER DATA FINANCIAL • Real-Time Calculation Engine"
      title="Kelola Master Tarif Pembelian Sampah"
      subtitle={latestSubtitle}
      rightActions={headerRightButtons}
    >
      <div className="sdu-admin-harga-container">
        {/* ========================================================
            1. RULES BANNER: KAIDAH PERHITUNGAN OTOMATIS SISTEM SDU
        ======================================================== */}
        <div className="sdu-rules-banner-card">
          <div className="sdu-rules-banner-left">
            <div className="sdu-rules-banner-icon">
              <FontAwesomeIcon icon={faBookOpen} />
            </div>
            <div className="sdu-rules-banner-content">
              <div className="sdu-rules-title-row">
                <h3 className="sdu-rules-main-title">
                  Kaidah Perhitungan Otomatis Sistem SDU
                </h3>
                <span className="sdu-rules-basis-pill">Basis Acuan: 100 Gram</span>
              </div>
              <p className="sdu-rules-desc-text">
                Tarif yang diperbarui di sini menjadi acuan dasar perhitungan
                otomatis kalkulator transaksi warga secara real-time. Basis
                perhitungan sistem adalah per 100 gram, sehingga timbangan presisi
                mini dari setoran warga akan langsung dikalibrasi ke satuan kg
                (10x lipat) tanpa pembulatan rugi.
              </p>
            </div>
          </div>

          <div className="sdu-rules-banner-right-chips">
            <div className="sdu-rules-spec-chip">
              <span className="sdu-spec-label">TOLERANSI TIMBANG</span>
              <strong className="sdu-spec-val">± 5 Gr</strong>
            </div>
            <div className="sdu-rules-spec-chip">
              <span className="sdu-spec-label">SINKRONISASI</span>
              <strong className="sdu-spec-val highlight">Instan (0.2s)</strong>
            </div>
          </div>
        </div>

        {/* ========================================================
            2. TARGET BONUS CARD (PROGRAM INSENTIF VOLUME WARGA)
        ======================================================== */}
        <div className="sdu-target-bonus-admin-card">
          <div className="sdu-bonus-card-header">
            <div className="sdu-bonus-header-left">
              <div className="sdu-bonus-icon-box">
                <FontAwesomeIcon icon={faGift} />
              </div>
              <div>
                <div className="sdu-bonus-eyebrow-row">
                  <span className="sdu-bonus-eyebrow">PROGRAM INSENTIF VOLUME WARGA</span>
                  <span className={`sdu-bonus-status-badge ${bonusIsActive ? "active" : "inactive"}`}>
                    <span className="dot" />
                    {bonusIsActive ? "Target Bonus Aktif" : "Target Bonus Dinonaktifkan"}
                  </span>
                </div>
                <h3 className="sdu-bonus-title">
                  Kelola Target Berat & Bonus Transaksi Warga
                </h3>
                <p className="sdu-bonus-desc">
                  Atur ambang batas bobot setor sampah dan besaran bonus tunai yang otomatis ditambahkan ke total tebusan saat warga memenuhi target dalam satu transaksi.
                </p>
              </div>
            </div>
          </div>

          {bonusFeedback && (
            <div className="sdu-bonus-alert-success">
              <FontAwesomeIcon icon={faCircleCheck} />
              <span>{bonusFeedback}</span>
            </div>
          )}

          <form onSubmit={handleSaveBonus} className="sdu-bonus-form-grid">
            {/* 1. Target Berat */}
            <div className="sdu-bonus-field-group">
              <label className="sdu-bonus-field-lbl">
                Minimal Berat Target (Kg)
              </label>
              <div className="sdu-bonus-input-wrap">
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  className="sdu-bonus-input"
                  value={bonusMinBerat}
                  onChange={(e) => setBonusMinBerat(e.target.value)}
                  placeholder="20"
                />
                <span className="sdu-bonus-input-unit">Kg</span>
              </div>
              <span className="sdu-bonus-help">
                Warga harus menyetor minimal berat ini untuk klaim bonus
              </span>
            </div>

            {/* 2. Nominal Bonus */}
            <div className="sdu-bonus-field-group">
              <label className="sdu-bonus-field-lbl">
                Nominal Bonus Tambahan (Rp)
              </label>
              <div className="sdu-bonus-input-wrap">
                <span className="sdu-bonus-input-prefix">Rp</span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  className="sdu-bonus-input with-prefix"
                  value={bonusNominal}
                  onChange={(e) => setBonusNominal(e.target.value)}
                  placeholder="5000"
                />
              </div>
              <span className="sdu-bonus-help">
                Bonus tebusan tunai yang ditambahkan otomatis ke struk
              </span>
            </div>

            {/* 3. Status Program & Tombol Simpan */}
            <div className="sdu-bonus-action-group">
              <label className="sdu-bonus-field-lbl">
                Status Program
              </label>
              <div className="sdu-bonus-toggle-row">
                <label className="sdu-switch-label">
                  <input
                    type="checkbox"
                    checked={bonusIsActive}
                    onChange={(e) => setBonusIsActive(e.target.checked)}
                  />
                  <span className="sdu-switch-slider" />
                </label>
                <span className="sdu-switch-status-text">
                  {bonusIsActive ? "Aktif Berjalan" : "Dinonaktifkan"}
                </span>
              </div>

              <button
                type="submit"
                className="sdu-btn-save-bonus"
                disabled={savingBonus}
              >
                {savingBonus ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="fa-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faFloppyDisk} />
                    <span>Simpan Pengaturan Bonus</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Live Simulation Card */}
          <div className="sdu-bonus-simulation-box">
            <div className="sdu-sim-icon">
              <FontAwesomeIcon icon={faTrophy} />
            </div>
            <div className="sdu-sim-content">
              <strong>Simulasi Tampilan & Perhitungan pada Warga:</strong>
              <p>
                {bonusIsActive ? (
                  <>
                    Jika warga menyetor sampah mencapai <strong>{Number(bonusMinBerat) || 20} Kg</strong> atau lebih, sistem otomatis menambahkan bonus tunai <strong>Rp {(Number(bonusNominal) || 0).toLocaleString("id-ID")} (bonus target)</strong>. Keterangan bonus ini akan langsung tercantum transparan pada kalkulator setor sampah dan struk resmi warga.
                  </>
                ) : (
                  <span className="text-muted">
                    Program bonus saat ini dinonaktifkan. Transaksi warga hanya akan dihitung berdasarkan tarif dasar per 100 gram tanpa penambahan bonus target.
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================
            3. MASTER PRICING CARDS (6 CARDS IN 3-COL GRID)
        ======================================================== */}
        {loading ? (
          <div className="sdu-pricing-loading">
            <div className="sdu-spinner" />
            <p>Memuat tarif master dari basis data...</p>
          </div>
        ) : (
          <CardHarga
            hargaList={harga}
            onUpdateSuccess={handleUpdateSuccess}
          />
        )}

        {/* ========================================================
            3. AUDIT LOG TABLE (CLEAN & DATABASE-DRIVEN)
        ======================================================== */}
        <div className="sdu-audit-log-section" id="riwayat-tarif-table">
          <div className="sdu-audit-log-header">
            <div>
              <div className="sdu-audit-title-row">
                <FontAwesomeIcon
                  icon={faClockRotateLeft}
                  className="sdu-audit-icon"
                />
                <h3 className="sdu-audit-title">
                  Riwayat Log Perubahan Tarif Master
                </h3>
              </div>
              <p className="sdu-audit-sub">
                Catatan audit riwayat penyesuaian tarif per 100 gram untuk
                transparansi operasional.
              </p>
            </div>

            <div className="sdu-audit-controls">
              <div className="sdu-audit-search-box">
                <FontAwesomeIcon icon={faMagnifyingGlass} />
                <input
                  type="text"
                  placeholder="Cari kategori/admin..."
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                />
              </div>

              <button
                className="sdu-audit-export-btn"
                title="Unduh Riwayat CSV"
                onClick={handleExportCSV}
              >
                <FontAwesomeIcon icon={faDownload} />
              </button>
            </div>
          </div>

          <div className="sdu-audit-table-wrap">
            <table className="sdu-audit-table">
              <thead>
                <tr>
                  <th>Waktu Penyesuaian</th>
                  <th>Komoditas Sampah</th>
                  <th>Harga Lama (100g)</th>
                  <th>Harga Baru (100g)</th>
                  <th>Ekuivalen (Per Kg)</th>
                  <th>Diubah Oleh</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="sdu-audit-empty-cell">
                      <div className="sdu-audit-empty-state">
                        <FontAwesomeIcon icon={faClockRotateLeft} />
                        <strong>Belum Ada Riwayat Log Perubahan Tarif</strong>
                        <span>
                          Log masih kosong seperti baru. Perubahan harga komoditas
                          yang disimpan akan tercatat secara otomatis di sini.
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="col-waktu">{log.waktu}</td>
                      <td className="col-komoditas">
                        <span className="sdu-dot-bullet" />
                        <strong className="capitalize">{log.komoditas}</strong>
                      </td>
                      <td className="col-lama">{log.hargaLama}</td>
                      <td className="col-baru">
                        <span className={`sdu-log-tag ${log.arah}`}>
                          {log.arah === "up" ? "↗" : "↘"} {log.hargaBaru}
                        </span>
                      </td>
                      <td className="col-ekuivalen">{log.ekuivalen}</td>
                      <td className="col-admin">
                        <div className="sdu-admin-pill-audit">
                          <span className="sdu-admin-avatar-mini">
                            {log.diubahOleh.charAt(0).toUpperCase()}
                          </span>
                          <span>
                            <strong>{log.diubahOleh}</strong> ({log.role})
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="sdu-audit-table-footer">
            <span className="sdu-audit-entries-text">
              Menampilkan {paginatedLogs.length} dari {filteredLogs.length} entri
              audit
            </span>

            {totalLogPages > 1 && (
              <div className="sdu-audit-pagination">
                <button
                  className="sdu-audit-page-btn"
                  disabled={logPage === 1}
                  onClick={() => setLogPage((p) => Math.max(1, p - 1))}
                >
                  ‹
                </button>
                {Array.from({ length: totalLogPages }, (_, idx) => idx + 1).map(
                  (num) => (
                    <button
                      key={num}
                      className={`sdu-audit-page-btn ${
                        logPage === num ? "active" : ""
                      }`}
                      onClick={() => setLogPage(num)}
                    >
                      {num}
                    </button>
                  )
                )}
                <button
                  className="sdu-audit-page-btn"
                  disabled={logPage === totalLogPages}
                  onClick={() =>
                    setLogPage((p) => Math.min(totalLogPages, p + 1))
                  }
                >
                  ›
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal Tambah Kategori */}
        {showAddModal && (
          <div
            className="sdu-modal-backdrop"
            onClick={() => setShowAddModal(false)}
          >
            <div
              className="sdu-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Tambah Kategori Sampah Baru</h3>
              <p>
                Masukkan rincian komoditas baru ke dalam master data sistem SDU.
              </p>
              <div className="sdu-modal-form">
                <label>Nama Kategori</label>
                <input
                  type="text"
                  placeholder="Contoh: Tembaga Murni"
                  value={newKategori}
                  onChange={(e) => setNewKategori(e.target.value)}
                />
                <label>Tarif per 100 Gram (Rp)</label>
                <input
                  type="number"
                  placeholder="Contoh: 1200"
                  value={newHarga}
                  onChange={(e) => setNewHarga(e.target.value)}
                />
              </div>
              <div className="sdu-modal-actions">
                <button
                  className="sdu-btn-modal-cancel"
                  onClick={() => setShowAddModal(false)}
                >
                  Batal
                </button>
                <button
                  className="sdu-btn-modal-submit"
                  disabled={addingKategori}
                  onClick={handleCreateKategori}
                >
                  {addingKategori ? "Menyimpan..." : "Simpan Kategori"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminHarga;
