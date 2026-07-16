import React, { useState, useEffect } from "react";
import CustomSelect from "../CustomSelect";

interface HeatmapData {
  quarter: string;
  stats: { text: string; color: string }[];
  grid: { val: string; pct: string; intensity: "none" | "low" | "mid" | "high"; type: "green" | "red" | "neutral" }[][];
}

type Props = {
  data?: any[];
};

const HeatingMarginsGrid = ({ data }: Props) => {
  const [selectedQuarter, setSelectedQuarter] = useState<string>("");

  const sortQuarters = (a: string, b: string) => {
    const matchA = a.match(/Q(\d) /);
    const matchB = b.match(/Q(\d) /);
    const yearA = a.match(/FY (\d+)/);
    const yearB = b.match(/FY (\d+)/);
    if (!matchA || !matchB || !yearA || !yearB) return 0;
    const qA = parseInt(matchA[1], 10);
    const yA = parseInt(yearA[1], 10);
    const qB = parseInt(matchB[1], 10);
    const yB = parseInt(yearB[1], 10);
    if (yA !== yB) return yA - yB;
    return qA - qB;
  };

  const getGridColsClass = (numItems: number) => {
    if (numItems === 1) return "grid-cols-1 max-w-sm mx-auto";
    if (numItems === 2) return "grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto";
    if (numItems === 3) return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto";
    return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
  };

  const sortedQuarters = (data || [])
    .map((m: any) => m.quarter)
    .sort(sortQuarters);

  useEffect(() => {
    if (sortedQuarters.length > 0 && !selectedQuarter) {
      setSelectedQuarter(sortedQuarters[sortedQuarters.length - 1]);
    }
  }, [sortedQuarters, selectedQuarter]);

  if (!data || data.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-700"></div>
      </div>
    );
  }

  const activeQuarter = selectedQuarter || sortedQuarters[sortedQuarters.length - 1] || "";
  const selectedIdx = sortedQuarters.indexOf(activeQuarter);

  // Take last 4 quarters ending at selected index
  const displayedQuartersList = sortedQuarters.slice(
    Math.max(0, selectedIdx - 3),
    selectedIdx + 1
  );

  const quartersData: HeatmapData[] = displayedQuartersList.map((qtr) => {
    const matrix = data.find((m: any) => m.quarter === qtr);
    if (!matrix) {
      return { quarter: qtr, stats: [], grid: [] };
    }

    const totalRev = matrix.total_rev;
    const totalFamilies = matrix.total_families;

    const stats = [
      {
        text: `● B: ${matrix.group_b.count}/${totalFamilies} (${matrix.group_b.rev_pct}%)`,
        color: "text-rose-600"
      },
      {
        text: `● A: ${matrix.group_a.count}/${totalFamilies} (${matrix.group_a.rev_pct}%)`,
        color: "text-emerald-600"
      }
    ];

    const grid = matrix.cells.map((row: any[], y: number) =>
      row.map((cell: any, x: number) => {
        const val = String(cell.count);
        const share = totalRev > 0 ? (cell.rev / totalRev) * 100 : 0;
        const pct = `${Math.round(share)}%`;

        let type: "green" | "red" | "neutral" = "neutral";
        if (cell.count > 0) {
          if (x === 0 && (y === 0 || y === 1)) {
            type = "red";
          } else if (y === 0 && x === 1) {
            type = "neutral";
          } else {
            type = "green";
          }
        }

        let intensity: "none" | "low" | "mid" | "high" = "none";
        if (cell.count > 0) {
          if (share >= 15) intensity = "high";
          else if (share >= 5) intensity = "mid";
          else intensity = "low";
        }

        return { val, pct, intensity, type };
      })
    );

    return { quarter: qtr, stats, grid };
  });

  const getCellBg = (cell: HeatmapData["grid"][0][0]) => {
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
        {sortedQuarters.length > 0 && (
          <CustomSelect
            options={sortedQuarters}
            value={activeQuarter}
            onChange={setSelectedQuarter}
            labelPrefix="Window: "
            alignRight
          />
        )}
      </div>

      <div className={`grid gap-6 ${getGridColsClass(quartersData.length)}`}>
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

            <div className="flex items-center gap-1 w-full max-w-[280px]">
              <div className="text-[9px] font-bold text-gray-500 tracking-wider whitespace-nowrap [writing-mode:vertical-lr] rotate-180 select-none">
                Target vs baseline
              </div>

              <div className="flex flex-col w-full">
                <div className="text-[10px] font-bold text-gray-600 text-center mb-1">
                  Δ Achieved gross margin (vs Baseline)
                </div>

                <div className="flex">
                  <div className="flex flex-col justify-around text-[9px] font-bold text-gray-500 pr-1 text-right w-12 py-3">
                    <span>&gt; 5%</span>
                    <span>0% to 5%</span>
                    <span>&lt; 0%</span>
                  </div>

                  <div className="flex-1 flex flex-col">
                    <div className="grid grid-cols-3 gap-1 mb-1 text-center text-[9px] font-bold text-gray-500">
                      <span>&lt; 0%</span>
                      <span>0% to 5%</span>
                      <span>&gt; 5%</span>
                    </div>

                    <div className="grid grid-cols-3 grid-rows-3 gap-1.5 aspect-square w-full border border-dashed border-gray-300 p-1.5 rounded-lg bg-gray-50/30">
                      {q.grid.map((row, rowIdx) =>
                        row.map((cell, cellIdx) => (
                          <div
                            key={`${rowIdx}-${cellIdx}`}
                            className={`relative border border-dashed rounded leading-none w-full h-full ${getCellBg(
                              cell
                            )}`}
                          >
                            <span className="absolute top-1 left-1.5 text-sm font-bold">{cell.val}</span>
                            {cell.val !== "0" && (
                              <span className="absolute bottom-1 right-1.5 text-[9px] font-semibold opacity-85">{cell.pct}</span>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-gray-400 mt-4 text-center leading-normal">
        Showing up to 4 quarters ending {activeQuarter}. Cell top-left = # families; bottom-right = % revenue share. Baseline from Heating_baseline.csv; PMA target from Heating_Targets.csv.
      </p>
    </div>
  );
};

export default HeatingMarginsGrid;
