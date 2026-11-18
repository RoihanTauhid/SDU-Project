import React from "react";
import "./style/StatusDropdown.css";

function StatusDropdown({ item, updateStatus }) {
  const getStatusLabel = (status) => {
    switch (status) {
      case "Menunggu":
        return "🕒 Menunggu";
      case "Diproses":
        return "🔄 Diproses";
      case "Dijemput":
        return "🚚 Dijemput (Kurir OTW)";
      case "Selesai":
        return "✅ Selesai & Cair";
      default:
        return status;
    }
  };

  return (
    <div className={`sdu-status-dropdown-wrapper ${item.status?.toLowerCase() || "menunggu"}`}>
      <select
        className="sdu-status-select"
        value={item.status}
        onChange={(e) => updateStatus(item.id, e.target.value)}
        title="Ubah status transaksi"
      >
        <option value="Menunggu">🕒 Menunggu</option>
        <option value="Diproses">🔄 Diproses</option>
        <option value="Dijemput">🚚 Dijemput (Kurir OTW)</option>
        <option value="Selesai">✅ Selesai & Cair</option>
      </select>
      <span className="sdu-select-chevron">▾</span>
    </div>
  );
}

export default StatusDropdown;
