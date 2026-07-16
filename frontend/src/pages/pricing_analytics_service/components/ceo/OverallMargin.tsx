import React, { useState, useEffect, useMemo } from "react";
import ExecutiveSnapshot from "./ExecutiveSnapshot";
import OverallQoQTable from "./OverallQoQTable";
import MarginTrendChart from "./MarginTrendChart";
import RevenueVsCogsChart from "./RevenueVsCogsChart";
import HeatingMarginsGrid from "./HeatingMarginsGrid";
import InsightsList from "./InsightsList";
import { useGetOverallMargin, useGetBusinessInsights } from "../../services/query/query";
import { useOutletContext } from "react-router-dom";

const OverallMargin = () => {
  const context = useOutletContext<any>() || {};
  const onNavigateToTab = context.onNavigateToTab;

  const sessionId = Number(localStorage.getItem("pricing_session_id"));
  const [selectedQuarter, setSelectedQuarter] = useState<string>("");
  const [snapshotQuarter, setSnapshotQuarter] = useState<string>("");

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
    if (quartersList.length > 0 && !snapshotQuarter) {
      setSnapshotQuarter(quartersList[quartersList.length - 1]);
    }
  }, [quartersList, selectedQuarter, snapshotQuarter]);

  const { data: insightsData, isLoading: isInsightsLoading } = useGetBusinessInsights(sessionId, selectedQuarter);

  if (isOverallLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-700"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      <OverallQoQTable data={overallData?.bridge_table} />

      <MarginTrendChart data={overallData?.margin_trend} />

      <RevenueVsCogsChart data={overallData?.revenue_vs_cogs} />

      <HeatingMarginsGrid data={overallData?.pma_baseline_matrices} />

      <ExecutiveSnapshot
        quartersList={quartersList}
        activeQuarter={snapshotQuarter}
        setActiveQuarter={setSnapshotQuarter}
      />

      <InsightsList
        data={insightsData}
        isLoading={isInsightsLoading || !selectedQuarter}
        selectedQuarter={selectedQuarter}
        setSelectedQuarter={setSelectedQuarter}
        quartersList={quartersList}
      />

      <div className="flex items-center justify-end border-t border-gray-200 pt-6 mt-4">
        <button
          onClick={() => onNavigateToTab?.("classification")}
          className="px-6 py-2 bg-[#a61c1e] hover:bg-[#8e181a] text-white font-bold rounded-lg text-xs tracking-wide transition-all shadow-md active:scale-95"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default OverallMargin;
