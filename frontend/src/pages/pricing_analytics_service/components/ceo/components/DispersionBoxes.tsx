import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

const DispersionBoxes = () => {
  const quarters = [
    {
      title: "Q1 FY 25",
      subtitle: "Current dispersion lower than baseline",
      familiesPct: "46%",
      revPct: "45%",
      footer: "22 of 71 families",
      isFamUp: false,
      isRevUp: false,
    },
    {
      title: "Q2 FY 25",
      subtitle: "Current dispersion lower than baseline",
      familiesPct: "35%",
      revPct: "55%",
      footer: "26 of 74 families",
      isFamUp: false,
      isRevUp: true,
    },
    {
      title: "Q3 FY 25",
      subtitle: "Current dispersion lower than baseline",
      familiesPct: "41%",
      revPct: "33%",
      footer: "31 of 75 families",
      isFamUp: true,
      isRevUp: false,
    },
    {
      title: "Q4 FY 25",
      subtitle: "Current dispersion lower than baseline",
      familiesPct: "37%",
      revPct: "24%",
      footer: "26 of 71 families",
      isFamUp: false,
      isRevUp: false,
    },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-bold text-gray-900">QoQ movement in dispersion at family level</h2>
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-md">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Quarter</span>
          <select className="bg-transparent text-xs font-semibold text-gray-700 outline-none border-none cursor-pointer">
            <option>Q4 FY 25</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {quarters.map((q, idx) => (
          <div key={idx} className="bg-gray-50 border border-gray-200 p-4 rounded-xl flex flex-col justify-between shadow-xs">
            <div>
              <h4 className="text-xs font-bold text-gray-900 mb-1">{q.title}</h4>
              <p className="text-[10px] text-gray-400 font-semibold mb-3">{q.subtitle}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 font-medium">% product families</span>
                  <span className="flex items-center gap-1 font-bold text-gray-900">
                    {q.familiesPct}
                    {q.isFamUp ? (
                      <ArrowUpRight size={14} className="text-emerald-600" />
                    ) : (
                      <ArrowDownRight size={14} className="text-rose-600" />
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 font-medium">% revenue share</span>
                  <span className="flex items-center gap-1 font-bold text-gray-900">
                    {q.revPct}
                    {q.isRevUp ? (
                      <ArrowUpRight size={14} className="text-emerald-600" />
                    ) : (
                      <ArrowDownRight size={14} className="text-rose-600" />
                    )}
                  </span>
                </div>
              </div>
            </div>
            <span className="text-[10px] text-gray-400 font-bold uppercase border-t border-gray-200 pt-2 block">
              {q.footer}
            </span>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-gray-400 mt-4 text-center">
        Families with line-level GM% σ below baseline (pooled Q4 FY 24 + Q1 FY 25). Showing 4 quarters ending Q4 FY 25.
      </p>
    </div>
  );
};

export default DispersionBoxes;
