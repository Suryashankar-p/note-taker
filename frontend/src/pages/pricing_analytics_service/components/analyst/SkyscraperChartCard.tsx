import React from "react";
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

interface SkyscraperChartCardProps {
  compareVs: string;
  setCompareVs: (val: string) => void;
  selectedQuarter: string;
  setSelectedQuarter: (val: string) => void;
}

const SkyscraperChartCard = ({
  compareVs,
  setCompareVs,
  selectedQuarter,
  setSelectedQuarter,
}: SkyscraperChartCardProps) => {
  // Sample data for 75 product families margin delta vs target
  // Alternating positive deltas and negative deltas
  const chartLabels = Array.from({ length: 45 }, (_, i) => `Family ${i + 1}`);
  const chartDeltas = [
    12.3, 10.3, 8.0, 5.8, 5.4, 5.2, 4.8, 4.3, 4.3, 3.5, 2.7, 1.8, 1.0, 0.5, 0.2,
    -0.1, -0.4, -0.9, -1.2, -1.8, -2.1, -2.5, -3.0, -3.2, -3.8, -4.1, -4.5, -5.0,
    -5.4, -5.8, -6.1, -6.5, -7.0, -7.8, -8.2, -8.9, -9.5, -10.1, -11.0, -11.7,
    -12.5, -13.2, -15.0, -17.4, -19.1,
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
          label: (context: any) =>
            `Delta: ${context.parsed.y > 0 ? "+" : ""}${context.parsed.y} pp`,
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
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-gray-100 gap-4">
        <div>
          <h3 className="text-sm font-bold tracking-tight text-gray-850">
            Skyscraper — margin delta vs target × revenue share
          </h3>
          <p className="text-[11px] text-gray-400 font-semibold uppercase mt-0.5">
            75 families — <strong>21 above target</strong> —{" "}
            <strong>54 below target</strong> (Δ = actual - target, pp).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
          {/* Compare Vs Selection Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setCompareVs("target")}
              className={`px-3 py-1 rounded-md transition-all ${
                compareVs === "target"
                  ? "bg-white text-[#a61c1e] shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Target (PMA)
            </button>
            <button
              onClick={() => setCompareVs("baseline")}
              className={`px-3 py-1 rounded-md transition-all ${
                compareVs === "baseline"
                  ? "bg-white text-[#a61c1e] shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Baseline (file)
            </button>
          </div>

          {/* Quarter Selector */}
          <select
            value={selectedQuarter}
            onChange={(e) => setSelectedQuarter(e.target.value)}
            className="bg-gray-50 border border-gray-250 rounded-lg px-2.5 py-1 text-gray-700 outline-none cursor-pointer"
          >
            <option>Q4 FY 26</option>
            <option>Q3 FY 26</option>
            <option>Q2 FY 26</option>
            <option>Q1 FY 26</option>
          </select>
        </div>
      </div>

      {/* Skyscraper Chart Area */}
      <div className="h-72 mt-4">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default SkyscraperChartCard;
