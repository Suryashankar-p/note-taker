import React, { useState, useEffect } from "react";
import SkyscraperChart from "./SkyscraperChart";
import SkyscraperInsights from "./SkyscraperInsights";
import SkyscraperProductFamilies from "./SkyscraperProductFamilies";
import { useGetSkyscraper } from "../../services/query/query";
import { useOutletContext } from "react-router-dom";

const Skycraper = () => {
  const context = useOutletContext<any>() || {};
  const onNavigateToTab = context.onNavigateToTab;

  const sessionId = Number(localStorage.getItem("pricing_session_id")) || 10;
  const { data, isLoading } = useGetSkyscraper(sessionId);

  const [compareMode, setCompareMode] = useState<"target" | "baseline">("target");
  const [selectedQuarter, setSelectedQuarter] = useState<string>("");

  const parseQuarter = (qStr: string) => {
    const match = qStr.match(/Q(\d)\s+FY\s+(\d+)/);
    if (!match) return { year: 0, quarter: 0 };
    return {
      quarter: parseInt(match[1], 10),
      year: parseInt(match[2], 10),
    };
  };

  const sortedQuarters = Object.keys(data || {}).sort((a, b) => {
    const qa = parseQuarter(a);
    const qb = parseQuarter(b);
    if (qa.year !== qb.year) return qa.year - qb.year;
    return qa.quarter - qb.quarter;
  });

  useEffect(() => {
    if (sortedQuarters.length > 0 && !selectedQuarter) {
      setSelectedQuarter(sortedQuarters[sortedQuarters.length - 1]);
    }
  }, [sortedQuarters, selectedQuarter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-700"></div>
      </div>
    );
  }

  const activeQuarter = selectedQuarter || sortedQuarters[sortedQuarters.length - 1] || "";
  const rawFamilies = data?.[activeQuarter] || [];

  const processedFamilies = rawFamilies
    .map((fam: any) => {
      const actual = fam.actual_gm_pct !== null && fam.actual_gm_pct !== undefined ? fam.actual_gm_pct : 0;
      const ref = (compareMode === "target" ? fam.target_gm_pct : fam.ref_gm_pct) ?? 0;
      const gap = (compareMode === "target" ? fam.margin_gap_pp : fam.baseline_margin_gap_pp) ?? 0;
      return {
        name: fam.display_name,
        actual: actual,
        target: ref,
        delta: gap,
        revenueInr: fam.revenue_inr || 0,
        share: fam.revenue_share_pct || 0,
        classification: fam.classification || "Commodity"
      };
    })
    .sort((a: any, b: any) => b.delta - a.delta);

  const quarterMeta = data?.byQuarter?.[activeQuarter] || {
    insights: [],
    vs_target: { above_target: 0, below_target: 0, at_target: 0 },
    vs_baseline: { above_baseline: 0, below_baseline: 0 }
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      <SkyscraperChart
        families={processedFamilies}
        compareMode={compareMode}
        setCompareMode={setCompareMode}
        selectedQuarter={activeQuarter}
        setSelectedQuarter={setSelectedQuarter}
        quarters={sortedQuarters}
        meta={quarterMeta}
      />

      <SkyscraperInsights
        insights={quarterMeta.insights}
      />

      <SkyscraperProductFamilies
        families={processedFamilies}
        selectedQuarter={activeQuarter}
      />

      <div className="flex items-center justify-between border-t border-gray-200 pt-6 mt-4">
        <button
          onClick={() => onNavigateToTab?.("classification")}
          className="px-5 py-2 border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 rounded-lg text-xs font-semibold tracking-wide transition-colors shadow-sm"
        >
          Previous
        </button>
        <button
          onClick={() => onNavigateToTab?.("dispersion-view")}
          className="px-6 py-2 bg-[#a61c1e] hover:bg-[#8e181a] text-white font-bold rounded-lg text-xs tracking-wide transition-all shadow-md active:scale-95"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Skycraper;
