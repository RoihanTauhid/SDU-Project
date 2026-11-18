import { useState, useEffect, useMemo, useRef } from "react";
import "./style/Riwayat.css";
import Navbar from "../components/Navbar";
import { getRiwayatTransaksiUser } from "../services/transaksiService";
import { getUploadUrl } from "../config/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxOpen,
  faScaleBalanced,
  faWallet,
  faClockRotateLeft,
  faLocationDot,
  faCalendarDays,
  faCheck,
  faPlus,
  faMagnifyingGlass,
  faXmark,
  faChevronLeft,
  faChevronRight,
  faRotateRight,
  faReceipt,
  faPrint,
  faTruckFast,
  faFilter,
  faArrowDownWideShort,
  faTableCellsLarge,
  faList,
  faRecycle,
  faCircleInfo,
  faLocationArrow,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { useNavigate } from "react-router-dom";

const STATUS_STEPS = ["Dikonfirmasi", "Dijemput", "Selesai"];

const CATEGORY_OPTIONS = [
  { value: "Semua", label: "Semua Kategori" },
  { value: "plastik", label: "Plastik" },
  { value: "kardus", label: "Kardus" },
  { value: "botol", label: "Botol Kaca" },
  { value: "kaleng", label: "Kaleng" },
  { value: "besi", label: "Besi" },
  { value: "pecah", label: "Pecah Belah" },
];

const SORT_OPTIONS = [
  { value: "terbaru", label: "Terbaru (Default)" },
  { value: "terlama", label: "Terlama" },
  { value: "nominal_desc", label: "Nominal Tertinggi" },
  { value: "nominal_asc", label: "Nominal Terendah" },
  { value: "berat_desc", label: "Berat Terbesar" },
  { value: "berat_asc", label: "Berat Terkecil" },
];

const getPageNumbers = (current, total) => {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, "...", total];
  }
  if (current >= total - 3) {
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, "...", current - 1, current, current + 1, "...", total];
};

