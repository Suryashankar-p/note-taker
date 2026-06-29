import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const DispersionCharts = () => {
  const dispersionCurveData = {
    labels: Array.from({ length: 40 }, (_, i) => `${i * 2.5}%`),
    datasets: [
      {
        label: "Baseline",
        data: Array.from({ length: 40 }, (_, i) => Math.exp(-Math.pow(i - 20, 2) / 45) * 80),
        borderColor: "#94a3b8",
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointRadius: 0,
      },
      {
        label: "Current Quarter",
        data: Array.from({ length: 40 }, (_, i) => Math.exp(-Math.pow(i - 23, 2) / 30) * 95),
        borderColor: "#a61c1e",
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };

  const trendData = {
    labels: ["Q1 FY 24", "Q2 FY 24", "Q3 FY 24", "Q4 FY 24", "Q1 FY 25", "Q2 FY 25", "Q3 FY 25", "Q4 FY 25"],
    datasets: [
      {
        label: "Mean GM%",
        data: [50, 48, 52, 51, 53, 50, 52, 55],
        borderColor: "#0ea5e9",
        borderWidth: 2.5,
        fill: false,
        tension: 0.3,
        pointRadius: 3,
      },
      {
        label: "Confidence Band",
        data: [55, 53, 57, 56, 58, 55, 57, 60],
        borderColor: "rgba(14, 165, 233, 0.05)",
        backgroundColor: "rgba(14, 165, 233, 0.05)",
        fill: "+1",
        tension: 0.3,
        pointRadius: 0,
      },
      {
        label: "Lower Band",
        data: [45, 43, 47, 46, 48, 45, 47, 50],
        borderColor: "rgba(14, 165, 233, 0.05)",
        fill: false,
        tension: 0.3,
        pointRadius: 0,
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
    },
    scales: {
      y: {
        grid: { color: "#e2e8f0" },
        ticks: { color: "#64748b" },
      },
      x: {
        grid: { display: false },
        ticks: { color: "#64748b" },
      },
    },
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 border-b border-gray-150 pb-4">
        <h3 className="text-base font-bold text-gray-900">Family-level GM% dispersion — Air nozzle</h3>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1 rounded-md">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Classification</span>
            <select className="bg-transparent text-xs font-semibold text-gray-700 outline-none border-none cursor-pointer">
              <option>All</option>
            </select>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1 rounded-md">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Product Family</span>
            <select className="bg-transparent text-xs font-semibold text-gray-700 outline-none border-none cursor-pointer">
              <option>Air nozzle</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h4 className="text-xs font-bold text-gray-700 mb-2">Dispersion curve of gross margins</h4>
          <p className="text-[10px] text-gray-400 mb-4">Baseline vs last vs current quarter - normalized frequency</p>
          <div className="h-56">
            <Line data={dispersionCurveData} options={chartOptions} />
          </div>
        </div>
        <div>
          <h4 className="text-xs font-bold text-gray-700 mb-2">GM% distribution trend — quarter on quarter</h4>
          <p className="text-[10px] text-gray-400 mb-4">Mean GM% with ±1σ confidence band</p>
          <div className="h-56">
            <Line data={trendData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DispersionCharts;
