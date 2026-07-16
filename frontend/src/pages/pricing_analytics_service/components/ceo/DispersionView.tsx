import React, { useState, useEffect } from "react";
import DispersionBoxes from "./DispersionBoxes";
import DispersionCharts from "./DispersionCharts";
import DispersionMovementExamples from "./DispersionMovementExamples";
import { useGetDispersion } from "../../services/query/query";
import { useOutletContext } from "react-router-dom";

const DispersionView = () => {
  const context = useOutletContext<any>() || {};
  const onNavigateToTab = context.onNavigateToTab;

  const sessionId = Number(localStorage.getItem("pricing_session_id")) || 10;
  const [selectedFamily, setSelectedFamily] = useState<string | null>(null);
  const [selectedQuarter, setSelectedQuarter] = useState<string>("");

  const { data, isLoading, isFetching } = useGetDispersion(sessionId, selectedFamily);

  const sortedQuarters = (data?.qoq_cards || [])
    .map((q: any) => q.quarter);

  useEffect(() => {
    if (sortedQuarters.length > 0 && !selectedQuarter) {
      setSelectedQuarter(sortedQuarters[sortedQuarters.length - 1]);
    }
  }, [sortedQuarters, selectedQuarter]);

  useEffect(() => {
    if (data?.families && data.families.length > 0 && !selectedFamily) {
      setSelectedFamily(data.families[0].nk);
    }
  }, [data?.families, selectedFamily]);

  const isInitialLoading = isLoading && !data;

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-700"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      {/* 1. Upper Dispersion Boxes */}
      <DispersionBoxes
        qoqCards={data?.qoq_cards || []}
        selectedQuarter={selectedQuarter}
        setSelectedQuarter={setSelectedQuarter}
        quarters={sortedQuarters}
      />

      {/* 2. Dispersion Curve and Trend Line Charts */}
      <DispersionCharts
        familyDispersion={data?.family_dispersion}
        families={data?.families || []}
        selectedFamily={selectedFamily}
        setSelectedFamily={setSelectedFamily}
        isFetching={isFetching && !isInitialLoading}
      />

      {/* 3. Examples Table
      <DispersionMovementExamples
        setSelectedFamily={setSelectedFamily}
      />
      */}

      <div className="flex items-center justify-start border-t border-gray-200 pt-6 mt-4">
        <button
          onClick={() => onNavigateToTab?.("skycraper")}
          className="px-5 py-2 border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 rounded-lg text-xs font-semibold tracking-wide transition-colors shadow-sm"
        >
          Previous
        </button>
      </div>
    </div>
  );
};

export default DispersionView;
