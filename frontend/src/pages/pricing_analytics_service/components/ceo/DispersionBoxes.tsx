import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import CustomSelect from "../CustomSelect";

interface DispersionBoxesProps {
  qoqCards: Array<{
    quarter: string;
    desc?: string;
    families?: string;
    revShare?: string;
    activeCount?: string;
    families_valid?: number;
    families_lower?: number;
    pct_families?: number;
    pct_revenue?: number;
    families_count_in_qtr?: number;
  }>;
  selectedQuarter: string;
  setSelectedQuarter: (val: string) => void;
  quarters: string[];
  isFetching?: boolean;
}

const DispersionBoxes = ({
  qoqCards,
  selectedQuarter,
  setSelectedQuarter,
  quarters,
  isFetching,
}: DispersionBoxesProps) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm relative text-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-900">QoQ movement in dispersion at family level</h2>
        <CustomSelect
          options={quarters}
          value={selectedQuarter}
          onChange={setSelectedQuarter}
          labelPrefix="Quarter: "
          alignRight
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {qoqCards.map((q, idx) => {
          const familiesVal = q.families || (q.pct_families ? `${q.pct_families}%` : "0%");
          const revShareVal = q.revShare || (q.pct_revenue ? `${q.pct_revenue}%` : "0%");
          const footerVal = q.activeCount || `${q.families_lower || 0} of ${q.families_valid || 0} families`;

          const isFamUp = idx % 2 === 0;
          const isRevUp = idx % 2 !== 0;

          return (
            <div key={idx} className="bg-gray-50 border border-gray-200 p-4 rounded-xl flex flex-col justify-between shadow-xs hover:border-red-200 transition-colors">
              <div>
                <h4 className="text-xs font-bold text-gray-900 mb-1">{q.quarter}</h4>
                <p className="text-[10px] text-gray-400 font-semibold mb-3">
                  {q.desc || "Current dispersion lower than baseline"}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">% product families</span>
                    <span className={`flex items-center gap-1 font-bold ${isFamUp ? "text-emerald-600" : "text-rose-600"}`}>
                      {familiesVal}
                      {isFamUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">% revenue share</span>
                    <span className={`flex items-center gap-1 font-bold ${isRevUp ? "text-emerald-600" : "text-rose-600"}`}>
                      {revShareVal}
                      {isRevUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    </span>
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-gray-400 font-bold uppercase border-t border-gray-200 pt-2 block">
                {footerVal}
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-gray-400 mt-4 text-center">
        Families with line-level GM% σ below baseline (pooled Q4 FY 24 + Q1 FY 25). Showing 4 quarters ending {selectedQuarter}.
      </p>
    </div>
  );
};

export default DispersionBoxes;
