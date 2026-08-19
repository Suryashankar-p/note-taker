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
import CustomSelect from "../CustomSelect";
import { useGetOverallMarginAllDivisions } from "../../services/query/query";
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

  const { data: allDivisionsData, isLoading, error } = useGetOverallMarginAllDivisions();

  const overallMarginTableData = useMemo(() => {
    if (!allDivisionsData) return [];
    const flattenedRows: any[] = [];
    Object.entries(allDivisionsData).forEach(([bu, buData]: [string, any]) => {
      if (!buData || !buData.bridge_table) return;
      const buName = bu.charAt(0).toUpperCase() + bu.slice(1);
      buData.bridge_table.forEach((row: any) => {
        flattenedRows.push({
          segment: buName,
          label: row.label,
          baseline_rev_cr: row.baseline_rev_cr,
          baseline_gm_pct: row.baseline_gm_pct,
          quarters: Object.entries(row.quarters || {}).reduce((acc: any, [q, val]: [string, any]) => {
            acc[q] = {
              rev_cr: val.rev_cr,
              gm_pct: val.gm_pct,
            };
            return acc;
          }, {}),
        });
      });
    });
    return flattenedRows;
  }, [allDivisionsData]);

  const tableQuarters = useMemo(() => {
    const qSet = new Set<string>();
    overallMarginTableData.forEach((row) => {
      if (row.quarters) {
        Object.keys(row.quarters).forEach((q) => qSet.add(q));
      }
    });
    const isQ3Fy25OrLater = (q: string) => {
      const m = q.match(/Q(\d)\s+FY\s+(\d+)/);
      if (!m) return false;
      const qNum = parseInt(m[1]);
      const fyNum = parseInt(m[2]);
      return fyNum > 25 || (fyNum === 25 && qNum >= 3);
    };
    return Array.from(qSet).filter(isQ3Fy25OrLater).sort(sortQuarters);
  }, [overallMarginTableData]);

  const latestQuarter = tableQuarters[tableQuarters.length - 1] || "Q4 FY 26";

  const trendData = useMemo(() => {
    if (!allDivisionsData) return [];
    const quartersSet = new Set<string>();
    Object.values(allDivisionsData).forEach((buData: any) => {
      const trend = buData?.margin_trend?.["All Families"];
      if (Array.isArray(trend)) {
        trend.forEach((pt: any) => quartersSet.add(pt.quarter));
      }
    });
    const sortedQuartersList = Array.from(quartersSet).sort(sortQuarters);

    return sortedQuartersList.map((q) => {
      const heatingPoint = allDivisionsData.heating?.margin_trend?.["All Families"]?.find((pt: any) => pt.quarter === q);
      const coolingPoint = allDivisionsData.cooling?.margin_trend?.["All Families"]?.find((pt: any) => pt.quarter === q);
      const waterPoint = allDivisionsData.water?.margin_trend?.["All Families"]?.find((pt: any) => pt.quarter === q);

      return {
        quarter: q,
        Heating: heatingPoint?.overall_gm_pct ?? null,
        Cooling: coolingPoint?.overall_gm_pct ?? null,
        Water: waterPoint?.overall_gm_pct ?? null,
      };
    });
  }, [allDivisionsData]);

  const trendQuarters = useMemo(() => {
    return trendData.map((item) => item.quarter);
  }, [trendData]);

  const heatingTrendMap = useMemo(() => {
    const map = new Map<string, number | null>();
    trendData.forEach((item: any) => map.set(item.quarter, item.Heating));
    return map;
  }, [trendData]);

  const coolingTrendMap = useMemo(() => {
    const map = new Map<string, number | null>();
    trendData.forEach((item: any) => map.set(item.quarter, item.Cooling));
    return map;
  }, [trendData]);

  const waterTrendMap = useMemo(() => {
    const map = new Map<string, number | null>();
    trendData.forEach((item: any) => map.set(item.quarter, item.Water));
    return map;
  }, [trendData]);

  const isAllNull = useMemo(() => {
    if (!allDivisionsData) return false;
    return Object.values(allDivisionsData).every((val) => val === null);
  }, [allDivisionsData]);

  if (isLoading) {
    return <PageLoading />;
  }

  if (isAllNull || !allDivisionsData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center max-w-2xl mx-auto my-12 shadow-sm">
        <div className="h-12 w-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center mb-4 text-[#a61c1e] shadow-xs">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 className="text-base font-bold text-gray-900 mb-2">No Compiled Data Available</h2>
        <p className="text-xs text-gray-505 max-w-md mb-8 leading-relaxed">
          It looks like none of the business units (Heating, Cooling, or Water) have been compiled yet. Please go to the Analyst Studio to upload the required files and compile the data models.
        </p>
      </div>
    );
  }

  const renderTable = () => {
    if (overallMarginTableData.length === 0) {
      return (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500 text-xs">
          No margin table data available. Make sure divisions are compiled.
        </div>
      );
    }

    const groupedByBU: { segment: string; rows: typeof overallMarginTableData }[] = [];
    overallMarginTableData.forEach((row) => {
      const last = groupedByBU[groupedByBU.length - 1];
      if (last && last.segment === row.segment) {
        last.rows.push(row);
      } else {
        groupedByBU.push({ segment: row.segment, rows: [row] });
      }
    });

    const buAccent: Record<string, string> = {
      Heating: "bg-orange-50/60",
    };

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
                Baseline<br /><span className="text-[10px] text-gray-400 font-normal">(Q4 FY24 + Q1 FY25)</span>
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
                Revenue (INR Cr)
              </th>
              <th className="p-2 text-center text-[10px] font-bold text-gray-450 border-r border-gray-200">
                Achieved GM%
              </th>
              {tableQuarters.map((_, i) => (
                <React.Fragment key={i}>
                  <th className="p-2 text-center text-[10px] font-bold text-gray-450 border-r border-gray-200">
                    Revenue (INR Cr)
                  </th>
                  <th className="p-2 text-center text-[10px] font-bold text-gray-450 border-r border-gray-200">
                    Achieved GM%
                  </th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {groupedByBU.map(({ segment, rows }) =>
              rows.map((row, rowIdx) => {
                const baselineGm = row.baseline_gm_pct || 0;
                const latestData = row.quarters?.[latestQuarter];
                const delta = latestData ? latestData.gm_pct - baselineGm : 0;
                const deltaStr = `${delta >= 0 ? "+" : ""}${delta.toFixed(2)}%`;
                const deltaClass = delta >= 0 ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-rose-50 text-rose-700 border-rose-100";
                const accentBg = buAccent[segment] ?? "bg-gray-50/20";

                return (
                  <tr key={`${segment}-${rowIdx}`} className="border-b border-gray-200 hover:bg-gray-50/50 transition-colors">
                    {rowIdx === 0 && (
                      <td
                        rowSpan={rows.length}
                        className={`p-3 font-bold text-gray-900 border-r border-gray-200 align-middle ${accentBg}`}
                      >
                        {segment || "Unknown"}
                      </td>
                    )}
                    <td className="p-3 font-semibold text-gray-600 border-r border-gray-200 bg-gray-55/10">
                      {row.label || "Overall"}
                    </td>
                    <td className="p-3 text-center text-gray-600 border-r border-gray-200">
                      {row.baseline_rev_cr?.toFixed(2) ?? "—"}
                    </td>
                    <td className="p-3 text-center font-bold text-gray-600 border-r border-gray-200">
                      {row.baseline_gm_pct != null ? `${row.baseline_gm_pct.toFixed(2)}%` : "—"}
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
                            {qData.rev_cr?.toFixed(2) ?? "—"}
                          </td>
                          <td
                            className={`p-3 text-center font-bold border-r border-gray-200 ${
                              isImproved ? "text-emerald-600" : "text-rose-600"
                            }`}
                          >
                            {qData.gm_pct != null ? `${qData.gm_pct.toFixed(2)}%` : "—"}
                          </td>
                        </React.Fragment>
                      );
                    })}
                    <td className={`p-3 text-center font-bold border-l border-gray-200 ${deltaClass}`}>
                      {deltaStr}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        <div className="text-[10px] text-gray-400 mt-3 text-center">
          Baseline: Q4 FY24 + Q1 FY25. Select a business unit below for charts, snapshot, and insights.
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
      const buKey = ds.label.split(" ")[0].toLowerCase();
      if ((allDivisionsData as any)?.[buKey] === null) return false;
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
      {(() => {
        const formatDate = (raw?: string | null): string => {
          if (!raw) return "—";
          try {
            const ddmmyyyy = raw.match(/^(\d{2})-(\d{2})-(\d{4})$/);
            if (ddmmyyyy) {
              const [, dd, mm, yyyy] = ddmmyyyy;
              const date = new Date(`${yyyy}-${mm}-${dd}`);
              if (isNaN(date.getTime())) return raw;
              return date.toLocaleDateString("en-IN", {
                day: "2-digit", month: "short", year: "numeric",
              });
            }
            const normalized = raw.replace(/(\.\d{3})\d+/, "$1");
            const date = new Date(normalized);
            if (isNaN(date.getTime())) return raw;
            return date.toLocaleString("en-IN", {
              day: "2-digit", month: "short", year: "numeric",
              hour: "2-digit", minute: "2-digit", hour12: true,
            });
          } catch {
            return raw;
          }
        };

        const buList = [
          { key: "heating", label: "Heating", color: "#f97316" },
          { key: "cooling", label: "Cooling", color: "#06b6d4" },
          { key: "water",   label: "Water",   color: "#3b82f6" },
        ];
        const publishMeta: Record<string, { by: string; at: string }> = {
          heating: {
            by: (allDivisionsData as any)?.heating?.published_by,
            at: formatDate((allDivisionsData as any)?.heating?.published_date),
          },
          cooling: {
            by: (allDivisionsData as any)?.cooling?.published_by,
            at: formatDate((allDivisionsData as any)?.cooling?.published_date),
          },
          water: {
            by: (allDivisionsData as any)?.water?.published_by,
            at: formatDate((allDivisionsData as any)?.water?.published_date),
          },
        };
        return (
          <div className="flex flex-wrap gap-3 pt-1">
            {buList.map(({ key, label, color }) => {
              const buData = (allDivisionsData as any)?.[key];
              const isCompiled = !!buData;
              const meta = isCompiled ? publishMeta[key] : null;
              return isCompiled ? (
                <div
                  key={key}
                  className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-1.5 shadow-xs text-[11px] font-semibold text-gray-700"
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  <span className="font-extrabold text-gray-900 uppercase tracking-wide">{label}</span>
                  <span className="text-gray-300 mx-0.5">·</span>
                  <span className="text-gray-500">Published by</span>
                  <span className="text-gray-800 font-bold">{meta!.by}</span>
                  <span className="text-gray-300 mx-0.5">·</span>
                  <span className="text-gray-500">Pushed at</span>
                  <span className="text-gray-800 font-bold">{meta!.at}</span>
                </div>
              ) : (
                <div
                  key={key}
                  className="flex items-center gap-2 bg-gray-50 border border-dashed border-gray-300 rounded-full px-4 py-1.5 text-[11px] font-semibold text-gray-400"
                >
                  <span className="w-2 h-2 rounded-full shrink-0 bg-gray-300" />
                  <span className="font-extrabold uppercase tracking-wide">{label}</span>
                  <span className="text-gray-300 mx-0.5">·</span>
                  <span className="italic">Not compiled</span>
                </div>
              );
            })}
          </div>
        );
      })()}

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

        <div className="bg-[#a61c1e]/5 border border-[#a61c1e]/15 p-4 rounded-xl text-center text-xs text-gray-650 mt-5 leading-relaxed w-full">
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
