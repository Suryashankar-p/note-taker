import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { useGetOverallMargin } from "../../services/query/query";
import CustomSelect from "../CustomSelect";
import PageLoading from "../../../../components/PageLoading";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTitle,
  Tooltip,
  Legend,
  Filler
);

const sortQuarters = (a: string, b: string) => {
  const parseQ = (s: string) => {
    if (s.toLowerCase() === "baseline") return 0;
    const m = s.match(/Q(\d)\s+FY\s+(\d+)/);
    return m ? parseInt(m[2]) * 10 + parseInt(m[1]) : 999;
  };
  return parseQ(a) - parseQ(b);
};

const OverallMargin = () => {
  const navigate = useNavigate();
  const [selectedBU, setSelectedBU] = useState<string>("All BUs");

  // Fetch real data for all three BUs
  const heatingQuery = useGetOverallMargin("heating");
  const coolingQuery = useGetOverallMargin("cooling");
  const waterQuery = useGetOverallMargin("water");

  const isLoading = heatingQuery.isLoading || coolingQuery.isLoading || waterQuery.isLoading;

  const overallMarginTableData = useMemo(() => {
    const list: any[] = [];
    if (heatingQuery.data?.bridge_table) list.push(...heatingQuery.data.bridge_table);
    if (coolingQuery.data?.bridge_table) list.push(...coolingQuery.data.bridge_table);
    if (waterQuery.data?.bridge_table) list.push(...waterQuery.data.bridge_table);
    return list;
  }, [heatingQuery.data, coolingQuery.data, waterQuery.data]);

  // Quarters list from table data
  const tableQuarters = useMemo(() => {
    const qSet = new Set<string>();
    overallMarginTableData.forEach((row) => {
      if (row.quarters) {
        Object.keys(row.quarters).forEach((q) => qSet.add(q));
      }
    });
    return Array.from(qSet).sort(sortQuarters);
  }, [overallMarginTableData]);

  // Quarters list for the trend chart
  const trendQuarters = useMemo(() => {
    const qSet = new Set<string>();
    heatingQuery.data?.margin_trend?.forEach((item: any) => qSet.add(item.quarter));
    coolingQuery.data?.margin_trend?.forEach((item: any) => qSet.add(item.quarter));
    waterQuery.data?.margin_trend?.forEach((item: any) => qSet.add(item.quarter));
    return Array.from(qSet).sort(sortQuarters);
  }, [heatingQuery.data, coolingQuery.data, waterQuery.data]);

  const latestQuarter = trendQuarters[trendQuarters.length - 1] || "Q4 FY 26";

  const heatingTrendMap = useMemo(() => {
    const map = new Map<string, number>();
    heatingQuery.data?.margin_trend?.forEach((item: any) => map.set(item.quarter, item.overall_gm_pct));
    return map;
  }, [heatingQuery.data]);

  const coolingTrendMap = useMemo(() => {
    const map = new Map<string, number>();
    coolingQuery.data?.margin_trend?.forEach((item: any) => map.set(item.quarter, item.overall_gm_pct));
    return map;
  }, [coolingQuery.data]);

  const waterTrendMap = useMemo(() => {
    const map = new Map<string, number>();
    waterQuery.data?.margin_trend?.forEach((item: any) => map.set(item.quarter, item.overall_gm_pct));
    return map;
  }, [waterQuery.data]);

  if (isLoading) {
    return <PageLoading />;
  }

  // Table rendering logic
  const renderTable = () => {
    if (overallMarginTableData.length === 0) {
      return (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500 text-xs">
          No margin table data available. Make sure divisions are compiled.
        </div>
      );
    }

    return (
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm overflow-x-auto text-gray-800">
        <div className="text-center mb-4">
          <h3 className="text-sm font-bold tracking-wider text-gray-500 uppercase">
            Overall margins — all business units
          </h3>
        </div>
        <table className="w-full border-collapse text-left text-xs min-w-[1000px]">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-55/75">
              <th className="p-3 font-bold text-gray-600 border-r border-gray-200" rowSpan={2}>
                Business Unit
              </th>
              <th className="p-3 font-bold text-gray-600 border-r border-gray-200" rowSpan={2}>
                Segment
              </th>
              <th className="p-3 font-bold text-gray-600 border-r border-gray-200 text-center" colSpan={2}>
                Baseline
              </th>
              {tableQuarters.map((q) => (
                <th key={q} className="p-3 font-bold text-gray-600 border-r border-gray-200 text-center" colSpan={2}>
                  {q}
                </th>
              ))}
              <th className="p-3 font-bold text-gray-600 text-center bg-red-50/50" rowSpan={2}>
                ΔGM%<br /><span className="text-[10px] text-gray-400 font-normal">{latestQuarter} vs baseline</span>
              </th>
            </tr>
            <tr className="border-b border-gray-200 bg-gray-55/50">
              <th className="p-2 text-center text-[10px] font-bold text-gray-450 border-r border-gray-200">
                Revenue (Cr)
              </th>
              <th className="p-2 text-center text-[10px] font-bold text-gray-450 border-r border-gray-200">
                Achieved GM%
              </th>
              {tableQuarters.map((_, i) => (
                <React.Fragment key={i}>
                  <th className="p-2 text-center text-[10px] font-bold text-gray-450 border-r border-gray-200">
                    Revenue (Cr)
                  </th>
                  <th className="p-2 text-center text-[10px] font-bold text-gray-450 border-r border-gray-200">
                    Achieved GM%
                  </th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {overallMarginTableData.map((row, idx) => {
              const baselineGm = row.baseline_gm_pct || 0;
              const latestData = row.quarters?.[latestQuarter];
              const delta = latestData ? latestData.gm_pct - baselineGm : 0;
              const deltaStr = `${delta >= 0 ? "+" : ""}${delta.toFixed(1)}%`;
              const deltaClass = delta >= 0 ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-rose-50 text-rose-700 border-rose-100";

              // Simple rendering segments grouping check (Heating, Cooling, Water have standard/non-standard options)
              // We will just show segment names for each row label
              return (
                <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50/50 transition-colors">
                  <td className="p-3 font-bold text-gray-900 border-r border-gray-200 align-middle bg-gray-50/20">
                    {row.segment || "Unknown"}
                  </td>
                  <td className="p-3 font-semibold text-gray-600 border-r border-gray-200 bg-gray-55/10">
                    {row.label || "Overall"}
                  </td>
                  <td className="p-3 text-center text-gray-600 border-r border-gray-200">
                    {row.baseline_rev_cr?.toFixed(1) ?? "—"}
                  </td>
                  <td className="p-3 text-center font-bold text-gray-600 border-r border-gray-200">
                    {row.baseline_gm_pct != null ? `${row.baseline_gm_pct.toFixed(1)}%` : "—"}
                  </td>
                  {tableQuarters.map((q) => {
                    const qData = row.quarters?.[q];
                    if (!qData) {
                      return (
                        <React.Fragment key={q}>
                          <td className="p-3 text-center text-gray-400 border-r border-gray-200">—</td>
                          <td className="p-3 text-center text-gray-400 border-r border-gray-200">—</td>
                        </React.Fragment>
                      );
                    }
                    const isImproved = qData.gm_pct >= baselineGm;
                    return (
                      <React.Fragment key={q}>
                        <td className="p-3 text-center text-gray-600 border-r border-gray-200">
                          {qData.rev_cr?.toFixed(1) ?? "—"}
                        </td>
                        <td
                          className={`p-3 text-center font-bold border-r border-gray-200 ${
                            isImproved ? "text-emerald-600" : "text-rose-600"
                          }`}
                        >
                          {qData.gm_pct != null ? `${qData.gm_pct.toFixed(1)}%` : "—"}
                        </td>
                      </React.Fragment>
                    );
                  })}
                  <td className={`p-3 text-center font-bold border-l border-gray-200 ${deltaClass}`}>
                    {deltaStr}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="text-[10px] text-gray-400 mt-3 text-center">
          Baseline is determined by transaction data from earlier quarters. Select a business unit below for detailed charts and matrices.
        </div>
      </div>
    );
  };

  const chartData = {
    labels: trendQuarters,
    datasets: [
      {
        label: "Heating margin %",
        data: trendQuarters.map((q) => heatingTrendMap.get(q)),
        borderColor: "#f97316",
        backgroundColor: "rgba(249, 115, 22, 0.02)",
        tension: 0.35,
        pointBackgroundColor: "#f97316",
        pointRadius: 4,
      },
      {
        label: "Cooling margin %",
        data: trendQuarters.map((q) => coolingTrendMap.get(q)),
        borderColor: "#06b6d4",
        backgroundColor: "rgba(6, 182, 212, 0.02)",
        tension: 0.35,
        pointBackgroundColor: "#06b6d4",
        pointRadius: 4,
      },
      {
        label: "Water margin %",
        data: trendQuarters.map((q) => waterTrendMap.get(q)),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.02)",
        tension: 0.35,
        pointBackgroundColor: "#3b82f6",
        pointRadius: 4,
      },
    ].filter((ds) => {
      if (selectedBU === "All BUs") return true;
      return ds.label.toLowerCase().includes(selectedBU.toLowerCase());
    }),
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
        labels: {
          color: "#4b5563",
          font: { size: 10, weight: "bold" as const },
          boxWidth: 12,
        },
      },
      tooltip: {
        backgroundColor: "#1f2937",
        titleColor: "#fff",
        bodyColor: "#f3f4f6",
        borderColor: "#e5e7eb",
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        ticks: { color: "#6b7280", callback: (val: any) => `${val}%` },
        grid: { color: "#f3f4f6" },
      },
      x: {
        ticks: { color: "#6b7280" },
        grid: { display: false },
      },
    },
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12 bg-slate-50 text-gray-800">
      {renderTable()}

      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold tracking-wider text-gray-500 uppercase">
              Margin trend
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-gray-400 font-bold uppercase">
              Business unit:
            </span>
            <CustomSelect
              options={["All BUs", "Heating", "Cooling", "Water"]}
              value={selectedBU}
              onChange={setSelectedBU}
            />
          </div>
        </div>

        <div className="h-64">
          <Line data={chartData} options={chartOptions} />
        </div>

        <div className="bg-[#a61c1e]/5 border border-[#a61c1e]/15 p-4 rounded-xl text-center text-xs text-gray-650 mt-5 leading-relaxed max-w-3xl mx-auto">
          All BUs view shows the combined margin trend only. Select Heating, Cooling, or Water above to load revenue vs COGS, PMA matrix, executive snapshot, and mix/margin insights for that BU.
        </div>
      </div>

      <div className="flex justify-end mt-2">
        <button
          onClick={() => navigate("../select-bu")}
          className="px-6 py-2.5 bg-[#a61c1e] hover:bg-red-750 text-white font-bold rounded-xl text-xs tracking-wider uppercase transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
        >
          Next – select business unit →
        </button>
      </div>
    </div>
  );
};

export default OverallMargin;
