import React, { useState } from "react";
import SkyscraperChartCard from "./SkyscraperChartCard";
import SkyscraperAlerts from "./SkyscraperAlerts";
import SkyscraperTable from "./SkyscraperTable";

const SkyscraperTab = () => {
  const [compareVs, setCompareVs] = useState("target");
  const [selectedQuarter, setSelectedQuarter] = useState("Q4 FY 26");

  return (
    <div className="flex flex-col gap-8 text-gray-800 pb-12">
      {/* 1. Main Skyscraper Graph Card */}
      <SkyscraperChartCard
        compareVs={compareVs}
        setCompareVs={setCompareVs}
        selectedQuarter={selectedQuarter}
        setSelectedQuarter={setSelectedQuarter}
      />

      {/* 2. Skyscraper Insights Alerts */}
      <SkyscraperAlerts />

      {/* 3. Product Families detailed table */}
      <SkyscraperTable selectedQuarter={selectedQuarter} />
    </div>
  );
};

export default SkyscraperTab;
