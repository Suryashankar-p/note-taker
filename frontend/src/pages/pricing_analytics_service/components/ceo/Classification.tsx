import React, { useState } from "react";
import ClassificationGrid from "./ClassificationGrid";
import ClassificationInsights from "./ClassificationInsights";
import { useGetClassificationMatrix } from "../../services/query/query";
import { useOutletContext } from "react-router-dom";

const Classification = () => {
  const context = useOutletContext<any>() || {};
  const onNavigateToTab = context.onNavigateToTab;

  const sessionId = Number(localStorage.getItem("pricing_session_id")) || 10;
  const [selectedQuarter, setSelectedQuarter] = useState<string>("Q4 FY 26");
  const { data, isLoading } = useGetClassificationMatrix(sessionId, selectedQuarter);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-700"></div>
      </div>
    );
  }

  const activeInsights = data?.insights;

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      <ClassificationGrid
        data={data}
        selectedQuarter={selectedQuarter}
        setSelectedQuarter={setSelectedQuarter}
      />

      <ClassificationInsights data={activeInsights} />

      <div className="flex items-center justify-between border-t border-gray-200 pt-6 mt-4">
        <button
          onClick={() => onNavigateToTab?.("overall-margin")}
          className="px-5 py-2 border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 rounded-lg text-xs font-semibold tracking-wide transition-colors shadow-sm"
        >
          Previous
        </button>
        <button
          onClick={() => onNavigateToTab?.("skycraper")}
          className="px-6 py-2 bg-[#a61c1e] hover:bg-[#8e181a] text-white font-bold rounded-lg text-xs tracking-wide transition-all shadow-md active:scale-95"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Classification;
