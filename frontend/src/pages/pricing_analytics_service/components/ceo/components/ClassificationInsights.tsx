import React from "react";

const ClassificationInsights = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-sm font-semibold tracking-wider text-gray-500 uppercase mb-4">
        Classification insights (vs prior quarters)
      </h3>
      <div className="flex flex-col gap-3.5 text-xs text-gray-600 leading-relaxed">
        <div className="border-l-4 border-[#a61c1e] bg-gray-50 p-4 rounded-r-lg">
          <strong className="text-gray-900 block mb-1">Commodity - High revenue share -3.0 pp (22.4% → 19.4%):</strong>
          Cell GM weakened -0.4 pp (50.8% → 50.4%; portfolio 43.6%). Mix -1.5 pp; margin: -0.1 pp. So what: you sold less of this segment and margins inside it also fell — a double pressure on portfolio GM. Family count below baseline is stable; the margin drop is mainly rate/pricing on the same mix of families.
        </div>
        <div className="border-l-4 border-emerald-500 bg-gray-50 p-4 rounded-r-lg">
          <strong className="text-gray-900 block mb-1">Commodity - Medium revenue share -2.8 pp (47.5% → 44.7%):</strong>
          Cell GM improved +1.1 pp (50.8% → 51.8%; portfolio 43.6%). Mix -1.4 pp; margin: +0.5 pp. So what: share fell but cell GM rose — volume likely shifted to stronger buckets while what you still sell here is priced better.
        </div>
        <div className="border-l-4 border-gray-400 bg-gray-50 p-4 rounded-r-lg">
          <strong className="text-gray-900 block mb-1">Below-baseline concentration:</strong>
          Q4 FY 26 has 22 product families below baseline across the matrix (30 in Q3 FY 26). 0% of classified heating revenue sits in below-baseline families. So what: fewer families are below baseline; any GM pressure is more about rates inside cells than a wider count of weak families.
        </div>
        <div className="border-l-4 border-[#a61c1e] bg-gray-50 p-4 rounded-r-lg">
          <strong className="text-gray-900 block mb-1">Families that flipped below baseline:</strong>
          SWITCH 1, Burner 2 (Fab), Level controller, Electric Heater (+ 1 more) were above baseline in Q3 FY 26 but below in Q4 FY 26. So what: these are newly weak performers — check non-standard mix and catalogue price/cost on these names first.
        </div>
      </div>
    </div>
  );
};

export default ClassificationInsights;
