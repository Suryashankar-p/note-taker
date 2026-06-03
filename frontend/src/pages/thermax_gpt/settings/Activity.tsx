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
import { months } from "../../../utils/constants";
import { findPercentage, getInitials } from "../../../utils/functions";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const THERMAX_RED = "#EE3124";
const MODEL_COLORS = [
  "rgba(59,130,246,0.85)",
  "rgba(245,158,11,0.85)",
  "rgba(16,185,129,0.85)",
];

interface Props {
  activityData: any;
  distributionData: any;
  month: any;
  topUsers: any;
  reachedBottom: () => void;
}

export default function Activity({ activityData, distributionData, month, topUsers, reachedBottom }: Props) {
  const totalQuestions = activityData?.total || 0;

  const barData = {
    labels: activityData?.day,
    datasets: [{
      label: "Questions",
      data: activityData?.question,
      backgroundColor: "rgba(238,49,36,0.8)",
      hoverBackgroundColor: THERMAX_RED,
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
          label: (item: any) => ` ${item.raw} questions`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: "#9ca3af", font: { size: 11 }, autoSkip: true, maxRotation: 0 },
      },
      y: {
        grid: { color: "#f3f4f6", lineWidth: 1 },
        border: { display: false, dash: [4, 4] },
        ticks: { color: "#9ca3af", font: { size: 11 }, precision: 0 },
        beginAtZero: true,
      },
    },
  };

  const modelDonutData = {
    labels: distributionData?.map((item: any) => item.model) || [],
    datasets: [{
      data: distributionData?.map((item: any) => item.questions) || [],
      backgroundColor: MODEL_COLORS,
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
          label: (item: any) => ` ${item.raw} questions`,
        },
      },
    },
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight + 2 >= scrollHeight) reachedBottom();
  };

  const maxQuestions = topUsers?.length
    ? Math.max(...topUsers.map((u: any) => u?.question || 0))
    : 1;

  return (
    <div className="flex flex-col p-6 gap-6">

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-100 rounded-xl p-4">
          <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Total Questions</span>
          <p className="text-2xl font-bold text-red-600 mt-1">{totalQuestions}</p>
          <p className="text-xs text-red-400 mt-0.5">this month</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Models Used</span>
          <p className="text-2xl font-bold text-blue-600 mt-1">{distributionData?.length || 0}</p>
          <p className="text-xs text-blue-400 mt-0.5">active models</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
          <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Active Users</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{topUsers?.length || 0}</p>
          <p className="text-xs text-emerald-400 mt-0.5">contributors</p>
        </div>
      </div>

      {/* Charts + Users Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Bar Chart — 3/5 */}
        <div className="lg:col-span-3 bg-gray-50 rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-gray-800">Daily Question Volume</p>
              <p className="text-xs text-gray-400">{months[month - 1]} · {totalQuestions} total</p>
            </div>
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ background: THERMAX_RED }} />
              <span className="text-xs font-medium text-gray-600">Questions</span>
            </div>
          </div>
          <div style={{ height: 260, position: "relative" }}>
            <Bar data={barData} options={barOptions} />
          </div>
          <p className="text-xs text-gray-400 text-center mt-3">Days of {months[month - 1]}</p>
        </div>

        {/* Right Column — 2/5 */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* Model Distribution Donut */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-sm font-semibold text-gray-800 mb-1">Questions by Model</p>
            <p className="text-xs text-gray-400 mb-3">Model share this month</p>
            {distributionData?.length > 0 ? (
              <div style={{ height: 190, position: "relative" }}>
                <Doughnut data={modelDonutData} options={modelDonutOptions} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                No data available
              </div>
            )}
          </div>

          {/* Top Users */}
          <div
            className="bg-white border border-gray-200 rounded-xl p-5 flex-1 overflow-y-auto"
            style={{ maxHeight: 320 }}
            onScroll={handleScroll}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-gray-800">Top Users</p>
              {topUsers?.length > 0 && (
                <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5 font-medium">
                  {topUsers.length}
                </span>
              )}
            </div>

            {topUsers?.length > 0 ? (
              <div className="flex flex-col gap-3">
                {topUsers.map((user: any, index: number) => {
                  const pct = totalQuestions > 0 ? Math.round((user?.question / totalQuestions) * 100) : 0;
                  return (
                    <div key={index} className="flex items-center gap-3">
                      {/* Rank + Avatar */}
                      <div className="flex items-center gap-2.5 flex-shrink-0">
                        <span className="text-[10px] font-bold text-gray-300 w-3 text-right">
                          {index + 1}
                        </span>
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                          style={{ background: index === 0 ? THERMAX_RED : index === 1 ? "#3b82f6" : "#6b7280" }}>
                          {user && getInitials(user.name)}
                        </div>
                      </div>
                      {/* Name + Bar */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-semibold text-gray-800 truncate">{user.name}</p>
                          <span className="text-xs font-bold text-gray-500 ml-2 flex-shrink-0">{user.question}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-1.5 rounded-full transition-all duration-500"
                            style={{
                              width: `${pct}%`,
                              background: index === 0 ? THERMAX_RED : index === 1 ? "#3b82f6" : "#9ca3af",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8 text-gray-400 text-sm">
                No activity to show
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}