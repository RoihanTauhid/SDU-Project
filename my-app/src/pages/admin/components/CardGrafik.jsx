import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  getGrafikTransaksi,
  getGrafikKategori,
} from "../../../services/transaksiService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartSimple, faChartPie } from "@fortawesome/free-solid-svg-icons";
import "./style/CardGrafik.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

const WARNA_KATEGORI = [
  "#0f3e2e",
  "#059669",
  "#10b981",
  "#2563eb",
  "#d97706",
  "#8b5cf6",
];

function CardGrafik() {
  const [grafikData, setGrafikData] = useState([]);
  const [kategoriData, setKategoriData] = useState([]);

  const namaBulan = [
    "",
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];

  const chartData = {
    labels:
      grafikData.length > 0
        ? grafikData.map((item) => namaBulan[item.bulan] || `Bln ${item.bulan}`)
        : ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"],
    datasets: [
      {
        label: "Jumlah Transaksi Warga",
        data:
          grafikData.length > 0
            ? grafikData.map((item) => item.total)
            : [4, 7, 12, 18, 24, 27],
        backgroundColor: "#059669",
        hoverBackgroundColor: "#0f3e2e",
        borderRadius: 8,
        maxBarThickness: 36,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#0f172a",
        titleFont: { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
        bodyFont: { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        ticks: { color: "#64748b", font: { family: "'Plus Jakarta Sans', sans-serif", size: 12 } },
        grid: { display: false },
        border: { display: false },
      },
      y: {
        ticks: { color: "#64748b", font: { family: "'Plus Jakarta Sans', sans-serif", size: 12 }, stepSize: 5 },
        grid: { color: "#f1f5f9" },
        border: { display: false },
      },
    },
  };

  const kategoriChartData = {
    labels:
      kategoriData.length > 0
        ? kategoriData.map((item) => item.kategori)
        : ["Plastik", "Kardus", "Kaleng", "Besi", "Botol"],
    datasets: [
      {
        data:
          kategoriData.length > 0
            ? kategoriData.map((item) => item.total)
            : [35, 25, 20, 12, 8],
        backgroundColor: WARNA_KATEGORI,
        borderColor: "#ffffff",
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  };

  const kategoriOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#475569",
          font: { family: "'Plus Jakarta Sans', sans-serif", size: 11, weight: 600 },
          boxWidth: 12,
          padding: 14,
        },
      },
      tooltip: {
        backgroundColor: "#0f172a",
        titleFont: { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
        bodyFont: { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
        padding: 10,
        cornerRadius: 8,
      },
    },
    cutout: "68%",
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const dataGrafik = await getGrafikTransaksi(setGrafikData);
        if (Array.isArray(dataGrafik)) setGrafikData(dataGrafik);

        const dataKategori = await getGrafikKategori(setKategoriData);
        if (Array.isArray(dataKategori)) setKategoriData(dataKategori);
      } catch (err) {
        console.error(err);
      }
    };

    loadData();
  }, []);

  return (
    <div className="sdu-admin-charts-grid">
      {/* Chart 1: Transaksi Bulanan */}
      <div className="sdu-chart-card">
        <div className="sdu-chart-header">
          <div className="sdu-chart-title-wrap">
            <div className="sdu-chart-icon-box green">
              <FontAwesomeIcon icon={faChartSimple} />
            </div>
            <div>
              <h3 className="sdu-chart-title">Volume Transaksi Bulanan</h3>
              <span className="sdu-chart-sub">Pergerakan total penjemputan terkelola</span>
            </div>
          </div>
          <span className="sdu-chart-badge">+28% Kuartal Ini</span>
        </div>
        <div className="sdu-chart-canvas-wrap">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Chart 2: Komposisi Kategori */}
      <div className="sdu-chart-card">
        <div className="sdu-chart-header">
          <div className="sdu-chart-title-wrap">
            <div className="sdu-chart-icon-box blue">
              <FontAwesomeIcon icon={faChartPie} />
            </div>
            <div>
              <h3 className="sdu-chart-title">Komposisi Komoditas</h3>
              <span className="sdu-chart-sub">Distribusi material berdasarkan setoran warga</span>
            </div>
          </div>
        </div>
        <div className="sdu-chart-canvas-wrap doughnut">
          <Doughnut data={kategoriChartData} options={kategoriOptions} />
        </div>
      </div>
    </div>
  );
}

export default CardGrafik;
