import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import CustomSelect from "../CustomSelect";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DispersionChartsProps {
  familyDispersion?: {
    curve?: {
      baseline: number[];
      lastQuarter: number[];
      currentQuarter: number[];
    };
    trend?: Array<{
      quarter: string;
      mean: number;
      range: number[];
    }>;
  } | null;
  families: Array<{
    nk: string;
    display_name: string;
  }>;
  selectedFamily: string | null;
  setSelectedFamily: (val: string) => void;
  isFetching?: boolean;
}

const DispersionCharts = ({
  familyDispersion,
  families,
  selectedFamily,
  setSelectedFamily,
  isFetching,
}: DispersionChartsProps) => {
  const [selectedClassification, setSelectedClassification] = useState<string>("All");

  const activeFamily = selectedFamily || "Air nozzle";

  const curveLabels = ["-10%", "0%", "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%"];
  const curveData = {
    labels: curveLabels,
    datasets: [
      {
        label: "Baseline (Q4 FY 24 + Q1 FY 25)",
        data: familyDispersion?.curve?.baseline || [10, 15, 30, 60, 95, 120, 110, 80, 45, 20, 5],
        borderColor: "#94a3b8",
        borderWidth: 2,
        tension: 0.35,
        fill: false,
        pointRadius: 0,
      },
      {
        label: "Last Quarter (Q3 FY 26)",
        data: familyDispersion?.curve?.lastQuarter || [8, 12, 25, 55, 90, 130, 115, 75, 40, 15, 4],
        borderColor: "#f43f5e",
        borderWidth: 2,
        tension: 0.35,
        fill: false,
        pointRadius: 0,
      },
      {
        label: "Current Quarter (Q4 FY 26)",
        data: familyDispersion?.curve?.currentQuarter || [6, 10, 20, 50, 85, 140, 125, 70, 35, 12, 3],
        borderColor: "#a61c1e",
        borderWidth: 2,
        tension: 0.35,
        fill: false,
        pointRadius: 0,
      },
    ],
  };

  const trendDataList = familyDispersion?.trend || [];
  const trendLabels = trendDataList.map((t) => t.quarter);
  const trendMeans = trendDataList.map((t) => t.mean);
  const trendUppers = trendDataList.map((t) => t.range[1]);
  const trendLowers = trendDataList.map((t) => t.range[0]);

  const trendData = {
    labels: trendLabels.length > 0 ? trendLabels : ["Q1 FY 25", "Q2 FY 25", "Q3 FY 25", "Q4 FY 25", "Q1 FY 26", "Q2 FY 26", "Q3 FY 26", "Q4 FY 26"],
    datasets: [
      {
        label: "Mean GM%",
        data: trendMeans.length > 0 ? trendMeans : [52.4, 51.9, 52.8, 53.5, 54.1, 55.3, 53.9, 54.8],
        borderColor: "#06b6d4",
        borderWidth: 2.5,
        tension: 0.3,
        fill: false,
        pointRadius: 3,
        pointBackgroundColor: "#06b6d4",
      },
      {
        label: "Upper Confidence Band",
        data: trendUppers.length > 0 ? trendUppers : [59.7, 59.0, 59.6, 61.2, 61.7, 62.8, 61.8, 62.5],
        borderColor: "rgba(6, 182, 212, 0.02)",
        backgroundColor: "rgba(6, 182, 212, 0.02)",
        fill: "+1",
        tension: 0.3,
        pointRadius: 0,
      },
      {
        label: "Lower Confidence Band",
        data: trendLowers.length > 0 ? trendLowers : [45.1, 44.8, 46.0, 45.8, 46.5, 47.8, 46.0, 47.1],
        borderColor: "rgba(6, 182, 212, 0.02)",
        fill: false,
        tension: 0.3,
        pointRadius: 0,
      },
    ],
  };

  const curveChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
        labels: {
          color: "#4b5563",
          font: { size: 9 },
          boxWidth: 8,
        },
      },
    },
    scales: {
      y: {
        grid: { color: "#f3f4f6" },
        ticks: { color: "#6b7280" },
      },
      x: {
        grid: { display: false },
        ticks: { color: "#6b7280" },
      },
    },
  };

  const trendChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        grid: { color: "#f3f4f6" },
        ticks: { color: "#6b7280", callback: (val: any) => `${val}%` },
      },
      x: {
        grid: { display: false },
        ticks: { color: "#6b7280" },
      },
    },
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm relative text-gray-800">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 border-b border-gray-200 pb-4">
        <h3 className="text-base font-bold text-gray-900">Family-level GM% dispersion — {activeFamily}</h3>
        <div className="flex gap-3">
          <CustomSelect
            options={["All", "Proprietary", "Value-added", "Commodity"]}
            value={selectedClassification}
            onChange={setSelectedClassification}
            labelPrefix="Classification: "
          />
          <CustomSelect
            options={families.map((f) => f.display_name)}
            value={activeFamily}
            onChange={(val) => setSelectedFamily(val)}
            labelPrefix="Product Family: "
            alignRight
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h4 className="text-xs font-bold text-gray-700 mb-2">Dispersion curve of gross margins</h4>
          <p className="text-[10px] text-gray-400 mb-4 font-semibold uppercase">Baseline vs last vs current quarter - normalized frequency</p>
          <div className="h-56">
            <Line data={curveData} options={curveChartOptions} />
          </div>
        </div>
        <div>
          <h4 className="text-xs font-bold text-gray-700 mb-2">GM% distribution trend — quarter on quarter</h4>
          <p className="text-[10px] text-gray-400 mb-4 font-semibold uppercase">Mean GM% with ±1σ confidence band</p>
          <div className="h-56">
            <Line data={trendData} options={trendChartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DispersionCharts;
