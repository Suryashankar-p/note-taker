import React, { useState, useEffect, useMemo } from "react";
import MarginTrendChart from "../ceo/MarginTrendChart";
import RevenueVsCogsChart from "../ceo/RevenueVsCogsChart";
import HeatingMarginsGrid from "../ceo/HeatingMarginsGrid";
import OverallQoQTable from "../ceo/OverallQoQTable";
import AnalystSnapshotCards from "./AnalystSnapshotCards";
import GMDecompositionAnalysis from "./GMDecompositionAnalysis";
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
  const [selectedQuarter, setSelectedQuarter] = useState<string>("");

  const { data: overallData, isLoading: isOverallLoading } = useGetOverallMargin(sessionId);

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

  const quartersList = useMemo(() => {
    let list: string[] = [];
    if (overallData?.bridge_table?.[0]?.quarters) {
      list = Object.keys(overallData.bridge_table[0].quarters);
    } else if (overallData?.pma_baseline_matrices) {
      list = overallData.pma_baseline_matrices.map((m: any) => m.quarter);
    } else if (overallData?.margin_trend) {
      list = overallData.margin_trend.map((m: any) => m.quarter);
    }
    return Array.from(new Set(list)).filter(Boolean).sort(sortQuarters);
  }, [overallData]);

  useEffect(() => {
    if (quartersList.length > 0 && !selectedQuarter) {
      setSelectedQuarter(quartersList[quartersList.length - 1]);
    }
  }, [quartersList, selectedQuarter]);

  const { data: insightsData, isLoading: isInsightsLoading } = useGetBusinessInsights(sessionId, selectedQuarter);
  const { data: snapshotKpis, isLoading: isSnapshotLoading } = useGetSnapshotKpis(sessionId);

  if (isOverallLoading || isSnapshotLoading) {
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MarginTrendChart data={overallData?.margin_trend} />
          <RevenueVsCogsChart data={overallData?.revenue_vs_cogs} />
        </div>
      </div>

      <HeatingMarginsGrid data={overallData?.pma_baseline_matrices} />

      <div className="border-t border-gray-200 pt-6">
        <div className="mb-6">
          <h3 className="text-sm font-semibold tracking-wider text-gray-500 uppercase">
            Business Insights & Snapshots
          </h3>
          <p className="text-[10px] text-gray-400 mt-1">
            Changing the quarter below updates the Executive Snapshot, Strategic Actions, and GM Decomposition together.
          </p>
        </div>

        <AnalystSnapshotCards
          snapshotKpis={snapshotKpis}
          insights={topInsights}
          selectedQuarter={selectedQuarter}
          setSelectedQuarter={setSelectedQuarter}
          quartersList={quartersList}
        />
      </div>

      <GMDecompositionAnalysis
        bridge={bridge}
        isLoading={isInsightsLoading || !selectedQuarter}
        selectedQuarter={selectedQuarter}
        quartersList={quartersList}
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
