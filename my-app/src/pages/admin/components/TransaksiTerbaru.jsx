import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faReceipt, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import "./style/TransaksiTerbaru.css";

const TransaksiTerbaru = ({ transactions = [] }) => {
  return (
    <div className="sdu-admin-recent-card">
      <div className="sdu-recent-header">
        <div className="sdu-recent-title-group">
          <div className="sdu-recent-icon-wrap receipt">
            <FontAwesomeIcon icon={faReceipt} />
          </div>
          <div>
            <h3 className="sdu-recent-title">Transaksi Terkini</h3>
            <span className="sdu-recent-sub">5 transaksi terakhir yang masuk sistem</span>
          </div>
        </div>

        <Link to="/admin/transaksi" className="sdu-recent-link">
          <span>Kelola Semua</span>
          <FontAwesomeIcon icon={faArrowRight} />
        </Link>
      </div>

      <div className="sdu-recent-list">
        {transactions.length === 0 ? (
          <div className="sdu-recent-empty">Belum ada transaksi terekam.</div>
        ) : (
          transactions.slice(0, 5).map((item) => {
            const beratKg = (Number(item.berat || 0) / 1000).toFixed(1);
            const statusKey = item.status?.toLowerCase() || "menunggu";

            return (
              <div className="sdu-recent-item" key={item.id}>
                <div className="sdu-recent-item-left">
                  <div className="sdu-recent-item-main">
                    <strong className="sdu-item-name">{item.nama || "Warga SDU"}</strong>
                    <span className="sdu-item-cat">
                      {item.kategori} • {beratKg} Kg
                    </span>
                  </div>
                </div>

                <div className="sdu-recent-item-right">
                  <span className="sdu-item-nominal">
                    Rp {Number(item.totalharga || 0).toLocaleString("id-ID")}
                  </span>
                  <span className={`sdu-item-status-pill ${statusKey}`}>
                    {item.status}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TransaksiTerbaru;
