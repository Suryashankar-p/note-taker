import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SkyscraperChart from "./SkyscraperChart";
import SkyscraperInsights from "./SkyscraperInsights";
import SkyscraperProductFamilies from "./SkyscraperProductFamilies";
import { useGetSkyscraper } from "../../services/query/query";
import PageLoading from "../../../../components/PageLoading";

const Skycraper = () => {
  const { bu } = useParams<{ bu: string }>();
  const navigate = useNavigate();
  const [compareMode, setCompareMode] = useState<"target" | "baseline">("target");
  const [selectedQuarter, setSelectedQuarter] = useState<string>("");

  const activeBu = bu || "heating";
  const { data: skyscraperData, isLoading, error } = useGetSkyscraper(activeBu);

  const quarters = useMemo(() => {
    if (!skyscraperData) return [];
    return Object.keys(skyscraperData);
  }, [skyscraperData]);

  useEffect(() => {
    if (quarters.length > 0 && !selectedQuarter) {
      setSelectedQuarter(quarters[quarters.length - 1]);
    }
  }, [quarters, selectedQuarter]);

  const is404 = useMemo(() => {
    const check404 = (err: any) => err?.response?.status === 404 || err?.status === 404;
    return check404(error);
  }, [error]);

  if (isLoading) {
    return <PageLoading />;
  }

  if (is404 || !skyscraperData || quarters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] bg-white border border-dashed border-gray-300 rounded-2xl p-8 text-center text-gray-800">
        <h2 className="text-base font-bold text-gray-900 mb-2">No Skyscraper Data Available</h2>
        <p className="text-xs text-gray-500 max-w-sm mb-6 leading-relaxed">
          The {activeBu} workspace has no skyscraper data compiled. Upload the required files to start.
        </p>
        <button
          onClick={() => navigate(`/ai-studio/pricing-analytics/workspace/dashboard/analyst/${activeBu}/upload`)}
          className="px-4 py-2 bg-[#a61c1e] text-white hover:bg-red-700 font-bold rounded-lg text-xs tracking-wide transition-colors shadow-sm"
        >
          Go to Upload Page
        </button>
      </div>
    );
  }

  const activeQuarter = selectedQuarter || quarters[quarters.length - 1] || "";
  const rawFamilies = skyscraperData[activeQuarter] || [];

  const processedFamilies = rawFamilies.map((fam: any) => {
    const actual = fam.actual_gm_pct ?? 0;
    const ref = (compareMode === "target" ? fam.target_gm_pct : fam.ref_gm_pct) ?? 0;
    const gap = (compareMode === "target" ? fam.margin_gap_pp : fam.baseline_margin_gap_pp) ?? 0;
    return {
      name: fam.display_name || fam.family_nk || "Unknown",
      actual: actual,
      target: ref,
      delta: gap,
      revenueInr: fam.revenue_inr || 0,
      share: fam.revenue_share_pct || 0,
      classification: fam.classification || "Commodity",
    };
  }).sort((a: any, b: any) => b.delta - a.delta);

  const byQuarterInfo = (skyscraperData as any).byQuarter?.[activeQuarter] || {};
  const meta = {
    vs_target: {
      above_target: byQuarterInfo.vs_target?.above_target ?? 0,
      below_target: byQuarterInfo.vs_target?.below_target ?? 0,
      at_target: byQuarterInfo.vs_target?.at_target ?? 0,
    },
    vs_baseline: {
      above_baseline: byQuarterInfo.vs_baseline?.above_baseline ?? 0,
      below_baseline: byQuarterInfo.vs_baseline?.below_baseline ?? 0,
    }
  };
  const insights = byQuarterInfo.insights || [];

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto text-gray-800">
      <SkyscraperChart
        families={processedFamilies}
        compareMode={compareMode}
        setCompareMode={setCompareMode}
        selectedQuarter={activeQuarter}
        setSelectedQuarter={setSelectedQuarter}
        quarters={quarters}
        meta={meta}
      />

      {insights.length > 0 && <SkyscraperInsights insights={insights} />}

      <SkyscraperProductFamilies families={processedFamilies} selectedQuarter={activeQuarter} />

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
