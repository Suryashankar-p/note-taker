import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ClassificationGrid from "./ClassificationGrid";
import ClassificationInsights from "./ClassificationInsights";
import { buClassificationMock } from "../../constants/mockData";

const Classification = () => {
  const { bu } = useParams<{ bu: string }>();
  const navigate = useNavigate();
  const [selectedQuarter, setSelectedQuarter] = useState<string>("Q4 FY 26");

  const activeBu = bu || "heating";
  const mockData = buClassificationMock[activeBu] || buClassificationMock["heating"];

  // Custom styling wrapper for dark-themed insights and layout
  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto text-gray-800">
      <ClassificationGrid
        data={mockData}
        selectedQuarter={selectedQuarter}
        setSelectedQuarter={setSelectedQuarter}
      />

      <ClassificationInsights data={mockData.insights} />

      <div className="flex items-center justify-between border-t border-gray-200 pt-6 mt-4">
        <button
          onClick={() => navigate("../select-bu")}
          className="px-5 py-2 border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 rounded-lg text-xs font-semibold tracking-wide transition-colors shadow-sm"
        >
          ← Welcome
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => navigate("../overall-margin")}
            className="px-5 py-2 border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 rounded-lg text-xs font-semibold tracking-wide transition-colors shadow-sm"
          >
            ← Previous
          </button>
          <button
            onClick={() => navigate(`../${activeBu}/revenue-gm-ladder`)}
            className="px-6 py-2 bg-[#a61c1e] hover:bg-[#8e181a] text-white font-bold rounded-lg text-xs tracking-wide transition-all shadow-md active:scale-95"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Classification;
