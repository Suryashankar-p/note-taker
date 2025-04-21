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
import { months } from "../../../utils/constants";
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
  const startDate = usageData?.day[0] || "N/A";
  const endDate =
    usageData?.day.length > 0
      ? usageData?.day[usageData?.day.length - 1]
      : "N/A";
  const member = useSelector((state: RootState) => state.memberRole);
  const TroubleshootingMemberDetails =
    member.service === "troubleshooting" ? member?.details : {};

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    radius: 100,
    cutout: "60%",
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text:
          startDate !== "N/A" && endDate !== "N/A"
            ? `Monthly bill ${months[month - 1]} ${startDate} - ${endDate}`
            : "N/A",
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
    <div className="flex flex-col justify-evenly md:flex-row lg:h-[32rem] xl:h-screen sm:h-[48rem] h-[42rem] lg:flex-row xl:flex-row lg:py-6 py-1 justify-between px-4">
      {editLimit && (
        <EditLimitModal defaultValue={limit} onSubmit={onLimitEdit} />
      )}

      {/* Bar Chart */}
      <div className="w-full md:w-[300px] lg:w-[300px] xl:w-[500px] h-[250px] md:h-[200px] lg:h-[300px] relative -top-8 lg:top-4 lg:-left-4">
        <Bar className="lg:px-4 px-1" options={options} data={data} />
      </div>

      {/* Doughnut Chart */}
      <div className="w-full md:w-1/2 lg:w-1/3 flex flex-col lg:flex-row top-1 relative justify-between items-between h-[300px] md:h-[150px] lg:h-[300px]">
        <Doughnut data={donutData} options={donutOptions} className="relative lg:-left-20 lg:top-0 -top-[4.5rem]"/>
        <div className="absolute lg:top-[60%] lg:left-[25%] top-[38%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 text-center text-primary_text w-[80px] md:w-[100px]">
          <Text type="header3">{percentage}%</Text>
        </div>
        <div className="absolute flex flex-col items-center lg:-right-8 lg:bottom-4 md:bottom-10 -bottom-6 right-[75px] ">
          <Text type="header2">${totalCost}</Text>
          <Text className="text-primary_text" type="body">
            /${limit} limit
          </Text>
          {TroubleshootingMemberDetails?.role === "OWNER" && (
            <button
              onClick={() => dispatch.modal.openEditLimit()}
              className="bg-danger rounded-lg p-2 m-2 md:p-3 md:m-4 text-sm md:text-base"
            >
              <Text className="text-white" type="body">
                Increase Limit
              </Text>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
