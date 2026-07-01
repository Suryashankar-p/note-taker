import React, { useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SkyscraperChart = () => {
  const [compareMode, setCompareMode] = useState<"target" | "baseline">("target");

  const chartLabels = Array.from({ length: 45 }, (_, i) => `Family ${i + 1}`);
  const chartDeltas = [
    12.3, 10.3, 8.0, 5.8, 5.4, 5.2, 4.8, 4.3, 4.3, 3.5, 2.7, 1.8, 1.0, 0.5, 0.2,
    -0.1, -0.4, -0.9, -1.2, -1.8, -2.1, -2.5, -3.0, -3.2, -3.8, -4.1, -4.5, -5.0,
    -5.4, -5.8, -6.1, -6.5, -7.0, -7.8, -8.2, -8.9, -9.5, -10.1, -11.0, -11.7,
    -12.5, -13.2, -15.0, -17.4, -19.1
  ];

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: "Margin Delta (pp)",
        data: chartDeltas,
        backgroundColor: chartDeltas.map((val) =>
          val >= 0 ? "rgba(16, 185, 129, 0.75)" : "rgba(225, 29, 72, 0.75)"
        ),
        borderRadius: 2,
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
        backgroundColor: "#1e293b",
        callbacks: {
          label: (context: any) => `Delta: ${context.parsed.y > 0 ? "+" : ""}${context.parsed.y} pp`,
        },
      },
    },
    scales: {
      y: {
        ticks: {
          color: "#64748b",
          callback: (value: any) => `${value > 0 ? "+" : ""}${value} pp`,
        },
        grid: {
          color: "#f1f5f9",
        },
      },
      x: {
        display: false, // Hide individual family names for clean view
      },
    },
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
        <div>
          <h2 className="text-base font-bold text-gray-900">Skyscraper — margin delta vs target × revenue share</h2>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setCompareMode("target")}
              className={`px-3 py-1 rounded text-xs font-bold transition-all border ${compareMode === "target"
                  ? "bg-[#a61c1e] text-white border-[#a61c1e]"
                  : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                }`}
            >
              Target (PMA)
            </button>
            <button
              onClick={() => setCompareMode("baseline")}
              className={`px-3 py-1 rounded text-xs font-bold transition-all border ${compareMode === "baseline"
                  ? "bg-[#a61c1e] text-white border-[#a61c1e]"
                  : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                }`}
            >
              Baseline (file)
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-md self-start md:self-auto">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Quarter</span>
          <select className="bg-transparent text-xs font-semibold text-gray-700 outline-none border-none cursor-pointer">
            <option>Q4 FY 26</option>
          </select>
        </div>
      </div>

      <div className="text-xs text-gray-500 font-semibold mb-6">
        <span className="text-gray-950 font-bold">75</span> families -{" "}
        <span className="text-emerald-600 font-bold">21</span> above target -{" "}
        <span className="text-rose-600 font-bold">54</span> below target (Δ = actual - target, pp).
      </div>

      {/* Skyscraper Chart Area */}
      <div className="h-72">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default SkyscraperChart;
