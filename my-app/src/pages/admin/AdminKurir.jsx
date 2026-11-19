import { useState, useEffect, useMemo } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import "./style/AdminKurir.css";
import {
  getAllKurir,
  createKurir,
  updateKurir,
  updateStatusKurir,
  deleteKurir,
} from "../../services/kurirService";
import { getUploadUrl } from "../../config/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTruckFast,
  faPlus,
  faPhone,
  faMotorcycle,
  faIdCard,
  faPenToSquare,
  faTrash,
  faImage,
  faXmark,
  faSearch,
  faRoute,
  faCircleCheck,
  faCheck,
  faCamera,
} from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";

function AdminKurir() {
  const [kurirList, setKurirList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [filterKendaraan, setFilterKendaraan] = useState("Semua");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add' | 'edit'
  const [selectedKurir, setSelectedKurir] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // Preview Document Modal
  const [docModalKurir, setDocModalKurir] = useState(null);
  const [activeDocTab, setActiveDocTab] = useState("kurir"); // 'kurir' | 'ktp' | 'kendaraan'

  // Form Fields
  const [formValues, setFormValues] = useState({
    nama: "",
    username: "",
    password: "",
    no_hp: "",
    jenis_kelamin: "Laki-laki",
    umur: 25,
    jenis_kendaraan: "Motor",
    plat_kendaraan: "",
    status: "tersedia",
  });

  const [files, setFiles] = useState({
    foto_ktp: null,
    foto_kurir: null,
    foto_kendaraan: null,
  });

  const [previews, setPreviews] = useState({
    foto_ktp: "",
    foto_kurir: "",
    foto_kendaraan: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getAllKurir();
      setKurirList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Gagal memuat kurir:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Metrics
  const metrics = useMemo(() => {
    const total = kurirList.length;
    const bertugas = kurirList.filter(
      (k) => Number(k.active_tasks) > 0 || k.status === "bertugas"
    ).length;
    const tersedia = kurirList.filter(
      (k) => Number(k.active_tasks) === 0 && k.status === "tersedia"
    ).length;
    const nonaktif = kurirList.filter((k) => k.status === "nonaktif").length;
    return { total, bertugas, tersedia, nonaktif };
  }, [kurirList]);

  // Filtered List
  const filteredKurir = useMemo(() => {
    return kurirList.filter((k) => {
      const q = search.toLowerCase();
      const matchSearch =
        k.nama?.toLowerCase().includes(q) ||
        k.username?.toLowerCase().includes(q) ||
        k.plat_kendaraan?.toLowerCase().includes(q) ||
        k.no_hp?.includes(q);

      const matchStatus =
        filterStatus === "Semua" ||
        (filterStatus === "Bertugas" &&
          (Number(k.active_tasks) > 0 || k.status === "bertugas")) ||
        (filterStatus === "Tersedia" &&
          Number(k.active_tasks) === 0 &&
          k.status === "tersedia") ||
        (filterStatus === "Nonaktif" && k.status === "nonaktif");

      const matchKendaraan =
        filterKendaraan === "Semua" || k.jenis_kendaraan === filterKendaraan;

      return matchSearch && matchStatus && matchKendaraan;
    });
  }, [kurirList, search, filterStatus, filterKendaraan]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setModalMode("add");
    setSelectedKurir(null);
    setFormError("");
    setFormValues({
      nama: "",
      username: "",
      password: "",
      no_hp: "",
      jenis_kelamin: "Laki-laki",
      umur: 25,
      jenis_kendaraan: "Motor",
      plat_kendaraan: "",
      status: "tersedia",
    });
    setFiles({ foto_ktp: null, foto_kurir: null, foto_kendaraan: null });
    setPreviews({ foto_ktp: "", foto_kurir: "", foto_kendaraan: "" });
    setModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (kurir) => {
    setModalMode("edit");
    setSelectedKurir(kurir);
    setFormError("");
    setFormValues({
      nama: kurir.nama || "",
      username: kurir.username || "",
      password: "", // Kosongkan jika tidak ingin ganti password
      no_hp: kurir.no_hp || "",
      jenis_kelamin: kurir.jenis_kelamin || "Laki-laki",
      umur: kurir.umur || 25,
      jenis_kendaraan: kurir.jenis_kendaraan || "Motor",
      plat_kendaraan: kurir.plat_kendaraan || "",
      status: kurir.status || "tersedia",
    });
    setFiles({ foto_ktp: null, foto_kurir: null, foto_kendaraan: null });
    setPreviews({
      foto_ktp: kurir.foto_ktp ? getUploadUrl("kurir", kurir.foto_ktp) : "",
      foto_kurir: kurir.foto_kurir ? getUploadUrl("kurir", kurir.foto_kurir) : "",
      foto_kendaraan: kurir.foto_kendaraan
        ? getUploadUrl("kurir", kurir.foto_kendaraan)
        : "",
    });
    setModalOpen(true);
  };

  // Handle File Change with Preview
  const handleFileChange = (field, file) => {
    if (!file) return;
    setFiles((prev) => ({ ...prev, [field]: file }));
    const objectUrl = URL.createObjectURL(file);
    setPreviews((prev) => ({ ...prev, [field]: objectUrl }));
  };

  // Handle Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formValues.nama.trim() || !formValues.no_hp.trim() || !formValues.plat_kendaraan.trim()) {
      setFormError("Nama, nomor HP, dan plat kendaraan wajib diisi!");
      return;
    }

    if (modalMode === "add") {
      if (!formValues.username.trim() || !formValues.password.trim()) {
        setFormError("Username dan Password akun kurir wajib diisi!");
        return;
      }
    }

    try {
      setSubmitLoading(true);
      const data = new FormData();
      data.append("nama", formValues.nama.trim());
      data.append("no_hp", formValues.no_hp.trim());
      data.append("jenis_kelamin", formValues.jenis_kelamin);
      data.append("umur", formValues.umur);
      data.append("jenis_kendaraan", formValues.jenis_kendaraan);
      data.append("plat_kendaraan", formValues.plat_kendaraan.trim().toUpperCase());
      data.append("status", formValues.status);

      if (modalMode === "add") {
        data.append("username", formValues.username.trim());
        data.append("password", formValues.password.trim());
      } else if (formValues.password.trim()) {
        data.append("password", formValues.password.trim());
      }

      if (files.foto_ktp) data.append("foto_ktp", files.foto_ktp);
      if (files.foto_kurir) data.append("foto_kurir", files.foto_kurir);
      if (files.foto_kendaraan) data.append("foto_kendaraan", files.foto_kendaraan);

      if (modalMode === "add") {
        await createKurir(data);
      } else {
        await updateKurir(selectedKurir.id, data);
      }

      setModalOpen(false);
      loadData();
    } catch (err) {
      setFormError(err.message || "Gagal menyimpan data kurir");
    } finally {
      setSubmitLoading(false);
    }
  };

  // Toggle Status
  const handleToggleStatus = async (kurir) => {
    const nextStatus = kurir.status === "nonaktif" ? "tersedia" : "nonaktif";
    const konfirm = window.confirm(
      `Ubah status kurir ${kurir.nama} menjadi '${nextStatus.toUpperCase()}'?`
    );
    if (!konfirm) return;

    try {
      await updateStatusKurir(kurir.id, nextStatus);
      setKurirList((prev) =>
        prev.map((k) => (k.id === kurir.id ? { ...k, status: nextStatus } : k))
      );
    } catch (err) {
      alert(err.message || "Gagal mengubah status");
    }
  };

  // Delete Kurir
  const handleDelete = async (kurir) => {
    const konfirm = window.confirm(
      `Hapus kurir '${kurir.nama}'? Akun login dan penugasan kurir ini akan dihapus secara permanen.`
    );
    if (!konfirm) return;

    try {
      await deleteKurir(kurir.id);
      setKurirList((prev) => prev.filter((k) => k.id !== kurir.id));
    } catch (err) {
      alert(err.message || "Gagal menghapus kurir");
    }
  };

  return (
    <AdminLayout>
      <div className="sdu-admin-kurir-page">
        {/* ================= HEADER SECTION ================= */}
        <div className="sdu-kurir-header-banner">
          <div>
            <div className="sdu-kurir-title-row">
              <div className="sdu-kurir-icon-badge">
                <FontAwesomeIcon icon={faTruckFast} />
              </div>
              <div>
                <h1 className="sdu-kurir-title">Kelola & Monitoring Kurir</h1>
                <p className="sdu-kurir-subtitle">
                  Pantau armada kurir, beban orderan jemput sampah, dan akun petugas operasional.
                </p>
              </div>
            </div>
          </div>

          <button className="sdu-btn-add-kurir" onClick={handleOpenAdd}>
            <FontAwesomeIcon icon={faPlus} /> Tambah Kurir Baru
          </button>
        </div>

        {/* ================= METRICS STATS CARDS ================= */}
        <div className="sdu-kurir-stats-grid">
          <div className="sdu-kurir-stat-card">
            <div className="sdu-kurir-stat-icon blue">
              <FontAwesomeIcon icon={faTruckFast} />
            </div>
            <div>
              <span className="sdu-stat-label">Total Armada Kurir</span>
              <h3 className="sdu-stat-value">{metrics.total} Orang</h3>
            </div>
          </div>

          <div className="sdu-kurir-stat-card highlight">
            <div className="sdu-kurir-stat-icon amber">
              <FontAwesomeIcon icon={faRoute} />
            </div>
            <div>
              <span className="sdu-stat-label">Sedang Bertugas</span>
              <h3 className="sdu-stat-value amber">{metrics.bertugas} Kurir</h3>
              <span className="sdu-stat-desc">Ada tugas penjemputan aktif</span>
            </div>
          </div>

          <div className="sdu-kurir-stat-card">
            <div className="sdu-kurir-stat-icon green">
              <FontAwesomeIcon icon={faCircleCheck} />
            </div>
            <div>
              <span className="sdu-stat-label">Siap / Tersedia</span>
              <h3 className="sdu-stat-value green">{metrics.tersedia} Kurir</h3>
              <span className="sdu-stat-desc">Standby siap ditugaskan</span>
            </div>
          </div>

          <div className="sdu-kurir-stat-card">
            <div className="sdu-kurir-stat-icon gray">
              <FontAwesomeIcon icon={faIdCard} />
            </div>
            <div>
              <span className="sdu-stat-label">Kurir Nonaktif / Cuti</span>
              <h3 className="sdu-stat-value gray">{metrics.nonaktif} Kurir</h3>
            </div>
          </div>
        </div>

        {/* ================= FILTER & SEARCH BAR ================= */}
        <div className="sdu-kurir-filter-row">
          <div className="sdu-kurir-search-box">
            <FontAwesomeIcon icon={faSearch} />
            <input
              type="text"
              placeholder="Cari nama, username, plat nomor, atau no HP kurir..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="sdu-clear-search" onClick={() => setSearch("")}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            )}
          </div>

          <div className="sdu-kurir-filters-group">
            <div className="sdu-filter-pill-wrapper">
              {["Semua", "Bertugas", "Tersedia", "Nonaktif"].map((st) => (
                <button
                  key={st}
                  className={`sdu-filter-pill ${filterStatus === st ? "active" : ""}`}
                  onClick={() => setFilterStatus(st)}
                >
                  {st}
                </button>
              ))}
            </div>

            <select
              className="sdu-select-kendaraan"
              value={filterKendaraan}
              onChange={(e) => setFilterKendaraan(e.target.value)}
            >
              <option value="Semua">Semua Armada</option>
              <option value="Motor">Motor</option>
              <option value="Tosa / Roda 3">Tosa / Roda 3</option>
              <option value="Mobil Pickup">Mobil Pickup</option>
              <option value="Becak Motor">Becak Motor</option>
            </select>
          </div>
        </div>

        {/* ================= COURIER LIST CARDS GRID ================= */}
        {loading ? (
          <div className="sdu-kurir-loading">
            <div className="sdu-spinner" />
            <p>Memuat armada kurir...</p>
          </div>
        ) : filteredKurir.length === 0 ? (
          <div className="sdu-kurir-empty">
            <FontAwesomeIcon icon={faTruckFast} className="empty-icon" />
            <h3>Tidak Ada Kurir Ditemukan</h3>
            <p>Belum ada data kurir yang cocok dengan pencarian atau filter Anda.</p>
          </div>
        ) : (
          <div className="sdu-kurir-card-grid">
            {filteredKurir.map((kurir) => {
              const activeCount = Number(kurir.active_tasks) || 0;
              const isOnDuty = activeCount > 0 || kurir.status === "bertugas";
              const isNonaktif = kurir.status === "nonaktif";

              return (
                <div key={kurir.id} className={`sdu-kcard ${isOnDuty ? "on-duty" : ""}`}>
                  {/* Card Header & Avatar */}
                  <div className="sdu-kcard-header">
                    <div className="sdu-kcard-user-info">
                      <div className="sdu-kcard-avatar-wrap">
                        {kurir.foto_kurir ? (
                          <img
                            src={getUploadUrl("kurir", kurir.foto_kurir)}
                            alt={kurir.nama}
                            className="sdu-kcard-avatar"
                          />
                        ) : (
                          <div className="sdu-kcard-avatar-dummy">
                            {kurir.nama?.charAt(0)?.toUpperCase() || "K"}
                          </div>
                        )}
                        <span
                          className={`sdu-kcard-status-dot ${
                            isNonaktif ? "gray" : isOnDuty ? "amber" : "green"
                          }`}
                        />
                      </div>

                      <div className="sdu-kcard-meta">
                        <h4 className="sdu-kcard-name">{kurir.nama}</h4>
                        <span className="sdu-kcard-sub">
                          @{kurir.username || "kurir"} • {kurir.jenis_kelamin}, {kurir.umur} thn
                        </span>
                      </div>
                    </div>

                    <span
                      className={`sdu-status-badge ${
                        isNonaktif ? "nonaktif" : isOnDuty ? "bertugas" : "tersedia"
                      }`}
                    >
                      {isNonaktif ? "Nonaktif" : isOnDuty ? "Bertugas" : "Tersedia"}
                    </span>
                  </div>

                  {/* Vehicle & Plate Info */}
                  <div className="sdu-kcard-vehicle-box">
                    <div className="sdu-vehicle-left">
                      <FontAwesomeIcon icon={faMotorcycle} className="v-icon" />
                      <div>
                        <span className="v-type">{kurir.jenis_kendaraan}</span>
                        <strong className="v-plate">{kurir.plat_kendaraan}</strong>
                      </div>
                    </div>

                    <div className="sdu-vehicle-load">
                      <span className="load-label">Beban Tugas</span>
                      <strong className={`load-val ${activeCount > 0 ? "busy" : "free"}`}>
                        {activeCount > 0 ? `${activeCount} Order Jalan` : "0 (Siap)"}
                      </strong>
                    </div>
                  </div>

                  {/* Contact & WA */}
                  <div className="sdu-kcard-contact-row">
                    <div className="sdu-kcard-phone">
                      <FontAwesomeIcon icon={faPhone} />
                      <span>{kurir.no_hp || "-"}</span>
                    </div>

                    {kurir.no_hp && (
                      <a
                        href={`https://wa.me/${kurir.no_hp.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="sdu-btn-wa-kurir"
                        title="Chat WhatsApp Kurir"
                      >
                        <FontAwesomeIcon icon={faWhatsapp} /> Chat WA
                      </a>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="sdu-kcard-actions">
                    <button
                      className="sdu-action-btn view-docs"
                      title="Lihat Berkas Foto KTP & Kendaraan"
                      onClick={() => {
                        setDocModalKurir(kurir);
                        setActiveDocTab("kurir");
                      }}
                    >
                      <FontAwesomeIcon icon={faImage} /> Berkas
                    </button>

                    <button
                      className="sdu-action-btn edit"
                      title="Edit Data Kurir"
                      onClick={() => handleOpenEdit(kurir)}
                    >
                      <FontAwesomeIcon icon={faPenToSquare} /> Edit
                    </button>

                    <button
                      className={`sdu-action-btn toggle ${isNonaktif ? "activate" : "deactivate"}`}
                      title={isNonaktif ? "Aktifkan Kurir" : "Nonaktifkan Kurir"}
                      onClick={() => handleToggleStatus(kurir)}
                    >
                      {isNonaktif ? "Aktifkan" : "Liburkan"}
                    </button>

                    <button
                      className="sdu-action-btn delete"
                      title="Hapus Kurir"
                      onClick={() => handleDelete(kurir)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ================= MODAL ADD / EDIT KURIR ================= */}
        {modalOpen && (
          <div className="sdu-modal-overlay">
            <div className="sdu-kurir-modal-card">
              <div className="sdu-modal-header">
                <div>
                  <h3>{modalMode === "add" ? "Tambah Kurir Baru" : "Edit Profil Kurir"}</h3>
                  <p>Lengkapi formulir kurir dan armada untuk operasional penjemputan sampah.</p>
                </div>
                <button className="sdu-modal-close" onClick={() => setModalOpen(false)}>
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>

              {formError && <div className="sdu-modal-error-alert">{formError}</div>}

              <form onSubmit={handleSubmit} className="sdu-kurir-form">
                <div className="sdu-form-row">
                  <div className="sdu-form-group">
                    <label>Nama Lengkap Kurir *</label>
                    <input
                      type="text"
                      placeholder="Contoh: Budi Santoso"
                      required
                      value={formValues.nama}
                      onChange={(e) => setFormValues({ ...formValues, nama: e.target.value })}
                    />
                  </div>

                  <div className="sdu-form-group">
                    <label>Nomor WhatsApp Aktif *</label>
                    <input
                      type="text"
                      placeholder="Contoh: 081234567890"
                      required
                      value={formValues.no_hp}
                      onChange={(e) => setFormValues({ ...formValues, no_hp: e.target.value })}
                    />
                  </div>
                </div>

                <div className="sdu-form-row">
                  <div className="sdu-form-group">
                    <label>Jenis Kelamin</label>
                    <select
                      value={formValues.jenis_kelamin}
                      onChange={(e) =>
                        setFormValues({ ...formValues, jenis_kelamin: e.target.value })
                      }
                    >
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>

                  <div className="sdu-form-group">
                    <label>Umur (Tahun)</label>
                    <input
                      type="number"
                      min="17"
                      max="70"
                      value={formValues.umur}
                      onChange={(e) =>
                        setFormValues({ ...formValues, umur: Number(e.target.value) })
                      }
                    />
                  </div>
                </div>

                {/* Account Credentials */}
                <div className="sdu-form-section-title">Akun Login Kurir di Aplikasi</div>
                <div className="sdu-form-row">
                  <div className="sdu-form-group">
                    <label>Username Login {modalMode === "add" && "*"}</label>
                    <input
                      type="text"
                      placeholder="Contoh: budi_kurir"
                      disabled={modalMode === "edit"}
                      required={modalMode === "add"}
                      value={formValues.username}
                      onChange={(e) =>
                        setFormValues({ ...formValues, username: e.target.value })
                      }
                    />
                    {modalMode === "edit" && (
                      <span className="sdu-field-hint">Username tidak dapat diubah</span>
                    )}
                  </div>

                  <div className="sdu-form-group">
                    <label>
                      Password {modalMode === "add" ? "*" : "(Kosongkan jika tidak diganti)"}
                    </label>
                    <input
                      type="password"
                      placeholder={modalMode === "add" ? "Minimal 4 karakter" : "Password baru..."}
                      required={modalMode === "add"}
                      value={formValues.password}
                      onChange={(e) =>
                        setFormValues({ ...formValues, password: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Vehicle Section */}
                <div className="sdu-form-section-title">Armada Kendaraan Penjemputan</div>
                <div className="sdu-form-row">
                  <div className="sdu-form-group">
                    <label>Jenis Kendaraan *</label>
                    <select
                      value={formValues.jenis_kendaraan}
                      onChange={(e) =>
                        setFormValues({ ...formValues, jenis_kendaraan: e.target.value })
                      }
                    >
                      <option value="Motor">Motor</option>
                      <option value="Tosa / Roda 3">Tosa / Roda 3</option>
                      <option value="Mobil Pickup">Mobil Pickup</option>
                      <option value="Becak Motor">Becak Motor</option>
                      <option value="Gerobak">Gerobak</option>
                    </select>
                  </div>

                  <div className="sdu-form-group">
                    <label>Plat Nomor Polisi *</label>
                    <input
                      type="text"
                      placeholder="Contoh: BA 1234 XY"
                      required
                      value={formValues.plat_kendaraan}
                      onChange={(e) =>
                        setFormValues({
                          ...formValues,
                          plat_kendaraan: e.target.value.toUpperCase(),
                        })
                      }
                    />
                  </div>
                </div>

                {/* File Uploads Grid */}
                <div className="sdu-form-section-title">Upload Dokumen & Berkas (JPG/PNG)</div>
                <div className="sdu-upload-fields-grid">
                  {/* Foto Kurir */}
                  <div className="sdu-upload-slot">
                    <span className="slot-title">Pasfoto Kurir</span>
                    <label className="sdu-file-dropzone">
                      {previews.foto_kurir ? (
                        <img src={previews.foto_kurir} alt="Kurir" className="preview-img" />
                      ) : (
                        <div className="drop-content">
                          <FontAwesomeIcon icon={faCamera} />
                          <span>Pilih Foto</span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange("foto_kurir", e.target.files[0])}
                      />
                    </label>
                  </div>

                  {/* Foto KTP */}
                  <div className="sdu-upload-slot">
                    <span className="slot-title">Foto KTP Kurir</span>
                    <label className="sdu-file-dropzone">
                      {previews.foto_ktp ? (
                        <img src={previews.foto_ktp} alt="KTP" className="preview-img" />
                      ) : (
                        <div className="drop-content">
                          <FontAwesomeIcon icon={faIdCard} />
                          <span>Pilih Foto</span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange("foto_ktp", e.target.files[0])}
                      />
                    </label>
                  </div>

                  {/* Foto Kendaraan */}
                  <div className="sdu-upload-slot">
                    <span className="slot-title">Foto Kendaraan</span>
                    <label className="sdu-file-dropzone">
                      {previews.foto_kendaraan ? (
                        <img src={previews.foto_kendaraan} alt="Kendaraan" className="preview-img" />
                      ) : (
                        <div className="drop-content">
                          <FontAwesomeIcon icon={faMotorcycle} />
                          <span>Pilih Foto</span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange("foto_kendaraan", e.target.files[0])}
                      />
                    </label>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="sdu-modal-actions">
                  <button
                    type="button"
                    className="sdu-btn-cancel"
                    onClick={() => setModalOpen(false)}
                    disabled={submitLoading}
                  >
                    Batal
                  </button>

                  <button type="submit" className="sdu-btn-submit" disabled={submitLoading}>
                    {submitLoading ? (
                      "Menyimpan..."
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faCheck} /> Simpan Data Kurir
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= MODAL PREVIEW DOKUMEN / FOTO ================= */}
        {docModalKurir && (
          <div className="sdu-modal-overlay">
            <div className="sdu-doc-preview-modal">
              <div className="sdu-modal-header">
                <div>
                  <h3>Berkas Dokumen: {docModalKurir.nama}</h3>
                  <p>Plat: {docModalKurir.plat_kendaraan} • {docModalKurir.jenis_kendaraan}</p>
                </div>
                <button className="sdu-modal-close" onClick={() => setDocModalKurir(null)}>
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>

              {/* Tabs */}
              <div className="sdu-doc-tabs">
                <button
                  className={`sdu-doc-tab ${activeDocTab === "kurir" ? "active" : ""}`}
                  onClick={() => setActiveDocTab("kurir")}
                >
                  Pasfoto Kurir
                </button>
                <button
                  className={`sdu-doc-tab ${activeDocTab === "ktp" ? "active" : ""}`}
                  onClick={() => setActiveDocTab("ktp")}
                >
                  Foto KTP
                </button>
                <button
                  className={`sdu-doc-tab ${activeDocTab === "kendaraan" ? "active" : ""}`}
                  onClick={() => setActiveDocTab("kendaraan")}
                >
                  Foto Armada Kendaraan
                </button>
              </div>

              {/* Tab Content */}
              <div className="sdu-doc-view-area">
                {activeDocTab === "kurir" && (
                  docModalKurir.foto_kurir ? (
                    <img
                      src={getUploadUrl("kurir", docModalKurir.foto_kurir)}
                      alt="Foto Kurir"
                      className="sdu-doc-img-full"
                    />
                  ) : (
                    <div className="sdu-doc-empty">Foto Kurir Belum Diunggah</div>
                  )
                )}

                {activeDocTab === "ktp" && (
                  docModalKurir.foto_ktp ? (
                    <img
                      src={getUploadUrl("kurir", docModalKurir.foto_ktp)}
                      alt="Foto KTP"
                      className="sdu-doc-img-full"
                    />
                  ) : (
                    <div className="sdu-doc-empty">Foto KTP Belum Diunggah</div>
                  )
                )}

                {activeDocTab === "kendaraan" && (
                  docModalKurir.foto_kendaraan ? (
                    <img
                      src={getUploadUrl("kurir", docModalKurir.foto_kendaraan)}
                      alt="Foto Kendaraan"
                      className="sdu-doc-img-full"
                    />
                  ) : (
                    <div className="sdu-doc-empty">Foto Kendaraan Belum Diunggah</div>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminKurir;
