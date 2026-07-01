import React from "react";
import SkyscraperChart from "./SkyscraperChart";
import SkyscraperInsights from "./SkyscraperInsights";
import SkyscraperProductFamilies from "./SkyscraperProductFamilies";

const Skycraper = () => {
  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      {/* 1. Visual Skyscraper Chart */}
      <SkyscraperChart />

      {/* 2. Insights */}
      <SkyscraperInsights />

      {/* 3. Product Families Table */}
      <SkyscraperProductFamilies />
    </div>
  );
};

export default Skycraper;
