import React from "react";

const SkyscraperProductFamilies = () => {
  const families = [
    { name: "He (Shell)", actual: "64.3%", target: "52.0%", delta: "+12.3", rev: "₹9.02L", share: "0.4%", isPositive: true },
    { name: "Furnace", actual: "74.6%", target: "64.3%", delta: "+10.3", rev: "₹0.57L", share: "0.0%", isPositive: true },
    { name: "ID Fan", actual: "51.9%", target: "45.9%", delta: "+6.0", rev: "₹21.67L", share: "1.0%", isPositive: true },
    { name: "VALVE 2 (VA)", actual: "65.6%", target: "60.0%", delta: "+5.6", rev: "₹3.71L", share: "0.2%", isPositive: true },
    { name: "Pneumatic Cylinder", actual: "61.7%", target: "56.3%", delta: "+5.4", rev: "₹5.00L", share: "0.2%", isPositive: true },
    { name: "Screw Feeder", actual: "63.3%", target: "58.1%", delta: "+5.2", rev: "₹11.37L", share: "0.5%", isPositive: true },
    { name: "HE (MPA)", actual: "56.8%", target: "52.0%", delta: "+4.8", rev: "₹74.34L", share: "3.4%", isPositive: true },
    { name: "WEGMAN CONE", actual: "64.2%", target: "59.9%", delta: "+4.3", rev: "₹37.98L", share: "1.7%", isPositive: true },
    { name: "Sight Glass", actual: "63.8%", target: "59.5%", delta: "+4.3", rev: "₹0.16L", share: "0.0%", isPositive: true },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-sm font-semibold tracking-wider text-gray-500 uppercase mb-2">
        Product families — Q4 FY 26
      </h3>
      <p className="text-[10px] text-gray-400 mb-4">
        Showing all 75 families. Use ▴ on a column header to filter or sort.
      </p>

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
          {families.map((fam, index) => (
            <tr key={index} className="border-b border-gray-150 hover:bg-gray-50 transition-colors">
              <td className="p-3 font-semibold text-gray-800">{fam.name}</td>
              <td className="p-3 text-center text-gray-600">{fam.actual}</td>
              <td className="p-3 text-center text-gray-600">{fam.target}</td>
              <td className={`p-3 text-center font-bold ${fam.isPositive ? "text-emerald-600" : "text-rose-600"}`}>
                {fam.delta}
              </td>
              <td className="p-3 text-center text-gray-600">{fam.rev}</td>
              <td className="p-3 text-center text-gray-600">{fam.share}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SkyscraperProductFamilies;
