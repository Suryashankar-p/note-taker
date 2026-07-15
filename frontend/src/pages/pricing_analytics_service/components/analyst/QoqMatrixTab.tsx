import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { useGetQoqMatrix } from "../../services/query/query";
import QoqMatrixTable from "./QoqMatrixTable";
import QoqDrilldownTable from "./QoqDrilldownTable";
import QoqPerformanceCharts from "./QoqPerformanceCharts";

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
  "Higher — last 2Q (last 2 > PY avg)":  "Rising 2Q",
  "Lower — last 2Q (last 2 < PY avg)": "Falling 2Q",
  "Lower — last 3Q (all 3 < PY avg)": "Falling 3Q",
  "Fluctuating / other (mixed)": "Fluctuating",
};

const colors: Record<string, string> = {
  "Above +3% vs PMA": "bg-emerald-600 hover:bg-emerald-500 text-white",
  "Within ±3% vs PMA": "bg-amber-600 hover:bg-amber-500 text-white",
  "Below -3% vs PMA": "bg-rose-600 hover:bg-rose-500 text-white",
};

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

  const [selectedQuarter, setSelectedQuarter] = useState<string>("");

  const sortedQuarters: string[] = qoqMatrixQuery.data?.quarters || [];

  useEffect(() => {
    if (sortedQuarters.length > 0 && !selectedQuarter) {
      setSelectedQuarter(sortedQuarters[sortedQuarters.length - 1]);
    }
  }, [sortedQuarters, selectedQuarter]);

  const activeQuarter = selectedQuarter || sortedQuarters[sortedQuarters.length - 1] || "";

  const apiFamilyDetails = qoqMatrixQuery.data?.familyDetails || {};
  const familyHistory = qoqMatrixQuery.data?.familyHistory || {};


  const getFamilyMockDetails = useCallback((name: string) => {
    const key = name.toLowerCase();

    // Retrieve stats for the active quarter from familyHistory, or fall back to overall apiFamilyDetails
    const stats = familyHistory[key]?.[activeQuarter] || apiFamilyDetails[key];
    const nkKey = stats?.nk ? stats.nk.toLowerCase() : key;
    const actualVal = stats?.actual_gm_pct ?? 0;
    const targetVal = stats?.target_gm_pct ?? 0;
    const baselineVal = stats?.baseline_gm_pct ?? targetVal;
    const gap = stats?.delta_pp ?? (actualVal - targetVal);

    // O(1) per-quarter lookup using the pre-indexed familyHistory map
    const history = sortedQuarters.map((q: string) => {
      const fStats = familyHistory[key]?.[q] ?? familyHistory[nkKey]?.[q];
      return {
        quarter: q,
        revenue: fStats ? fStats.revenue_inr / 100000 : 0,
        gm: fStats ? fStats.actual_gm_pct : 0,
      };
    });

    const mean = stats?.mean_gm_pct ?? actualVal;
    const min = stats?.min_gm_pct ?? actualVal;
    const max = stats?.max_gm_pct ?? actualVal;
    const median = stats?.median_gm_pct ?? actualVal;
    const std = stats?.std_dev_gm_pct ?? 0.0;

    const revenueInr = stats?.revenue_inr || 0;
    return {
      name,
      revenue: revenueInr > 0 ? `₹${(revenueInr / 100000).toFixed(2)}L` : "₹0.00L",
      actual: `${actualVal.toFixed(1)}%`,
      target: `${targetVal.toFixed(1)}%`,
      delta: `${gap >= 0 ? "+" : ""}${gap.toFixed(1)}`,
      deltaVal: gap,
      history,
      baseline: baselineVal,
      targetVal,
      mean: `${mean.toFixed(1)}%`,
      stdDev: std > 0 ? `${std.toFixed(1)}%` : "-",
      median: `${median.toFixed(1)}%`,
      min: `${min.toFixed(1)}%`,
      max: `${max.toFixed(1)}%`,
      transactionCount: stats?.transaction_count ?? 0,
      // Pass nk directly so dispersion API gets the correct lowercase key
      familyNk: stats?.nk ?? key,
    };
  }, [apiFamilyDetails, familyHistory, sortedQuarters, activeQuarter]);

  const matrixData = useMemo(() => {
    const activeMatrix = qoqMatrixQuery.data?.quarterMatrices?.[activeQuarter] || qoqMatrixQuery.data?.matrix || {};
    const data: Record<string, Record<string, { count: number; color: string; families: string[]; familyData: any[] }>> = {};

    rows.forEach((rowName) => {
      data[rowName] = {};
      columns.forEach((colName) => {
        const familiesArray: string[] = activeMatrix?.[apiRows[rowName]]?.[apiCols[colName]] || [];
        data[rowName][colName] = {
          count: familiesArray.length,
          color: colors[rowName],
          families: familiesArray,
          familyData: familiesArray.map(getFamilyMockDetails),
        };
      });
    });
    return data;
  }, [activeQuarter, qoqMatrixQuery.data, getFamilyMockDetails]);

  const handleCellClick = useCallback((r: string, c: string) => {
    const item = matrixData[r][c];
    setSelectedQoqCell({
      row: r,
      col: c,
      count: item.count,
      colorClass: item.color,
      families: item.families,
    });
    setSelectedFamily(null);
  }, [matrixData, setSelectedQoqCell, setSelectedFamily]);

  const getRowTotal = useCallback((r: string) => {
    return columns.reduce((sum, c) => sum + (matrixData[r]?.[c]?.count || 0), 0);
  }, [matrixData]);

  const activeFamiliesList = selectedQoqCell
    ? matrixData[selectedQoqCell.row]?.[selectedQoqCell.col]?.familyData || []
    : [];

  const selectedDetails = selectedFamily ? getFamilyMockDetails(selectedFamily) : null;

  if (qoqMatrixQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#a61c1e]"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 text-gray-800 pb-12">
      <QoqMatrixTable
        matrixData={matrixData}
        activeQuarter={activeQuarter}
        sortedQuarters={sortedQuarters}
        selectedQuarter={selectedQuarter}
        setSelectedQuarter={setSelectedQuarter}
        selectedQoqCell={selectedQoqCell}
        handleCellClick={handleCellClick}
        getRowTotal={getRowTotal}
      />

      {selectedQoqCell && (
        <>
          <QoqDrilldownTable
            activeFamiliesList={activeFamiliesList}
            selectedFamily={selectedFamily}
            setSelectedFamily={setSelectedFamily}
            activeQuarter={activeQuarter}
          />

          {selectedFamily && selectedDetails && (
            <QoqPerformanceCharts
              selectedFamily={selectedFamily}
              selectedDetails={selectedDetails}
              sortedQuarters={sortedQuarters}
              onNavigateToSku={onNavigateToSku}
              activeQuarter={activeQuarter}
            />
          )}
        </>
      )}

      <div className="flex items-center justify-between border-t border-gray-200 pt-6 mt-4">
        <button
          onClick={() => onNavigateToTab?.("skyscraper")}
          className="px-5 py-2 border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 rounded-lg text-xs font-semibold tracking-wide transition-colors shadow-sm"
        >
          Previous
        </button>
        <button
          onClick={() => onNavigateToTab?.("sku-drill-down")}
          className="px-6 py-2 bg-[#a61c1e] hover:bg-[#8e181a] text-white font-bold rounded-lg text-xs tracking-wide transition-all shadow-md active:scale-95"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default QoqMatrixTab;
