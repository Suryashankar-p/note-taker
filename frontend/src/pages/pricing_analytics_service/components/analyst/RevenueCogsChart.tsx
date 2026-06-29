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

const RevenueCogsChart = () => {
  const transactionPills = [
    "5,718",
    "4,860",
    "5,894",
    "5,987",
    "6,269",
    "5,142",
    "5,551",
    "5,583",
    "5,660",
  ];

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
        label: "Revenue",
        data: [20.48, 13.77, 16.27, 18.9, 24.14, 15.25, 20.74, 21.03, 21.83],
        backgroundColor: "#a61c1e", // Thermax Red
        borderRadius: 4,
        barPercentage: 0.7,
        categoryPercentage: 0.65,
      },
      {
        label: "COGS",
        data: [10.31, 6.85, 8.18, 9.14, 12.52, 7.58, 10.05, 10.11, 10.43],
        backgroundColor: "#ea580c", // Orange
        borderRadius: 4,
        barPercentage: 0.7,
        categoryPercentage: 0.65,
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
          label: (context: any) => `${context.dataset.label}: ₹${context.parsed.y.toFixed(2)} Cr`,
        },
      },
    },
    scales: {
      y: {
        min: 0,
        max: 30,
        ticks: {
          color: "#64748b",
          callback: (value: any) => `₹${value} Cr`,
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
    <div className="bg-white border border-gray-150 rounded-xl p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold tracking-tight text-gray-800">
            Revenue vs COGS
          </h3>
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#a61c1e]"></span>
              <span className="text-gray-500 font-semibold uppercase text-[9px]">Revenue</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#ea580c]"></span>
              <span className="text-gray-500 font-semibold uppercase text-[9px]">COGS</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded border border-gray-300 bg-gray-100 flex items-center justify-center text-[7px] text-gray-600 font-bold">T</span>
              <span className="text-gray-500 font-semibold uppercase text-[9px]">Transactions</span>
            </div>
          </div>
        </div>

        {/* Transaction count badge pills above charts matching the image */}
        <div className="grid grid-cols-9 gap-1 text-center mb-4 mt-2">
          {transactionPills.map((val, idx) => (
            <div key={idx} className="flex justify-center">
              <span className="bg-gray-100 border border-gray-200 text-gray-700 text-[9px] font-bold py-0.5 px-1.5 rounded">
                {val}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="h-60 mt-1">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default RevenueCogsChart;
