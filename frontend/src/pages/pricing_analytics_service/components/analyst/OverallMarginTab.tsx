import React, { useState, useEffect, useMemo } from "react";
import MarginTrendChart from "../ceo/MarginTrendChart";
import RevenueVsCogsChart from "../ceo/RevenueVsCogsChart";
import HeatingMarginsGrid from "../ceo/HeatingMarginsGrid";
import OverallQoQTable from "../ceo/OverallQoQTable";
import AnalystSnapshotCards from "./AnalystSnapshotCards";
import GMDecompositionAnalysis from "./GMDecompositionAnalysis";
import { useOutletContext, useParams } from "react-router-dom";
import { analystOverallMarginMock, analystKpisMock } from "../../constants/analystMockData";

const OverallMarginTab = () => {
  const context = useOutletContext<any>() || {};
  const onNavigateToTab = context.onNavigateToTab;
  const { bu } = useParams<{ bu?: string }>();

  const activeBu = bu || "heating";

  const overallData = analystOverallMarginMock[activeBu] || analystOverallMarginMock.heating;
  const kpiData = analystKpisMock[activeBu] || analystKpisMock.heating;

  const [snapshotQuarter, setSnapshotQuarter] = useState<string>("Q4 FY 26");
  const [insightsQuarter, setInsightsQuarter] = useState<string>("Q4 FY 26");

  const quartersList = ["Q4 FY 24", "Q1 FY 25", "Q2 FY 25", "Q3 FY 25", "Q4 FY 25", "Q1 FY 26", "Q2 FY 26", "Q3 FY 26", "Q4 FY 26"];

  const topInsights = kpiData.insights || [];
  const bridge = kpiData.bridge;

  return (
    <div className="flex flex-col gap-8 text-gray-800 pb-12">
      <OverallQoQTable data={overallData.bridge_table} />

      <div className="bg-slate-100/50 border border-gray-200 rounded-xl p-4 flex flex-col gap-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MarginTrendChart data={overallData.margin_trend} />
          <RevenueVsCogsChart data={overallData.revenue_vs_cogs} />
        </div>
      </div>

      <HeatingMarginsGrid data={overallData.pma_baseline_matrices} />

      <AnalystSnapshotCards
        snapshotKpis={{
          quarter: snapshotQuarter,
          revenue_inr: 218300000,
          actual_gm_pct: activeBu === "cooling" ? 71.0 : 52.2,
          target_gm_pct: activeBu === "cooling" ? 68.0 : 49.7,
          baseline_gm_pct: activeBu === "cooling" ? 64.9 : 49.7,
          total_revenue_inr: 218300000,
          pooled_actual_gm_pct: activeBu === "cooling" ? 71.0 : 52.2,
          global_delta_pp: activeBu === "cooling" ? 3.0 : 2.5,
          total_below_baseline: 1,
          total_above_baseline: 3,
        }}
        insights={topInsights}
        snapshotQuarter={snapshotQuarter}
        setSnapshotQuarter={setSnapshotQuarter}
        insightsQuarter={insightsQuarter}
        setInsightsQuarter={setInsightsQuarter}
        quartersList={quartersList}
        isSnapshotLoading={false}
      />

      <GMDecompositionAnalysis
        bridge={bridge}
        isLoading={false}
        selectedQuarter={insightsQuarter}
        quartersList={quartersList}
      />

      <div className="flex items-center justify-end border-t border-gray-200 pt-6 mt-4">
        <button
          onClick={() => onNavigateToTab?.("revenue-gm-ladder")}
          className="px-6 py-2 bg-[#a61c1e] hover:bg-[#8e181a] text-white font-bold rounded-lg text-xs tracking-wide transition-all shadow-md active:scale-95"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default OverallMarginTab;
