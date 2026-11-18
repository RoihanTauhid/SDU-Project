import React from "react";
import "./style/SearchBar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faLayerGroup,
  faCalendarDays,
} from "@fortawesome/free-solid-svg-icons";

function SearchBar({
  search,
  setSearch,
  filterKategori,
  setFilterKategori,
  filterTanggal,
  setFilterTanggal,
}) {
  return (
    <div className="sdu-admin-filter-bar">
      {/* 1. Search Text Input */}
      <div className="sdu-search-input-wrap">
        <FontAwesomeIcon icon={faMagnifyingGlass} className="sdu-search-icon" />
        <input
          type="text"
          placeholder="Cari nama warga, nomor WhatsApp, atau ID TRX..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* 2. Category Dropdown */}
      <div className="sdu-category-filter-wrap">
        <FontAwesomeIcon icon={faLayerGroup} className="sdu-cat-icon" />
        <select
          value={filterKategori}
          onChange={(e) => setFilterKategori(e.target.value)}
        >
          <option value="Semua">Semua Kategori Sampah</option>
          <option value="Plastik">Plastik (PET & HDPE)</option>
          <option value="Kardus">Kardus & Kertas</option>
          <option value="Kaleng">Kaleng & Aluminium</option>
          <option value="Besi">Besi & Logam</option>
          <option value="Botol">Botol Kaca</option>
          <option value="Pecah Belah">Pecah Belah</option>
        </select>
      </div>

      {/* 3. Date Filter */}
      <div className="sdu-date-filter-wrap">
        <FontAwesomeIcon icon={faCalendarDays} className="sdu-date-icon" />
        <input
          type="date"
          value={filterTanggal || ""}
          onChange={(e) => setFilterTanggal(e.target.value)}
          placeholder="Pilih Tanggal"
        />
      </div>
    </div>
  );
}

export default SearchBar;
