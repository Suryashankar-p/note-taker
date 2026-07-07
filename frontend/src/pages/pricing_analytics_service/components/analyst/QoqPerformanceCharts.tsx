import React from "react";
import { ArrowRight } from "lucide-react";
import { Chart, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface QoqPerformanceChartsProps {
  selectedFamily: string;
  selectedDetails: {
    name: string;
    revenue: string;
    actual: string;
    target: string;
    delta: string;
    deltaVal: number;
    history: Array<{ quarter: string; revenue: number; gm: number }>;
    baseline: number;
    targetVal: number;
    mean: string;
    stdDev: string;
    median: string;
    min: string;
    max: string;
  };
  sortedQuarters: string[];
  onNavigateToSku: () => void;
}

const QoqPerformanceCharts: React.FC<QoqPerformanceChartsProps> = ({
  selectedFamily,
  selectedDetails,
  sortedQuarters,
  onNavigateToSku,
}) => {
  // Configuration for dynamic combo chart
  const comboChartData = {
    labels: selectedDetails.history.map(h => h.quarter),
    datasets: [
      {
        type: "bar" as const,
        label: "Revenue",
        yAxisID: "yRev",
        data: selectedDetails.history.map(h => h.revenue),
        backgroundColor: "rgba(166, 28, 30, 0.25)",
        borderRadius: 4,
        barPercentage: 0.45,
        order: 2,
      },
      {
        type: "line" as const,
        label: "GM %",
        yAxisID: "yGM",
        data: selectedDetails.history.map(h => h.gm),
        borderColor: "#a61c1e",
        borderWidth: 2,
        tension: 0.35,
        pointBackgroundColor: "#a61c1e",
        pointBorderColor: "#fff",
        pointRadius: 4,
        fill: false,
        order: 1,
      },
      {
        type: "line" as const,
        label: `PMA Target (${selectedDetails.target})`,
        yAxisID: "yGM",
        data: selectedDetails.history.map(() => selectedDetails.targetVal),
        borderColor: "#eab308",
        borderDash: [5, 5],
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false,
        order: 3,
      },
      {
        type: "line" as const,
        label: `Baseline (${selectedDetails.baseline.toFixed(1)}%)`,
        yAxisID: "yGM",
        data: selectedDetails.history.map(() => selectedDetails.baseline),
        borderColor: "#eab308",
        borderDash: [5, 5],
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false,
        order: 4,
      }
    ]
  };

  const comboChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#1e293b",
        padding: 10,
        cornerRadius: 6,
      }
    },
    scales: {
      yGM: {
        type: "linear" as const,
        position: "left" as const,
        min: 30,
        max: 110,
        ticks: {
          color: "#64748b",
          callback: (value: any) => `${value}.0%`,
        },
        grid: {
          color: "#f1f5f9",
        }
      },
      yRev: {
        type: "linear" as const,
        position: "right" as const,
        min: 0,
        max: 80,
        ticks: {
          color: "#64748b",
          callback: (value: any) => `₹${value}L`,
        },
        grid: {
          display: false,
        }
      },
      x: {
        ticks: {
          color: "#64748b",
        },
        grid: {
          display: false,
        }
      }
    }
  };


  // Normal distribution curve mockup data
  /*
  const normalChartData = {
    labels: ["10.0%", "20.0%", "30.0%", "40.0%", "50.0%", "60.0%", "70.0%", "80.0%"],
    datasets: [
      {
        type: "bar" as const,
        label: "Frequency",
        data: [1, 2, 8, 30, 48, 12, 3, 0],
        backgroundColor: "rgba(166, 28, 30, 0.3)",
        borderRadius: 2,
        barPercentage: 0.6,
      },
      {
        type: "line" as const,
        label: "Normal curve",
        data: [0.5, 2.5, 12, 35, 45, 22, 5, 0.5],
        borderColor: "#a61c1e",
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
        fill: false,
      }
    ]
  };

  const normalChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { display: false },
      x: { ticks: { color: "#64748b" }, grid: { display: false } }
    }
  };

  // Confidence interval trend chart mockup data
  const confidenceChartData = {
    labels: sortedQuarters,
    datasets: [
      {
        label: "Mean GM%",
        data: [49.2, 40.6, 50.3, 47.7, 51.6, 50.4, 51.7, 51.9, 52.2],
        borderColor: "#a61c1e",
        borderWidth: 2,
        tension: 0.35,
        pointBackgroundColor: "#a61c1e",
        pointRadius: 4,
        fill: false,
      },
      {
        label: "Lower Band",
        data: [44.2, 35.6, 45.3, 42.7, 46.6, 45.4, 46.7, 46.9, 47.2],
        borderColor: "transparent",
        pointRadius: 0,
        fill: "+1",
        backgroundColor: "rgba(166, 28, 30, 0.08)",
      },
      {
        label: "Upper Band",
        data: [54.2, 45.6, 55.3, 52.7, 56.6, 55.4, 56.7, 56.9, 57.2],
        borderColor: "transparent",
        pointRadius: 0,
        fill: false,
      }
    ]
  };

  const confidenceChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { min: 30, max: 70, ticks: { color: "#64748b", callback: (val: any) => `${val}%` }, grid: { color: "#f1f5f9" } },
      x: { ticks: { color: "#64748b" }, grid: { display: false } }
    }
  };
  */

  return (
    <div className="bg-white border border-gray-250 rounded-xl p-6 shadow-sm flex flex-col gap-6 animate-fade-in">
      <div>
        <h3 className="text-sm font-bold tracking-tight text-gray-800">
          Revenue and GM % by quarter
        </h3>
        <p className="text-[11px] text-gray-400 font-semibold uppercase mt-0.5">
          Select a product family row in the table to update all charts below. (Active: <strong className="text-[#a61c1e]">{selectedFamily}</strong>)
        </p>
      </div>

      <div className="h-72 bg-slate-50 rounded-xl border border-gray-150 p-5">
        <span className="text-[10px] text-gray-400 font-extrabold uppercase mb-2 block">
          Revenue and GM % by quarter for {selectedFamily}
        </span>
        <div className="h-60">
          <Chart type="bar" data={comboChartData} options={comboChartOptions} />
        </div>
      </div>


      {/* 4. GM% Dispersion Analysis
      <div className="border-t border-gray-150 pt-6 mt-2">
        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-4">
          GM% dispersion analysis
        </h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Normal distribution Chart * /}
          <div className="border border-gray-150 rounded-xl p-4 bg-slate-50/50">
            <span className="text-[10px] text-gray-400 font-bold uppercase mb-4 block">Normal distribution — GM%</span>
            <div className="h-52">
              <Chart type="bar" data={normalChartData} options={normalChartOptions} />
            </div>
          </div>

          {/* Confidence Interval Trend Chart * /}
          <div className="border border-gray-150 rounded-xl p-4 bg-slate-50/50">
            <span className="text-[10px] text-gray-400 font-bold uppercase mb-4 block">GM% distribution trend — quarter on quarter</span>
            <div className="h-52">
              <Line data={confidenceChartData} options={confidenceChartOptions} />
            </div>
          </div>
        </div>
      </div>
      */}

      {/* Summary stats
      <div className="grid grid-cols-5 gap-3 text-center border-t border-gray-150 pt-6">
        <div>
          <span className="text-[9px] text-gray-400 font-bold uppercase">Mean GM%</span>
          <span className="text-sm font-extrabold text-gray-900 block mt-1">{selectedDetails.mean}</span>
        </div>
        <div>
          <span className="text-[9px] text-slate-400 font-bold uppercase">Std-dev (σ)</span>
          <span className="text-sm font-extrabold text-gray-900 block mt-1">{selectedDetails.stdDev}</span>
        </div>
        <div>
          <span className="text-[9px] text-gray-400 font-bold uppercase">Median</span>
          <span className="text-sm font-extrabold text-gray-900 block mt-1">{selectedDetails.median}</span>
        </div>
        <div>
          <span className="text-[9px] text-gray-400 font-bold uppercase">Min GM%</span>
          <span className="text-sm font-extrabold text-rose-600 block mt-1">{selectedDetails.min}</span>
        </div>
        <div>
          <span className="text-[9px] text-gray-400 font-bold uppercase">Max GM%</span>
          <span className="text-sm font-extrabold text-emerald-600 block mt-1">{selectedDetails.max}</span>
        </div>
      </div>
      */}

      <button
        onClick={onNavigateToSku}
        className="mt-4 flex items-center justify-center gap-2 w-full py-2 bg-[#a61c1e] hover:bg-[#8e181a] text-white font-bold rounded-lg text-xs tracking-wide transition-colors shadow-sm hover:scale-[1.01]"
      >
        SKU deviation drill-down 
        <ArrowRight size={14} />
      </button>
    </div>
  );
};

export default QoqPerformanceCharts;
