import React from "react";

interface SkyscraperTableProps {
  selectedQuarter: string;
}

const SkyscraperTable = ({ selectedQuarter }: SkyscraperTableProps) => {
  const tableData = [
    {
      name: "He (Shell)",
      actual: "64.3%",
      target: "52.0%",
      delta: "+12.3",
      revenue: "₹9.02L",
      share: "0.4%",
    },
    {
      name: "Furnace",
      actual: "74.6%",
      target: "64.3%",
      delta: "+10.3",
      revenue: "₹0.57L",
      share: "0.0%",
    },
    {
      name: "ID Fan",
      actual: "51.9%",
      target: "45.9%",
      delta: "+8.0",
      revenue: "₹21.67L",
      share: "1.0%",
    },
    {
      name: "VALVE 2 (VA)",
      actual: "65.8%",
      target: "60.0%",
      delta: "+5.8",
      revenue: "₹3.71L",
      share: "0.2%",
    },
    {
      name: "Pneumatic Cylinder",
      actual: "61.7%",
      target: "56.3%",
      delta: "+5.4",
      revenue: "₹5.00L",
      share: "0.2%",
    },
    {
      name: "Screw Feeder",
      actual: "63.3%",
      target: "58.1%",
      delta: "+5.2",
      revenue: "₹11.37L",
      share: "0.5%",
    },
    {
      name: "HE (MPA)",
      actual: "56.8%",
      target: "52.0%",
      delta: "+4.8",
      revenue: "₹74.34L",
      share: "3.4%",
    },
    {
      name: "WEGMAN CONE",
      actual: "64.2%",
      target: "59.9%",
      delta: "+4.3",
      revenue: "₹37.98L",
      share: "1.7%",
    },
    {
      name: "Sight Glass",
      actual: "63.8%",
      target: "59.5%",
      delta: "+4.3",
      revenue: "₹0.16L",
      share: "0.0%",
    },
    {
      name: "Hardware & Fitting",
      actual: "74.0%",
      target: "70.5%",
      delta: "+3.5",
      revenue: "₹2.47L",
      share: "0.1%",
    },
  ];

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
            {tableData.map((row, idx) => {
              const isPositive = row.delta.startsWith("+");
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
                  <td className="py-2.5 px-4 text-right">{row.revenue}</td>
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
