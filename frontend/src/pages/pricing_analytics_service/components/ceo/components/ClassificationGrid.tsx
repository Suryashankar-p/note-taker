import React from "react";

interface FamilyItem {
  family_nk: string;
  display_name: string;
  actual_gm_pct: number;
  baseline_gm_pct: number;
  target_gm_pct: number;
  revenue_inr: number;
}

interface CellData {
  gm_pct: number | null;
  revenue_share_pct: number;
  families: FamilyItem[];
}

interface ClassificationGridProps {
  data?: {
    matrix: Record<string, Record<string, CellData>>;
    insights?: {
      curr_qtr: string;
      prev_qtr: string;
    } | null;
  };
}

const ClassificationGrid = ({ data }: ClassificationGridProps) => {
  const matrix = data?.matrix;
  const insights = data?.insights;
  if (!matrix) return null;

  const rowNames = ["Proprietary", "Value-added", "Commodity"];
  const colNames = ["Low", "Medium", "High"];

  // Compute 3x3 Grid Data
  const gridData = rowNames.map((row) => {
    const cols = colNames.map((col) => {
      const cell = matrix[row]?.[col];
      if (!cell) {
        return { red: 0, green: 0, margin: "-", isGreen: false, isRed: false, rev: "₹0.00 (0.0%)" };
      }

      let red = 0;
      let green = 0;
      cell.families.forEach((fam) => {
        if (fam.actual_gm_pct < fam.baseline_gm_pct) {
          red++;
        } else {
          green++;
        }
      });

      const totalRev = cell.families.reduce((sum, f) => sum + (f.revenue_inr || 0), 0);
      const weightedBaseline = totalRev > 0
        ? cell.families.reduce((sum, f) => sum + (f.baseline_gm_pct * (f.revenue_inr || 0)), 0) / totalRev
        : 0;

      const gmVal = cell.gm_pct !== null ? cell.gm_pct : 0;
      const delta = cell.gm_pct !== null ? (gmVal - weightedBaseline) : 0;

      const marginStr = cell.gm_pct !== null
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
        margin: marginStr,
        isGreen,
        isRed,
        rev: `${revStr} (${(cell.revenue_share_pct || 0).toFixed(1)}%)`,
      };
    });

    return {
      row,
      cols,
    };
  });

  // Compute Global Matrix Metrics
  let totalRedFamilies = 0;
  let totalGreenFamilies = 0;
  let globalTotalRev = 0;
  let globalActualGmWeightedSum = 0;
  let globalBaselineGmWeightedSum = 0;

  rowNames.forEach((row) => {
    colNames.forEach((col) => {
      const cell = matrix[row]?.[col];
      if (cell) {
        cell.families.forEach((fam) => {
          const rev = fam.revenue_inr || 0;
          globalTotalRev += rev;
          globalActualGmWeightedSum += fam.actual_gm_pct * rev;
          globalBaselineGmWeightedSum += fam.baseline_gm_pct * rev;
          if (fam.actual_gm_pct < fam.baseline_gm_pct) {
            totalRedFamilies++;
          } else {
            totalGreenFamilies++;
          }
        });
      }
    });
  });

  const pooledActualGm = globalTotalRev > 0 ? (globalActualGmWeightedSum / globalTotalRev) : 0;
  const pooledBaselineGm = globalTotalRev > 0 ? (globalBaselineGmWeightedSum / globalTotalRev) : 0;
  const globalDelta = pooledActualGm - pooledBaselineGm;

  let globalRevStr = "₹0.00";
  if (globalTotalRev >= 10000000) {
    globalRevStr = `₹${(globalTotalRev / 10000000).toFixed(2)}Cr`;
  } else {
    globalRevStr = `₹${(globalTotalRev / 100000).toFixed(2)}L`;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-bold text-gray-900">Classification × Freq to buy</h2>
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-md">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Quarter</span>
          <select className="bg-transparent text-xs font-semibold text-gray-700 outline-none border-none cursor-pointer">
            <option>{insights?.curr_qtr || "Q4 FY 26"}</option>
          </select>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50 mb-6">
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">
          Classification = Freq to buy • {insights?.curr_qtr || "Q4 FY 26"}
        </div>
        <div className="text-xl font-extrabold text-gray-900 mt-1">
          Heating overall GM: <span className="text-[#a61c1e]">{pooledActualGm.toFixed(2)}%</span>
        </div>
      </div>

      {/* 3x3 Freq Grid */}
      <div className="grid grid-cols-4 gap-4 text-xs font-semibold">
        <div></div>
        <div className="text-center font-bold text-gray-500 bg-gray-50 py-2 border border-gray-200 rounded-md">Low</div>
        <div className="text-center font-bold text-gray-500 bg-gray-50 py-2 border border-gray-200 rounded-md">Medium</div>
        <div className="text-center font-bold text-gray-500 bg-gray-50 py-2 border border-gray-200 rounded-md">High</div>

        {gridData.map((row, rIdx) => (
          <React.Fragment key={rIdx}>
            <div className="flex items-center font-bold text-gray-700 bg-gray-50 px-3 border border-gray-200 rounded-md">
              {row.row}
            </div>
            {row.cols.map((col, cIdx) => (
              <div key={cIdx} className="bg-white border border-gray-200 p-3 rounded-lg flex flex-col gap-2 shadow-xs">
                <div className="flex justify-between items-center text-xs">
                  <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-100 font-bold">{col.red}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold">{col.green}</span>
                </div>
                <div className={`text-center font-bold py-1 px-1.5 rounded text-[10px] ${
                  col.isGreen
                    ? "bg-emerald-50 text-emerald-800"
                    : col.isRed
                    ? "bg-rose-50 text-rose-800"
                    : "bg-gray-50 text-gray-400"
                }`}>
                  {col.margin}
                </div>
                <div className="text-center text-[10px] text-gray-500 bg-gray-50 py-1 rounded">
                  {col.rev}
                </div>
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>

      {/* Metric Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Below / above baseline GM (# families)</span>
          <div className="flex gap-2">
            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
              {totalRedFamilies} below
            </span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              {totalGreenFamilies} above
            </span>
          </div>
        </div>
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Pooled GM% (Δ vs baseline)</span>
          <span className="text-xs font-bold text-gray-800">
            {pooledActualGm.toFixed(2)}% ({globalDelta >= 0 ? "+" : ""}{globalDelta.toFixed(2)}%)
          </span>
        </div>
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Revenue (share of total)</span>
          <span className="text-xs font-bold text-gray-800">
            {globalRevStr} (100%)
          </span>
        </div>
      </div>
    </div>
  );
};

export default ClassificationGrid;
