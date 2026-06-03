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
import { months } from "../../../utils/constants";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Props {
  tokenData: any;
  month: any;
}

export default function Tokens({ tokenData, month }: Props) {
  const totalPrompt = tokenData?.total_prompt || 0;
  const totalCompletion = tokenData?.total_completion || 0;
  const totalTokens = totalPrompt + totalCompletion;
  const avgPerQuery = tokenData?.total
    ? Math.round(totalTokens / tokenData.total)
    : 0;

  const promptPct = totalTokens > 0 ? Math.round((totalPrompt / totalTokens) * 100) : 0;
  const completionPct = totalTokens > 0 ? 100 - promptPct : 0;

  const barData = {
    labels: tokenData?.day || [],
    datasets: [
      {
        label: "Prompt Tokens",
        data: tokenData?.prompt_tokens || [],
        backgroundColor: "rgba(59,130,246,0.85)",
        hoverBackgroundColor: "#2563eb",
        borderRadius: 4,
        borderSkipped: false,
        stack: "tokens",
      },
      {
        label: "Completion Tokens",
        data: tokenData?.completion_tokens || [],
        backgroundColor: "rgba(16,185,129,0.85)",
        hoverBackgroundColor: "#059669",
        borderRadius: 4,
        borderSkipped: false,
        stack: "tokens",
      },
    ],
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
        bodyFont: { size: 13, weight: "bold" },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          title: (items: any) => `${items[0].label} ${months[month - 1]}`,
          label: (item: any) => ` ${item.dataset.label}: ${item.raw?.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
        border: { display: false },
        ticks: { color: "#9ca3af", font: { size: 11 }, autoSkip: true, maxRotation: 0 },
      },
      y: {
        stacked: true,
        grid: { color: "#f3f4f6", lineWidth: 1 },
        border: { display: false, dash: [4, 4] },
        ticks: {
          color: "#9ca3af",
          font: { size: 11 },
          callback: (v: any) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v,
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="flex flex-col p-6 gap-6">

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex flex-col gap-1">
          <span className="text-xs font-semibold text-orange-400 uppercase tracking-wider">Avg / Query</span>
          <p className="text-2xl font-bold text-orange-600">{avgPerQuery.toLocaleString()}</p>
          <p className="text-xs text-orange-400">tokens per question</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex flex-col gap-1">
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Prompt Tokens</span>
          <p className="text-2xl font-bold text-blue-600">{totalPrompt.toLocaleString()}</p>
          <p className="text-xs text-blue-400">{promptPct}% of total</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex flex-col gap-1">
          <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Completion</span>
          <p className="text-2xl font-bold text-emerald-600">{totalCompletion.toLocaleString()}</p>
          <p className="text-xs text-emerald-400">{completionPct}% of total</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col gap-1">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Tokens</span>
          <p className="text-2xl font-bold text-gray-700">{totalTokens.toLocaleString()}</p>
          <p className="text-xs text-gray-400">this month</p>
        </div>
      </div>

      {/* Ratio Bar */}
      {totalTokens > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-gray-700">Token Distribution</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
                <span className="text-xs text-gray-500">Prompt {promptPct}%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                <span className="text-xs text-gray-500">Completion {completionPct}%</span>
              </div>
            </div>
          </div>
          <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
            <div
              className="bg-blue-500 transition-all duration-700 rounded-l-full"
              style={{ width: `${promptPct}%` }}
            />
            <div
              className="bg-emerald-500 transition-all duration-700 rounded-r-full"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="bg-gray-50 rounded-xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-gray-800">Daily Token Usage</p>
            <p className="text-xs text-gray-400">{months[month - 1]} · Stacked by type</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ background: "rgba(59,130,246,0.85)" }} />
              <span className="text-xs font-medium text-gray-500">Prompt</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ background: "rgba(16,185,129,0.85)" }} />
              <span className="text-xs font-medium text-gray-500">Completion</span>
            </div>
          </div>
        </div>
        <div style={{ height: 340, position: "relative" }}>
          <Bar data={barData} options={barOptions} />
        </div>
        <p className="text-xs text-gray-400 text-center mt-3">Days of {months[month - 1]}</p>
      </div>
    </div>
  );
}