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
import React from 'react';

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

interface TrendPoint {
	label: string;
	active_users: number;
}

interface Props {
	activityData: any;
	month: any;
	year: number;
	topUsers: any;
	trendData?: TrendPoint[] | null;
}

function getDaysInMonth(month: number, year: number) {
	return new Date(year, month, 0).getDate();
}

function getInitials(name: string) {
	if (!name) return '';
	const parts = name.split(' ');
	if (parts.length === 1) return parts[0][0]?.toUpperCase() || '';
	return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Activity({ activityData, month, year, topUsers, trendData }: Props) {
	const totalTranslations = activityData?.total;
	const daysInMonth = getDaysInMonth(month, year);
	const allDays = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());

	const dayToCount: Record<string, number> = {};
	if (activityData?.day && activityData?.count) {
		activityData.day.forEach((d: string, idx: number) => {
			dayToCount[d] = activityData.count[idx];
		});
	}
	const counts = allDays.map((d) => dayToCount[d] || 0);

	// Derived stats
	const activeUsers = topUsers?.filter((u: any) => u.total_translations > 0) ?? [];
	const activeUsersCount = activeUsers.length;
	const avgPerActiveUser = activeUsersCount > 0
		? Math.round((totalTranslations ?? 0) / activeUsersCount)
		: 0;

	// ── Bar chart (daily translations) ──────────────────────────────
	const barData = {
		labels: allDays,
		datasets: [
			{
				label: 'Translations',
				data: counts,
				backgroundColor: 'rgba(99, 132, 255, 0.5)',
			},
		],
	};

	const barOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: { display: false },
			title: {
				display: true,
				text: `Monthly translations: ${totalTranslations ?? 0}`,
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
					text: 'No. of translations',
					font: { size: 14 },
				},
				beginAtZero: true,
				suggestedMax: Math.max(...counts, 1) + 2,
				ticks: { precision: 0, stepSize: 1 },
			},
		},
	};

	// ── Line chart (active users trend) ─────────────────────────────
	const trendLabels = trendData?.map((p) => p.label) ?? [];
	const trendCounts = trendData?.map((p) => p.active_users) ?? [];
	const trendMax = Math.max(...trendCounts, 1);

	const lineData = {
		labels: trendLabels,
		datasets: [
			{
				label: 'Active users',
				data: trendCounts,
				borderColor: '#16a34a',           // green-600
				backgroundColor: 'rgba(22,163,74,0.10)',
				pointBackgroundColor: '#16a34a',
				pointRadius: 5,
				pointHoverRadius: 7,
				borderWidth: 2,
				tension: 0.35,
				fill: true,
			},
		],
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
	}
	};
	const lineOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: { display: false },
			title: { display: false },
			tooltip: {
				callbacks: {
					label: (ctx: any) => ` ${ctx.parsed.y} active user${ctx.parsed.y !== 1 ? 's' : ''}`,
				},
			},
		},
		scales: {
			x: {
				grid: { display: false },
				ticks: { font: { size: 12 } },
			},
			y: {
				beginAtZero: true,
				suggestedMax: trendMax + 1,
				ticks: { precision: 0, stepSize: 1 },
				grid: { color: 'rgba(0,0,0,0.06)' },
			},
		},
	};

	const widthPercentage = (user: any) => {
		if (!totalTranslations) return 0;
		return ((user?.total_translations / totalTranslations) * 100).toString();
	};

	return (
		<div className="flex flex-col px-4 py-4 gap-0">

			{/* ── TOP SECTION: stat cards + bar chart (left) | user list (right) ── */}
			<div className="flex flex-row gap-6 min-h-[380px]">

				{/* LEFT */}
				<div className="flex flex-col flex-1 gap-3 min-w-0">

					{/* Stat Cards */}
					<div className="flex flex-row gap-3">
						<div className="flex flex-col bg-gray-100 rounded-lg px-4 py-3 flex-1">
							<span className="text-xs text-gray-500 mb-1">Monthly translations</span>
							<span className="text-2xl font-medium text-gray-800">{totalTranslations ?? 0}</span>
							<span className="text-[11px] text-gray-400 mt-1">{months[month - 1]} {year}</span>
						</div>
						<div className="flex flex-col bg-gray-100 rounded-lg px-4 py-3 flex-1">
							<span className="text-xs text-gray-500 mb-1">Active users</span>
							<span className="text-2xl font-medium text-gray-800">{activeUsersCount}</span>
							<span className="text-[11px] text-gray-400 mt-1">Translated at least once</span>
						</div>
						<div className="flex flex-col bg-gray-100 rounded-lg px-4 py-3 flex-1">
							<span className="text-xs text-gray-500 mb-1">Avg. per active user</span>
							<span className="text-2xl font-medium text-gray-800">{avgPerActiveUser}</span>
							<span className="text-[11px] text-gray-400 mt-1">Translations this month</span>
						</div>
					</div>

					{/* Bar Chart */}
					<div className="flex-1 min-h-[260px]">
						<Bar className="lg:px-4 px-1" options={barOptions} data={barData} />
					</div>
				</div>

				{/* Vertical Divider */}
				<div className="w-px bg-gray-200 self-stretch" />

				{/* RIGHT: User Activity */}
				<div className="flex flex-col w-[280px] xl:w-[320px] flex-shrink-0 overflow-y-auto max-h-[380px]">
					<Text className="mb-3 text-lg md:text-xl" type="header3">User Activity</Text>
					{topUsers?.map((user: any, index: number) => (
						<div key={index} className="py-2 flex items-center w-full">
							<div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
								<span className="text-gray-600 text-sm">
									{user && getInitials(String(user.name || user.user_id))}
								</span>
							</div>
							<div className="ml-3 overflow-hidden w-full">
								<Text type="small" className="text-primary_text">
									{user.name ? user.name : `User ID: ${user.user_id}`}
								</Text>
								{user.email && (
									<Text
										type="small"
										className="text-gray-500 text-[11px] block overflow-hidden text-ellipsis whitespace-nowrap"
										title={user.email}
									>
										{user.email}
									</Text>
								)}
								<div
									title={`Total: ${totalTranslations}`}
									className="w-full bg-gray-200 h-4 mt-2 rounded-md overflow-hidden"
								>
									<div
										title={`Translations: ${user?.total_translations}`}
										className="bg-[#b1c1ff] rounded-r-md h-4 transition-all duration-300"
										style={{ width: `${widthPercentage(user)}%` }}
									/>
								</div>
							</div>
						</div>
					))}
					<div className="pt-2 mt-2 border-t border-gray-200">
						<span className="text-[11px] text-gray-400">
							Showing {activeUsersCount} active user{activeUsersCount !== 1 ? 's' : ''} this month
						</span>
					</div>
				</div>
			</div>

			{/* ── HORIZONTAL DIVIDER ─────────────────────────────────────────── */}
			{trendData && trendData.length > 0 && (
				<>
					<div className="border-t border-gray-200 mx-0 mt-4 mb-4" />

					{/* ── BOTTOM SECTION: month-on-month trend ──────────────────────── */}
					<div className="flex flex-col gap-2 pb-4">
						<span className="text-sm font-medium text-gray-700">
							Active users — month on month
						</span>
						<div className="h-[200px]">
							<Line options={lineOptions} data={lineData} plugins={[datalabelsPlugin]}/>
						</div>
					</div>
				</>
			)}
		</div>
	);
}
