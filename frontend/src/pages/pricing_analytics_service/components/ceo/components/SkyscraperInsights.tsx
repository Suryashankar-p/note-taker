import React from "react";

const SkyscraperInsights = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-sm font-semibold tracking-wider text-gray-500 uppercase mb-4">
        Skyscraper insights
      </h3>
      <div className="flex flex-col gap-3.5 text-xs text-gray-600 leading-relaxed">
        <div className="border-l-4 border-[#a61c1e] bg-gray-50 p-4 rounded-r-lg">
          <strong className="text-gray-900 block mb-1">Largest gap vs target:</strong>
          Fan at -19.1 pp below PMA (₹44.92L, 2.1% of quarter revenue). So what: this family alone is the single biggest target miss in Q4 FY 26.
        </div>
        <div className="border-l-4 border-[#a61c1e] bg-gray-50 p-4 rounded-r-lg">
          <strong className="text-gray-900 block mb-1">Highest revenue below target:</strong>
          HE (Coil) — ₹450.84L at -11.7 pp (20.7% share). So what: even if not the deepest miss, its size makes it the main lever to lift heating GM.
        </div>
        <div className="border-l-4 border-rose-500 bg-gray-50 p-4 rounded-r-lg">
          <strong className="text-gray-900 block mb-1">Chronic drag:</strong>
          HE (Coil) (20.7% share, -11.7 pp); Tube (3.9% share, -6.5 pp); pump 1 (3.5% share, -3.2 pp); Burner 1 (4.9% share, -1.8 pp) (+ 1 more) — below target for 3 consecutive quarter(s) with meaningful share (&gt; ₹0.64 Cr GM at risk). So what: structural underperformance, not a one-off quarter.
        </div>
        <div className="border-l-4 border-emerald-500 bg-gray-50 p-4 rounded-r-lg">
          <strong className="text-gray-900 block mb-1">HE (Coil) — diagnosis:</strong>
          Standard GM 65.0% (16% of family rev) vs non-standard 49.1%. Non-standard mix is the primary drag — bespoke / non-catalogue volume is running below PMA target, not standard list-price discipline.
        </div>
      </div>
    </div>
  );
};

export default SkyscraperInsights;
