import { useState, useEffect, useMemo } from "react";
import {
  getAllTransaksi,
  updateStatusTransaksi,
} from "../../services/transaksiService";
import AdminLayout from "../../layouts/AdminLayout";
import "./style/AdminTransaksi.css";
import StatusDropdown from "./components/StatusDropdown";
import SearchBar from "./components/SearchBar";
import { getUploadUrl } from "../../config/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faScaleBalanced,
  faReceipt,
  faBoxOpen,
  faChevronLeft,
  faChevronRight,
  faCircleInfo,
  faPhone,
  faLocationDot,
  faLocationArrow,
  faXmark,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";

function AdminTransaksi() {
  const [transaksi, setTransaksi] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [search, setSearch] = useState("");
  const [filterKategori, setFilterKategori] = useState("Semua");
  const [filterTanggal, setFilterTanggal] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Selected Detail Modal
  const [selectedDetail, setSelectedDetail] = useState(null);

  const loadTransaksi = async () => {
    try {
      setLoading(true);
      const data = await getAllTransaksi();
      setTransaksi(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading transaksi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransaksi();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await updateStatusTransaksi(id, status);
      setTransaksi((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: status } : item,
        ),
      );
      if (selectedDetail && selectedDetail.id === id) {
        setSelectedDetail((prev) => (prev ? { ...prev, status: status } : null));
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Gagal memperbarui status transaksi.");
    }
  };

  // Metrics computation
  const metrics = useMemo(() => {
    const totalBeratGr = transaksi.reduce(
      (sum, item) => sum + (Number(item.berat) || 0),
      0,
    );
    const totalNominal = transaksi.reduce(
      (sum, item) => sum + (Number(item.totalharga) || 0),
      0,
    );

    const counts = {
      Semua: transaksi.length,
      Menunggu: 0,
      Diproses: 0,
      Dijemput: 0,
      Selesai: 0,
    };

    transaksi.forEach((item) => {
      if (counts[item.status] !== undefined) {
        counts[item.status]++;
      }
    });

    return {
      totalKg: (totalBeratGr / 1000).toFixed(1),
      totalNominal,
      counts,
    };
  }, [transaksi]);

  // Filtering
  const filteredTransaksi = useMemo(() => {
    return transaksi.filter((item) => {
      // Status filter
      if (filterStatus !== "Semua" && item.status !== filterStatus) {
        return false;
      }

      // Kategori filter
      if (
        filterKategori !== "Semua" &&
        !item.kategori?.toLowerCase().includes(filterKategori.toLowerCase())
      ) {
        return false;
      }

      // Tanggal filter
      if (filterTanggal) {
        const itemDate = item.created_at?.split("T")[0];
        if (itemDate && itemDate !== filterTanggal) {
          return false;
        }
      }

      // Search keyword
      if (search) {
        const kw = search.toLowerCase();
        const namaCocok = item.nama?.toLowerCase().includes(kw);
        const hpCocok = item.no_hp?.includes(kw);
        const idCocok =
          String(item.id).includes(kw) ||
          `sdu-trx-${item.id}`.includes(kw);
        const katCocok = item.kategori?.toLowerCase().includes(kw);
        const locCocok = item.lokasi?.toLowerCase().includes(kw);
        if (!namaCocok && !hpCocok && !idCocok && !katCocok && !locCocok) {
          return false;
        }
      }

      return true;
    });
  }, [transaksi, filterStatus, filterKategori, filterTanggal, search]);

  // Pagination slice
  const totalPages = Math.ceil(filteredTransaksi.length / itemsPerPage) || 1;
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTransaksi.slice(start, start + itemsPerPage);
  }, [filteredTransaksi, currentPage, itemsPerPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Right Header Metrics Chips
  const headerRightChips = (
    <div className="sdu-admin-header-chips">
      <div className="sdu-header-chip-box">
        <div className="sdu-chip-icon-wrap green">
          <FontAwesomeIcon icon={faScaleBalanced} />
        </div>
        <div className="sdu-chip-text-wrap">
          <span className="sdu-chip-sub">TOTAL MUATAN</span>
          <span className="sdu-chip-val green">{metrics.totalKg} Kg</span>
        </div>
      </div>

      <div className="sdu-header-chip-box">
        <div className="sdu-chip-icon-wrap amber">
          <FontAwesomeIcon icon={faReceipt} />
        </div>
        <div className="sdu-chip-text-wrap">
          <span className="sdu-chip-sub">EST. NILAI TEBUSAN</span>
          <span className="sdu-chip-val amber">
            Rp {metrics.totalNominal.toLocaleString("id-ID")}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <AdminLayout
      eyebrow="OPERASIONAL LAPANGAN • Real-Time Dispatch Center"
      title="Kelola Transaksi Penjemputan Sampah"
      subtitle="Pantau, verifikasi timbangan, ubah status, dan koordinasikan kurir jemput langsung ke titik GPS warga."
      rightActions={headerRightChips}
    >
      <div className="sdu-transaksi-content-wrapper">
        {/* ========================================================
            STATUS PILL FILTERS BAR
        ======================================================== */}
        <div className="sdu-status-pills-bar">
          <button
            className={`sdu-pill-tab ${filterStatus === "Semua" ? "active" : ""}`}
            onClick={() => {
              setFilterStatus("Semua");
              setCurrentPage(1);
            }}
          >
            Semua Transaksi <span className="sdu-pill-count">{metrics.counts.Semua}</span>
          </button>

          <button
            className={`sdu-pill-tab menunggu ${filterStatus === "Menunggu" ? "active" : ""}`}
            onClick={() => {
              setFilterStatus("Menunggu");
              setCurrentPage(1);
            }}
          >
            <span className="sdu-pill-dot menunggu" />
            Menunggu <span className="sdu-pill-count">{metrics.counts.Menunggu}</span>
          </button>

          <button
            className={`sdu-pill-tab diproses ${filterStatus === "Diproses" ? "active" : ""}`}
            onClick={() => {
              setFilterStatus("Diproses");
              setCurrentPage(1);
            }}
          >
            <span className="sdu-pill-dot diproses" />
            Diproses <span className="sdu-pill-count">{metrics.counts.Diproses}</span>
          </button>

          <button
            className={`sdu-pill-tab dijemput ${filterStatus === "Dijemput" ? "active" : ""}`}
            onClick={() => {
              setFilterStatus("Dijemput");
              setCurrentPage(1);
            }}
          >
            <span className="sdu-pill-dot dijemput" />
            Dijemput <span className="sdu-pill-count">{metrics.counts.Dijemput}</span>
          </button>

          <button
            className={`sdu-pill-tab selesai ${filterStatus === "Selesai" ? "active" : ""}`}
            onClick={() => {
              setFilterStatus("Selesai");
              setCurrentPage(1);
            }}
          >
            <span className="sdu-pill-dot selesai" />
            Selesai <span className="sdu-pill-count">{metrics.counts.Selesai}</span>
          </button>
        </div>

        {/* ========================================================
            SEARCH & CATEGORY & DATE FILTER BAR
        ======================================================== */}
        <SearchBar
          search={search}
          setSearch={setSearch}
          filterKategori={filterKategori}
          setFilterKategori={setFilterKategori}
          filterTanggal={filterTanggal}
          setFilterTanggal={setFilterTanggal}
        />

        {/* ========================================================
            TRANSACTION TABLE LIST VIEW (CLEAN & MODERN)
        ======================================================== */}
        {loading ? (
          <div className="sdu-transaksi-loading">
            <div className="sdu-spinner" />
            <p>Memuat data transaksi dari server...</p>
          </div>
        ) : filteredTransaksi.length === 0 ? (
          <div className="transaksi-empty">
            <FontAwesomeIcon icon={faBoxOpen} className="empty-icon" />
            <h3>Tidak Ada Transaksi</h3>
            <p>Belum ada transaksi yang cocok dengan kriteria filter saat ini.</p>
          </div>
        ) : (
          <div className="sdu-admin-table-card">
            <div className="sdu-admin-table-scroll">
              <table className="sdu-admin-table">
                <thead>
                  <tr>
                    <th>ID & Waktu</th>
                    <th>Warga / Kontak</th>
                    <th>Kategori Material</th>
                    <th>Lokasi Penjemputan</th>
                    <th>Bobot Timbang</th>
                    <th>Estimasi Nilai</th>
                    <th>Status Transaksi</th>
                    <th className="text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((item) => {
                    const codeTrx = `#SDU-TRX-${String(item.id).padStart(4, "0")}`;
                    const beratKg = (Number(item.berat || 0) / 1000).toFixed(1);
                    const nominal = Number(item.totalharga || 0).toLocaleString("id-ID");
                    let timeStr = "-";
                    if (item.created_at) {
                      const d = new Date(item.created_at);
                      timeStr = `${d.toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                      })}, ${d.toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })} WIB`;
                    }

                    return (
                      <tr key={item.id}>
                        <td>
                          <div className="sdu-adm-code">{codeTrx}</div>
                          <span className="sdu-adm-time">{timeStr}</span>
                        </td>
                        <td>
                          <strong className="sdu-adm-warga">
                            {item.nama || "Warga SDU"}
                          </strong>
                          <div className="sdu-adm-phone">
                            <FontAwesomeIcon icon={faPhone} /> {item.no_hp || "-"}
                          </div>
                        </td>
                        <td>
                          <span className="sdu-adm-kat">{item.kategori}</span>
                          {item.keterangan && (
                            <div
                              className="sdu-adm-note"
                              title={item.keterangan}
                            >
                              {item.keterangan.length > 32
                                ? item.keterangan.slice(0, 32) + "..."
                                : item.keterangan}
                            </div>
                          )}
                        </td>
                        <td>
                          <span className="sdu-adm-loc" title={item.lokasi}>
                            {item.lokasi
                              ? item.lokasi.length > 28
                                ? item.lokasi.slice(0, 28) + "..."
                                : item.lokasi
                              : "-"}
                          </span>
                        </td>
                        <td>
                          <strong className="sdu-adm-weight">{beratKg} Kg</strong>
                          <span className="sdu-adm-gr">({item.berat || 0} gr)</span>
                        </td>
                        <td>
                          <strong className="sdu-adm-nominal">
                            Rp {nominal}
                          </strong>
                          {Number(item.bonus) > 0 && (
                            <div style={{ fontSize: "11px", color: "#059669", fontWeight: 700, marginTop: "2px" }}>
                              +Rp {Number(item.bonus).toLocaleString("id-ID")} (bonus target)
                            </div>
                          )}
                        </td>
                        <td>
                          <StatusDropdown
                            item={item}
                            updateStatus={updateStatus}
                          />
                        </td>
                        <td className="text-right">
                          <button
                            className="sdu-adm-btn-detail"
                            onClick={() => setSelectedDetail(item)}
                            title="Lihat Detail Transaksi"
                          >
                            <FontAwesomeIcon icon={faCircleInfo} />
                            <span>Detail</span>
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

        {/* ========================================================
            BOTTOM PAGINATION BAR
        ======================================================== */}
        {filteredTransaksi.length > 0 && (
          <div className="sdu-admin-pagination-bar">
            <span className="sdu-pagination-info">
              Menampilkan {currentItems.length} dari {filteredTransaksi.length} transaksi aktif
            </span>

            <div className="sdu-pagination-controls">
              <button
                className="sdu-pagination-btn nav"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                ‹ Sebelumnya
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`sdu-pagination-btn num ${currentPage === page ? "active" : ""}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              ))}

              <button
                className="sdu-pagination-btn nav"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Selanjutnya ›
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          MODAL DETAIL TRANSAKSI ADMIN (Centered Pop-Up Card)
      ======================================================== */}
      {selectedDetail && (
        <div
          className="sdu-slip-overlay"
          onClick={() => setSelectedDetail(null)}
        >
          <div
            className="sdu-detail-popup-card admin-mode"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sdu-popup-header">
              <div className="sdu-popup-title-wrap">
                <span className="sdu-popup-badge">DISPATCH & KONTROL TRANSAKSI</span>
                <h3 className="sdu-popup-code">
                  #SDU-TRX-{String(selectedDetail.id).padStart(4, "0")}
                </h3>
              </div>
              <button
                className="sdu-popup-close-btn"
                onClick={() => setSelectedDetail(null)}
                aria-label="Tutup"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            {/* Body */}
            <div className="sdu-popup-body">
              {/* Status & Quick Action */}
              <div className="sdu-admin-status-box">
                <span className="sdu-stepper-label">Ubah Status Transaksi:</span>
                <StatusDropdown
                  item={selectedDetail}
                  updateStatus={(id, st) => {
                    updateStatus(id, st);
                    setSelectedDetail((prev) =>
                      prev ? { ...prev, status: st } : null
                    );
                  }}
                />
              </div>

              {/* Citizen Information */}
              <div className="sdu-admin-warga-card">
                <div className="sdu-warga-header">
                  <span className="sdu-detail-micro-label">INFORMASI WARGA / PENYETOR</span>
                  <div className="sdu-warga-name-row">
                    <strong>{selectedDetail.nama || "Warga SDU"}</strong>
                    {selectedDetail.no_hp && (
                      <button
                        className="sdu-btn-wa-chip"
                        onClick={() => {
                          const cleanPhone = selectedDetail.no_hp
                            .replace(/^0/, "")
                            .replace(/[^0-9]/g, "");
                          const msg = `Halo Kak ${selectedDetail.nama || "Bapak/Ibu"}, kami dari Pengelola Depo SDU terkait transaksi #SDU-TRX-${String(selectedDetail.id).padStart(4, "0")}.\nStatus transaksi: *${selectedDetail.status}*.`;
                          window.open(
                            `https://wa.me/62${cleanPhone}?text=${encodeURIComponent(msg)}`,
                            "_blank"
                          );
                        }}
                      >
                        <FontAwesomeIcon icon={faWhatsapp} /> Hubungi via WhatsApp ({selectedDetail.no_hp})
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Location & GPS */}
              <div className="sdu-popup-address-card">
                <div className="sdu-addr-header">
                  <FontAwesomeIcon icon={faLocationDot} />
                  <span>Titik Penjemputan Lapangan</span>
                </div>
                <strong className="sdu-addr-main">
                  {selectedDetail.lokasi || "Alamat penjemputan warga terdaftar"}
                </strong>
                {selectedDetail.detail_alamat && (
                  <p className="sdu-addr-notes">{selectedDetail.detail_alamat}</p>
                )}
                {selectedDetail.latitude && selectedDetail.longitude ? (
                  <button
                    className="sdu-btn-open-maps-link"
                    onClick={() => {
                      window.open(
                        `https://www.google.com/maps/dir/?api=1&destination=${selectedDetail.latitude},${selectedDetail.longitude}`,
                        "_blank"
                      );
                    }}
                  >
                    <FontAwesomeIcon icon={faLocationArrow} /> Buka Rute GPS Kurir (Google Maps)
                  </button>
                ) : (
                  <button
                    className="sdu-btn-open-maps-link"
                    onClick={() => {
                      window.open(
                        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedDetail.lokasi || "Surabaya")}`,
                        "_blank"
                      );
                    }}
                  >
                    <FontAwesomeIcon icon={faLocationArrow} /> Cari Alamat di Google Maps
                  </button>
                )}
              </div>

              {/* Waste Photo */}
              {selectedDetail.foto && (
                <div className="sdu-popup-photo-card">
                  <span className="sdu-photo-caption">Foto Material Sampah:</span>
                  <img
                    src={getUploadUrl("transaksi", selectedDetail.foto)}
                    alt="Foto Material Sampah"
                    className="sdu-popup-photo-img"
                  />
                </div>
              )}

              {/* Waste Details Grid */}
              <div className="sdu-popup-grid-info">
                <div className="sdu-popup-info-tile">
                  <span className="sdu-tile-lbl">Kategori Sampah</span>
                  <strong className="sdu-tile-val">{selectedDetail.kategori}</strong>
                </div>

                <div className="sdu-popup-info-tile">
                  <span className="sdu-tile-lbl">Bobot Penimbangan</span>
                  <strong className="sdu-tile-val">
                    {((Number(selectedDetail.berat) || 0) / 1000).toFixed(1)} Kg{" "}
                    <small>({selectedDetail.berat || 0} gr)</small>
                  </strong>
                </div>

                <div className="sdu-popup-info-tile highlight">
                  <span className="sdu-tile-lbl">Nilai Tebusan</span>
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
                  <span className="sdu-tile-lbl">Waktu Masuk</span>
                  <strong className="sdu-tile-val">
                    {selectedDetail.created_at
                      ? new Date(selectedDetail.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }) + " WIB"
                      : "-"}
                  </strong>
                </div>
              </div>

              {/* Catatan Warga */}
              {selectedDetail.keterangan && (
                <div className="sdu-popup-note-box">
                  <span className="sdu-tile-lbl">Catatan Tambahan Warga:</span>
                  <p>"{selectedDetail.keterangan}"</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sdu-popup-footer">
              <button
                className="sdu-btn-close-popup w-full"
                onClick={() => setSelectedDetail(null)}
              >
                Tutup Jendela Detail
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminTransaksi;
