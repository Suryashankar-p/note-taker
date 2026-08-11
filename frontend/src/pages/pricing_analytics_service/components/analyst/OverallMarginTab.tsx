import React, { useState, useEffect, useMemo } from "react";
import MarginTrendChart from "../ceo/MarginTrendChart";
import RevenueVsCogsChart from "../ceo/RevenueVsCogsChart";
import HeatingMarginsGrid from "../ceo/HeatingMarginsGrid";
import OverallQoQTable from "../ceo/OverallQoQTable";
import AnalystSnapshotCards from "./AnalystSnapshotCards";
import GMDecompositionAnalysis from "./GMDecompositionAnalysis";
import { useOutletContext, useParams } from "react-router-dom";
import {
  useGetOverallMargin,
  useGetSnapshotKpis,
  useGetBusinessInsights,
  useGetGmDecompose,
} from "../../services/query/query";
import PageLoading from "../../../../components/PageLoading";

const OverallMarginTab = () => {
  const context = useOutletContext<any>() || {};
  const onNavigateToTab = context.onNavigateToTab;
  const { bu } = useParams<{ bu?: string }>();
  const activeBu = bu || "heating";

  // Real Queries
  const { data: overallData, isLoading: isOverallLoading, error: overallError } = useGetOverallMargin(activeBu);
  const [snapshotQuarter, setSnapshotQuarter] = useState<string>("");
  const [insightsQuarter, setInsightsQuarter] = useState<string>("");
  const [decomposeQuarter, setDecomposeQuarter] = useState<string>("");

  // Extract quarters list dynamically from overallData
  const quartersList = useMemo(() => {
    if (!overallData?.margin_trend) return [];
    if (Array.isArray(overallData.margin_trend)) {
      return overallData.margin_trend.map((item: any) => item.quarter);
    }
    const keys = Object.keys(overallData.margin_trend);
    if (keys.length > 0) {
      const firstKey = keys[0];
      const list = overallData.margin_trend[firstKey];
      if (Array.isArray(list)) {
        return list.map((item: any) => item.quarter);
      }
    }
    return [];
  }, [overallData]);

  // Set default quarters
  useEffect(() => {
    if (quartersList.length > 0) {
      setSnapshotQuarter(quartersList[quartersList.length - 1]);
      setInsightsQuarter(quartersList[quartersList.length - 1]);
      setDecomposeQuarter(quartersList[quartersList.length - 1]);
    }
  }, [quartersList]);

  const { data: snapshotKpis, isLoading: isSnapshotLoading } = useGetSnapshotKpis(activeBu, snapshotQuarter || undefined);
  const { data: insightsData, isLoading: isInsightsLoading } = useGetBusinessInsights(activeBu, insightsQuarter || undefined);
  const { data: decomposeData, isLoading: isDecomposeLoading } = useGetGmDecompose(activeBu, decomposeQuarter || undefined);

  // Handle 404 / empty state if nothing has been compiled yet
  const is404 = useMemo(() => {
    const check404 = (err: any) => err?.response?.status === 404 || err?.status === 404;
    return check404(overallError);
  }, [overallError]);

  if (isOverallLoading) {
    return <PageLoading />;
  }

  if (is404 || !overallData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] bg-white border border-dashed border-gray-300 rounded-2xl p-8 text-center">
        <h2 className="text-base font-bold text-gray-900 mb-2">No Draft Data Available</h2>
        <p className="text-xs text-gray-500 max-w-sm mb-6 leading-relaxed">
          It looks like the {activeBu} business unit has not been compiled yet. Upload the required files to start.
        </p>
        <button
          onClick={() => onNavigateToTab?.("upload")}
          className="px-4 py-2 bg-[#a61c1e] text-white hover:bg-red-700 font-bold rounded-lg text-xs tracking-wide transition-colors shadow-sm"
        >
          Go to Upload Page
        </button>
      </div>
    );
  }

  const topInsights = insightsData?.insights || [];
  const bridge = decomposeData || null;

  return (
    <div className="flex flex-col gap-8 text-gray-800 pb-12">
      {overallData?.bridge_table && <OverallQoQTable data={overallData.bridge_table} businessUnit={activeBu} />}

      <div className="bg-slate-100/50 border border-gray-200 rounded-xl p-4 flex flex-col gap-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {overallData?.margin_trend && <MarginTrendChart data={overallData.margin_trend} />}
          {overallData?.revenue_vs_cogs && <RevenueVsCogsChart data={overallData.revenue_vs_cogs} />}
        </div>
      </div>

      {overallData?.pma_baseline_matrices && <HeatingMarginsGrid data={overallData.pma_baseline_matrices} />}

      <AnalystSnapshotCards
        snapshotKpis={snapshotKpis || {}}
        insights={topInsights}
        snapshotQuarter={snapshotQuarter}
        setSnapshotQuarter={setSnapshotQuarter}
        insightsQuarter={insightsQuarter}
        setInsightsQuarter={setInsightsQuarter}
        quartersList={quartersList}
        isSnapshotLoading={isSnapshotLoading || isInsightsLoading}
      />

      <GMDecompositionAnalysis
        bridge={bridge}
        isLoading={isDecomposeLoading}
        selectedQuarter={decomposeQuarter}
        setSelectedQuarter={setDecomposeQuarter}
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
