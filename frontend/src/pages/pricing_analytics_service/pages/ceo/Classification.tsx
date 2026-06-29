import React from "react";
import ClassificationGrid from "./components/ClassificationGrid";
import ClassificationInsights from "./components/ClassificationInsights";

const Classification = () => {
  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      {/* 1. 3x3 Freq Grid */}
      <ClassificationGrid />

      {/* 2. Insights */}
      <ClassificationInsights />
    </div>
  );
};

export default Classification;
