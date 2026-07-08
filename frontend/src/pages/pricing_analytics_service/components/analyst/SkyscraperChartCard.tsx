import React from "react";
import { Bar } from "react-chartjs-2";
import CustomSelect from "../CustomSelect";
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
  families: Array<{
    name: string;
    actual: string;
    target: string;
    delta: string;
    deltaVal: number;
    revenueInr: number;
    share: string;
  }>;
  compareVs: string;
  setCompareVs: (val: string) => void;
  selectedQuarter: string;
  setSelectedQuarter: (val: string) => void;
  quarters: string[];
}

const SkyscraperChartCard = ({
  families,
  compareVs,
  setCompareVs,
  selectedQuarter,
  setSelectedQuarter,
  quarters,
}: SkyscraperChartCardProps) => {
  const chartLabels = families.map((f) => f.name);
  const chartDeltas = families.map((f) => f.deltaVal);

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

  const aboveCount = families.filter((f) => f.deltaVal >= 0).length;
  const belowCount = families.filter((f) => f.deltaVal < 0).length;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-gray-100 gap-4">
        <div>
          <h3 className="text-sm font-bold tracking-tight text-gray-850">
            Skyscraper — margin delta vs target × revenue share
          </h3>
          <p className="text-[11px] text-gray-400 font-semibold uppercase mt-0.5">
            {families.length} families — <strong>{aboveCount} above {compareVs}</strong> —{" "}
            <strong>{belowCount} below {compareVs}</strong> (Δ = actual - {compareVs}, pp).
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

          <CustomSelect
            options={quarters}
            value={selectedQuarter}
            onChange={setSelectedQuarter}
            labelPrefix="Quarter: "
            alignRight
          />
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
