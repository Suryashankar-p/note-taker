import React from "react";
import { AlertCircle } from "lucide-react";

interface QoqDrilldownTableProps {
  activeFamiliesList: any[];
  selectedFamily: string | null;
  setSelectedFamily: (family: string | null) => void;
  activeQuarter: string;
}

const QoqDrilldownTable: React.FC<QoqDrilldownTableProps> = ({
  activeFamiliesList,
  selectedFamily,
  setSelectedFamily,
  activeQuarter,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-sm font-bold tracking-tight text-gray-800 mb-3">
        Product family drill-down
      </h3>
      
      <div className="flex items-center gap-3 bg-teal-50 border border-teal-200 text-teal-800 p-3 rounded-lg mb-4 text-xs font-semibold">
        <AlertCircle className="text-teal-600 shrink-0" size={14} />
        <p>Click a product family to see performance and dispersion. Scroll down and open SKU drill-down for line-level deviations.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-gray-150 bg-gray-55 text-gray-500 font-bold uppercase text-[9px] tracking-wider">
              <th className="py-2.5 px-4">Product Family</th>
              <th className="py-2.5 px-4 text-right">Revenue ({activeQuarter})</th>
              <th className="py-2.5 px-4 text-right">Actual GM%</th>
              <th className="py-2.5 px-4 text-right">Target GM%</th>
              <th className="py-2.5 px-4 text-right">Δ (PP)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
            {activeFamiliesList.length > 0 ? (
              activeFamiliesList.map((fam, idx) => {
                const isSelected = selectedFamily === fam.name;
                const isPositive = fam.delta.startsWith("+");
                return (
                  <tr
                    key={idx}
                    onClick={() => setSelectedFamily(fam.name)}
                    className={`cursor-pointer hover:bg-slate-50 transition-colors ${
                      isSelected ? "bg-[#a61c1e]/10 text-[#a61c1e]" : ""
                    }`}
                  >
                    <td className="py-3 px-4 font-bold text-gray-900">{fam.name}</td>
                    <td className="py-3 px-4 text-right">{fam.revenue}</td>
                    <td className="py-3 px-4 text-right">{fam.actual}</td>
                    <td className="py-3 px-4 text-right">{fam.target}</td>
                    <td className={`py-3 px-4 text-right font-bold ${isPositive ? "text-emerald-600" : "text-rose-600"}`}>
                      {fam.delta}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-400 font-bold text-xs bg-slate-50/50">
                  No families found for this cell.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QoqDrilldownTable;
