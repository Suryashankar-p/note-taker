import React from "react";
import ExecutiveSnapshot from "./components/ExecutiveSnapshot";
import OverallQoQTable from "./components/OverallQoQTable";
import MarginTrendChart from "./components/MarginTrendChart";
import RevenueVsCogsChart from "./components/RevenueVsCogsChart";
import HeatingMarginsGrid from "./components/HeatingMarginsGrid";
import InsightsList from "./components/InsightsList";

const OverallMargin = () => {
  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      {/* 1. Overall QoQ Table */}
      <OverallQoQTable />

      {/* 2. Margin Trend Chart */}
      <MarginTrendChart />

      {/* 3. Revenue vs COGS Chart */}
      <RevenueVsCogsChart />

      {/* 4. Heatmap Grid */}
      <HeatingMarginsGrid />

      {/* 5. Executive Snapshot */}
      <ExecutiveSnapshot />

      {/* 6. Insights List */}
      <InsightsList />
    </div>
  );
};

export default OverallMargin;
