import React from "react";

interface HeatmapData {
  quarter: string;
  stats: { text: string; color: string }[];
  grid: { val: string; pct: string; intensity: "none" | "low" | "mid" | "high"; type: "green" | "red" | "neutral" }[][];
}

const HeatingMarginsGrid = () => {
  const quartersData: HeatmapData[] = [
    {
      quarter: "Q1 FY 26",
      stats: [
        { text: "● R: 24/70 (31%)", color: "text-rose-600" },
        { text: "● A: 38/70 (48%)", color: "text-emerald-600" },
      ],
      grid: [
        [
          { val: "10", pct: "11%", intensity: "mid", type: "red" },
          { val: "13", pct: "15%", intensity: "low", type: "neutral" },
          { val: "15", pct: "21%", intensity: "high", type: "green" },
        ],
        [
          { val: "14", pct: "11%", intensity: "low", type: "neutral" },
          { val: "10", pct: "15%", intensity: "mid", type: "green" },
          { val: "3", pct: "2%", intensity: "mid", type: "neutral" },
        ],
        [
          { val: "7", pct: "12%", intensity: "mid", type: "green" },
          { val: "0", pct: "0%", intensity: "none", type: "neutral" },
          { val: "2", pct: "2%", intensity: "mid", type: "green" },
        ],
      ],
    },
    {
      quarter: "Q2 FY 26",
      stats: [
        { text: "● R: 24/70 (31%)", color: "text-rose-600" },
        { text: "● A: 38/70 (48%)", color: "text-emerald-600" },
      ],
      grid: [
        [
          { val: "10", pct: "20%", intensity: "high", type: "red" },
          { val: "15", pct: "25%", intensity: "mid", type: "green" },
          { val: "12", pct: "9%", intensity: "low", type: "green" },
        ],
        [
          { val: "14", pct: "20%", intensity: "low", type: "neutral" },
          { val: "10", pct: "11%", intensity: "mid", type: "green" },
          { val: "4", pct: "6%", intensity: "low", type: "neutral" },
        ],
        [
          { val: "7", pct: "12%", intensity: "mid", type: "green" },
          { val: "0", pct: "0%", intensity: "none", type: "neutral" },
          { val: "2", pct: "2%", intensity: "mid", type: "green" },
        ],
      ],
    },
    {
      quarter: "Q3 FY 26",
      stats: [
        { text: "● R: 23/70 (31%)", color: "text-rose-600" },
        { text: "● A: 40/70 (52%)", color: "text-emerald-600" },
      ],
      grid: [
        [
          { val: "11", pct: "11%", intensity: "low", type: "neutral" },
          { val: "13", pct: "27%", intensity: "mid", type: "green" },
          { val: "14", pct: "14%", intensity: "high", type: "green" },
        ],
        [
          { val: "8", pct: "27%", intensity: "mid", type: "green" },
          { val: "12", pct: "12%", intensity: "low", type: "green" },
          { val: "4", pct: "4%", intensity: "low", type: "neutral" },
        ],
        [
          { val: "8", pct: "4%", intensity: "low", type: "neutral" },
          { val: "2", pct: "9%", intensity: "low", type: "green" },
          { val: "0", pct: "0%", intensity: "none", type: "neutral" },
        ],
      ],
    },
    {
      quarter: "Q4 FY 26",
      stats: [
        { text: "● R: 18/70 (25%)", color: "text-rose-600" },
        { text: "● A: 48/70 (68%)", color: "text-emerald-600" },
      ],
      grid: [
        [
          { val: "5", pct: "5%", intensity: "low", type: "red" },
          { val: "10", pct: "25%", intensity: "mid", type: "green" },
          { val: "23", pct: "38%", intensity: "high", type: "green" },
        ],
        [
          { val: "11", pct: "11%", intensity: "mid", type: "green" },
          { val: "12", pct: "22%", intensity: "high", type: "green" },
          { val: "4", pct: "4%", intensity: "low", type: "green" },
        ],
        [
          { val: "8", pct: "8%", intensity: "mid", type: "green" },
          { val: "3", pct: "9%", intensity: "mid", type: "green" },
          { val: "0", pct: "0%", intensity: "none", type: "neutral" },
        ],
      ],
    },
  ];

  const getCellBg = (cell: typeof quartersData[0]["grid"][0][0]) => {
    if (cell.type === "red") {
      if (cell.intensity === "high") return "bg-red-200 border-red-300 text-red-900";
      if (cell.intensity === "mid") return "bg-red-100 border-red-200 text-red-800";
      return "bg-red-50/70 border-red-100 text-red-700";
    }
    if (cell.type === "green") {
      if (cell.intensity === "high") return "bg-emerald-200 border-emerald-300 text-emerald-900";
      if (cell.intensity === "mid") return "bg-emerald-100 border-emerald-250 text-emerald-800";
      return "bg-emerald-50/70 border-emerald-200 text-emerald-700";
    }
    return "bg-gray-50 border-gray-200 text-gray-400";
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold tracking-wider text-gray-500 uppercase">
            Heating Margins: QoQ view
          </h3>
          <p className="text-[10px] text-gray-400 mt-1">
            Heating Spares — PMA target vs baseline by product family
          </p>
        </div>
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1 rounded-md">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Window</span>
          <select className="bg-transparent text-xs font-semibold text-gray-700 outline-none border-none cursor-pointer">
            <option>Q4 FY 26</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quartersData.map((q, idx) => (
          <div key={idx} className="bg-white border border-gray-200 p-4 rounded-xl flex flex-col items-center shadow-xs">
            {/* Quarter Header */}
            <h4 className="text-xs font-bold text-gray-800 mb-1">{q.quarter}</h4>
            <div className="flex gap-3 mb-4">
              {q.stats.map((st, sIdx) => (
                <span key={sIdx} className={`text-[9px] font-bold ${st.color}`}>
                  {st.text}
                </span>
              ))}
            </div>

            {/* Custom 3x3 Heatmap Grid */}
            <div className="relative w-full aspect-square max-w-[220px]">
              {/* Y Axis Label (Left) */}
              <div className="absolute left-[-24px] top-1/2 -translate-y-1/2 -rotate-90 text-[8px] font-bold text-gray-400 tracking-wider uppercase whitespace-nowrap">
                Target vs Baseline
              </div>

              {/* Grid Wrapper */}
              <div className="grid grid-cols-3 grid-rows-3 gap-1.5 w-full h-full border border-dashed border-gray-300 p-1.5 rounded-lg bg-gray-50/30">
                {q.grid.map((row, rowIdx) =>
                  row.map((cell, cellIdx) => (
                    <div
                      key={`${rowIdx}-${cellIdx}`}
                      className={`flex flex-col items-center justify-center border border-dashed rounded p-1 leading-none ${getCellBg(
                        cell
                      )}`}
                    >
                      <span className="text-sm font-bold">{cell.val}</span>
                      {cell.val !== "0" && (
                        <span className="text-[9px] font-semibold opacity-85 mt-1">{cell.pct}</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* X Axis Label */}
            <span className="text-[8px] font-bold text-gray-400 tracking-wider uppercase mt-3">
              Baseline / Target
            </span>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-gray-400 mt-4 text-center leading-normal">
        Showing 4 quarters ending Q4 FY 26. Cell top-left = # families; bottom-right = % revenue share. Baseline from Heating_baseline.csv; PMA target from Heating_Targets.csv.
      </p>
    </div>
  );
};

export default HeatingMarginsGrid;
