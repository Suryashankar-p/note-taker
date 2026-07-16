import React, { useState, useEffect } from "react";
import { useGetSnapshotKpis } from "../../services/query/query";
import CustomSelect from "../CustomSelect";

const ExecutiveSnapshot = () => {
  const sessionId = Number(localStorage.getItem("pricing_session_id")) || 10;
  const { data: snapshotKpis, isLoading } = useGetSnapshotKpis(sessionId);
  const [selectedQuarter, setSelectedQuarter] = useState<string>("");

  const sortQuarters = (a: string, b: string) => {
    const matchA = a.match(/Q(\d) /);
    const matchB = b.match(/Q(\d) /);
    const yearA = a.match(/FY (\d+)/);
    const yearB = b.match(/FY (\d+)/);
    if (!matchA || !matchB || !yearA || !yearB) return 0;
    const qA = parseInt(matchA[1], 10);
    const yA = parseInt(yearA[1], 10);
    const qB = parseInt(matchB[1], 10);
    const yB = parseInt(yearB[1], 10);
    if (yA !== yB) return yA - yB;
    return qA - qB;
  };

  const quarters = (snapshotKpis?.quarters || [])
    .map((item: any) => item.quarter)
    .sort(sortQuarters);

  const activeQuarter = selectedQuarter || quarters[quarters.length - 1] || "";
  const activeData = (snapshotKpis?.quarters || []).find((item: any) => item.quarter === activeQuarter);

  useEffect(() => {
    if (quarters.length > 0 && !selectedQuarter) {
      setSelectedQuarter(quarters[quarters.length - 1]);
    }
  }, [quarters, selectedQuarter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[120px] bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-700"></div>
      </div>
    );
  }

  if (!activeData) return null;

  const heatingRevenue = `₹${(activeData.revenue_inr / 10000000).toFixed(1)} Cr`;
  const overallGm = `${activeData.overall_gm_pct.toFixed(1)}%`;
  const deltaBaseline = `${activeData.delta_vs_baseline_pp >= 0 ? "+" : ""}${activeData.delta_vs_baseline_pp.toFixed(1)}%`;
  const deltaTarget = `${activeData.delta_vs_heating_target_pp >= 0 ? "+" : ""}${activeData.delta_vs_heating_target_pp.toFixed(1)}%`;

  const snapshotData = [
    { label: "HEATING REVENUE", value: heatingRevenue },
    { label: "OVERALL GM%", value: overallGm },
    { label: "Δ VS BASELINE", value: deltaBaseline, highlight: activeData.delta_vs_baseline_pp >= 0 ? "text-emerald-600" : "text-rose-600" },
    { label: "Δ VS HEATING TARGET", value: deltaTarget, highlight: activeData.delta_vs_heating_target_pp >= 0 ? "text-emerald-600" : "text-rose-600" },
    { label: "FAMILIES ABOVE TARGET", value: String(activeData.families_above_target) },
    { label: "FAMILIES BELOW TARGET", value: String(activeData.families_below_target), highlight: "text-rose-500" },
    { label: "FAMILIES ABOVE BASELINE", value: String(activeData.families_above_baseline) },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold tracking-wider text-gray-500 uppercase">
          Executive Snapshot
        </h3>
        {quarters.length > 0 && (
          <CustomSelect
            options={quarters}
            value={activeQuarter}
            onChange={setSelectedQuarter}
            labelPrefix="Quarter: "
            alignRight
          />
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {snapshotData.map((item, idx) => (
          <div key={idx} className="bg-gray-50 border border-gray-200 p-4 rounded-lg flex flex-col justify-between shadow-xs">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2 leading-tight">
              {item.label}
            </span>
            <span className={`text-lg font-bold text-gray-900 ${item.highlight || ""}`}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExecutiveSnapshot;
