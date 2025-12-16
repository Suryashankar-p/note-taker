import { Bar } from "react-chartjs-2";
import Text from "../../components/Text";
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
import { months } from "../../utils/constants";

// Register chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

interface Props {
  activityData: any;
  month: number | string;
  topUsers: any;
  activityStatus: any;
  reachedBottom: () => void;
  periodType: "monthly" | "yearly";
}

export default function Activity1({
  activityData,
  month,
  topUsers,
  activityStatus,
  reachedBottom,
  periodType,
}: Props) {
  const totalQuestions = activityData?.total || 0;

  /* ---------------- X AXIS LABELS ---------------- */
  const labels =
    periodType === "yearly"
      ? monthNames
      : activityData?.day?.map((d: number) => String(d)) || [];

  const values = activityData?.activity || [];

  /* ---------------- CHART DATA ---------------- */
  const data = {
    labels,
    datasets: [
      {
        label: "Activities",
        data: values,
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        borderRadius: 4,
      },
    ],
  };

  /* ---------------- CHART OPTIONS ---------------- */
  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text:
          periodType === "yearly"
            ? `Annual Activities: ${totalQuestions}`
            : `Monthly Activities: ${totalQuestions}`,
      },
      tooltip: {
        callbacks: {
          title: (items: any) =>
            periodType === "yearly"
              ? `Month: ${items[0].label}`
              : `Date: ${items[0].label} ${months[Number(month) - 1]}`,
        },
      },
    },
    scales: {
      /* ---------------- X AXIS ---------------- */
      x: {
        ticks: {
          autoSkip: false,        // ✅ show ALL dates (1,2,3,4...)
          maxRotation: 0,
          minRotation: 0,
        },
        title: {
          display: true,
          text:
            periodType === "yearly"
              ? "Months of Year"
              : `Days of ${months[Number(month) - 1]}`,
          font: { size: 14 },
        },
      },

      /* ---------------- Y AXIS (FIXED 0,2,4,6,8,10) ---------------- */
      y: {
        beginAtZero: true,
        min: 0,
        max: 10,                 // ✅ force full scale
        ticks: {
          stepSize: 2,           // ✅ 0,2,4,6,8,10
          precision: 0,
        },
        title: {
          display: true,
          text: "No. of Activities",
          font: { size: 14 },
        },
      },
    },
  };

  /* ---------------- SCROLL HANDLER ---------------- */
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight + 2 >= scrollHeight) {
      reachedBottom();
    }
  };

  const activityStatusMapper = (status: string) => {
    switch (status) {
      case "submitted_success":
      case "SUBMITTED_SUCCESS":
        return "Submitted";
      case "submitted_waiting":
      case "SUBMITTED_WAITING":
        return "Waiting";
      case "submitted_failed":
      case "SUBMITTED_FAILED":
        return "Failed";
      case "rejected":
      case "REJECTED":
        return "Rejected";
      case "in_progress":
      case "IN_PROGRESS":
        return "In Progress";
      case "deleted":
      case "DELETED":
        return "Deleted";
      default:
        return status;
    }
  };

  const renderStatsTable = (title: string, stats: any) => (
    <div className="p-2 bg-white border border-gray-300 rounded-lg shadow-md w-full h-40 max-w-xs">
      <Text type="header3" className="mb-2">{title}</Text>

      <div className="overflow-y-auto max-h-28" onScroll={handleScroll}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-1 text-xs font-medium text-gray-500 uppercase">
                <Text type="small">Name</Text>
              </th>
              <th className="px-2 py-1 text-xs font-medium text-gray-500 uppercase">
                <Text type="small">Value</Text>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {stats?.length ? (
              stats.map((stat: any, index: number) => (
                <tr key={index}>
                  <td className="px-2 py-1 text-sm truncate">
                    {stat.name || activityStatusMapper(stat.stat)}
                  </td>
                  <td className="px-2 py-1 text-sm text-gray-600">
                    {stat.activity || stat.activity_count}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="px-2 py-1 text-sm text-gray-500">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="flex relative py-6 px-4 flex-row justify-between items-start xl:space-x-20">
      <div className="w-2/3 h-[350px]">
        <Bar data={data} options={options} />
      </div>

      <div className="flex flex-col gap-3 max-w-sm w-full">
        {renderStatsTable("Top Users Status", topUsers)}
        {renderStatsTable("Activity Status", activityStatus)}
      </div>
    </div>
  );
}
