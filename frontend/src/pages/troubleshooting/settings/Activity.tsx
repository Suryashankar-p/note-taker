import { Bar, Line } from 'react-chartjs-2';
import Text from '../../../components/Text';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { months } from '../../../utils/constants';
import { findPercentage, getInitials } from '../../../utils/functions';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface Props {
  activityData: any;
  month: any;
  topUsers: any;
  reachedBottom: () => void;
  trendData?: any;
}

export default function Activity({ activityData, month, topUsers, reachedBottom, trendData }: Props) {
  const totalQuestions = activityData?.total;

  // ── Derived stat cards ───────────────────────────────────────────
  const activeUsers = topUsers?.filter((u: any) => u.question > 0) ?? [];
  const activeUsersCount = activeUsers.length;
  const avgPerActiveUser = activeUsersCount > 0
    ? Math.round((totalQuestions ?? 0) / activeUsersCount)
    : 0;

  // ── Bar chart ────────────────────────────────────────────────────
  const data = {
    labels: activityData?.day,
    datasets: [
      {
        label: 'Questions',
        data: activityData?.question,
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const, display: false },
      title: {
        display: true,
        text: `Monthly questions: ${totalQuestions ?? 0}`,
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems: any) => {
            return `Date: ${tooltipItems[0].label} ${months[month - 1]}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: `Days of ${months[month - 1]}`,
          font: { size: 14 },
        },
      },
      y: {
        title: {
          display: true,
          text: 'No. of questions',
          font: { size: 14 },
        },
        beginAtZero: true,
      },
    },
  };

  // ── Line chart ───────────────────────────────────────────────────
  const trendLabels = trendData?.map((p: any) => p.label) ?? [];
  const trendCounts = trendData?.map((p: any) => p.active_users) ?? [];
  const maxValue = Math.max(...trendCounts, 1);

  const lineData = {
    labels: trendLabels,
    datasets: [
      {
        label: 'Active users',
        data: trendCounts,
        borderColor: '#16a34a',
        backgroundColor: 'rgba(22,163,74,0.1)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: maxValue + 1,
        ticks: { stepSize: 1, precision: 0 },
      },
    },
  };

  const datalabelsPlugin = {
    id: 'datalabels',
    afterDatasetsDraw(chart: any) {
      const ctx = chart.ctx;
      chart.data.datasets.forEach((_: any, datasetIndex: number) => {
        const meta = chart.getDatasetMeta(datasetIndex);
        meta.data.forEach((point: any, index: number) => {
          const value = chart.data.datasets[datasetIndex].data[index];
          if (value !== null && value !== undefined) {
            ctx.save();
            ctx.font = '600 11px sans-serif';
            ctx.fillStyle = '#16a34a';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(value, point.x, point.y - 6);
            ctx.restore();
          }
        });
      });
    },
  };

  const widthPercentage = (user: any) => {
    return findPercentage(user?.question, totalQuestions).toString();
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight + 2 >= scrollHeight) {
      reachedBottom();
    }
  };

  return (
    <div className="flex flex-col px-4 py-4 gap-0">
      {/* ── BAR CHART + TOP USERS ────────────────────────────────────── */}
      <div className="flex flex-row gap-6 min-h-[380px]">

        {/* LEFT: Stat Cards + Bar Chart */}
        <div className="flex flex-col flex-1 gap-3 min-w-0">
          
          {/* Stat Cards */}
          <div className="flex flex-row gap-3">
            <div className="flex flex-col bg-gray-100 rounded-lg px-4 py-3 flex-1">
              <span className="text-xs text-gray-500 mb-1">Monthly questions</span>
              <span className="text-2xl font-medium text-gray-800">{totalQuestions ?? 0}</span>
              <span className="text-[11px] text-gray-400 mt-1">{months[month - 1]}</span>
            </div>
            <div className="flex flex-col bg-gray-100 rounded-lg px-4 py-3 flex-1">
              <span className="text-xs text-gray-500 mb-1">Active users</span>
              <span className="text-2xl font-medium text-gray-800">{activeUsersCount}</span>
              <span className="text-[11px] text-gray-400 mt-1">Asked at least once</span>
            </div>
            <div className="flex flex-col bg-gray-100 rounded-lg px-4 py-3 flex-1">
              <span className="text-xs text-gray-500 mb-1">Avg. per active user</span>
              <span className="text-2xl font-medium text-gray-800">{avgPerActiveUser}</span>
              <span className="text-[11px] text-gray-400 mt-1">Questions this month</span>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="flex-1 min-h-[260px]">
            <Bar className="lg:px-4 px-1" options={options} data={data} />
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="w-px bg-gray-200 self-stretch" />

        {/* RIGHT: Top Users — full height */}
        <div
          className="flex flex-col w-[280px] xl:w-[320px] flex-shrink-0 overflow-y-auto"
          onScroll={handleScroll}
        >
          <Text className="mb-2 text-lg md:text-xl" type="header3">Top Users</Text>
          {topUsers?.map((user: any, index: number) => (
            <div key={index} className="px-3 py-2 flex lg:items-center w-full">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-gray-600">{user && getInitials(user.name)}</span>
              </div>
              <div className="ml-3 overflow-hidden w-full">
                <Text type="small" className="text-primary_text">{user.name}</Text>
                <Text
                  type="small"
                  className="text-gray-500 text-[11px] block overflow-hidden text-ellipsis whitespace-nowrap"
                  title={user.email}
                >
                  {user.email}
                </Text>
                <div title={`Total: ${totalQuestions}`} className="w-full bg-gray-200 h-4 mt-2 rounded-md overflow-hidden">
                  <div
                    title={`Asked: ${user?.question}`}
                    className="bg-[#ffb1c1] rounded-r-md h-4 transition-all duration-300"
                    style={{ width: `${widthPercentage(user)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── TREND LINE CHART ─────────────────────────────────────────── */}
      {trendData && trendData.length > 0 && (
        <>
          <div className="border-t border-gray-200 mx-0 mt-4 mb-4" />
          <div className="flex flex-col gap-2 pb-8">
            <span className="text-sm font-medium text-gray-700">
              Active users — month on month
            </span>
            <div className="h-[200px]">
              <Line data={lineData} options={lineOptions} plugins={[datalabelsPlugin]} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}