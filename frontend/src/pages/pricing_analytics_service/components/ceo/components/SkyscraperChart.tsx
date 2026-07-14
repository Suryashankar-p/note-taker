import React from "react";
import { Bar } from "react-chartjs-2";
import CustomSelect from "../../CustomSelect";
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

interface SkyscraperChartProps {
  families: Array<{
    name: string;
    actual: number;
    target: number;
    delta: number;
    revenueInr: number;
    share: number;
    classification: string;
  }>;
  compareMode: "target" | "baseline";
  setCompareMode: (val: "target" | "baseline") => void;
  selectedQuarter: string;
  setSelectedQuarter: (val: string) => void;
  quarters: string[];
  meta: {
    insights: string[];
    vs_target: { above_target: number; below_target: number; at_target: number };
    vs_baseline: { above_baseline: number; below_baseline: number };
  };
}

const SkyscraperChart = ({
  families,
  compareMode,
  setCompareMode,
  selectedQuarter,
  setSelectedQuarter,
  quarters,
  meta,
}: SkyscraperChartProps) => {
  const chartLabels = families.map((f) => f.name);
  const chartDeltas = families.map((f) => f.delta);

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
          title: (context: any) => {
            const index = context[0].dataIndex;
            return families[index]?.name || "";
          },
          label: (context: any) => {
            const index = context.dataIndex;
            const item = families[index];
            if (!item) return "";
            const refLabel = compareMode === "target" ? "Target" : "Baseline";
            return [
              `Actual GM: ${item.actual.toFixed(2)}%`,
              `${refLabel} GM: ${item.target.toFixed(2)}%`,
              `Δ vs ${refLabel}: ${item.delta >= 0 ? "+" : ""}${item.delta.toFixed(2)} pp`,
              `Revenue (L): ₹${(item.revenueInr / 100000).toFixed(2)}L`,
              `Share of quarter: ${item.share.toFixed(2)}%`
            ];
          },
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

        <CustomSelect
          options={quarters}
          value={selectedQuarter}
          onChange={setSelectedQuarter}
          labelPrefix="Quarter: "
          alignRight
        />
      </div>

      <div className="text-xs text-gray-500 font-semibold mb-6">
        <span className="text-gray-950 font-bold">{families.length}</span> families -{" "}
        {compareMode === "target" ? (
          <>
            <span className="text-emerald-600 font-bold">{meta.vs_target.above_target}</span> above target -{" "}
            <span className="text-rose-600 font-bold">{meta.vs_target.below_target}</span> below target
          </>
        ) : (
          <>
            <span className="text-emerald-600 font-bold">{meta.vs_baseline.above_baseline}</span> above baseline -{" "}
            <span className="text-rose-600 font-bold">{meta.vs_baseline.below_baseline}</span> below baseline
          </>
        )}{" "}
        (Δ = actual - {compareMode}, pp).
      </div>

      {/* Skyscraper Chart Area */}
      <div className="h-72">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default SkyscraperChart;
