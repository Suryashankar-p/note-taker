import React, { useState, useEffect } from "react";
import SkyscraperChartCard from "./SkyscraperChartCard";
import SkyscraperAlerts from "./SkyscraperAlerts";
import SkyscraperTable from "./SkyscraperTable";
import { useGetSkyscraper } from "../../services/query/query";

const SkyscraperTab = () => {
  const sessionId = Number(localStorage.getItem("pricing_session_id")) || 10;
  const { data, isLoading } = useGetSkyscraper(sessionId);

  const [compareVs, setCompareVs] = useState<string>("target");
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

  // Map and process product families sorted by margin gap descending
  const processedFamilies = rawFamilies
    .map((fam: any) => {
      const actual = fam.actual_gm_pct !== null && fam.actual_gm_pct !== undefined ? fam.actual_gm_pct : 0;
      const ref = (compareVs === "target" ? fam.target_gm_pct : fam.ref_gm_pct) ?? 0;
      const gap = (compareVs === "target" ? fam.margin_gap_pp : fam.baseline_margin_gap_pp) ?? 0;
      return {
        name: fam.display_name,
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

  return (
    <div className="flex flex-col gap-8 text-gray-800 pb-12">
      <SkyscraperChartCard
        families={processedFamilies}
        compareVs={compareVs}
        setCompareVs={setCompareVs}
        selectedQuarter={activeQuarter}
        setSelectedQuarter={setSelectedQuarter}
        quarters={sortedQuarters}
      />

      <SkyscraperAlerts
        families={processedFamilies}
        selectedQuarter={activeQuarter}
        compareVs={compareVs}
        insights={data?.byQuarter?.[activeQuarter]?.insights}
      />

      <SkyscraperTable families={processedFamilies} selectedQuarter={activeQuarter} />
    </div>
  );
};

export default SkyscraperTab;
