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
      baseline?: any[];
      prior_quarter?: any[];
      lastQuarter?: any[];
      current_quarter?: any[];
      currentQuarter?: any[];
    } | null;
    trend?: Array<{
      quarter: string;
      std_dev?: number;
      lower_band?: number;
      upper_band?: number;
      mean_gm_pct?: number;
      mean?: number;
      range?: number[];
    }> | null;
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
  const activeFamilyDisplayName = families.find((f) => f.nk === activeFamily)?.display_name || activeFamily;

  const baselineData = familyDispersion?.curve?.baseline || [];
  const priorData = familyDispersion?.curve?.prior_quarter || familyDispersion?.curve?.lastQuarter || [];
  const currentData = familyDispersion?.curve?.current_quarter || familyDispersion?.curve?.currentQuarter || [];

  const hasCurveData = baselineData.length > 0;
  const curveLabels = hasCurveData
    ? baselineData.map((pt: any) => `${pt.x}%`)
    : ["-10%", "0%", "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%"];

  const curveData = {
    labels: curveLabels,
    datasets: [
      {
        label: "Baseline",
        data: hasCurveData ? baselineData.map((pt: any) => pt.y) : [],
        borderColor: "#94a3b8",
        borderWidth: 2,
        tension: 0.35,
        fill: false,
        pointRadius: 0,
      },
      {
        label: "Last Quarter",
        data: priorData.length > 0 ? priorData.map((pt: any) => pt.y) : [],
        borderColor: "#f43f5e",
        borderWidth: 2,
        tension: 0.35,
        fill: false,
        pointRadius: 0,
      },
      {
        label: "Current Quarter",
        data: currentData.length > 0 ? currentData.map((pt: any) => pt.y) : [],
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
  const trendMeans = trendDataList.map((t) => t.mean_gm_pct ?? t.mean);
  const trendUppers = trendDataList.map((t) => t.upper_band ?? t.range?.[1]);
  const trendLowers = trendDataList.map((t) => t.lower_band ?? t.range?.[0]);

  const trendData = {
    labels: trendLabels,
    datasets: [
      {
        label: "Mean GM%",
        data: trendMeans.length > 0 && trendMeans[0] !== undefined ? trendMeans : [],
        borderColor: "#06b6d4",
        borderWidth: 2.5,
        tension: 0.3,
        fill: false,
        pointRadius: 3,
        pointBackgroundColor: "#06b6d4",
      },
      {
        label: "Upper Confidence Band",
        data: trendUppers.length > 0 && trendUppers[0] !== undefined ? trendUppers : [],
        borderColor: "rgba(6, 182, 212, 0.02)",
        backgroundColor: "rgba(6, 182, 212, 0.02)",
        fill: "+1",
        tension: 0.3,
        pointRadius: 0,
      },
      {
        label: "Lower Confidence Band",
        data: trendLowers.length > 0 && trendLowers[0] !== undefined ? trendLowers : [],
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
        <h3 className="text-base font-bold text-gray-900">Family-level GM% dispersion — {activeFamilyDisplayName}</h3>
        <div className="flex gap-3">
          <CustomSelect
            options={["All", "Proprietary", "Value-added", "Commodity"]}
            value={selectedClassification}
            onChange={setSelectedClassification}
            labelPrefix="Classification: "
          />
          <CustomSelect
            options={families.map((f) => ({ value: f.nk, label: f.display_name }))}
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
