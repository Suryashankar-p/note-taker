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

const RevenueVsCogsChart = () => {
  const data = {
    labels: [
      "Q1 FY 24",
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
        label: "Revenue",
        data: [18.5, 17.2, 18.9, 19.5, 24.1, 16.2, 20.7, 21.0, 21.8],
        backgroundColor: "#b91c1c", // Red-orange
        borderRadius: 4,
      },
      {
        label: "COGS",
        data: [9.3, 8.8, 9.1, 9.6, 12.6, 8.2, 10.0, 10.1, 10.4],
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
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default RevenueVsCogsChart;