function Riwayat() {
  const navigate = useNavigate();
  const listTopRef = useRef(null);

  const [transaksi, setTransaksi] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Controls
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [filterKategori, setFilterKategori] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("terbaru");
  const [viewMode, setViewMode] = useState("table"); // 'table' | 'grid'

  // Pagination (Fixed 6 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modals
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);

  const user = JSON.parse(localStorage.getItem("user")) || {};

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
        console.error("Gagal load riwayat transaksi:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user.id]);

  // Reset page to 1 whenever any filter, search, or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, filterKategori, searchQuery, sortBy]);

  // Precompute metrics & status counts efficiently
  const metrics = useMemo(() => {
    const statusCounts = {
      Semua: transaksi.length,
      Menunggu: 0,
      Diproses: 0,
      Dijemput: 0,
      Selesai: 0,
    };

    let totalBeratGr = 0;
    let totalNominal = 0;
    let activeCount = 0;

    transaksi.forEach((t) => {
      totalBeratGr += Number(t.berat) || 0;
      totalNominal += Number(t.totalharga) || 0;

      const st = (t.status || "Menunggu").toLowerCase();
      if (st === "menunggu") {
        statusCounts.Menunggu++;
        activeCount++;
      } else if (st === "diproses") {
        statusCounts.Diproses++;
        activeCount++;
      } else if (st === "dijemput") {
        statusCounts.Dijemput++;
        activeCount++;
      } else if (st === "selesai") {
        statusCounts.Selesai++;
      }
    });

    return {
      totalTransaksi: transaksi.length,
      totalBeratKg: (totalBeratGr / 1000).toLocaleString("id-ID", {
        maximumFractionDigits: 1,
      }),
      totalNominal,
      activeCount,
      statusCounts,
    };
  }, [transaksi]);

  // Filter & Sort using useMemo for instant responsiveness
  const filteredAndSorted = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = transaksi.filter((t) => {
      // Status check
      if (
        filterStatus !== "Semua" &&
        (t.status || "Menunggu").toLowerCase() !== filterStatus.toLowerCase()
      ) {
        return false;
      }

      // Category check
      if (
        filterKategori !== "Semua" &&
        !(t.kategori || "").toLowerCase().includes(filterKategori.toLowerCase())
      ) {
        return false;
      }

      // Search query check
      if (query) {
        const trxCode = `trx-2026-${String(t.id).padStart(3, "0")}`;
        const matchesId =
          trxCode.includes(query) || String(t.id).includes(query);
        const matchesKat = (t.kategori || "").toLowerCase().includes(query);
        const matchesKet = (t.keterangan || "").toLowerCase().includes(query);
        const matchesLok = (t.lokasi || "").toLowerCase().includes(query);

        if (!matchesId && !matchesKat && !matchesKet && !matchesLok) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "terlama":
          return (Number(a.id) || 0) - (Number(b.id) || 0);
        case "nominal_desc":
          return (Number(b.totalharga) || 0) - (Number(a.totalharga) || 0);
        case "nominal_asc":
          return (Number(a.totalharga) || 0) - (Number(b.totalharga) || 0);
        case "berat_desc":
          return (Number(b.berat) || 0) - (Number(a.berat) || 0);
        case "berat_asc":
          return (Number(a.berat) || 0) - (Number(b.berat) || 0);
        case "terbaru":
        default:
          return (Number(b.id) || 0) - (Number(a.id) || 0);
      }
    });
  }, [transaksi, filterStatus, filterKategori, searchQuery, sortBy]);

  // Pagination slice
  const pagination = useMemo(() => {
    const totalItems = filteredAndSorted.length;
    if (itemsPerPage === 0) {
      return {
        totalItems,
        totalPages: 1,
        currentPage: 1,
        startIndex: 0,
        endIndex: totalItems,
        items: filteredAndSorted,
      };
    }

    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const safePage = Math.min(currentPage, totalPages);
    const startIndex = (safePage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    return {
      totalItems,
      totalPages,
      currentPage: safePage,
      startIndex,
      endIndex,
      items: filteredAndSorted.slice(startIndex, endIndex),
    };
  }, [filteredAndSorted, currentPage, itemsPerPage]);

  const handlePageChange = (pageNum) => {
    if (pageNum < 1 || pageNum > pagination.totalPages) return;
    setCurrentPage(pageNum);
    if (listTopRef.current) {
      listTopRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleResetFilters = () => {
    setFilterStatus("Semua");
    setFilterKategori("Semua");
    setSearchQuery("");
    setSortBy("terbaru");
    setCurrentPage(1);
  };

  const openWhatsApp = (item) => {
    const cleanPhone = "6283808421427";
    const text = encodeURIComponent(
      `Halo Admin SDU, saya ingin menanyakan penjemputan transaksi TRX-2026-${String(
        item.id
      ).padStart(3, "0")} (${item.kategori}, ${(
        (Number(item.berat) || 0) / 1000
      ).toFixed(1)} Kg).`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, "_blank");
  };

  const formatTanggal = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const hasActiveFilters =
    filterStatus !== "Semua" ||
    filterKategori !== "Semua" ||
    searchQuery.trim() !== "" ||
    sortBy !== "terbaru";

  return (
    <div className="sdu-riwayat-page">
      <Navbar />

      <div className="sdu-riwayat-container">
        {/* Header */}
        <div className="sdu-rw-header">
          <div>
            <span className="sdu-rw-eyebrow">
              <FontAwesomeIcon icon={faClockRotateLeft} /> RIWAYAT TRANSAKSI
            </span>
            <h1 className="sdu-rw-title">Riwayat Setoran Sampah Anda</h1>
            <p className="sdu-rw-subtitle">
              Pantau status penjemputan, cari arsip slip digital, dan lacak
              pencairan dana dengan cepat.
            </p>
          </div>

          <button
            className="sdu-btn-primary"
            onClick={() => navigate("/transaksi")}
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>Setor Sampah Baru</span>
          </button>
        </div>

        {/* Top Summary Metrics Bar */}
        <div className="sdu-rw-summary-grid">
          <div className="sdu-rw-summary-card">
            <div className="sdu-rw-sum-icon blue">
              <FontAwesomeIcon icon={faBoxOpen} />
            </div>
            <div>
              <span className="sdu-rw-sum-label">Total Setoran</span>
              <strong className="sdu-rw-sum-val">
                {metrics.totalTransaksi} Transaksi
              </strong>
            </div>
          </div>

          <div className="sdu-rw-summary-card">
            <div className="sdu-rw-sum-icon teal">
              <FontAwesomeIcon icon={faScaleBalanced} />
            </div>
            <div>
              <span className="sdu-rw-sum-label">Total Sampah Terpilah</span>
              <strong className="sdu-rw-sum-val">
                {metrics.totalBeratKg} Kg
              </strong>
            </div>
          </div>

          <div className="sdu-rw-summary-card">
            <div className="sdu-rw-sum-icon green">
              <FontAwesomeIcon icon={faWallet} />
            </div>
            <div>
              <span className="sdu-rw-sum-label">Akumulasi Pendapatan</span>
              <strong className="sdu-rw-sum-val highlight">
                Rp {metrics.totalNominal.toLocaleString("id-ID")}
              </strong>
            </div>
          </div>

          <div className="sdu-rw-summary-card">
            <div className="sdu-rw-sum-icon amber">
              <FontAwesomeIcon icon={faTruckFast} />
            </div>
            <div>
              <span className="sdu-rw-sum-label">Penjemputan Berjalan</span>
              <strong className="sdu-rw-sum-val">
                {metrics.activeCount} Aktif
              </strong>
            </div>
          </div>
        </div>

        {/* Anchor target for smooth scroll when paging */}
        <div ref={listTopRef} className="sdu-rw-controls-wrapper">
          {/* Status Pills Row */}
          <div className="sdu-rw-filter-bar">
            {["Semua", "Menunggu", "Diproses", "Dijemput", "Selesai"].map(
              (st) => (
                <button
                  key={st}
                  className={`sdu-rw-pill-tab ${
                    filterStatus === st ? "active" : ""
                  }`}
                  onClick={() => setFilterStatus(st)}
                >
                  <span>{st}</span>
                  <span className="sdu-rw-pill-count">
                    {metrics.statusCounts[st]}
                  </span>
                </button>
              )
            )}
          </div>

          {/* Search, Category, Sort, View & PageSize Toolbar */}
          <div className="sdu-rw-toolbar">
            {/* Search Box */}
            <div className="sdu-rw-search-box">
              <FontAwesomeIcon
                icon={faMagnifyingGlass}
                className="sdu-rw-search-icon"
              />
              <input
                type="text"
                placeholder="Cari kode TRX, kategori, lokasi, atau catatan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="sdu-rw-search-input"
              />
              {searchQuery && (
                <button
                  className="sdu-rw-clear-btn"
                  onClick={() => setSearchQuery("")}
                  title="Hapus pencarian"
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              )}
            </div>

            <div className="sdu-rw-toolbar-actions">
              {/* Category Filter */}
              <div className="sdu-rw-select-group">
                <FontAwesomeIcon
                  icon={faFilter}
                  className="sdu-rw-select-icon"
                />
                <select
                  value={filterKategori}
                  onChange={(e) => setFilterKategori(e.target.value)}
                  className="sdu-rw-select"
                  aria-label="Filter Kategori"
                >
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div className="sdu-rw-select-group">
                <FontAwesomeIcon
                  icon={faArrowDownWideShort}
                  className="sdu-rw-select-icon"
                />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sdu-rw-select"
                  aria-label="Urutkan Transaksi"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* View Mode Switcher */}
              <div className="sdu-rw-view-toggle" role="group" aria-label="Mode Tampilan">
                <button
                  className={`sdu-rw-view-btn ${
                    viewMode === "grid" ? "active" : ""
                  }`}
                  onClick={() => setViewMode("grid")}
                  title="Tampilan Kartu"
                >
                  <FontAwesomeIcon icon={faTableCellsLarge} />
                </button>
                <button
                  className={`sdu-rw-view-btn ${
                    viewMode === "table" ? "active" : ""
                  }`}
                  onClick={() => setViewMode("table")}
                  title="Tampilan Tabel Ringkas (Cepat)"
                >
                  <FontAwesomeIcon icon={faList} />
                </button>
              </div>

              {hasActiveFilters && (
                <button
                  className="sdu-rw-reset-btn"
                  onClick={handleResetFilters}
                  title="Reset semua filter"
                >
                  <FontAwesomeIcon icon={faRotateRight} />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="sdu-rw-loading-grid">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="sdu-rw-skeleton-card">
                <div className="sdu-skel-line w-40" />
                <div className="sdu-skel-line w-70 h-lg" />
                <div className="sdu-skel-box" />
                <div className="sdu-skel-line w-full" />
              </div>
            ))}
          </div>
        ) : pagination.totalItems === 0 ? (
          <div className="sdu-rw-empty">
            <FontAwesomeIcon icon={faBoxOpen} className="sdu-empty-icon" />
            <h3>
              {transaksi.length === 0
                ? "Belum Ada Transaksi"
                : "Transaksi Tidak Ditemukan"}
            </h3>
            <p>
              {transaksi.length === 0
                ? "Belum ada riwayat setoran sampah Anda. Yuk mulai setor sampah terpilah sekarang!"
                : "Tidak ada transaksi yang cocok dengan pencarian atau filter yang dipilih."}
            </p>
            {transaksi.length === 0 ? (
              <button
                className="sdu-btn-primary"
                onClick={() => navigate("/transaksi")}
              >
                Mulai Setor Sampah
              </button>
            ) : (
              <button
                className="sdu-btn-outline-reset"
                onClick={handleResetFilters}
              >
                <FontAwesomeIcon icon={faRotateRight} /> Reset Semua Filter
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Results Info Bar */}
            <div className="sdu-rw-results-meta">
              <span>
                Menampilkan{" "}
                <strong>
                  {pagination.startIndex + 1} -{" "}
                  {Math.min(pagination.endIndex, pagination.totalItems)}
                </strong>{" "}
                dari <strong>{pagination.totalItems}</strong> transaksi
              </span>
              <span className="sdu-rw-page-indicator">
                Halaman {pagination.currentPage} dari {pagination.totalPages}
              </span>
            </div>

            {viewMode === "grid" ? (
              /* GRID CARD VIEW */
              <div className="sdu-rw-grid">
                {pagination.items.map((item) => {
                  const currentStepIndex =
                    item.status === "Selesai"
                      ? 2
                      : item.status === "Dijemput"
                      ? 1
                      : 0;

                  return (
                    <div key={item.id} className="sdu-rw-card">
                      {/* Card Header */}
                      <div className="sdu-rw-card-header">
                        <div>
                          <span className="sdu-rw-code">
                            TRX-2026-{String(item.id).padStart(3, "0")}
                          </span>
                          <h3 className="sdu-rw-cat">{item.kategori}</h3>
                        </div>

                        <span
                          className={`sdu-status-chip ${(
                            item.status || "menunggu"
                          ).toLowerCase()}`}
                        >
                          {item.status || "Menunggu"}
                        </span>
                      </div>

                      {/* Visual Status Stepper */}
                      <div className="sdu-rw-stepper">
                        {STATUS_STEPS.map((step, idx) => {
                          const isCompleted = idx <= currentStepIndex;
                          const isCurrent = idx === currentStepIndex;

                          return (
                            <div
                              key={step}
                              className={`sdu-rw-node ${
                                isCompleted ? "completed" : ""
                              } ${isCurrent ? "current" : ""}`}
                            >
                              <div className="sdu-rw-dot">
                                {isCompleted ? (
                                  <FontAwesomeIcon icon={faCheck} />
                                ) : (
                                  <span>{idx + 1}</span>
                                )}
                              </div>
                              <span className="sdu-rw-node-label">{step}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Photo Thumbnail if exists */}
                      {item.foto && (
                        <div className="sdu-rw-photo-box">
                          <img
                            src={getUploadUrl("transaksi", item.foto)}
                            alt="Foto Sampah"
                            className="sdu-rw-photo-img"
                            loading="lazy"
                          />
                        </div>
                      )}

                      {/* Notes / Description */}
                      {item.keterangan && (
                        <p className="sdu-rw-notes">{item.keterangan}</p>
                      )}

                      {/* Metrics Row */}
                      <div className="sdu-rw-metrics-row">
                        <div className="sdu-rw-metric-item">
                          <span className="sdu-metric-label">
                            <FontAwesomeIcon icon={faScaleBalanced} /> Berat
                          </span>
                          <strong className="sdu-metric-val">
                            {((Number(item.berat) || 0) / 1000).toFixed(1)} Kg
                          </strong>
                        </div>

                        <div className="sdu-rw-metric-item">
                          <span className="sdu-metric-label">
                            <FontAwesomeIcon icon={faWallet} /> Total Payout
                          </span>
                          <strong className="sdu-metric-val highlight">
                            Rp{" "}
                            {(Number(item.totalharga) || 0).toLocaleString(
                              "id-ID"
                            )}
                          </strong>
                        </div>
                      </div>

                      {/* Footer Meta & Action */}
                      <div className="sdu-rw-footer">
                        <div className="sdu-rw-footer-info">
                          {item.lokasi && (
                            <span className="sdu-rw-loc" title={item.lokasi}>
                              <FontAwesomeIcon icon={faLocationDot} />{" "}
                              {item.lokasi.length > 26
                                ? item.lokasi.slice(0, 26) + "..."
                                : item.lokasi}
                            </span>
                          )}
                          <span className="sdu-rw-date">
                            <FontAwesomeIcon icon={faCalendarDays} />{" "}
                            {formatTanggal(item.created_at)}
                          </span>
                        </div>

                        <div className="sdu-rw-card-btns">
                          <button
                            className="sdu-btn-detail-sm"
                            onClick={() => setSelectedDetail(item)}
                            title="Lihat Detail Transaksi"
                          >
                            <FontAwesomeIcon icon={faCircleInfo} />
                            <span>Detail</span>
                          </button>

                          <button
                            className="sdu-btn-slip-sm"
                            onClick={() => setSelectedSlip(item)}
                            title="Lihat Bukti Slip Digital"
                          >
                            <FontAwesomeIcon icon={faReceipt} />
                            <span>Slip</span>
                          </button>

                          <button
                            className="sdu-btn-wa-sm"
                            onClick={() => openWhatsApp(item)}
                            title="Hubungi Admin via WhatsApp"
                          >
                            <FontAwesomeIcon icon={faWhatsapp} />
                            <span>Admin</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* COMPACT TABLE VIEW */
              <div className="sdu-rw-table-card">
                <div className="sdu-rw-table-scroll">
                  <table className="sdu-rw-table">
                    <thead>
                      <tr>
                        <th>ID & Tanggal</th>
                        <th>Kategori Material</th>
                        <th>Lokasi Jemput</th>
                        <th>Berat</th>
                        <th>Total Payout</th>
                        <th>Status</th>
                        <th className="text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagination.items.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <div className="sdu-tbl-id">
                              TRX-2026-{String(item.id).padStart(3, "0")}
                            </div>
                            <div className="sdu-tbl-date">
                              {formatTanggal(item.created_at)}
                            </div>
                          </td>
                          <td>
                            <span className="sdu-tbl-cat">{item.kategori}</span>
                            {item.keterangan && (
                              <div className="sdu-tbl-note">
                                {item.keterangan.length > 42
                                  ? item.keterangan.slice(0, 42) + "..."
                                  : item.keterangan}
                              </div>
                            )}
                          </td>
                          <td>
                            <span className="sdu-tbl-loc" title={item.lokasi}>
                              {item.lokasi
                                ? item.lokasi.length > 32
                                  ? item.lokasi.slice(0, 32) + "..."
                                  : item.lokasi
                                : "-"}
                            </span>
                          </td>
                          <td>
                            <strong>
                              {((Number(item.berat) || 0) / 1000).toFixed(1)} Kg
                            </strong>
                          </td>
                          <td>
                            <strong className="sdu-tbl-payout">
                              Rp{" "}
                              {(Number(item.totalharga) || 0).toLocaleString(
                                "id-ID"
                              )}
                            </strong>
                            {Number(item.bonus) > 0 && (
                              <div style={{ fontSize: "11px", color: "#059669", fontWeight: 700, marginTop: "2px" }}>
                                +Rp {Number(item.bonus).toLocaleString("id-ID")} (bonus target)
                              </div>
                            )}
                          </td>
                          <td>
                            <span
                              className={`sdu-status-chip ${(
                                item.status || "menunggu"
                              ).toLowerCase()}`}
                            >
                              {item.status || "Menunggu"}
                            </span>
                          </td>
                          <td>
                            <div className="sdu-tbl-actions">
                              <button
                                className="sdu-btn-detail-table"
                                onClick={() => setSelectedDetail(item)}
                                title="Lihat Penjelasan Detail Transaksi"
                              >
                                <FontAwesomeIcon icon={faCircleInfo} />
                                <span>Detail</span>
                              </button>
                              <button
                                className="sdu-btn-slip-sm"
                                onClick={() => setSelectedSlip(item)}
                                title="Lihat Bukti Slip Digital"
                              >
                                <FontAwesomeIcon icon={faReceipt} />
                                <span>Slip</span>
                              </button>
                              <button
                                className="sdu-btn-wa-sm"
                                onClick={() => openWhatsApp(item)}
                                title="Hubungi Admin"
                              >
                                <FontAwesomeIcon icon={faWhatsapp} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pagination Footer */}
            {pagination.totalPages > 1 && (
              <div className="sdu-rw-pagination-bar">
                <span className="sdu-rw-pg-summary">
                  Menampilkan <strong>{pagination.items.length}</strong> dari{" "}
                  <strong>{pagination.totalItems}</strong> transaksi
                </span>

                <div className="sdu-rw-pg-controls">
                  <button
                    className="sdu-rw-pg-nav"
                    disabled={pagination.currentPage === 1}
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                  >
                    <FontAwesomeIcon icon={faChevronLeft} />
                    <span>Sebelumnya</span>
                  </button>

                  <div className="sdu-rw-pg-numbers">
                    {getPageNumbers(
                      pagination.currentPage,
                      pagination.totalPages
                    ).map((page, idx) =>
                      page === "..." ? (
                        <span key={`dots-${idx}`} className="sdu-rw-pg-dots">
                          ...
                        </span>
                      ) : (
                        <button
                          key={page}
                          className={`sdu-rw-pg-num ${
                            pagination.currentPage === page ? "active" : ""
                          }`}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </button>
                      )
                    )}
                  </div>

                  <button
                    className="sdu-rw-pg-nav"
                    disabled={pagination.currentPage === pagination.totalPages}
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                  >
                    <span>Selanjutnya</span>
                    <FontAwesomeIcon icon={faChevronRight} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ======================================================
          MODAL BUKTI SLIP DIGITAL TRANSAKSI
      ====================================================== */}
      {selectedSlip && (
        <div
          className="sdu-slip-overlay"
          onClick={() => setSelectedSlip(null)}
        >
          <div
            className="sdu-slip-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sdu-slip-header">
              <div className="sdu-slip-brand">
                <div className="sdu-slip-logo">
                  <FontAwesomeIcon icon={faRecycle} />
                </div>
                <div>
                  <h3>SLIP DIGITAL PENIMBANGAN</h3>
                  <span>SDU - Sistem Daur Ulang Indonesia</span>
                </div>
              </div>
              <button
                className="sdu-slip-close"
                onClick={() => setSelectedSlip(null)}
                aria-label="Tutup Modal"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className="sdu-slip-body">
              <div className="sdu-slip-top-meta">
                <div>
                  <span className="sdu-slip-lbl">Nomor Transaksi</span>
                  <strong className="sdu-slip-code">
                    TRX-2026-{String(selectedSlip.id).padStart(3, "0")}
                  </strong>
                </div>
                <span
                  className={`sdu-status-chip ${(
                    selectedSlip.status || "menunggu"
                  ).toLowerCase()}`}
                >
                  {selectedSlip.status || "Menunggu"}
                </span>
              </div>

              <div className="sdu-slip-divider" />

              <div className="sdu-slip-info-grid">
                <div className="sdu-slip-info-row">
                  <span>Nama Warga</span>
                  <strong>{user.nama || "Warga Terdaftar"}</strong>
                </div>
                <div className="sdu-slip-info-row">
                  <span>Tanggal Pengajuan</span>
                  <strong>{formatTanggal(selectedSlip.created_at)}</strong>
                </div>
                <div className="sdu-slip-info-row">
                  <span>Kategori Sampah</span>
                  <strong className="capitalize">
                    {selectedSlip.kategori}
                  </strong>
                </div>
                <div className="sdu-slip-info-row">
                  <span>Berat Terdata</span>
                  <strong>
                    {((Number(selectedSlip.berat) || 0) / 1000).toFixed(1)} Kg (
                    {Number(selectedSlip.berat || 0).toLocaleString("id-ID")}{" "}
                    gr)
                  </strong>
                </div>
                <div className="sdu-slip-info-row full">
                  <span>Lokasi Penjemputan</span>
                  <strong>{selectedSlip.lokasi || "-"}</strong>
                </div>
                {selectedSlip.keterangan && (
                  <div className="sdu-slip-info-row full">
                    <span>Catatan Material</span>
                    <p className="sdu-slip-note">{selectedSlip.keterangan}</p>
                  </div>
                )}
              </div>

              {selectedSlip.foto && (
                <div className="sdu-slip-photo">
                  <img
                    src={getUploadUrl("transaksi", selectedSlip.foto)}
                    alt="Bukti Foto Sampah"
                  />
                </div>
              )}

              <div className="sdu-slip-total-box">
                <div>
                  <span>TOTAL PENCAIRAN DANA</span>
                  {Number(selectedSlip.bonus) > 0 && (
                    <div style={{ fontSize: "11px", color: "#059669", fontWeight: 700 }}>
                      Termasuk +Rp {Number(selectedSlip.bonus).toLocaleString("id-ID")} (bonus target)
                    </div>
                  )}
                </div>
                <strong>
                  Rp{" "}
                  {(Number(selectedSlip.totalharga) || 0).toLocaleString(
                    "id-ID"
                  )}
                </strong>
              </div>
            </div>

            <div className="sdu-slip-footer">
              <button
                className="sdu-btn-outline-slip"
                onClick={() => window.print()}
              >
                <FontAwesomeIcon icon={faPrint} />
                <span>Cetak Slip</span>
              </button>
              <button
                className="sdu-btn-wa-slip"
                onClick={() => openWhatsApp(selectedSlip)}
              >
                <FontAwesomeIcon icon={faWhatsapp} />
                <span>Hubungi Admin</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================
          MODAL POP-UP DETAIL TRANSAKSI (CARD PENJELASAN)
      ====================================================== */}
      {selectedDetail && (
        <div
          className="sdu-slip-overlay"
          onClick={() => setSelectedDetail(null)}
        >
          <div
            className="sdu-detail-popup-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sdu-popup-header">
              <div className="sdu-popup-title-wrap">
                <span className="sdu-popup-badge">RINCIAN TRANSAKSI</span>
                <h3 className="sdu-popup-code">
                  #TRX-2026-{String(selectedDetail.id).padStart(3, "0")}
                </h3>
              </div>
              <button
                className="sdu-popup-close-btn"
                onClick={() => setSelectedDetail(null)}
                aria-label="Tutup Modal"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="sdu-popup-body">
              {/* Stepper Status (Dikonfirmasi > Dijemput > Selesai) */}
              <div className="sdu-popup-stepper-box">
                <div className="sdu-popup-stepper-status-row">
                  <span className="sdu-stepper-label">Status Penjemputan:</span>
                  <span
                    className={`sdu-status-chip ${(
                      selectedDetail.status || "menunggu"
                    ).toLowerCase()}`}
                  >
                    {selectedDetail.status || "Menunggu"}
                  </span>
                </div>

                <div className="sdu-popup-stepper-track">
                  {STATUS_STEPS.map((step, idx) => {
                    const currentStepIdx =
                      selectedDetail.status === "Selesai"
                        ? 2
                        : selectedDetail.status === "Dijemput"
                        ? 1
                        : 0;
                    const isPassed = idx <= currentStepIdx;
                    const isCurrent = idx === currentStepIdx;

                    return (
                      <div
                        key={step}
                        className={`sdu-step-node ${
                          isPassed ? "completed" : ""
                        } ${isCurrent ? "active" : ""}`}
                      >
                        <div className="sdu-step-line" />
                        <div className="sdu-step-circle">
                          {isPassed ? (
                            <FontAwesomeIcon icon={faCheck} />
                          ) : (
                            <span>{idx + 1}</span>
                          )}
                        </div>
                        <span className="sdu-step-title">{step}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Foto Bukti Sampah jika ada */}
              {selectedDetail.foto && (
                <div className="sdu-popup-photo-card">
                  <span className="sdu-photo-caption">Foto Sampah yang Disetor:</span>
                  <img
                    src={getUploadUrl("transaksi", selectedDetail.foto)}
                    alt="Foto Sampah"
                    className="sdu-popup-photo-img"
                  />
                </div>
              )}

              {/* Rincian Info Grid */}
              <div className="sdu-popup-grid-info">
                <div className="sdu-popup-info-tile">
                  <span className="sdu-tile-lbl">Kategori Material</span>
                  <strong className="sdu-tile-val">{selectedDetail.kategori}</strong>
                </div>

                <div className="sdu-popup-info-tile">
                  <span className="sdu-tile-lbl">Bobot Penimbangan</span>
                  <strong className="sdu-tile-val">
                    {((Number(selectedDetail.berat) || 0) / 1000).toFixed(1)} Kg
                    <small> ({selectedDetail.berat || 0} gr)</small>
                  </strong>
                </div>

                <div className="sdu-popup-info-tile highlight">
                  <span className="sdu-tile-lbl">Total Nilai Tebusan</span>
                  <strong className="sdu-tile-val green">
                    Rp {(Number(selectedDetail.totalharga) || 0).toLocaleString("id-ID")}
                  </strong>
                  {Number(selectedDetail.bonus) > 0 && (
                    <small style={{ color: "#059669", fontWeight: 700, marginTop: "2px", display: "block" }}>
                      +Rp {Number(selectedDetail.bonus).toLocaleString("id-ID")} (bonus target)
                    </small>
                  )}
                </div>

                <div className="sdu-popup-info-tile">
                  <span className="sdu-tile-lbl">Tanggal Pengajuan</span>
                  <strong className="sdu-tile-val">
                    {formatTanggal(selectedDetail.created_at)}
                  </strong>
                </div>
              </div>

              {/* Alamat & Titik Penjemputan */}
              <div className="sdu-popup-address-card">
                <div className="sdu-addr-header">
                  <FontAwesomeIcon icon={faLocationDot} />
                  <span>Titik Penjemputan Warga:</span>
                </div>
                <strong className="sdu-addr-main">
                  {selectedDetail.lokasi || "Alamat penjemputan warga terdaftar"}
                </strong>
                {selectedDetail.detail_alamat && (
                  <p className="sdu-addr-notes">{selectedDetail.detail_alamat}</p>
                )}
                {selectedDetail.latitude && selectedDetail.longitude && (
                  <button
                    className="sdu-btn-open-maps-link"
                    onClick={() => {
                      window.open(
                        `https://www.google.com/maps/search/?api=1&query=${selectedDetail.latitude},${selectedDetail.longitude}`,
                        "_blank"
                      );
                    }}
                  >
                    <FontAwesomeIcon icon={faLocationArrow} /> Buka Titik GPS di Google Maps
                  </button>
                )}
              </div>

              {/* Catatan Warga jika ada */}
              {selectedDetail.keterangan && (
                <div className="sdu-popup-note-box">
                  <span className="sdu-tile-lbl">Catatan Tambahan Warga:</span>
                  <p>"{selectedDetail.keterangan}"</p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="sdu-popup-footer">
              <button
                className="sdu-btn-outline-popup"
                onClick={() => {
                  const item = selectedDetail;
                  setSelectedDetail(null);
                  setSelectedSlip(item);
                }}
              >
                <FontAwesomeIcon icon={faReceipt} /> Lihat Slip Digital
              </button>

              <button
                className="sdu-btn-wa-popup"
                onClick={() => openWhatsApp(selectedDetail)}
              >
                <FontAwesomeIcon icon={faWhatsapp} /> Hubungi Admin
              </button>

              <button
                className="sdu-btn-close-popup"
                onClick={() => setSelectedDetail(null)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Riwayat;
