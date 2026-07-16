import React from "react";
import { Sparkles } from "lucide-react";
import CustomSelect from "../CustomSelect";

interface AnalystSnapshotCardsProps {
  snapshotKpis?: {
    quarters: Array<{
      quarter: string;
      revenue_inr: number;
      overall_gm_pct: number;
      delta_vs_baseline_pp: number;
      delta_vs_heating_target_pp: number;
      families_above_target: number;
      families_below_target: number;
      families_above_baseline: number;
    }>;
  };
  insights: string[];
  snapshotQuarter: string;
  setSnapshotQuarter: (q: string) => void;
  insightsQuarter: string;
  setInsightsQuarter: (q: string) => void;
  quartersList: string[];
}

const AnalystSnapshotCards = ({
  snapshotKpis,
  insights,
  snapshotQuarter,
  setSnapshotQuarter,
  insightsQuarter,
  setInsightsQuarter,
  quartersList,
}: AnalystSnapshotCardsProps) => {
  const activeSnapshot = (snapshotKpis?.quarters || []).find(
    (item: any) => item.quarter === snapshotQuarter,
  );

  const stats = activeSnapshot
    ? [
        {
          label: "HEATING REVENUE",
          value: `₹${(activeSnapshot.revenue_inr / 10000000).toFixed(1)} Cr`,
        },
        {
          label: "OVERALL GM%",
          value: `${activeSnapshot.overall_gm_pct.toFixed(1)}%`,
        },
        {
          label: "Δ VS BASELINE",
          value: `${activeSnapshot.delta_vs_baseline_pp >= 0 ? "+" : ""}${activeSnapshot.delta_vs_baseline_pp.toFixed(1)}%`,
          isPositive: activeSnapshot.delta_vs_baseline_pp >= 0,
          isNegative: activeSnapshot.delta_vs_baseline_pp < 0,
        },
        {
          label: "Δ VS HEATING TARGET",
          value: `${activeSnapshot.delta_vs_heating_target_pp >= 0 ? "+" : ""}${activeSnapshot.delta_vs_heating_target_pp.toFixed(1)}%`,
          isPositive: activeSnapshot.delta_vs_heating_target_pp >= 0,
          isNegative: activeSnapshot.delta_vs_heating_target_pp < 0,
        },
        {
          label: "FAMILIES ABOVE TARGET",
          value: String(activeSnapshot.families_above_target),
        },
        {
          label: "FAMILIES BELOW TARGET",
          value: String(activeSnapshot.families_below_target),
        },
        {
          label: "FAMILIES ABOVE BASELINE",
          value: String(activeSnapshot.families_above_baseline),
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

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
