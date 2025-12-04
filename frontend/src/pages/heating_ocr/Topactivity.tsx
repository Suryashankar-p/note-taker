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
import { findPercentage, getInitials } from "../../utils/functions";

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

interface Props {
  activityData: any;
  month: any;
  topUsers: any;
  activityStatus: any;
  reachedBottom: () => void;

}

export default function Activity1({
  activityData,
  month,
  topUsers,
  activityStatus,
  reachedBottom
}: Props) {
  const totalQuestions = activityData?.total || 0;

  const data = {
    labels: activityData?.day || [],
    datasets: [
      {
        label: "activities",
        data: activityData?.activity || [],
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
        display: false,
      },
      title: {
        display: true,
        text: `Monthly Activities: ${totalQuestions}`,
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems: any) => {
            // Assuming the x-axis labels are dates, you can customize the title
            const date = tooltipItems[0].label + " " + months[month - 1];
            return `Date: ${date}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: `Days of ${months[month - 1]}`,
          font: {
            size: 14,
          },
        },
      },
      y: {
        title: {
          display: true,
          text: "No. of Activities",
          font: {
            size: 14,
          },
        },
        beginAtZero: true,
      },
    },
  };  

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight + 2 >= scrollHeight) {
      reachedBottom()
    }
  };  

  const renderStatsTable = (title: string, stats: any) =>  (
    <div className="p-2 bg-white border border-gray-300 rounded-lg shadow-md w-full h-40 max-w-xs">
      <Text type="header3" className="mb-2">
        {title}
      </Text>
      <div className="overflow-y-auto max-h-28" onScroll={handleScroll}>
      <table className="min-w-full divide-y divide-gray-200 overflow-auto" >
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              <Text type="small">Name</Text>
            </th>
            <th
              scope="col"
              className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              <Text type="small">Value</Text>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {stats?.length > 0 ? (
            stats.map((stat: any, index: number) => (
              <tr key={index}>
                <td
                  className="px-2 py-1 whitespace-nowrap text-sm font-medium text-gray-900 overflow-hidden text-ellipsis"
                  style={{ maxWidth: "150px" }}
                  title={stat.name || (stat.stat && activityStatusMapper(stat.stat))}
                >
                  {stat.name ||
                    (stat.stat && activityStatusMapper(stat.stat))}
                </td>
                <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-600">
                  {stat.activity || stat.activity_count}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                className="px-2 py-1 whitespace-nowrap text-sm font-medium text-gray-900"
                colSpan={2}
              >
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  );

  const activityStatusMapper = (status: string) => {
    switch (status) {
      // case "submitted":
      //   return "Submitted";
      case "submitted_success":
        return "Submitted";
      case "submitted_waiting":
        return "Waiting";
      case "submitted_failed":
        return "Failed";
      case "deleted":
        return "Deleted";
      case "rejected":
        return "Rejected";
      case "in_progress":
        return "In Progress";
      case "SUBMITTED_SUCCESS":
        return "Submitted";
      case "SUBMITTED_WAITING":
        return "Waiting";
      case "SUBMITTED_FAILED":
        return "Failed";
      case "REJECTED":
        return "Rejected";
      case "IN_PROGRESS":
        return "In Progress";
      case "DELETED":
        return "Deleted";

    }
  };

  return (
   <div className="flex relative py-6 px-4 flex-row justify-between items-start xl:space-x-20">
  <div className="w-2/3">
    <Bar
      width={100}
      height={50}
      className="pl-4"
      options={options}
      data={data}
    />
  </div>

  <div className="mt-1 xl:mr-1 flex flex-col gap-3 max-w-sm w-full">
    {renderStatsTable("Top Users Status", topUsers)}
    {renderStatsTable("Activity Status", activityStatus)}
  </div>
</div>
  );
}
