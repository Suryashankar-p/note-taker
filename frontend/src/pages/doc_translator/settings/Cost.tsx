import { Bar } from "react-chartjs-2";
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
import { months } from "../../../utils/constants";
import React from 'react';

ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
	ArcElement
);

function getDaysInMonth(month: number, year: number) {
	return new Date(year, month, 0).getDate();
}

export default function Cost({ usageData, month, year }: any) {
	const totalCost = usageData?.total ? usageData?.total.toFixed(4) : 0;
	const daysInMonth = getDaysInMonth(month, year);
	const allDays = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());
	// Map usageData.day/cost to allDays
	const dayToCost: Record<string, number> = {};
	if (usageData?.day && usageData?.cost) {
		usageData.day.forEach((d: string, idx: number) => {
			dayToCost[d] = usageData.cost[idx];
		});
	}
	const costs = allDays.map((d) => dayToCost[d] || 0);

	const startDate = allDays[0] || "N/A";
	const endDate = allDays.length > 0 ? allDays[allDays.length - 1] : "N/A";

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
				text:
					startDate !== "N/A" && endDate !== "N/A"
						? `Monthly bill ${months[month - 1]} ${startDate} - ${endDate}`
						: "N/A",
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
		labels: allDays,
		datasets: [
			{
				label: "Cost",
				data: costs,
				backgroundColor: "rgba(99, 132, 255, 0.5)",
			},
		],
	};

	return (
		<div className="flex flex-col gap-8 px-2 pt-8 h-screen">
			<Text type="header3" className="mb-2 text-lg md:text-xl">
				Monthly Spend: ${totalCost}
			</Text>
			<div className="w-full h-[300px]">
				<Bar options={options} data={data} />
			</div>
		</div>
	);
}
