import React, { useState } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import Text from "../../../components/Text";
import { findPercentage, roundToFourDecimals } from "../../../utils/functions";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../../redux/store";
import EditLimitModal from "../../../components/Modals/EditLimit";
import EditGlobalLimitModal from "../../../components/Modals/EditGlobalLimit";
import { months } from "../../../utils/constants";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const THERMAX_RED = "#EE3124";
const MODEL_COLORS = [
  { bg: "rgba(59,130,246,0.85)", border: "#3b82f6", label: "#1d4ed8" },
  { bg: "rgba(245,158,11,0.85)", border: "#f59e0b", label: "#b45309" },
  { bg: "rgba(16,185,129,0.85)", border: "#10b981", label: "#047857" },
];

export default function Cost({ usageData, distributionData, limit, onLimitEdit, onGlobalLimitEdit, month }: any) {
  const totalCost = usageData?.total ? roundToFourDecimals(usageData?.total) : 0;
  const dispatch = useDispatch<Dispatch>();
  const editLimit = useSelector((state: RootState) => state.modal.editLimit);
  const percentage = findPercentage(totalCost, limit);
  const startDate = usageData?.day?.[0] || "N/A";
  const endDate = usageData?.day?.length > 0 ? usageData.day[usageData.day.length - 1] : "N/A";
  const member = useSelector((state: RootState) => state.memberRole);
  const salesMemberDetails = member?.details ?? {};
  const remaining = limit ? Math.max(0, limit - totalCost) : 0;
  const isOverBudget = totalCost > limit;
  const [isGlobalLimitModalOpen, setIsGlobalLimitModalOpen] = useState(false);

  // Bar chart
  const barData = {
    labels: usageData?.day,
    datasets: [{
      label: "Cost",
      data: usageData?.cost,
      backgroundColor: THERMAX_RED,
      hoverBackgroundColor: "#D6281E",
      borderRadius: 5,
      borderSkipped: false,
    }],
  };

  const barOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        backgroundColor: "#111827",
        titleFont: { size: 12, weight: "normal" },
        bodyFont: { size: 14, weight: "bold" },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          title: (items: any) => `${items[0].label} ${months[month - 1]}`,
          label: (item: any) => ` $${item.raw.toFixed(4)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          color: "#9ca3af",
          font: { size: 11 },
          autoSkip: true,
          maxRotation: 0,
        },
      },
      y: {
        grid: { color: "#f3f4f6", lineWidth: 1 },
        border: { display: false, dash: [4, 4] },
        ticks: {
          color: "#9ca3af",
          font: { size: 11 },
          callback: (v: any) => `$${v}`,
        },
        beginAtZero: true,
      },
    },
  };

  // Budget donut
  const budgetDonutData = {
    labels: ["Used", "Remaining"],
    datasets: [{
      data: [totalCost, Math.max(0, (limit || 0) - totalCost)],
      backgroundColor: [THERMAX_RED, "#f3f4f6"],
      borderWidth: 0,
      hoverOffset: 4,
    }],
  };

  const budgetDonutOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "72%",
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
  };

  // Model donut
  const modelDonutData = {
    labels: distributionData?.map((item: any) => item.model) || [],
    datasets: [{
      data: distributionData?.map((item: any) => item.cost) || [],
      backgroundColor: MODEL_COLORS.map((c) => c.bg),
      borderWidth: 0,
      hoverOffset: 6,
    }],
  };

  const modelDonutOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "65%",
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: { boxWidth: 10, padding: 14, font: { size: 12 }, color: "#374151" },
      },
      title: { display: false },
      tooltip: {
        backgroundColor: "#111827",
        callbacks: {
          label: (item: any) => ` $${item.raw?.toFixed(4) ?? 0}`,
        },
      },
    },
  };

  return (
    <div className="flex flex-col p-6 gap-6">

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex flex-col gap-1">
          <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Monthly Spend</span>
          <span className="text-2xl font-bold text-red-600">${totalCost}</span>
          <span className="text-xs text-red-400">
            {startDate !== "N/A" ? `${months[month - 1]} ${startDate}–${endDate}` : "No data yet"}
          </span>
        </div>

        <div className={`border rounded-xl p-4 flex flex-col gap-1 ${isOverBudget ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-100"}`}>
          <span className={`text-xs font-semibold uppercase tracking-wider ${isOverBudget ? "text-red-400" : "text-amber-500"}`}>
            Budget Used
          </span>
          <span className={`text-2xl font-bold ${isOverBudget ? "text-red-600" : "text-amber-600"}`}>
            {percentage}%
          </span>
          <span className={`text-xs ${isOverBudget ? "text-red-400" : "text-amber-400"}`}>
            of ${limit?.toFixed(2) || "0"} limit
          </span>
        </div>

        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex flex-col gap-1">
          <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Remaining Budget</span>
          <span className="text-2xl font-bold text-emerald-600">${remaining.toFixed(2)}</span>
          <span className="text-xs text-emerald-400">available to spend</span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Bar Chart — 3/5 width */}
        <div className="lg:col-span-3 bg-gray-50 rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-gray-800">Daily Cost Breakdown</p>
              <p className="text-xs text-gray-400">{months[month - 1]} · All days</p>
            </div>
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ background: THERMAX_RED }} />
              <span className="text-xs font-medium text-gray-600">Cost ($)</span>
            </div>
          </div>
          <div style={{ height: 280, position: "relative" }}>
            <Bar data={barData} options={barOptions} />
          </div>
          <p className="text-xs text-gray-400 text-center mt-3">Days of {months[month - 1]}</p>
        </div>

        {/* Right Panel — 2/5 width */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* Budget Ring Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-5">
            <div style={{ position: "relative", width: 110, height: 110, flexShrink: 0 }}>
              <Doughnut data={budgetDonutData} options={budgetDonutOptions} />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-lg font-bold text-gray-800">{percentage}%</span>
                <span className="text-[10px] text-gray-400 leading-none mt-0.5">used</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 flex-1 min-w-0">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Total Spend</p>
                <p className="text-xl font-bold text-gray-900">${totalCost}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-1.5 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, Number(percentage))}%`, background: THERMAX_RED }}
                  />
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">${limit?.toFixed(0)}</span>
              </div>
              {salesMemberDetails?.role === "OWNER" && (
                <button
                  onClick={() => dispatch.modal.openEditLimit()}
                  className="mt-1 text-xs font-semibold text-white rounded-lg py-2 px-3 transition-colors duration-200 self-start"
                  style={{ background: THERMAX_RED }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#D6281E")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = THERMAX_RED)}
                >
                  Increase Limit
                </button>
              )}
            </div>
          </div>

          {/* Global Limit Card */}
          {salesMemberDetails?.role === "OWNER" && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800">Global Yearly Limit</p>
                <p className="text-xs text-gray-400">Set limit for all users</p>
              </div>
              <button
                onClick={() => setIsGlobalLimitModalOpen(true)}
                className="text-xs font-semibold text-white rounded-lg py-2 px-3 transition-colors duration-200"
                style={{ background: THERMAX_RED }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#D6281E")}
                onMouseLeave={(e) => (e.currentTarget.style.background = THERMAX_RED)}
              >
                Update All Users
              </button>
            </div>
          )}

          {/* Model Distribution Donut */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 flex-1">
            <p className="text-sm font-semibold text-gray-800 mb-1">Cost by Model</p>
            <p className="text-xs text-gray-400 mb-3">Distribution this month</p>
            {distributionData?.length > 0 ? (
              <div style={{ height: 200, position: "relative" }}>
                <Doughnut data={modelDonutData} options={modelDonutOptions} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                No distribution data
              </div>
            )}
          </div>
        </div>
      </div>

      {editLimit && (
        <div className="absolute top-0 left-0 w-full h-full z-50">
          <EditLimitModal defaultValue={limit} onSubmit={onLimitEdit} />
        </div>
      )}

      {isGlobalLimitModalOpen && (
        <div className="absolute top-0 left-0 w-full h-full z-50">
          <EditGlobalLimitModal 
            isOpen={isGlobalLimitModalOpen} 
            onClose={() => setIsGlobalLimitModalOpen(false)} 
            onSubmit={(data) => {
              onGlobalLimitEdit(data);
              setIsGlobalLimitModalOpen(false);
            }} 
          />
        </div>
      )}
    </div>
  );
}

function InsightItem({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-white/70 rounded-lg px-4 py-3">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`text-sm font-semibold ${color}`}>{value}</p>
    </div>
  );
}