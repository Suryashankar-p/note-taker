import React from "react";
import DispersionBoxes from "./components/DispersionBoxes";
import DispersionCharts from "./components/DispersionCharts";
import DispersionMovementExamples from "./components/DispersionMovementExamples";

const DispersionView = () => {
  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      {/* 1. Upper Dispersion Boxes */}
      <DispersionBoxes />

      {/* 2. Dispersion Curve and Trend Line Charts */}
      <DispersionCharts />

      {/* 3. Examples Table */}
      <DispersionMovementExamples />
    </div>
  );
};

export default DispersionView;
