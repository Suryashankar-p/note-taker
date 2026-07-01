import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useGetQoqMatrix, useGetSkyscraper } from "../../services/query/query";
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

// Mock details matching the client's screenshot exactly
const clientFamilyMockData: Record<string, {
  name: string;
  revenue: string;
  actual: string;
  target: string;
  delta: string;
  deltaVal: number;
  history: Array<{ quarter: string; revenue: number; gm: number }>;
  baseline: number;
  targetVal: number;
  mean: string;
  stdDev: string;
  median: string;
  min: string;
  max: string;
}> = {
  "air nozzle": {
    name: "Air nozzle",
    revenue: "₹20.26L",
    actual: "53.5%",
    target: "54.6%",
    delta: "-1.1",
    deltaVal: -1.1,
    history: [
      { quarter: "Q4 FY 24", revenue: 46.7, gm: 49.2 },
      { quarter: "Q1 FY 25", revenue: 40.3, gm: 40.6 },
      { quarter: "Q2 FY 25", revenue: 51.2, gm: 50.3 },
      { quarter: "Q3 FY 25", revenue: 36.5, gm: 47.7 },
      { quarter: "Q4 FY 25", revenue: 57.8, gm: 51.6 },
      { quarter: "Q1 FY 26", revenue: 42.0, gm: 50.4 },
      { quarter: "Q2 FY 26", revenue: 52.0, gm: 51.7 },
      { quarter: "Q3 FY 26", revenue: 46.8, gm: 51.9 },
      { quarter: "Q4 FY 26", revenue: 53.5, gm: 52.2 }
    ],
    baseline: 50.3,
    targetVal: 54.6,
    mean: "51.6%",
    stdDev: "7.0%",
    median: "54.6%",
    min: "39.5%",
    max: "70.0%"
  },
  "he (economiser)": {
    name: "HE (Economiser)",
    revenue: "₹25.68L",
    actual: "49.6%",
    target: "51.4%",
    delta: "-1.8",
    deltaVal: -1.8,
    history: [
      { quarter: "Q4 FY 24", revenue: 22.1, gm: 48.0 },
      { quarter: "Q1 FY 25", revenue: 20.3, gm: 49.1 },
      { quarter: "Q2 FY 25", revenue: 24.5, gm: 48.8 },
      { quarter: "Q3 FY 25", revenue: 21.0, gm: 49.0 },
      { quarter: "Q4 FY 25", revenue: 28.2, gm: 49.2 },
      { quarter: "Q1 FY 26", revenue: 22.0, gm: 49.3 },
      { quarter: "Q2 FY 26", revenue: 25.1, gm: 49.5 },
      { quarter: "Q3 FY 26", revenue: 24.8, gm: 49.6 },
      { quarter: "Q4 FY 26", revenue: 25.68, gm: 49.6 }
    ],
    baseline: 49.0,
    targetVal: 51.4,
    mean: "49.1%",
    stdDev: "0.5%",
    median: "49.2%",
    min: "48.0%",
    max: "49.6%"
  },
  "spiral": {
    name: "Spiral",
    revenue: "₹9.11L",
    actual: "56.5%",
    target: "55.2%",
    delta: "+1.3",
    deltaVal: 1.3,
    history: [
      { quarter: "Q4 FY 24", revenue: 8.2, gm: 54.0 },
      { quarter: "Q1 FY 25", revenue: 7.9, gm: 54.5 },
      { quarter: "Q2 FY 25", revenue: 8.8, gm: 55.0 },
      { quarter: "Q3 FY 25", revenue: 8.1, gm: 55.2 },
      { quarter: "Q4 FY 25", revenue: 9.4, gm: 55.5 },
      { quarter: "Q1 FY 26", revenue: 8.5, gm: 55.8 },
      { quarter: "Q2 FY 26", revenue: 9.0, gm: 56.0 },
      { quarter: "Q3 FY 26", revenue: 8.9, gm: 56.2 },
      { quarter: "Q4 FY 26", revenue: 9.11, gm: 56.5 }
    ],
    baseline: 54.5,
    targetVal: 55.2,
    mean: "55.3%",
    stdDev: "0.8%",
    median: "55.5%",
    min: "54.0%",
    max: "56.5%"
  },
  "transmitter": {
    name: "Transmitter",
    revenue: "₹7.47L",
    actual: "54.9%",
    target: "54.4%",
    delta: "+0.5",
    deltaVal: 0.5,
    history: [
      { quarter: "Q4 FY 24", revenue: 6.8, gm: 53.5 },
      { quarter: "Q1 FY 25", revenue: 6.5, gm: 54.0 },
      { quarter: "Q2 FY 25", revenue: 7.2, gm: 54.2 },
      { quarter: "Q3 FY 25", revenue: 6.9, gm: 54.3 },
      { quarter: "Q4 FY 25", revenue: 7.5, gm: 54.5 },
      { quarter: "Q1 FY 26", revenue: 7.0, gm: 54.6 },
      { quarter: "Q2 FY 26", revenue: 7.3, gm: 54.7 },
      { quarter: "Q3 FY 26", revenue: 7.2, gm: 54.8 },
      { quarter: "Q4 FY 26", revenue: 7.47, gm: 54.9 }
    ],
    baseline: 54.0,
    targetVal: 54.4,
    mean: "54.3%",
    stdDev: "0.4%",
    median: "54.5%",
    min: "53.5%",
    max: "54.9%"
  },
  "rg / cg / pg": {
    name: "RG / CG / PG",
    revenue: "₹7.21L",
    actual: "63.9%",
    target: "63.0%",
    delta: "+0.9",
    deltaVal: 0.9,
    history: [
      { quarter: "Q4 FY 24", revenue: 6.5, gm: 62.1 },
      { quarter: "Q1 FY 25", revenue: 6.2, gm: 62.5 },
      { quarter: "Q2 FY 25", revenue: 7.0, gm: 62.8 },
      { quarter: "Q3 FY 25", revenue: 6.6, gm: 63.0 },
      { quarter: "Q4 FY 25", revenue: 7.3, gm: 63.2 },
      { quarter: "Q1 FY 26", revenue: 6.8, gm: 63.4 },
      { quarter: "Q2 FY 26", revenue: 7.1, gm: 63.6 },
      { quarter: "Q3 FY 26", revenue: 7.0, gm: 63.7 },
      { quarter: "Q4 FY 26", revenue: 7.21, gm: 63.9 }
    ],
    baseline: 62.8,
    targetVal: 63.0,
    mean: "63.0%",
    stdDev: "0.6%",
    median: "63.2%",
    min: "62.1%",
    max: "63.9%"
  },
  "level gauge 1": {
    name: "Level Gauge 1",
    revenue: "₹10.45L",
    actual: "53.9%",
    target: "51.7%",
    delta: "+2.2",
    deltaVal: 2.2,
    history: [
      { quarter: "Q4 FY 24", revenue: 9.5, gm: 50.1 },
      { quarter: "Q1 FY 25", revenue: 9.1, gm: 50.8 },
      { quarter: "Q2 FY 25", revenue: 10.2, gm: 51.2 },
      { quarter: "Q3 FY 25", revenue: 9.7, gm: 51.5 },
      { quarter: "Q4 FY 25", revenue: 10.8, gm: 52.0 },
      { quarter: "Q1 FY 26", revenue: 9.9, gm: 52.4 },
      { quarter: "Q2 FY 26", revenue: 10.3, gm: 52.8 },
      { quarter: "Q3 FY 26", revenue: 10.1, gm: 53.2 },
      { quarter: "Q4 FY 26", revenue: 10.45, gm: 53.9 }
    ],
    baseline: 51.2,
    targetVal: 51.7,
    mean: "51.8%",
    stdDev: "1.2%",
    median: "52.0%",
    min: "50.1%",
    max: "53.9%"
  }
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
      <div className="flex items-center justify-center min-h-[400px] w-full bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#a61c1e]"></div>
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
    "Above +3% vs PMA": "bg-emerald-600 hover:bg-emerald-500 text-white",
    "Within ±3% vs PMA": "bg-amber-600 hover:bg-amber-500 text-white",
    "Below -3% vs PMA": "bg-rose-600 hover:bg-rose-500 text-white",
  };

  const activeQuarter = selectedQuarter || sortedQuarters[sortedQuarters.length - 1] || "";
  const rawFamilies = skyscraperQuery.data?.[activeQuarter] || [];
  const familyLookup = new Map<string, any>();
  rawFamilies.forEach((fam: any) => {
    familyLookup.set(fam.display_name.toLowerCase(), fam);
    familyLookup.set(fam.family_nk.toLowerCase(), fam);
  });

  const getFamilyMockDetails = (name: string) => {
    const key = name.toLowerCase();
    if (clientFamilyMockData[key]) {
      return clientFamilyMockData[key];
    }
    const stats = familyLookup.get(key);
    const actualVal = stats?.actual_gm_pct || 50.0;
    const targetVal = stats?.target_gm_pct || 50.0;
    const baselineVal = stats?.baseline_gm_pct || 50.0;
    const gap = actualVal - targetVal;
    
    const history = sortedQuarters.map((q) => {
      const familiesInQuarter = skyscraperQuery.data?.[q] || [];
      const fStats = familiesInQuarter.find(
        (f: any) => f.display_name.toLowerCase() === key || f.family_nk.toLowerCase() === key
      );
      return {
        quarter: q,
        revenue: fStats ? fStats.revenue_inr / 100000 : 10.0,
        gm: fStats ? fStats.actual_gm_pct : actualVal,
      };
    });

    const validHistory = history.filter(h => h.gm > 0);
    const actuals = validHistory.map(h => h.gm);
    const mean = actuals.length > 0 ? actuals.reduce((a, b) => a + b, 0) / actuals.length : actualVal;
    const min = actuals.length > 0 ? Math.min(...actuals) : actualVal;
    const max = actuals.length > 0 ? Math.max(...actuals) : actualVal;
    const sorted = [...actuals].sort((a, b) => a - b);
    const median = sorted.length > 0 ? sorted[Math.floor(sorted.length / 2)] : actualVal;
    const std = actuals.length > 1 ? Math.sqrt(actuals.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / (actuals.length - 1)) : 0.0;

    return {
      name,
      revenue: stats ? `₹${(stats.revenue_inr / 100000).toFixed(2)}L` : "₹10.00L",
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
      max: `${max.toFixed(1)}%`
    };
  };

  rows.forEach((rowName) => {
    matrixData[rowName] = {};
    columns.forEach((colName) => {
      const apiRowKey = apiRows[rowName];
      const apiColKey = apiCols[colName];
      const familiesArray = qoqMatrixQuery.data?.matrix?.[apiRowKey]?.[apiColKey] || [];

      const familyData = familiesArray.map((name: string) => {
        return getFamilyMockDetails(name);
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
    setSelectedFamily(null);
  };

  const getRowTotal = (r: string) => {
    let sum = 0;
    columns.forEach((c) => {
      sum += matrixData[r][c].count;
    });
    return sum;
  };

  const activeFamiliesList = selectedQoqCell
    ? matrixData[selectedQoqCell.row]?.[selectedQoqCell.col]?.familyData || []
    : [];

  const selectedDetails = selectedFamily ? getFamilyMockDetails(selectedFamily) : null;

  return (
    <div className="flex flex-col gap-8 text-gray-800 pb-12">
      {/* 1. QoQ Matrix grid Table */}
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

      {/* 2. Product Family Drill-down */}
      {selectedQoqCell ? (
        <>
          <QoqDrilldownTable
            activeFamiliesList={activeFamiliesList}
            selectedFamily={selectedFamily}
            setSelectedFamily={setSelectedFamily}
            activeQuarter={activeQuarter}
          />

          {/* 3. Performance details combo and distribution charts */}
          {selectedFamily && selectedDetails && (
            <QoqPerformanceCharts
              selectedFamily={selectedFamily}
              selectedDetails={selectedDetails}
              sortedQuarters={sortedQuarters}
              onNavigateToSku={onNavigateToSku}
            />
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
            className="px-6 py-2 bg-[#a61c1e] hover:bg-[#8e181a] text-white font-bold rounded-lg text-xs tracking-wide transition-all shadow-md active:scale-95"
          >
            Next —
          </button>
        </div>
      )}
    </div>
  );
};

export default QoqMatrixTab;
