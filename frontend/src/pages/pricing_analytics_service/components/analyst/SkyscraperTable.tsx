import React from "react";

interface SkyscraperTableProps {
  families: Array<{
    name: string;
    actual: string;
    target: string;
    delta: string;
    deltaVal: number;
    revenueInr: number;
    share: string;
  }>;
  selectedQuarter: string;
}

const SkyscraperTable = ({
  families,
  selectedQuarter,
}: SkyscraperTableProps) => {
  const formatRevInLakhs = (val: number) => {
    return `₹${(val / 100000).toFixed(2)}L`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-sm font-bold tracking-tight text-gray-800 mb-4 pb-3 border-b border-gray-100">
        Product families — {selectedQuarter}
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 font-bold uppercase text-[9px] tracking-wider">
              <th className="py-3 px-4">Product Family</th>
              <th className="py-3 px-4 text-right">Actual GM %</th>
              <th className="py-3 px-4 text-right">Target GM %</th>
              <th className="py-3 px-4 text-right">Δ (PP)</th>
              <th className="py-3 px-4 text-right">Revenue (L)</th>
              <th className="py-3 px-4 text-right">Share</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
            {families.map((row, idx) => {
              const isPositive = row.deltaVal >= 0;
              return (
                <tr key={idx} className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-4 font-semibold text-gray-900">
                    {row.name}
                  </td>
                  <td className="py-2.5 px-4 text-right">{row.actual}</td>
                  <td className="py-2.5 px-4 text-right">{row.target}</td>
                  <td
                    className={`py-2.5 px-4 text-right font-bold ${
                      isPositive ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {row.delta}
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    {formatRevInLakhs(row.revenueInr)}
                  </td>
                  <td className="py-2.5 px-4 text-right">{row.share}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SkyscraperTable;
