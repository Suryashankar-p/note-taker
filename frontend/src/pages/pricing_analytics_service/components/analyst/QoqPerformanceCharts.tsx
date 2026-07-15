import React from "react";
import { ArrowRight } from "lucide-react";
import { Chart, Line } from "react-chartjs-2";
import { useGetQoqDistribution, useGetDispersion } from "../../services/query/query";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface QoqPerformanceChartsProps {
  selectedFamily: string;
  selectedDetails: {
    name: string;
    revenue: string;
    actual: string;
    target: string;
    delta: string;
    deltaVal: number;
    history: Array<{ quarter: string; revenue: number; gm: number }>;
    baseline: number;
    targetVal: number;
    mean: string;
    stdDev: string;
    median: string;
    min: string;
    max: string;
    transactionCount?: number;
    familyNk?: string;
  };
  sortedQuarters: string[];
  onNavigateToSku: () => void;
  activeQuarter: string;
}

const QoqPerformanceCharts: React.FC<QoqPerformanceChartsProps> = ({
  selectedFamily,
  selectedDetails,
  sortedQuarters,
  onNavigateToSku,
  activeQuarter,
}) => {
  const sessionId = Number(localStorage.getItem("pricing_session_id"));
  const familyNk = selectedDetails.familyNk || selectedFamily.toLowerCase();
  
  const { data: qoqDistributionData, isFetching: isQoqDistributionFetching } = useGetQoqDistribution(sessionId, activeQuarter, familyNk);
  const { data: dispersionData, isFetching: isDispersionFetching } = useGetDispersion(sessionId, familyNk);

  const familyDispersion = dispersionData?.family_dispersion;
  const hasDispersionData = !!qoqDistributionData?.summary;

  const gmValues = selectedDetails.history.map(h => h.gm).filter(v => v != null);
  const revValues = selectedDetails.history.map(h => h.revenue).filter(v => v != null);
  const gmMin = gmValues.length > 0 ? Math.floor(Math.min(...gmValues, selectedDetails.targetVal, selectedDetails.baseline) - 10) : 0;
  const gmMax = gmValues.length > 0 ? Math.ceil(Math.max(...gmValues, selectedDetails.targetVal, selectedDetails.baseline) + 10) : 100;
  const revMax = revValues.length > 0 ? Math.ceil(Math.max(...revValues) * 1.3) : 100;

  const comboChartData = {
    labels: selectedDetails.history.map(h => h.quarter),
    datasets: [
      {
        type: "bar" as const,
        label: "Revenue",
        yAxisID: "yRev",
        data: selectedDetails.history.map(h => h.revenue),
        backgroundColor: "rgba(166, 28, 30, 0.25)",
        borderRadius: 4,
        barPercentage: 0.45,
        order: 2,
      },
      {
        type: "line" as const,
        label: "GM %",
        yAxisID: "yGM",
        data: selectedDetails.history.map(h => h.gm),
        borderColor: "#a61c1e",
        borderWidth: 2,
        tension: 0.35,
        pointBackgroundColor: "#a61c1e",
        pointBorderColor: "#fff",
        pointRadius: 4,
        fill: false,
        order: 1,
      },
      {
        type: "line" as const,
        label: `PMA Target (${selectedDetails.target})`,
        yAxisID: "yGM",
        data: selectedDetails.history.map(() => selectedDetails.targetVal),
        borderColor: "#eab308",
        borderDash: [5, 5],
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false,
        order: 3,
      },
      {
        type: "line" as const,
        label: `Baseline (${selectedDetails.baseline.toFixed(1)}%)`,
        yAxisID: "yGM",
        data: selectedDetails.history.map(() => selectedDetails.baseline),
        borderColor: "#eab308",
        borderDash: [5, 5],
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false,
        order: 4,
      }
    ]
  };

  const comboChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: "#1e293b", padding: 10, cornerRadius: 6 }
    },
    scales: {
      yGM: {
        type: "linear" as const,
        position: "left" as const,
        min: gmMin,
        max: gmMax,
        ticks: {
          color: "#64748b",
          callback: (value: any) => `${value}%`,
        },
        grid: { color: "#f1f5f9" }
      },
      yRev: {
        type: "linear" as const,
        position: "right" as const,
        min: 0,
        max: revMax,
        ticks: {
          color: "#64748b",
          callback: (value: any) => `₹${value}L`,
        },
        grid: { display: false }
      },
      x: {
        ticks: { color: "#64748b" },
        grid: { display: false }
      }
    }
  };

  const meanVal = qoqDistributionData?.summary?.mean ?? parseFloat(selectedDetails.mean) ?? 0;
  const stdVal  = qoqDistributionData?.summary?.std_dev ?? parseFloat(selectedDetails.stdDev) ?? 0;
  
  const histogramMin = qoqDistributionData?.summary?.min ? Math.floor(qoqDistributionData.summary.min - 2) : 0;
  const histogramMax = qoqDistributionData?.summary?.max ? Math.ceil(qoqDistributionData.summary.max + 2) : 100;

  const muSigmaPlugin = {
    id: "muSigmaLines",
    afterDraw: (chart: any) => {
      const ctx = chart.ctx;
      const xSc = chart.scales["x"];
      const ySc = chart.scales["y"];
      if (!xSc || !ySc) return;

      const toPixel = (gmVal: number) => {
        return xSc.getPixelForValue(gmVal);
      };

      const lines = [
        { val: qoqDistributionData?.markers?.mu_minus_sigma ?? (meanVal - stdVal), label: "μ-σ" },
        { val: qoqDistributionData?.markers?.mu ?? meanVal,          label: "μ"   },
        { val: qoqDistributionData?.markers?.mu_plus_sigma ?? (meanVal + stdVal), label: "μ+σ" },
      ];

      lines.forEach(({ val, label }) => {
        const px   = toPixel(val);
        const yTop = ySc.top;
        const yBot = ySc.bottom;

        ctx.save();
        ctx.setLineDash([5, 4]);
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth   = 1.5;
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.moveTo(px, yTop);
        ctx.lineTo(px, yBot);
        ctx.stroke();

        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
        ctx.font        = "bold 9px Inter, sans-serif";
        ctx.fillStyle   = "#f59e0b";
        ctx.textAlign   = "center";
        ctx.fillText(label, px, yTop - 4);
        ctx.restore();
      });
    },
  };

  const xBarLabels = qoqDistributionData?.histogram?.map((h: any) => `${h.start}-${h.end}%`) || [];

  const histogramChartData = {
    labels: xBarLabels,
    datasets: [
      {
        type: "bar" as const,
        label: "Frequency",
        xAxisID: "xBar",
        data: qoqDistributionData?.histogram?.map((h: any) => h.frequency) || [],
        backgroundColor: "rgba(56, 189, 248, 0.65)",
        borderColor: "rgba(56, 189, 248, 0.95)",
        borderWidth: 1,
        barPercentage: 0.95,
        categoryPercentage: 1.0,
        order: 2,
        yAxisID: "y",
      },
      {
        type: "line" as const,
        label: "Normal dist.",
        xAxisID: "xLine",
        data: qoqDistributionData?.normal_curve?.map((pt: any) => ({
          x: pt.x,
          y: pt.y
        })) || [],
        borderColor: "#f59e0b",
        borderWidth: 2.5,
        tension: 0.45,
        pointRadius: 0,
        fill: "origin",
        backgroundColor: "rgba(245, 158, 11, 0.08)",
        order: 1,
        yAxisID: "y",
      },
    ],
  };

  const histogramOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
        labels: { boxWidth: 10, font: { size: 9 }, color: "#64748b" },
      },
      tooltip: { backgroundColor: "#1e293b", padding: 8, cornerRadius: 6 },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "# Transactions", color: "#94a3b8", font: { size: 9 } },
        grid: { color: "#f1f5f9" },
        ticks: { color: "#64748b", font: { size: 9 }, precision: 0 },
      },
      xBar: {
        type: "category" as const,
        grid: { display: false },
        ticks: {
          color: "#64748b",
          font: { size: 9 }
        },
      },
      xLine: {
        type: "linear" as const,
        display: false,
        min: qoqDistributionData?.histogram?.[0]?.start ?? 40,
        max: qoqDistributionData?.histogram?.[qoqDistributionData.histogram.length - 1]?.end ?? 60,
      },
    },
  };

  const trendRows = familyDispersion?.trend || [];
  const validTrendRows = trendRows.filter((r: any) => r.mean_gm_pct !== null && r.mean_gm_pct !== undefined);

  const trendData = {
    labels: validTrendRows.map((r: any) => r.quarter),
    datasets: [
      {
        label: "Mean GM%",
        data: validTrendRows.map((r: any) => r.mean_gm_pct),
        borderColor: "#38bdf8",
        borderWidth: 2.5,
        fill: false,
        tension: 0.3,
        pointRadius: 3,
      },
      {
        label: "Confidence Band",
        data: validTrendRows.map((r: any) => r.upper_band),
        borderColor: "rgba(56, 189, 248, 0.05)",
        backgroundColor: "rgba(56, 189, 248, 0.15)",
        fill: "+1",
        tension: 0.3,
        pointRadius: 0,
      },
      {
        label: "Lower Band",
        data: validTrendRows.map((r: any) => r.lower_band),
        borderColor: "rgba(56, 189, 248, 0.05)",
        fill: false,
        tension: 0.3,
        pointRadius: 0,
      },
    ],
  };

  const trendChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
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
    <div className="flex flex-col gap-8 w-full">
      <div className="bg-white border border-gray-250 rounded-xl p-6 shadow-sm flex flex-col gap-6 animate-fade-in">
        <div>
          <h3 className="text-sm font-bold tracking-tight text-gray-800">
            Revenue and GM % by quarter
          </h3>
          <p className="text-[11px] text-gray-400 font-semibold uppercase mt-0.5">
            Select a product family row in the table to update all charts below. (Active: <strong className="text-[#a61c1e]">{selectedFamily}</strong>)
          </p>
        </div>

        <div className="h-72 bg-slate-50 rounded-xl border border-gray-150 p-5">
          <span className="text-[10px] text-gray-400 font-extrabold uppercase mb-2 block">
            Revenue and GM % by quarter for {selectedFamily}
          </span>
          <div className="h-60">
            <Chart type="bar" data={comboChartData} options={comboChartOptions} />
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-250 rounded-xl p-6 shadow-sm flex flex-col gap-6 animate-fade-in relative text-gray-800">
        {isDispersionFetching && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center z-10 transition-all rounded-xl">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-700"></div>
          </div>
        )}

        <div>
          <h3 className="text-sm font-bold tracking-tight text-gray-850 text-blue-900">
            GM% dispersion analysis
          </h3>
          <p className="text-[11px] text-gray-400 font-semibold uppercase mt-0.5">
            Invoice-line GM% for the selected product family (each COGS row = one transaction). Charts update when you pick a family in the table above. <strong className="text-[#a61c1e]">{activeQuarter} - {selectedDetails.name}</strong>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 border-b border-gray-150 pb-6">
          <div className="bg-slate-50 border border-gray-150 p-5 rounded-xl">
            <h4 className="text-xs font-bold text-gray-700 mb-1">Normal distribution — GM%</h4>
            <p className="text-[10px] text-gray-400 mb-4">Bell curve fit · histogram overlay · μ±σ bands</p>
            <div className="h-56">
              {hasDispersionData || stdVal > 0 ? (
                <Chart type="bar" data={histogramChartData} options={histogramOptions} plugins={[muSigmaPlugin]} />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-50 border border-dashed border-gray-200 rounded-lg text-xs text-gray-400">
                  Select a product family above to view gross margin dispersion curves.
                </div>
              )}
            </div>
          </div>
          <div className="bg-slate-50 border border-gray-150 p-5 rounded-xl">
            <h4 className="text-xs font-bold text-gray-700 mb-1">GM% distribution trend — quarter on quarter</h4>
            <p className="text-[10px] text-gray-400 mb-4">Mean GM% with ±1σ confidence band</p>
            <div className="h-56">
              {hasDispersionData && validTrendRows.length > 0 ? (
                <Line data={trendData} options={trendChartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-50 border border-dashed border-gray-200 rounded-lg text-xs text-gray-400">
                  Select a product family above to view gross margin distribution trends.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-slate-50 border border-gray-200 rounded-xl p-5">
          <span className="text-[10px] text-gray-400 font-extrabold uppercase mb-4 block">
            Distribution statistics — {activeQuarter} · {selectedDetails.name} · {qoqDistributionData?.summary?.count ?? selectedDetails.transactionCount ?? 0} transactions
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Mean GM%</span>
              <span className="text-xl font-black text-gray-900 mt-1">
                {qoqDistributionData?.summary?.mean !== undefined ? `${qoqDistributionData.summary.mean.toFixed(1)}%` : selectedDetails.mean}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Std dev (σ)</span>
              <span className="text-xl font-black text-gray-900 mt-1">
                {qoqDistributionData?.summary?.std_dev !== undefined ? `${qoqDistributionData.summary.std_dev.toFixed(1)}%` : selectedDetails.stdDev}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Median</span>
              <span className="text-xl font-black text-gray-900 mt-1">
                {qoqDistributionData?.summary?.median !== undefined ? `${qoqDistributionData.summary.median.toFixed(1)}%` : selectedDetails.median}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Min GM%</span>
              <span className="text-xl font-black text-gray-900 mt-1">
                {qoqDistributionData?.summary?.min !== undefined ? `${qoqDistributionData.summary.min.toFixed(1)}%` : selectedDetails.min}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Max GM%</span>
              <span className="text-xl font-black text-gray-900 mt-1">
                {qoqDistributionData?.summary?.max !== undefined ? `${qoqDistributionData.summary.max.toFixed(1)}%` : selectedDetails.max}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onNavigateToSku}
          className="mt-2 flex items-center justify-center gap-2 w-full py-2 bg-[#a61c1e] hover:bg-[#8e181a] text-white font-bold rounded-lg text-xs tracking-wide transition-all shadow-md hover:scale-[1.01] active:scale-[0.99]"
        >
          SKU deviation drill-down
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default QoqPerformanceCharts;
