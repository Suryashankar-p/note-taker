import React from "react";
import ExecutiveSnapshot from "./ExecutiveSnapshot";
import OverallQoQTable from "./OverallQoQTable";
import MarginTrendChart from "./MarginTrendChart";
import RevenueVsCogsChart from "./RevenueVsCogsChart";
import HeatingMarginsGrid from "./HeatingMarginsGrid";
import InsightsList from "./InsightsList";
import { useGetOverallMargin, useGetBusinessInsights } from "../../../services/query/query";

const OverallMargin = () => {
  const sessionId = Number(localStorage.getItem("pricing_session_id"));
  const { data: overallData, isLoading: isOverallLoading } = useGetOverallMargin(sessionId);
  const { data: insightsData, isLoading: isInsightsLoading } = useGetBusinessInsights(sessionId);

  if (isOverallLoading || isInsightsLoading) {
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

      <HeatingMarginsGrid />

      <ExecutiveSnapshot />

      <InsightsList data={insightsData} />
    </div>
  );
};

export default OverallMargin;
