import React, { useState, useEffect } from "react";
import { AlertCircle, ArrowRight, BarChart3, TrendingUp, Sparkles } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { useGetQoqMatrix, useGetSkyscraper } from "../../services/query/query";

interface CellData {
  row: string;
  col: string;
  count: number;
  colorClass: string;
  families: string[];
}

interface QoqMatrixTabProps {
  selectedQoqCell?: CellData | null;
  setSelectedQoqCell?: (cell: CellData | null) => void;
  selectedFamily?: string | null;
  setSelectedFamily?: (family: string | null) => void;
  onNavigateToSku?: () => void;
  onNavigateToTab?: (tabId: string) => void;
}

const QoqMatrixTab: React.FC<QoqMatrixTabProps> = ({
  selectedQoqCell: propsSelectedQoqCell,
  setSelectedQoqCell: propsSetSelectedQoqCell,
  selectedFamily: propsSelectedFamily,
  setSelectedFamily: propsSetSelectedFamily,
  onNavigateToSku: propsOnNavigateToSku,
  onNavigateToTab: propsOnNavigateToTab,
}) => {
  const context = useOutletContext<any>() || {};

  const selectedQoqCell = propsSelectedQoqCell !== undefined ? propsSelectedQoqCell : context.selectedQoqCell;
  const setSelectedQoqCell = propsSetSelectedQoqCell || context.setSelectedQoqCell;
  const selectedFamily = propsSelectedFamily !== undefined ? propsSelectedFamily : context.selectedFamily;
  const setSelectedFamily = propsSetSelectedFamily || context.setSelectedFamily;
  const onNavigateToSku = propsOnNavigateToSku || context.onNavigateToSku;
  const onNavigateToTab = propsOnNavigateToTab || context.onNavigateToTab;

  const sessionId = Number(localStorage.getItem("pricing_session_id")) || 10;
  const qoqMatrixQuery = useGetQoqMatrix(sessionId);
  const skyscraperQuery = useGetSkyscraper(sessionId);

  const [selectedQuarter, setSelectedQuarter] = useState<string>("");

  const parseQuarter = (qStr: string) => {
    const match = qStr.match(/Q(\d)\s+FY\s+(\d+)/);
    if (!match) return { year: 0, quarter: 0 };
    return {
      quarter: parseInt(match[1], 10),
      year: parseInt(match[2], 10),
    };
  };

  const sortedQuarters = Object.keys(skyscraperQuery.data || {}).sort((a, b) => {
    const qa = parseQuarter(a);
    const qb = parseQuarter(b);
    if (qa.year !== qb.year) return qa.year - qb.year;
    return qa.quarter - qb.quarter;
  });

  useEffect(() => {
    if (sortedQuarters.length > 0 && !selectedQuarter) {
      setSelectedQuarter(sortedQuarters[sortedQuarters.length - 1]);
    }
  }, [sortedQuarters, selectedQuarter]);

  if (qoqMatrixQuery.isLoading || skyscraperQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-700"></div>
      </div>
    );
  }

  const columns = [
    "Higher — last 3Q (all > PY avg)",
    "Higher — last 2Q (last 2 > PY avg)",
    "Lower — last 2Q (last 2 < PY avg)",
    "Lower — last 3Q (all 3 < PY avg)",
    "Fluctuating / other (mixed)",
  ];

  const rows = [
    "Above +3% vs PMA",
    "Within ±3% vs PMA",
    "Below -3% vs PMA",
  ];

  const apiRows: Record<string, string> = {
    "Above +3% vs PMA": "Above target (> +3pp)",
    "Within ±3% vs PMA": "Within target (±3pp)",
    "Below -3% vs PMA": "Below target (< -3pp)",
  };

  const apiCols: Record<string, string> = {
    "Higher — last 3Q (all > PY avg)": "Rising 3Q",
    "Higher — last 2Q (last 2 > PY avg)": "Rising 2Q",
    "Lower — last 2Q (last 2 < PY avg)": "Falling 2Q",
    "Lower — last 3Q (all 3 < PY avg)": "Falling 3Q",
    "Fluctuating / other (mixed)": "Fluctuating",
  };

  const matrixData: Record<string, Record<string, { count: number; color: string; families: string[]; familyData: any[] }>> = {};

  const colors: Record<string, string> = {
    "Above +3% vs PMA": "bg-emerald-800 hover:bg-emerald-700 text-white",
    "Within ±3% vs PMA": "bg-amber-800 hover:bg-amber-750 text-white",
    "Below -3% vs PMA": "bg-rose-900 hover:bg-rose-800 text-white",
  };

  const activeQuarter = selectedQuarter || sortedQuarters[sortedQuarters.length - 1] || "";
  const rawFamilies = skyscraperQuery.data?.[activeQuarter] || [];
  const familyLookup = new Map<string, any>();
  rawFamilies.forEach((fam: any) => {
    familyLookup.set(fam.display_name.toLowerCase(), fam);
    familyLookup.set(fam.family_nk.toLowerCase(), fam);
  });

  rows.forEach((rowName) => {
    matrixData[rowName] = {};
    columns.forEach((colName) => {
      const apiRowKey = apiRows[rowName];
      const apiColKey = apiCols[colName];
      const familiesArray = qoqMatrixQuery.data?.matrix?.[apiRowKey]?.[apiColKey] || [];

      const familyData = familiesArray.map((name: string) => {
        const stats = familyLookup.get(name.toLowerCase());
        const actualVal = stats?.actual_gm_pct || 0;
        const targetVal = stats?.target_gm_pct || 0;
        const gap = actualVal - targetVal;
        return {
          name,
          revenue: stats ? `₹${(stats.revenue_inr / 100000).toFixed(2)}L` : "₹0.00L",
          actual: stats ? `${actualVal.toFixed(1)}%` : "0.0%",
          target: stats ? `${targetVal.toFixed(1)}%` : "0.0%",
          delta: stats ? `${gap >= 0 ? "+" : ""}${gap.toFixed(1)}` : "0.0",
        };
      });

      matrixData[rowName][colName] = {
        count: familiesArray.length,
        color: colors[rowName],
        families: familiesArray,
        familyData,
      };
    });
  });

  const handleCellClick = (r: string, c: string) => {
    const item = matrixData[r][c];
    setSelectedQoqCell({
      row: r,
      col: c,
      count: item.count,
      colorClass: item.color,
      families: item.families,
    });
    setSelectedFamily(null); // Clear selected family until clicked in the table
  };

  const getRowTotal = (r: string) => {
    let sum = 0;
    columns.forEach((c) => {
      sum += matrixData[r][c].count;
    });
    return sum;
  };

  // Find active family data rows to render
  const activeFamiliesList = selectedQoqCell
    ? matrixData[selectedQoqCell.row]?.[selectedQoqCell.col]?.familyData || []
    : [];

  // Extract selected family history across all quarters dynamically
  const familyHistory = sortedQuarters.map((q) => {
    const familiesInQuarter = skyscraperQuery.data?.[q] || [];
    const stats = familiesInQuarter.find(
      (f: any) =>
        f.display_name.toLowerCase() === selectedFamily?.toLowerCase() ||
        f.family_nk.toLowerCase() === selectedFamily?.toLowerCase()
    );
    return {
      quarter: q,
      revenueInr: stats ? stats.revenue_inr : 0,
      actualGmPct: stats ? stats.actual_gm_pct : 0,
    };
  });

  const validHistory = familyHistory.filter((h) => h.actualGmPct > 0);
  const actuals = validHistory.map((h) => h.actualGmPct);
  const meanGm = actuals.length > 0 ? actuals.reduce((a, b) => a + b, 0) / actuals.length : 0;
  const minGm = actuals.length > 0 ? Math.min(...actuals) : 0;
  const maxGm = actuals.length > 0 ? Math.max(...actuals) : 0;

  const sortedActuals = [...actuals].sort((a, b) => a - b);
  const medianGm = sortedActuals.length > 0
    ? (sortedActuals.length % 2 === 0
      ? (sortedActuals[sortedActuals.length / 2 - 1] + sortedActuals[sortedActuals.length / 2]) / 2
      : sortedActuals[Math.floor(sortedActuals.length / 2)])
    : 0;

  const stdDev = actuals.length > 1
    ? Math.sqrt(actuals.reduce((sum, val) => sum + Math.pow(val - meanGm, 2), 0) / (actuals.length - 1))
    : 0;

  return (
    <div className="flex flex-col gap-8 text-gray-800 pb-12">
      {/* Matrix Box */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
          <div>
            <h3 className="text-sm font-bold tracking-tight text-gray-850">
              QoQ matrix — margin vs PMA × revenue momentum
            </h3>
            <p className="text-[11px] text-gray-400 font-semibold uppercase mt-0.5">
              Revenue trend vs GM vs PMA matrix.
            </p>
          </div>
          {sortedQuarters.length > 0 && (
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-md">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Quarter</span>
              <select
                value={activeQuarter}
                onChange={(e) => setSelectedQuarter(e.target.value)}
                className="bg-transparent text-xs font-semibold text-gray-700 outline-none border-none cursor-pointer"
              >
                {sortedQuarters.map((q) => (
                  <option key={q} value={q}>{q}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 bg-[#a61c1e]/5 border border-[#a61c1e]/20 text-gray-700 p-4 rounded-xl mb-6 text-xs font-semibold">
          <AlertCircle className="text-[#a61c1e] shrink-0" size={16} />
          <p>Click any number in the matrix below to see which product families sit in that cell.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-gray-400 font-extrabold uppercase text-[8px] tracking-wider text-center">
                <th className="py-2 px-3 text-left"></th>
                <th className="py-2 px-3 border-l border-gray-150" colSpan={5}>Revenue Trend (Product families — {activeQuarter})</th>
                <th></th>
              </tr>
              <tr className="border-b border-gray-150 bg-gray-50 text-gray-700 font-bold uppercase text-[9px] tracking-wider">
                <th className="py-3 px-4 w-52 text-left">GM vs PMA \ Revenue vs PY</th>
                {columns.map((colName) => (
                  <th key={colName} className="py-3 px-3 text-center border-l border-gray-150 w-36 font-semibold leading-snug">
                    {colName}
                  </th>
                ))}
                <th className="py-3 px-4 text-center border-l border-gray-200 bg-gray-100/50 w-24">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150 text-center font-semibold">
              {rows.map((rowName) => {
                const total = getRowTotal(rowName);
                return (
                  <tr key={rowName} className="hover:bg-slate-50/40">
                    <td className="py-4 px-4 font-bold text-gray-800 text-left bg-gray-50/20 border-r border-gray-150">
                      {rowName}
                    </td>

                    {columns.map((colName) => {
                      const item = matrixData[rowName][colName];
                      const isSelected = selectedQoqCell?.row === rowName && selectedQoqCell?.col === colName;
                      return (
                        <td key={colName} className="py-4 px-3 border-r border-gray-150">
                          <button
                            onClick={() => handleCellClick(rowName, colName)}
                            className={`w-10 h-10 rounded-lg font-extrabold text-sm transition-all shadow-sm ${item.color} ${
                              isSelected ? "ring-4 ring-[#a61c1e]/40 border-2 border-white scale-105" : ""
                            }`}
                          >
                            {item.count}
                          </button>
                        </td>
                      );
                    })}

                    <td className="py-4 px-4 bg-gray-100/30 text-gray-900 font-extrabold text-sm border-l border-gray-200">
                      {total}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Product Family Drill-down (populated only when cell is clicked) */}
      {selectedQoqCell ? (
        <>
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-bold tracking-tight text-gray-850 mb-3">
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
                            isSelected ? "bg-red-50/20 text-[#a61c1e]" : ""
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
                        No cell selected in step 3. Click a matrix number above to load product families.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. Render charts only if a family is selected */}
          {selectedFamily && (
            <div className="bg-white border border-gray-250 rounded-xl p-6 shadow-sm flex flex-col gap-6 animate-fade-in">
              <div>
                <h3 className="text-sm font-bold tracking-tight text-gray-800">
                  Revenue and GM % by quarter
                </h3>
                <p className="text-[11px] text-gray-400 font-semibold uppercase mt-0.5">
                  Select a product family row in the table to update all charts below. (Active: <strong className="text-[#a61c1e]">{selectedFamily}</strong>)
                </p>
              </div>

              {/* Render custom SVGs/Charts simulating Quarter values in screenshot */}
              <div className="h-60 bg-slate-50 rounded-xl border border-gray-150 p-4 flex flex-col justify-between">
                <span className="text-[10px] text-gray-400 font-extrabold uppercase">Revenue and GM % by quarter for {selectedFamily}</span>
                <div className="flex items-end justify-between h-40 px-6">
                  {familyHistory.map((hist, idx) => {
                    const maxRev = Math.max(...familyHistory.map((h) => h.revenueInr), 1);
                    const heightVal = (hist.revenueInr / maxRev) * 100;
                    return (
                      <div key={idx} className="flex flex-col items-center gap-1 w-12">
                        <span className="text-[8px] text-[#a61c1e] font-extrabold">
                          {hist.revenueInr > 0 ? `₹${(hist.revenueInr / 100000).toFixed(1)}L` : "-"}
                        </span>
                        <div
                          className="w-6 bg-[#a61c1e]/20 hover:bg-[#a61c1e]/40 rounded-t border-t border-[#a61c1e] transition-all"
                          style={{ height: `${heightVal}px` }}
                        ></div>
                        <span className="text-[8px] text-emerald-600 font-extrabold">
                          {hist.actualGmPct > 0 ? `${hist.actualGmPct.toFixed(1)}%` : "-"}
                        </span>
                        <span className="text-[8px] text-gray-400 font-bold">{hist.quarter}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 4. GM% Dispersion Analysis */}
              <div className="border-t border-gray-100 pt-6 mt-2">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-4">
                  GM% dispersion analysis
                </h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="border border-gray-150 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between">
                    <span className="text-[10px] text-gray-400 font-bold uppercase mb-4">Normal distribution — GM%</span>
                    <div className="h-40 flex items-center justify-center text-xs text-gray-400 font-semibold border-2 border-dashed border-gray-200 rounded-lg">
                      [Normal Curve Simulation for {selectedFamily}]
                    </div>
                  </div>
                  <div className="border border-gray-150 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between">
                    <span className="text-[10px] text-gray-400 font-bold uppercase mb-4">GM% distribution trend — quarter on quarter</span>
                    <div className="h-40 flex items-center justify-center text-xs text-gray-400 font-semibold border-2 border-dashed border-gray-200 rounded-lg">
                      [Quarter Trend Simulation for {selectedFamily}]
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary stats */}
              <div className="grid grid-cols-5 gap-3 text-center border-t border-gray-150 pt-6">
                <div>
                  <span className="text-[9px] text-gray-400 font-bold uppercase">Mean GM%</span>
                  <span className="text-sm font-extrabold text-gray-900 block mt-1">
                    {meanGm > 0 ? `${meanGm.toFixed(1)}%` : "-"}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-gray-400 font-bold uppercase">Std-dev (σ)</span>
                  <span className="text-sm font-extrabold text-gray-900 block mt-1">
                    {stdDev > 0 ? `${stdDev.toFixed(1)}%` : "-"}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-gray-400 font-bold uppercase">Median</span>
                  <span className="text-sm font-extrabold text-gray-900 block mt-1">
                    {medianGm > 0 ? `${medianGm.toFixed(1)}%` : "-"}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-gray-400 font-bold uppercase">Min GM%</span>
                  <span className="text-sm font-extrabold text-rose-600 block mt-1">
                    {minGm > 0 ? `${minGm.toFixed(1)}%` : "-"}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-gray-400 font-bold uppercase">Max GM%</span>
                  <span className="text-sm font-extrabold text-emerald-600 block mt-1">
                    {maxGm > 0 ? `${maxGm.toFixed(1)}%` : "-"}
                  </span>
                </div>
              </div>

              {/* Drill-down button */}
              <button
                onClick={onNavigateToSku}
                className="mt-4 flex items-center justify-center gap-2 w-full py-2 bg-[#a61c1e] hover:bg-[#8e181a] text-white font-bold rounded-lg text-xs tracking-wide transition-colors shadow-sm hover:scale-[1.01]"
              >
                SKU deviation drill-down —
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center justify-between border-t border-gray-200 pt-6 mt-4">
          <button
            onClick={() => onNavigateToTab?.("skyscraper")}
            className="px-5 py-2 border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 rounded-lg text-xs font-semibold tracking-wide transition-colors shadow-sm"
          >
            — Previous
          </button>
          <button
            onClick={() => onNavigateToTab?.("sku-drill-down")}
            className="px-6 py-2 bg-[#2dd4bf] hover:bg-[#14b8a6] text-white font-bold rounded-lg text-xs tracking-wide transition-all shadow-md active:scale-95"
          >
            Next —
          </button>
        </div>
      )}
    </div>
  );
};

export default QoqMatrixTab;
