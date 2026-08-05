import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SkyscraperChart from "./SkyscraperChart";
import SkyscraperInsights from "./SkyscraperInsights";
import SkyscraperProductFamilies from "./SkyscraperProductFamilies";
import { buLadderMock } from "../../constants/mockData";

const Skycraper = () => {
  const { bu } = useParams<{ bu: string }>();
  const navigate = useNavigate();
  const [compareMode, setCompareMode] = useState<"target" | "baseline">("target");
  const [selectedQuarter, setSelectedQuarter] = useState<string>("Q4 FY 26");

  const activeBu = bu || "heating";
  const mockData = buLadderMock[activeBu] || buLadderMock["heating"];

  // Process families for standard layout expectations
  const processedFamilies = (mockData.families || []).map((fam: any) => ({
    name: fam.name,
    actual: fam.actual,
    target: fam.target,
    delta: fam.delta,
    revenueInr: fam.revenue * 100000,
    share: fam.share,
    classification: "Commodity",
  }));

  const chartData = (mockData.chartData || []).map((c: any) => ({
    name: c.name,
    value: c.value,
  }));

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto text-gray-800">
      <SkyscraperChart
        families={processedFamilies}
        compareMode={compareMode}
        setCompareMode={setCompareMode}
        selectedQuarter={selectedQuarter}
        setSelectedQuarter={setSelectedQuarter}
        quarters={["Q4 FY 26"]}
        meta={{
          vs_target: {
            above_target: mockData.summary.above,
            below_target: mockData.summary.below,
            at_target: 0,
          },
          vs_baseline: {
            above_baseline: mockData.summary.above,
            below_baseline: mockData.summary.below,
          },
        }}
        mockChartData={chartData}
      />

      <SkyscraperInsights insights={mockData.insights} />

      <SkyscraperProductFamilies families={processedFamilies} selectedQuarter={selectedQuarter} />

      <div className="flex items-center justify-between border-t border-gray-200 pt-6 mt-4">
        <button
          onClick={() => navigate("../select-bu")}
          className="px-5 py-2 border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 rounded-lg text-xs font-semibold tracking-wide transition-colors shadow-sm"
        >
          ← Welcome
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => navigate(`../${activeBu}/classification`)}
            className="px-5 py-2 border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 rounded-lg text-xs font-semibold tracking-wide transition-colors shadow-sm"
          >
            ← Previous
          </button>
          <button
            onClick={() => navigate(`../${activeBu}/dispersion-view`)}
            className="px-6 py-2 bg-[#a61c1e] hover:bg-[#8e181a] text-white font-bold rounded-lg text-xs tracking-wide transition-all shadow-md active:scale-95"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Skycraper;
