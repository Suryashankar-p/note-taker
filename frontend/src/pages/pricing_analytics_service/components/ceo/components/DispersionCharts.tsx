import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import CustomSelect from "../../CustomSelect";
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
    density_curves: Array<{
      name: string;
      points: Array<{ x: number; y: number }>;
    }> | Record<string, any> | null;
    trend: Array<{
      quarter: string;
      mean_gm_pct: number | null;
      std_dev: number | null;
      upper_band: number | null;
      lower_band: number | null;
    }>;
    family_nk: string;
  } | null;
  families: Array<{
    nk: string;
    display: string;
    classification: string | null;
  }>;
  selectedFamily: string | null;
  setSelectedFamily: (val: string | null) => void;
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

  const classifications = ["All", ...Array.from(new Set(families.map((f) => f.classification).filter(Boolean)))]
    .filter((c) => {
      const trimmed = c.trim().toLowerCase();
      return trimmed !== "" && trimmed !== "0" && trimmed !== "o" && trimmed !== "#n/a" && trimmed !== "n/a";
    });

  const filteredFamilies = families.filter((f) => {
    if (selectedClassification === "All") return true;
    return f.classification === selectedClassification;
  });

  const rawFamilyName = families.find((f) => f.nk === selectedFamily)?.display || "No Family Selected";
  const selectedFamilyName = rawFamilyName
    .replace(/\s*\(\s*(o|n\/a)\s*\)/gi, "")
    .replace(/\b(o|n\/a)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  const hasData = familyDispersion && familyDispersion.family_nk !== "null";

  const dispersionCurveData = {
    datasets: familyDispersion?.density_curves && !Array.isArray(familyDispersion.density_curves)
      ? Object.entries(familyDispersion.density_curves).map(([key, pointsArray]: [string, any]) => {
          let color = "#94a3b8";
          if (key.toLowerCase().includes("current")) {
            color = "#a61c1e";
          } else if (key.toLowerCase().includes("prior")) {
            color = "#0ea5e9";
          }

          const nameMap: Record<string, string> = {
            baseline: "Baseline",
            prior_quarter: "Prior Quarter",
            current_quarter: "Current Quarter"
          };
          const label = nameMap[key] || key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

          return {
            label,
            data: pointsArray,
            borderColor: color,
            borderWidth: 2,
            fill: false,
            tension: 0.4,
            pointRadius: 0,
          };
        })
      : [],
  };

  const trendRows = familyDispersion?.trend || [];
  const validTrendRows = trendRows.filter((r) => r.mean_gm_pct !== null && r.mean_gm_pct !== undefined);

  const trendData = {
    labels: validTrendRows.map((r) => r.quarter),
    datasets: [
      {
        label: "Mean GM%",
        data: validTrendRows.map((r) => r.mean_gm_pct),
        borderColor: "#0ea5e9",
        borderWidth: 2.5,
        fill: false,
        tension: 0.3,
        pointRadius: 3,
      },
      {
        label: "Confidence Band",
        data: validTrendRows.map((r) => r.upper_band),
        borderColor: "rgba(14, 165, 233, 0.05)",
        backgroundColor: "rgba(14, 165, 233, 0.05)",
        fill: "+1",
        tension: 0.3,
        pointRadius: 0,
      },
      {
        label: "Lower Band",
        data: validTrendRows.map((r) => r.lower_band),
        borderColor: "rgba(14, 165, 233, 0.05)",
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
          boxWidth: 10,
          font: { size: 9 }
        }
      },
    },
    scales: {
      y: {
        grid: { color: "#e2e8f0" },
        ticks: { color: "#64748b" },
      },
      x: {
        type: "linear" as const,
        grid: { display: false },
        ticks: { color: "#64748b" },
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
        grid: { color: "#e2e8f0" },
        ticks: { color: "#64748b" },
      },
      x: {
        grid: { display: false },
        ticks: { color: "#64748b" },
      },
    },
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm relative">
      {isFetching && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center z-10 transition-all rounded-xl">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-700"></div>
        </div>
      )}


      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 border-b border-gray-150 pb-4">
        <h3 className="text-base font-bold text-gray-900">Family-level GM% dispersion — {selectedFamilyName}</h3>
        <div className="flex gap-3">
          <CustomSelect
            options={classifications}
            value={selectedClassification}
            onChange={setSelectedClassification}
            labelPrefix="Classification: "
          />
          <CustomSelect
            options={filteredFamilies.map((f) => ({
              value: f.nk,
              label: f.display
                .replace(/\s*\(\s*(o|n\/a)\s*\)/gi, "")
                .replace(/\b(o|n\/a)\b/gi, "")
                .replace(/\s+/g, " ")
                .trim(),
            }))}
            value={selectedFamily || ""}
            onChange={(val) => setSelectedFamily(val || null)}
            labelPrefix="Product Family: "
            alignRight
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h4 className="text-xs font-bold text-gray-700 mb-2">Dispersion curve of gross margins</h4>
          <p className="text-[10px] text-gray-400 mb-4">Baseline vs last vs current quarter - normalized frequency</p>
          <div className="h-56 relative">
            {hasData ? (
              <Line data={dispersionCurveData} options={curveChartOptions} />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 border border-dashed border-gray-200 rounded-lg text-center text-xs text-gray-405 p-6">
                Select a product family above to view gross margin dispersion curves.
              </div>
            )}
          </div>
        </div>
        <div>
          <h4 className="text-xs font-bold text-gray-700 mb-2">GM% distribution trend — quarter on quarter</h4>
          <p className="text-[10px] text-gray-400 mb-4">Mean GM% with ±1σ confidence band</p>
          <div className="h-56 relative">
            {hasData && validTrendRows.length > 0 ? (
              <Line data={trendData} options={trendChartOptions} />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 border border-dashed border-gray-200 rounded-lg text-center text-xs text-gray-405 p-6">
                Select a product family above to view gross margin distribution trends.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DispersionCharts;
