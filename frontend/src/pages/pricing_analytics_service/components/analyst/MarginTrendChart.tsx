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

interface MarginTrendChartProps {
  selectedFamily: string;
}

const MarginTrendChart: React.FC<MarginTrendChartProps> = ({ selectedFamily }) => {
  // Mock data representing standard vs baseline
  const data = {
    labels: [
      "Q4 FY 24",
      "Q1 FY 25",
      "Q2 FY 25",
      "Q3 FY 25",
      "Q4 FY 25",
      "Q1 FY 26",
      "Q2 FY 26",
      "Q3 FY 26",
      "Q4 FY 26",
    ],
    datasets: [
      {
        label: "Heating margin %",
        data: [49.2, 50.3, 49.7, 51.6, 48.1, 50.3, 51.5, 51.9, 52.2],
        borderColor: "#a61c1e", // Thermax Red
        backgroundColor: "rgba(166, 28, 30, 0.05)",
        tension: 0.35,
        fill: true,
        pointBackgroundColor: "#a61c1e",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "#a61c1e",
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: "Heating baseline",
        data: [50.0, 50.0, 50.0, 50.0, 50.0, 50.0, 50.0, 50.0, 50.0],
        borderColor: "#eab308", // Yellow dashed
        borderDash: [5, 5],
        fill: false,
        pointRadius: 0,
        tension: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#1e293b",
        titleColor: "#f8fafc",
        bodyColor: "#f8fafc",
        borderColor: "#e2e8f0",
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (context: any) => `${context.dataset.label}: ${context.parsed.y}%`,
        },
      },
    },
    scales: {
      y: {
        min: 48,
        max: 53,
        ticks: {
          color: "#64748b",
          callback: (value: any) => `${value.toFixed(1)}%`,
        },
        grid: {
          color: "#f1f5f9",
        },
      },
      x: {
        ticks: {
          color: "#64748b",
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="bg-white border border-gray-150 rounded-xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h3 className="text-sm font-bold tracking-tight text-gray-800">
            Margin trend
          </h3>
          <p className="text-[11px] text-gray-400 font-semibold uppercase mt-0.5">
            Applies to margin and revenue vs COGS charts below.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-1 bg-[#a61c1e] inline-block"></span>
            <span className="text-gray-600 font-medium">Heating margin %</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-1 border-t-2 border-dashed border-[#eab308] inline-block"></span>
            <span className="text-gray-600 font-medium">Heating baseline</span>
          </div>
        </div>
      </div>

      <div className="h-64">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default MarginTrendChart;
