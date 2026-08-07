import React, { useState } from "react";
import CustomSelect from "../CustomSelect";
import { type ClassificationFamilyItem, type ClassificationCellData } from "../../services/query/query";

interface ClassificationGridProps {
  data?: any;
  quartersList?: string[];
  selectedQuarter?: string;
  setSelectedQuarter?: (qtr: string) => void;
  activeBu?: string;
}

const ClassificationGrid = ({
  data,
  quartersList = [],
  selectedQuarter: propsSelectedQuarter,
  setSelectedQuarter: propsSetSelectedQuarter,
  activeBu,
}: ClassificationGridProps) => {
  const [selectedDetails, setSelectedDetails] = useState<{
    title: string;
    families: ClassificationFamilyItem[];
  } | null>(null);

  const quarters = quartersList;
  const activeQuarter = propsSelectedQuarter || "Q4 FY 26";
  const setSelectedQuarter = propsSetSelectedQuarter || (() => {});

  const matrix = data?.matrix;
  if (!matrix) return null;

  const rowNames = ["Proprietary", "Value-added", "Commodity"];
  const colNames = ["Low", "Medium", "High"];

  const gridData = rowNames.map((row) => {
    const cols = colNames.map((col) => {
      const cell = matrix[row]?.[col];
      if (!cell) {
        return { red: 0, green: 0, margin: "-", isGreen: false, isRed: false, rev: "₹0.00 (0.0%)", redFamilies: [], greenFamilies: [] };
      }

      const redFamilies = cell.families.filter((fam) => fam.actual_gm_pct < fam.baseline_gm_pct);
      const greenFamilies = cell.families.filter((fam) => fam.actual_gm_pct >= fam.baseline_gm_pct);

      const red = cell.below_baseline ?? 0;
      const green = cell.above_baseline ?? 0;

      const totalRev = cell.total_revenue ?? 0;
      const delta = cell.gm_delta_pp ?? 0;

      const marginStr =
        cell.gm_pct !== null
          ? `${cell.gm_pct.toFixed(2)}% (${delta >= 0 ? "+" : ""}${delta.toFixed(2)}%)`
          : "-";

      const isGreen = delta >= 0 && cell.gm_pct !== null;
      const isRed = delta < 0 && cell.gm_pct !== null;

      let revStr = "₹0.00";
      if (totalRev >= 10000000) {
        revStr = `₹${(totalRev / 10000000).toFixed(2)}Cr`;
      } else {
        revStr = `₹${(totalRev / 100000).toFixed(2)}L`;
      }

      return {
        red,
        green,
        redFamilies,
        greenFamilies,
        margin: marginStr,
        isGreen,
        isRed,
        rev: `${revStr} (${(cell.revenue_share_pct || 0).toFixed(1)}%)`,
      };
    });

    return { row, cols };
  });

  const totalRedFamilies = data?.summary?.total_below_baseline ?? 0;
  const totalGreenFamilies = data?.summary?.total_above_baseline ?? 0;
  const pooledActualGm = data?.summary?.pooled_actual_gm_pct ?? 0;
  const globalDelta = data?.summary?.global_delta_pp ?? 0;
  const globalTotalRev = data?.summary?.total_revenue_inr ?? 0;

  let globalRevStr = "₹0.00";
  if (globalTotalRev >= 10000000) {
    globalRevStr = `₹${(globalTotalRev / 10000000).toFixed(2)}Cr`;
  } else {
    globalRevStr = `₹${(globalTotalRev / 100000).toFixed(2)}L`;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm text-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-900">Classification × Freq to buy</h2>
        <CustomSelect
          options={quarters}
          value={activeQuarter}
          onChange={(val) => {
            setSelectedQuarter(val);
            setSelectedDetails(null);
          }}
          labelPrefix="Quarter: "
          alignRight
        />
      </div>

      <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 mb-6">
        <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">
          Classification × Freq to buy • {activeQuarter}
        </div>
        <div className="text-lg font-extrabold text-gray-900 mt-1">
          {activeBu ? activeBu.charAt(0).toUpperCase() + activeBu.slice(1) : "Heating"} overall GM: <span className="text-[#a61c1e]">{pooledActualGm.toFixed(2)}%</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 text-xs font-semibold">
        <div></div>
        <div className="text-center font-bold text-gray-500 bg-gray-50 py-2 border border-gray-200 rounded-lg">
          Low
        </div>
        <div className="text-center font-bold text-gray-500 bg-gray-50 py-2 border border-gray-200 rounded-lg">
          Medium
        </div>
        <div className="text-center font-bold text-gray-500 bg-gray-50 py-2 border border-gray-200 rounded-lg">
          High
        </div>

        {gridData.map((row, rIdx) => (
          <React.Fragment key={rIdx}>
            <div className="flex items-center font-bold text-gray-700 bg-gray-50 px-3 border border-gray-200 rounded-lg">
              {row.row}
            </div>
            {row.cols.map((col, cIdx) => (
              <div key={cIdx} className="bg-white border border-gray-200 p-4 rounded-xl flex flex-col gap-3 shadow-sm hover:border-gray-300 transition-colors">
                <div className="flex justify-between items-center text-xs">
                  <span
                    className="px-3 py-0.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-100 font-bold cursor-pointer hover:bg-rose-100 transition-colors"
                    onClick={() =>
                      setSelectedDetails({
                        title: `Below baseline — ${row.row} × ${colNames[cIdx]} - ${activeQuarter}`,
                        families: col.redFamilies,
                      })
                    }
                  >
                    {col.red}
                  </span>
                  <span
                    className="px-3 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold cursor-pointer hover:bg-emerald-100 transition-colors"
                    onClick={() =>
                      setSelectedDetails({
                        title: `Above baseline — ${row.row} × ${colNames[cIdx]} - ${activeQuarter}`,
                        families: col.greenFamilies,
                      })
                    }
                  >
                    {col.green}
                  </span>
                </div>
                <div
                  className={`text-center font-bold py-1 px-1.5 rounded-lg text-[10px] border ${
                    col.isGreen
                      ? "bg-emerald-50 text-emerald-800 border-emerald-100"
                      : col.isRed
                      ? "bg-rose-50 text-rose-800 border-rose-100"
                      : "bg-gray-50 text-gray-400 border-transparent"
                  }`}
                >
                  {col.margin}
                </div>
                <div className="text-center text-[10px] text-gray-500 border border-gray-250/20 bg-gray-50 py-1 rounded-lg">
                  {col.rev}
                </div>
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">
            Below / above baseline GM (# families)
          </span>
          <div className="flex gap-2">
            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-150">
              {totalRedFamilies} below
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-150">
              {totalGreenFamilies} above
            </span>
          </div>
        </div>
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">
            Pooled GM% (Δ vs baseline)
          </span>
          <span className="text-xs font-bold text-gray-800">
            {pooledActualGm.toFixed(2)}% ({globalDelta >= 0 ? "+" : ""}{globalDelta.toFixed(2)}%)
          </span>
        </div>
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">
            Revenue (share of total)
          </span>
          <span className="text-xs font-bold text-gray-800">{globalRevStr} (100%)</span>
        </div>
      </div>

      {selectedDetails && (
        <div className="mt-8 bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-gray-900 font-bold text-sm">{selectedDetails.title}</h3>
            <button
              onClick={() => setSelectedDetails(null)}
              className="text-gray-550 hover:text-gray-700 text-xs border border-gray-300 px-2.5 py-1 rounded bg-white shadow-sm"
            >
              Close
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-[10px] text-gray-500 font-bold uppercase tracking-wider bg-gray-50">
                  <th className="py-3 px-4 font-semibold">PRODUCT FAMILY</th>
                  <th className="py-3 px-4 font-semibold">BASELINE GM%</th>
                  <th className="py-3 px-4 font-semibold">TARGET GM%</th>
                  <th className="py-3 px-4 font-semibold">ACTUAL GM%</th>
                  <th className="py-3 px-4 font-semibold">REVENUE</th>
                  <th className="py-3 px-4 font-semibold">TRANSACTIONS</th>
                </tr>
              </thead>
              <tbody className="text-xs text-gray-700">
                {selectedDetails.families.map((fam, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="py-3 px-4 font-semibold text-gray-900">
                      {fam.display_name || fam.family_nk}
                    </td>
                    <td className="py-3 px-4">{fam.baseline_gm_pct?.toFixed(1)}%</td>
                    <td className="py-3 px-4">{fam.target_gm_pct?.toFixed(1)}%</td>
                    <td className="py-3 px-4">{fam.actual_gm_pct?.toFixed(1)}%</td>
                    <td className="py-3 px-4">₹{fam.revenue_inr?.toLocaleString("en-IN")}</td>
                    <td className="py-3 px-4">{fam.transaction_count ?? fam.transactions ?? 0} txns</td>
                  </tr>
                ))}
                {selectedDetails.families.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-gray-400 italic bg-white">
                      No product families found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassificationGrid;
