import React from "react";
import { Sparkles } from "lucide-react";
import ClassificationGrid from "./components/ClassificationGrid";
import ClassificationInsights from "./components/ClassificationInsights";
import AboveBaselineTable from "./components/AboveBaselineTable";

const Classification = () => {
  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      {/* 1. 3x3 Freq Grid */}
      <ClassificationGrid />

      {/* 2. Insights */}
      <ClassificationInsights />

      {/* 3. Drill-down Table */}
      <AboveBaselineTable />

      {/* Bottom Navigation */}
      <footer className="flex items-center justify-between border-t border-gray-200 pt-6 mt-4">
        <div className="flex items-center gap-4">
          <button className="px-4 py-2 border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 rounded-lg text-xs font-semibold tracking-wide transition-colors shadow-sm">
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

export default Classification;
