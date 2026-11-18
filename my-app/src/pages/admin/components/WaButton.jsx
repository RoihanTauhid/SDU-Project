import React from "react";
import "./style/WaButton.css";

function WaButton({ item }) {
  const handleOpenWa = () => {
    if (!item?.no_hp) return;

    const cleanPhone = item.no_hp.replace(/^0/, "").replace(/[^0-9]/g, "");
    const namaWarga = item.nama || "Bapak/Ibu";
    const beratKg = item.berat ? (Number(item.berat) / 1000).toFixed(1) : 0;
    const nominal = item.totalharga ? item.totalharga.toLocaleString("id-ID") : "0";
    const status = item.status || "Menunggu";

    let pesanStatus = "";
    if (status === "Menunggu" || status === "Diproses") {
      pesanStatus = "kami ingin mengonfirmasi jadwal penjemputan sampah daur ulang Anda.";
    } else if (status === "Dijemput") {
      pesanStatus = "tim penjemput SDU sedang menuju lokasi Anda untuk penjemputan.";
    } else if (status === "Selesai") {
      pesanStatus = "transaksi sampah daur ulang Anda telah selesai. Terima kasih telah berkontribusi bersama SDU!";
    } else {
      pesanStatus = "kami ingin mengonfirmasi transaksi daur ulang Anda.";
    }

    const templatePesan = `Halo Kak ${namaWarga}, kami dari tim SDU (Sistem Daur Ulang).\n\nDetail Transaksi:\n- Kategori: ${item.kategori}\n- Berat: ${beratKg} Kg\n- Estimasi Payout: Rp ${nominal}\n- Lokasi: ${item.lokasi || "-"}\n\nStatus transaksi Anda saat ini: *${status}*, ${pesanStatus}`;

    const url = `https://wa.me/62${cleanPhone}?text=${encodeURIComponent(templatePesan)}`;
    window.open(url, "_blank");
  };

  return (
    <button className="btn-wa" onClick={handleOpenWa}>
      💬 WhatsApp
    </button>
  );
}

export default WaButton;
