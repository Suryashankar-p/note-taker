import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DispersionBoxes from "./DispersionBoxes";
import DispersionCharts from "./DispersionCharts";
import DispersionMovementExamples from "./DispersionMovementExamples";
import { buDispersionMock } from "../../constants/mockData";

const DispersionView = () => {
  const { bu } = useParams<{ bu: string }>();
  const navigate = useNavigate();
  const [selectedFamily, setSelectedFamily] = useState<string>("Air nozzle");
  const [selectedQuarter, setSelectedQuarter] = useState<string>("Q4 FY 26");

  const activeBu = bu || "heating";
  const mockData = buDispersionMock[activeBu] || buDispersionMock["heating"];

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto text-gray-800">
      {/* 1. Upper Dispersion Boxes */}
      <DispersionBoxes
        qoqCards={mockData.qoqMovement || []}
        selectedQuarter={selectedQuarter}
        setSelectedQuarter={setSelectedQuarter}
        quarters={["Q4 FY 26"]}
        isFetching={false}
      />

      {/* 2. Dispersion Curve and Trend Line Charts */}
      <DispersionCharts
        familyDispersion={{
          curve: mockData.dispersionCurve,
          trend: mockData.trendLine,
        }}
        families={[
          { nk: "Air nozzle", display_name: "Air nozzle" },
          { nk: "Compressor", display_name: "Compressor" },
          { nk: "Membranes", display_name: "Membranes" },
        ]}
        selectedFamily={selectedFamily}
        setSelectedFamily={setSelectedFamily}
        isFetching={false}
      />

      {/* 3. Examples Table */}
      <DispersionMovementExamples
        setSelectedFamily={setSelectedFamily}
        dispersionExamples={mockData.examples}
        selectedQuarter={selectedQuarter}
      />

      <div className="flex items-center justify-between border-t border-gray-200 pt-6 mt-4">
        <button
          onClick={() => navigate("../select-bu")}
          className="px-5 py-2 border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 rounded-lg text-xs font-semibold tracking-wide transition-colors shadow-sm"
        >
          ← Welcome
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => navigate(`../${activeBu}/revenue-gm-ladder`)}
            className="px-5 py-2 border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 rounded-lg text-xs font-semibold tracking-wide transition-colors shadow-sm"
          >
            ← Previous
          </button>
          <button
            onClick={() => navigate("../select-bu")}
            className="px-6 py-2 bg-[#a61c1e] hover:bg-[#8e181a] text-white font-bold rounded-lg text-xs tracking-wide transition-all shadow-md active:scale-95"
          >
            Back to business units
          </button>
        </div>
      </div>
    </div>
  );
};

export default DispersionView;
