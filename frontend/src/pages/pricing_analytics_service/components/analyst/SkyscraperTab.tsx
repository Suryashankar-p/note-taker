import React, { useState, useEffect, useMemo } from "react";
import SkyscraperChartCard from "./SkyscraperChartCard";
import SkyscraperAlerts from "./SkyscraperAlerts";
import SkyscraperTable from "./SkyscraperTable";
import { useOutletContext, useParams } from "react-router-dom";
import { useGetSkyscraper } from "../../services/query/query";
import PageLoading from "../../../../components/PageLoading";

const SkyscraperTab = () => {
  const context = useOutletContext<any>() || {};
  const onNavigateToTab = context.onNavigateToTab;
  const { bu } = useParams<{ bu?: string }>();
  const activeBu = bu || "heating";

  const { data: skyscraperData, isLoading, error } = useGetSkyscraper(activeBu);

  const [compareVs, setCompareVs] = useState<string>("target");
  const [selectedQuarter, setSelectedQuarter] = useState<string>("");

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
      <div className="flex flex-col items-center justify-center min-h-[50vh] bg-white border border-dashed border-gray-300 rounded-2xl p-8 text-center">
        <h2 className="text-base font-bold text-gray-900 mb-2">No Skyscraper Data Available</h2>
        <p className="text-xs text-gray-500 max-w-sm mb-6 leading-relaxed">
          The {activeBu} workspace has not compiled skyscraper data yet. Upload the required files to start.
        </p>
        <button
          onClick={() => onNavigateToTab?.("upload")}
          className="px-4 py-2 bg-[#a61c1e] text-white hover:bg-red-700 font-bold rounded-lg text-xs tracking-wide transition-colors shadow-sm"
        >
          Go to Upload Page
        </button>
      </div>
    );
  }

  const activeQuarter = selectedQuarter || quarters[quarters.length - 1] || "";
  const rawFamilies = skyscraperData[activeQuarter] || [];

  const processedFamilies = rawFamilies
    .map((fam: any) => {
      const actual = fam.actual_gm_pct !== null && fam.actual_gm_pct !== undefined ? fam.actual_gm_pct : 0;
      const ref = (compareVs === "target" ? fam.target_gm_pct : fam.ref_gm_pct) ?? 0;
      const gap = (compareVs === "target" ? fam.margin_gap_pp : fam.baseline_margin_gap_pp) ?? 0;
      return {
        name: fam.display_name || fam.family_nk || "Unknown",
        actual: `${actual.toFixed(1)}%`,
        target: `${ref.toFixed(1)}%`,
        delta: `${gap >= 0 ? "+" : ""}${gap.toFixed(1)}`,
        deltaVal: gap,
        revenueInr: fam.revenue_inr || 0,
        share: `${(fam.revenue_share_pct || 0).toFixed(1)}%`,
        rawActual: actual,
        rawTarget: ref,
        rawShare: fam.revenue_share_pct || 0
      };
    })
    .sort((a: any, b: any) => b.deltaVal - a.deltaVal);

  const byQuarterInfo = (skyscraperData as any).byQuarter?.[activeQuarter] || {};

  return (
    <div className="flex flex-col gap-8 text-gray-800 pb-12">
      <SkyscraperChartCard
        families={processedFamilies}
        compareVs={compareVs}
        setCompareVs={setCompareVs}
        selectedQuarter={activeQuarter}
        setSelectedQuarter={setSelectedQuarter}
        quarters={quarters}
      />

      <SkyscraperAlerts
        families={processedFamilies}
        selectedQuarter={activeQuarter}
        compareVs={compareVs}
        insights={byQuarterInfo.insights || []}
      />

      <SkyscraperTable families={processedFamilies} selectedQuarter={activeQuarter} />

      <div className="flex items-center justify-between border-t border-gray-200 pt-6 mt-4">
        <button
          onClick={() => onNavigateToTab?.("overall-margin")}
          className="px-5 py-2 border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 rounded-lg text-xs font-semibold tracking-wide transition-colors shadow-sm"
        >
          Previous
        </button>
        <button
          onClick={() => onNavigateToTab?.("qoq-matrix")}
          className="px-6 py-2 bg-[#a61c1e] hover:bg-[#8e181a] text-white font-bold rounded-lg text-xs tracking-wide transition-all shadow-md active:scale-95"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default SkyscraperTab;
