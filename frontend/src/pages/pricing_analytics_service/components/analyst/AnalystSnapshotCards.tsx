import React from "react";
import { Sparkles } from "lucide-react";
import CustomSelect from "../CustomSelect";

interface AnalystSnapshotCardsProps {
  snapshotKpis?: any;
  insights: string[];
  snapshotQuarter: string;
  setSnapshotQuarter: (q: string) => void;
  insightsQuarter: string;
  setInsightsQuarter: (q: string) => void;
  quartersList: string[];
  isSnapshotLoading?: boolean;
}

const AnalystSnapshotCards = ({
  snapshotKpis,
  insights,
  snapshotQuarter,
  setSnapshotQuarter,
  insightsQuarter,
  setInsightsQuarter,
  quartersList,
  isSnapshotLoading = false,
}: AnalystSnapshotCardsProps) => {
  const activeSnapshot = Array.isArray(snapshotKpis)
    ? (snapshotKpis.find((item: any) => item.quarter === snapshotQuarter) || snapshotKpis[0])
    : null;

  const revenue = activeSnapshot?.revenue_inr ?? 0;
  const overallGm = activeSnapshot?.overall_gm_pct ?? 0;
  const deltaBaseline = activeSnapshot?.delta_vs_baseline_pp ?? 0;
  const deltaTarget = activeSnapshot?.delta_vs_target_pp ?? activeSnapshot?.delta_vs_heating_target_pp ?? activeSnapshot?.delta_vs_cooling_target_pp ?? activeSnapshot?.delta_vs_water_target_pp ?? 0;

  const stats = activeSnapshot
    ? [
        {
          label: "REVENUE",
          value: `₹${(revenue / 10000000).toFixed(2)} Cr`,
        },
        {
          label: "OVERALL GM%",
          value: `${overallGm.toFixed(2)}%`,
        },
        {
          label: "Δ VS BASELINE",
          value: `${deltaBaseline >= 0 ? "+" : ""}${deltaBaseline.toFixed(2)}%`,
          isPositive: deltaBaseline >= 0,
          isNegative: deltaBaseline < 0,
        },
        {
          label: "Δ VS TARGET",
          value: `${deltaTarget >= 0 ? "+" : ""}${deltaTarget.toFixed(2)}%`,
          isPositive: deltaTarget >= 0,
          isNegative: deltaTarget < 0,
        },
        {
          label: "FAMILIES ABOVE BASELINE",
          value: String(activeSnapshot.families_above_baseline ?? 0),
        },
        {
          label: "FAMILIES ABOVE TARGET",
          value: String(activeSnapshot.families_above_target ?? 0),
        },
        {
          label: "FAMILIES BELOW TARGET",
          value: String(activeSnapshot.families_below_target ?? 0),
        },
      ]
    : [];

  return (
    <div className="flex flex-col gap-8">
      {/* Executive Snapshot Card - full width */}
      <div className="w-full bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col gap-6">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h3 className="text-sm font-bold tracking-tight text-gray-800">
            Executive snapshot
          </h3>
          {quartersList.length > 0 && (
            <CustomSelect
              options={quartersList}
              value={snapshotQuarter}
              onChange={setSnapshotQuarter}
              labelPrefix="Quarter: "
              alignRight
            />
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative min-h-[100px]">
          {isSnapshotLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[1px] rounded-xl z-10">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-700"></div>
            </div>
          )}
          {stats.map((st) => (
            <div
              key={st.label}
              className="border border-gray-100 rounded-xl p-4 bg-slate-50/50 shadow-sm flex flex-col justify-between"
            >
              <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wide leading-tight mb-2">
                {st.label}
              </span>
              <span
                className={`text-base font-extrabold tracking-tight ${
                  st.isPositive
                    ? "text-emerald-600"
                    : st.isNegative
                      ? "text-rose-600"
                      : "text-gray-800"
                }`}
              >
                {st.value}
              </span>
            </div>
          ))}
          {stats.length === 0 && (
            <div className="col-span-4 text-xs text-gray-400 italic py-4 text-center">
              No snapshot data for {snapshotQuarter || "this quarter"}.
            </div>
          )}
        </div>
      </div>

      {/* Top Insights (CEO/CFO style) */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-semibold tracking-wider text-gray-500 uppercase mb-6 pb-3 border-b border-gray-100 flex items-center justify-between">
            <span>Top Insights</span>
            {quartersList && setInsightsQuarter && insightsQuarter && (
              <CustomSelect
                options={quartersList}
                value={insightsQuarter}
                onChange={setInsightsQuarter}
                labelPrefix="Qtr: "
                alignRight
              />
            )}
          </h3>

          {insights.length === 0 ? (
            <div className="text-gray-400 italic font-medium">
              No insights available.
            </div>
          ) : (
            <ul className="flex flex-col gap-3.5 text-xs text-gray-600 leading-relaxed font-semibold">
              {insights.map((insight, idx) => (
                <li key={idx} className="flex gap-2.5 items-start">
                  <span className="text-[#a61c1e] mt-1 font-bold">▶</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalystSnapshotCards;
