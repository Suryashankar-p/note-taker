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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface RevenueVsCogsChartProps {
  data?: Array<{
    quarter: string;
    revenue_inr: number;
    cogs_inr: number;
  }>;
}

const RevenueVsCogsChart = ({ data: apiData }: RevenueVsCogsChartProps) => {
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
        label: "Revenue",
        data: sortedApiData.map((item) => item.revenue_inr / 10000000),
        backgroundColor: "#b91c1c", // Red-orange
        borderRadius: 4,
      },
      {
        label: "COGS",
        data: sortedApiData.map((item) => item.cogs_inr / 10000000),
        backgroundColor: "#ea580c", // Orange
        borderRadius: 4,
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
      },
    },
    scales: {
      y: {
        ticks: {
          color: "#64748b",
          callback: (value: any) => `₹${value} Cr`,
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
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold tracking-wider text-gray-500 uppercase">
          Revenue vs COGS
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-[#b91c1c]"></span>
            <span className="text-[10px] text-gray-500 font-bold uppercase">Revenue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-[#ea580c]"></span>
            <span className="text-[10px] text-gray-500 font-bold uppercase">COGS</span>
          </div>
        </div>
      </div>

      <div className="h-64">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default RevenueVsCogsChart;
