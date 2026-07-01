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
  data?: Array<{
    quarter: string;
    overall_gm_pct: number | null;
    standard_gm_pct: number | null;
    non_standard_gm_pct: number | null;
  }>;
}

const MarginTrendChart = ({ data: apiData }: MarginTrendChartProps) => {
  const sortQuarters = (a: string, b: string) => {
    const matchA = a.match(/Q(\d) /);
    const matchB = b.match(/Q(\d) /);
    const yearA = a.match(/FY (\d+)/);
    const yearB = b.match(/FY (\d+)/);
    if (!matchA || !matchB || !yearA || !yearB) return 0;
    const qA = parseInt(matchA[1]);
    const yA = parseInt(yearA[1]);
    const qB = parseInt(matchB[1]);
    const yB = parseInt(yearB[1]);
    if (yA !== yB) return yA - yB;
    return qA - qB;
  };

  if (!apiData || apiData.length === 0) return null;
  
  const sortedApiData = [...apiData].sort((a, b) => sortQuarters(a.quarter, b.quarter));

  const chartData = {
    labels: sortedApiData.map((item) => item.quarter),
    datasets: [
      {
        label: "103 families margin %",
        data: sortedApiData.map((item) => item.overall_gm_pct ?? 0),
        fill: true,
        borderColor: "#a61c1e",
        backgroundColor: "rgba(166, 28, 30, 0.04)",
        tension: 0.4,
        pointBackgroundColor: "#a61c1e",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "#a61c1e",
        pointRadius: 4,
        pointHoverRadius: 6,
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
        backgroundColor: "#0f172a",
        titleColor: "#f8fafc",
        bodyColor: "#f8fafc",
        borderColor: "#e2e8f0",
        borderWidth: 1,
        padding: 10,
        cornerRadius: 6,
        displayColors: false,
        callbacks: {
          label: (context: any) => `Margin: ${context.parsed.y}%`,
        },
      },
    },
    scales: {
      y: {
        ticks: {
          color: "#64748b",
          callback: (value: any) => `${value}%`,
        },
        grid: {
          color: "#e2e8f0",
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
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h3 className="text-sm font-semibold tracking-wider text-gray-500 uppercase">
            Margin trend
          </h3>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[10px] text-gray-400 font-bold uppercase">Product families</span>
            <select className="bg-gray-50 border border-gray-200 rounded-md px-3 py-1 text-xs font-semibold text-[#a61c1e] outline-none cursor-pointer">
              <option>103 of 109 families</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#a61c1e]"></span>
          <span className="text-xs text-gray-600 font-semibold">103 families margin %</span>
        </div>
      </div>

      <div className="h-64">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default MarginTrendChart;
