import React, { useState, useEffect } from "react";
import "./style/StatusDataComponent.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faArrowsRotate,
  faTruckFast,
  faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";
import { getStatusTransaksiUser } from "../../../services/transaksiService";

function StatusDataComponent() {
  const [statusData, setStatusData] = useState({
    Menunggu: 0,
    Diproses: 0,
    Dijemput: 0,
    Selesai: 0,
  });

  useEffect(() => {
    async function fetchStatusTransaksi() {
      try {
        const result = await getStatusTransaksiUser();
        if (result) {
          setStatusData(result);
        }
      } catch (error) {
        console.error("Error fetching status transactions:", error);
      }
    }
    fetchStatusTransaksi();
  }, []);

  return (
    <div className="sdu-pipeline-section">
      <div className="sdu-pipeline-header">
        <h3 className="sdu-pipeline-title">Status Alur Operasional Penjemputan</h3>
        <span className="sdu-pipeline-sub">Pemantauan real-time status siklus penjemputan aktif</span>
      </div>

      <div className="sdu-pipeline-grid">
        {/* 1. Menunggu */}
        <div className="sdu-pipeline-card menunggu">
          <div className="sdu-pipeline-icon-wrap menunggu">
            <FontAwesomeIcon icon={faClock} />
          </div>
          <div className="sdu-pipeline-info">
            <span className="sdu-pipeline-count">{statusData.Menunggu || 0}</span>
            <strong className="sdu-pipeline-label">Menunggu Verifikasi</strong>
          </div>
        </div>

        {/* 2. Diproses */}
        <div className="sdu-pipeline-card diproses">
          <div className="sdu-pipeline-icon-wrap diproses">
            <FontAwesomeIcon icon={faArrowsRotate} />
          </div>
          <div className="sdu-pipeline-info">
            <span className="sdu-pipeline-count">{statusData.Diproses || 0}</span>
            <strong className="sdu-pipeline-label">Dalam Penjadwalan</strong>
          </div>
        </div>

        {/* 3. Dijemput */}
        <div className="sdu-pipeline-card dijemput">
          <div className="sdu-pipeline-icon-wrap dijemput">
            <FontAwesomeIcon icon={faTruckFast} />
          </div>
          <div className="sdu-pipeline-info">
            <span className="sdu-pipeline-count">{statusData.Dijemput || 0}</span>
            <strong className="sdu-pipeline-label">Kurir Bergerak ke GPS</strong>
          </div>
        </div>

        {/* 4. Selesai */}
        <div className="sdu-pipeline-card selesai">
          <div className="sdu-pipeline-icon-wrap selesai">
            <FontAwesomeIcon icon={faCircleCheck} />
          </div>
          <div className="sdu-pipeline-info">
            <span className="sdu-pipeline-count">{statusData.Selesai || 0}</span>
            <strong className="sdu-pipeline-label">Selesai & Tertimbang</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatusDataComponent;
