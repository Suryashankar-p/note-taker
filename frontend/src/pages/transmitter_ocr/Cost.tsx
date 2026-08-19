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
import Text from "../../components/Text";
import { findPercentage, roundToFourDecimals } from "../../utils/functions";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../redux/store";
import EditLimitModal from "../../components/Modals/EditLimit";
import { months } from "../../utils/constants";
import { useEffect, useRef, useState } from "react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Cost({ usageData, limit, onLimitEdit, month }: any) {
  const totalCost = usageData?.total
    ? roundToFourDecimals(usageData?.total)
    : 0;
  const dispatch = useDispatch<Dispatch>();
  const editLimit = useSelector((state: RootState) => state.modal.editLimit);
  const percentage = findPercentage(totalCost, limit);
  const percentageRef = useRef<HTMLDivElement>(null);
  const [percentageWidth, setPercentageWidth] = useState(0);
  const startDate = usageData?.day[0] || "N/A";
  const endDate =
    usageData?.day.length > 0
      ? usageData?.day[usageData?.day.length - 1]
      : "N/A";
  const member = useSelector((state: RootState) => state.memberRole);
  const ocrMemberDetails = member.service === "transmitter_ocr" ? member?.details : {};

  useEffect(() => {
    if (percentageRef.current) {
      setPercentageWidth(percentageRef.current.offsetWidth);
    }
  }, [percentage]);

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    radius: 80,
    cutout: '60%',
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: (startDate !== 'N/A' && endDate !== 'N/A') ? `Monthly bill ${months[month - 1]} ${startDate} - ${endDate}` : 'N/A',
      },
    },
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        display: false,
      },
      title: {
        display: true,
        text: `Monthly Spend $ ${totalCost}`,
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems: any) => {
            const date = tooltipItems[0].label + " " + months[month - 1];
            return `Date: ${date}`;
          },
          label: (tooltipItem: any) => {
            const value = tooltipItem.raw.toFixed(4);
            return `Cost: $${value}`;
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
          text: "Cost in $",
          font: {
            size: 14,
          },
        },
        beginAtZero: true,
      },
    },
  };

  const data = {
    labels: usageData?.day,
    datasets: [
      {
        label: "Cost",
        data: usageData?.cost,
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  const donutData = {
    labels: ["Used", "Remaining"],
    datasets: [
      {
        label: "Cost",
        data: [totalCost, limit - totalCost],
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(200, 200, 200, 0.5)",
        ],
        borderColor: ["rgba(255, 99, 132, 1)", "rgba(200, 200, 200, 1)"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="flex relative py-6 px-4 flex-col lg:flex-row justify-between items-start gap-6">
      {editLimit && (
        <div>
          <EditLimitModal defaultValue={limit} onSubmit={onLimitEdit} />
        </div>
      )}
      <div className="w-full lg:w-[55%] h-80 relative">
        <Bar
          className="pl-4"
          options={options}
          data={data}
        />
      </div>
      <div className="w-full lg:w-[45%] flex flex-col sm:flex-row justify-center items-center gap-8 min-h-[320px] self-center">
        <div className="relative w-64 h-64 flex justify-center items-center">
          <Doughnut
            data={donutData}
            options={donutOptions}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-8">
            <Text type="header3" className="text-gray-800 font-bold">{percentage}%</Text>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center text-center p-4 bg-gray-50 rounded-xl border border-gray-100 min-w-[180px]">
          <Text type="header2" className="text-gray-800 font-bold">${totalCost}</Text>
          <Text className="text-gray-500 mt-1" type="body">
            /${limit} limit
          </Text>
          {ocrMemberDetails && ocrMemberDetails?.role === "OWNER" ? (
            <button
              onClick={() => dispatch.modal.openEditLimit()}
              className="bg-danger hover:bg-red-700 text-white font-semibold rounded-lg px-4 py-2 mt-4 shadow-sm transition duration-300 w-full"
            >
              <Text className="text-white" type="body">
                Increase Limit
              </Text>
            </button>
          ) : (
            <div className="py-2 mt-4 invisible" style={{ visibility: "hidden" }}>
              <Text type="body">Increase Limit</Text>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}