import React, { useState } from "react";
import MarginTrendChart from "../ceo/components/MarginTrendChart";
import RevenueVsCogsChart from "../ceo/components/RevenueVsCogsChart";
import HeatingMarginsGrid from "../ceo/components/HeatingMarginsGrid";
import OverallQoQTable from "../ceo/components/OverallQoQTable";
import AnalystSnapshotCards from "./AnalystSnapshotCards";
import GMDecompositionAnalysis from "./GMDecompositionAnalysis";
import {
  useGetOverallMargin,
  useGetBusinessInsights,
  useGetSnapshotKpis,
} from "../../services/query/query";

const OverallMarginTab = () => {
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
      {/* 1. QoQ Table */}
      <OverallQoQTable data={overallData?.bridge_table} />

      {/* 2. Charts section */}
      <div className="bg-slate-100/50 border border-gray-200 rounded-xl p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Product families</span>
            <select
              value={selectedFamily}
              onChange={(e) => setSelectedFamily(e.target.value)}
              className="bg-white border border-gray-200 rounded-md px-3 py-1.5 text-xs font-semibold text-[#a61c1e] focus:outline-none focus:ring-1 focus:ring-[#a61c1e] cursor-pointer shadow-sm select-none"
            >
              <option>All families (109)</option>
              <option>Spares & Fans</option>
              <option>Burners</option>
              <option>Boilers</option>
            </select>
          </div>
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
    </div>
  );
};

export default OverallMarginTab;
