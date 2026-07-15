import React from "react";

const AboveBaselineTable = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-sm font-semibold tracking-wider text-gray-500 uppercase mb-4">
        Above baseline — Proprietary × Medium • Q4 FY 26
      </h3>
      <table className="w-full text-xs text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
            <th className="p-3">Product Family</th>
            <th className="p-3 text-center">Baseline GM%</th>
            <th className="p-3 text-center">Target GM%</th>
            <th className="p-3 text-center">Actual GM%</th>
            <th className="p-3 text-center">Revenue</th>
            <th className="p-3 text-center">Transactions</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-150 hover:bg-gray-50 transition-colors">
            <td className="p-3 font-semibold text-gray-800">JACKET</td>
            <td className="p-3 text-center text-gray-600">46.3%</td>
            <td className="p-3 text-center text-gray-600">65.6%</td>
            <td className="p-3 text-center font-bold text-emerald-600">57.5%</td>
            <td className="p-3 text-center text-gray-600">₹34,75,478</td>
            <td className="p-3 text-center text-gray-600">33 txns</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default AboveBaselineTable;
