import React, { useState } from "react";
import MarginTrendChart from "../ceo/MarginTrendChart";
import RevenueVsCogsChart from "../ceo/RevenueVsCogsChart";
import HeatingMarginsGrid from "../ceo/HeatingMarginsGrid";
import OverallQoQTable from "../ceo/OverallQoQTable";
import AnalystSnapshotCards from "./AnalystSnapshotCards";
import GMDecompositionAnalysis from "./GMDecompositionAnalysis";
import CustomSelect from "../CustomSelect";
import { useOutletContext } from "react-router-dom";
import {
  useGetOverallMargin,
  useGetBusinessInsights,
  useGetSnapshotKpis,
} from "../../services/query/query";

const OverallMarginTab = () => {
  const context = useOutletContext<any>() || {};
  const onNavigateToTab = context.onNavigateToTab;

  const sessionId = Number(localStorage.getItem("pricing_session_id")) || 10;
  const [selectedFamily, setSelectedFamily] = useState("All families (109)");

  const { data: overallData, isLoading: isOverallLoading } = useGetOverallMargin(sessionId);
  const { data: insightsData, isLoading: isInsightsLoading } = useGetBusinessInsights(sessionId);
  const { data: snapshotKpis, isLoading: isSnapshotLoading } = useGetSnapshotKpis(sessionId);

  if (isOverallLoading || isInsightsLoading || isSnapshotLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-700"></div>
      </div>
    );
  }

  const topInsights = insightsData?.insights || [];
  const bridge = insightsData?.bridge;

  return (
    <div className="flex flex-col gap-8 text-gray-800 pb-12">
      <OverallQoQTable data={overallData?.bridge_table} />


      <div className="bg-slate-100/50 border border-gray-200 rounded-xl p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between px-2">
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MarginTrendChart data={overallData?.margin_trend} />
          <RevenueVsCogsChart data={overallData?.revenue_vs_cogs} />
        </div>
      </div>

      {/* 3. Heatmap Grid */}
      <HeatingMarginsGrid data={overallData?.pma_baseline_matrices} />

      {/* 4. Snapshot & Insights cards */}
      <AnalystSnapshotCards
        snapshotKpis={snapshotKpis}
        insights={topInsights}
      />

      {/* 5. GM% Decomposition Analysis Section */}
      <GMDecompositionAnalysis
        bridge={bridge}
      />

      <div className="flex items-center justify-end border-t border-gray-200 pt-6 mt-4">
        <button
          onClick={() => onNavigateToTab?.("skyscraper")}
          className="px-6 py-2 bg-[#a61c1e] hover:bg-[#8e181a] text-white font-bold rounded-lg text-xs tracking-wide transition-all shadow-md active:scale-95"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default OverallMarginTab;
