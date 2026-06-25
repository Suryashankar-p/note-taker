import React from "react";
import ExecutiveSnapshot from "./components/ExecutiveSnapshot";
import OverallQoQTable from "./components/OverallQoQTable";
import MarginTrendChart from "./components/MarginTrendChart";
import RevenueVsCogsChart from "./components/RevenueVsCogsChart";
import HeatingMarginsGrid from "./components/HeatingMarginsGrid";
import InsightsList from "./components/InsightsList";
import { Sparkles } from "lucide-react";

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

      {/* Footer Navigation Bar */}
      <footer className="flex items-center justify-between border-t border-gray-200 pt-6 mt-4">
        <div className="flex items-center gap-4">
          <button className="px-4 py-2 border border-gray-350 bg-white text-gray-600 hover:bg-gray-50 rounded-lg text-xs font-semibold tracking-wide transition-colors shadow-sm">
            — Previous
          </button>
          
          <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#8b5cf6] bg-[#8b5cf6]/5 text-[#7c3aed] hover:bg-[#8b5cf6]/10 text-xs font-bold transition-all duration-200">
            <Sparkles size={14} />
            GIA LLM Co-pilot
          </button>
        </div>

        <button className="px-5 py-2 bg-[#a61c1e] hover:bg-[#8e181a] text-white font-bold rounded-lg text-xs tracking-wide transition-colors shadow-sm">
          Next —
        </button>
      </footer>
    </div>
  );
};

export default OverallMargin;
