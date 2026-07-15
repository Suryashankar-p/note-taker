import React from "react";

interface SkyscraperProductFamiliesProps {
  families: Array<{
    name: string;
    actual: number;
    target: number;
    delta: number;
    revenueInr: number;
    share: number;
    classification: string;
  }>;
  selectedQuarter: string;
}

const SkyscraperProductFamilies = ({
  families,
  selectedQuarter,
}: SkyscraperProductFamiliesProps) => {
  const formatRevInLakhs = (val: number) => {
    return `₹${(val / 100000).toFixed(2)}L`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-sm font-semibold tracking-wider text-gray-500 uppercase mb-2">
        Product families — {selectedQuarter}
      </h3>
      <p className="text-[10px] text-gray-400 mb-4">
        Showing all {families.length} families.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
              <th className="p-3">Product Family</th>
              <th className="p-3 text-center">Actual GM%</th>
              <th className="p-3 text-center">Target GM%</th>
              <th className="p-3 text-center">Δ (PP)</th>
              <th className="p-3 text-center">Revenue (L)</th>
              <th className="p-3 text-center">Share</th>
            </tr>
          </thead>
          <tbody>
            {families.map((fam, index) => {
              const isPositive = fam.delta >= 0;
              return (
                <tr key={index} className="border-b border-gray-150 hover:bg-gray-50 transition-colors">
                  <td className="p-3 font-semibold text-gray-800">{fam.name}</td>
                  <td className="p-3 text-center text-gray-600">{fam.actual.toFixed(1)}%</td>
                  <td className="p-3 text-center text-gray-600">{fam.target.toFixed(1)}%</td>
                  <td className={`p-3 text-center font-bold ${isPositive ? "text-emerald-600" : "text-rose-600"}`}>
                    {isPositive ? "+" : ""}{fam.delta.toFixed(1)}
                  </td>
                  <td className="p-3 text-center text-gray-600">{formatRevInLakhs(fam.revenueInr)}</td>
                  <td className="p-3 text-center text-gray-600">{fam.share.toFixed(1)}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SkyscraperProductFamilies;
