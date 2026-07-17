import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import CustomSelect from "../CustomSelect";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

type MarginDataPoint = {
  quarter: string;
  overall_gm_pct: number | null;
  standard_gm_pct: number | null;
  non_standard_gm_pct: number | null;
  baseline_gm_pct?: number | null;
  target_gm_pct?: number | null;
  gap_vs_baseline_pp?: number | null;
  gap_vs_target_pp?: number | null;
};

interface MarginTrendChartProps {
  data?: Record<string, MarginDataPoint[]> | MarginDataPoint[];
}

const MarginTrendChart = ({ data }: MarginTrendChartProps) => {
  const [selectedFamily, setSelectedFamily] = useState<string>("");

  const normalizedData = React.useMemo(() => {
    if (!data) return {};
    if (Array.isArray(data)) return { "All Families": data };

    if (typeof data === "object") {
      const validData: Record<string, MarginDataPoint[]> = {};
      for (const key in data) {
        if (Array.isArray((data as any)[key])) {
          validData[key] = (data as any)[key];
        }
      }
      return validData;
    }
    return {};
  }, [data]);

  const families = Object.keys(normalizedData);

  useEffect(() => {
    if (families.length > 0 && !selectedFamily) {
      if (families.includes("All Families")) {
        setSelectedFamily("All Families");
      } else {
        setSelectedFamily(families[0]);
      }
    }
  }, [normalizedData, selectedFamily]);

  const sortQuarters = (a: string, b: string) => {
    const matchA = a.match(/Q(\d) /);
    const matchB = b.match(/Q(\d) /);
    const yearA = a.match(/FY (\d+)/);
    const yearB = b.match(/FY (\d+)/);
    if (!matchA || !matchB || !yearA || !yearB) return 0;
    const qA = parseInt(matchA[1]);
    const yA = parseInt(yearA[1]);
    const qB = parseInt(matchB[1]);
    const yB = parseInt(yearB[1]);
    if (yA !== yB) return yA - yB;
    return qA - qB;
  };

  if (families.length === 0) return null;

  const activeFamily =
    selectedFamily && families.includes(selectedFamily)
      ? selectedFamily
      : families[0];
  const apiData = normalizedData[activeFamily] || [];

  const sortedApiData = [...apiData]
    .filter((item) => {
      const q = item?.quarter || "";
      const match = q.match(/Q(\d) /);
      const year = q.match(/FY (\d+)/);
      if (!match || !year) return false;
      const qNum = parseInt(match[1]);
      const yNum = parseInt(year[1]);
      const val = yNum * 10 + qNum;
      return val >= 244 && val <= 264;
    })
    .sort((a, b) => sortQuarters(a?.quarter || "", b?.quarter || ""));

  const chartData = {
    labels: sortedApiData.map((item) => item.quarter),
    datasets: [
      {
        label: `Actual margin %`,
        data: sortedApiData.map((item) => item.overall_gm_pct),
        spanGaps: true,
        fill: true,
        borderColor: "#a61c1e",
        backgroundColor: "rgba(166, 28, 30, 0.04)",
        tension: 0.4,
        pointBackgroundColor: "#a61c1e",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "#a61c1e",
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: `Heating baseline`,
        data: sortedApiData.map((item) => item.baseline_gm_pct ?? null),
        spanGaps: true,
        fill: false,
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245, 158, 11, 0.08)",
        borderDash: [6, 4],
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#0f172a",
        titleColor: "#f8fafc",
        bodyColor: "#f8fafc",
        borderColor: "#e2e8f0",
        borderWidth: 1,
        padding: 10,
        cornerRadius: 6,
        displayColors: false,
        callbacks: {
          label: (context: any) => {
            const dataPoint = sortedApiData[context.dataIndex];
            if (!dataPoint)
              return `Overall Margin: ${context.parsed.y?.toFixed(1)}%`;

            const lines = [`Overall Margin: ${context.parsed.y?.toFixed(1)}%`];

            if (
              dataPoint.standard_gm_pct !== null &&
              dataPoint.standard_gm_pct !== undefined
            ) {
              lines.push(
                `Standard Margin: ${dataPoint.standard_gm_pct.toFixed(1)}%`,
              );
            }

            if (
              dataPoint.non_standard_gm_pct !== null &&
              dataPoint.non_standard_gm_pct !== undefined
            ) {
              lines.push(
                `Non-Standard Margin: ${dataPoint.non_standard_gm_pct.toFixed(1)}%`,
              );
            }

            if (
              dataPoint.baseline_gm_pct !== null &&
              dataPoint.baseline_gm_pct !== undefined
            ) {
              lines.push(
                `Heating baseline: ${dataPoint.baseline_gm_pct.toFixed(1)}%`,
              );
            }

            if (
              dataPoint.gap_vs_baseline_pp !== null &&
              dataPoint.gap_vs_baseline_pp !== undefined
            ) {
              lines.push(
                `Actual gap vs baseline: ${dataPoint.gap_vs_baseline_pp.toFixed(1)} pp`,
              );
            }

            if (
              dataPoint.target_gm_pct !== null &&
              dataPoint.target_gm_pct !== undefined
            ) {
              lines.push(`Target: ${dataPoint.target_gm_pct.toFixed(1)}%`);
            }

            if (
              dataPoint.gap_vs_target_pp !== null &&
              dataPoint.gap_vs_target_pp !== undefined
            ) {
              lines.push(
                `Gap vs Target: ${dataPoint.gap_vs_target_pp.toFixed(1)} pp`,
              );
            }

            return lines;
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          color: "#64748b",
          callback: (value: any) => `${value}%`,
        },
        grid: {
          color: "#e2e8f0",
        },
      },
      x: {
        ticks: {
          color: "#64748b",
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h3 className="text-sm font-semibold tracking-wider text-gray-500 uppercase">
            Margin trend
          </h3>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[10px] text-gray-400 font-bold uppercase">
              Product families
            </span>
            <CustomSelect
              options={families}
              value={activeFamily}
              onChange={setSelectedFamily}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#a61c1e]"></span>
          <span className="text-xs text-gray-600 font-semibold">
            {activeFamily} margin %
          </span>
        </div>
      </div>

      <div className="h-64">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default MarginTrendChart;
