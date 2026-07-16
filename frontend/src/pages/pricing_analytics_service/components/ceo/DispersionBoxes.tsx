import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import CustomSelect from "../CustomSelect";

interface DispersionBoxesProps {
  qoqCards: Array<{
    quarter: string;
    families_valid: number;
    families_lower: number;
    pct_families: number;
    pct_revenue: number;
    families_count_in_qtr: number;
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
  const activeIdx = qoqCards.findIndex((card) => card.quarter === selectedQuarter);
  const windowQuarters = activeIdx !== -1
    ? qoqCards.slice(Math.max(0, activeIdx - 3), activeIdx + 1)
    : qoqCards.slice(-4);

  const mappedCards = windowQuarters.map((q) => {
    const origIdx = qoqCards.findIndex((card) => card.quarter === q.quarter);
    const prevCard = origIdx > 0 ? qoqCards[origIdx - 1] : null;

    const isFamUp = prevCard ? q.pct_families > prevCard.pct_families : false;
    const isRevUp = prevCard ? q.pct_revenue > prevCard.pct_revenue : false;

    return {
      title: q.quarter,
      subtitle: `Total families: ${q.families_count_in_qtr}`,
      familiesPct: `${q.pct_families}%`,
      revPct: `${q.pct_revenue}%`,
      footer: `${q.families_lower} of ${q.families_valid} families`,
      isFamUp,
      isRevUp,
    };
  });

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm relative">
      {isFetching && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center z-10 transition-all rounded-xl">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-700"></div>
        </div>
      )}
      <div className="flex items-center justify-between mb-6">
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
        {mappedCards.map((q, idx) => (
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
        Families with line-level GM% σ below baseline (pooled Q4 FY 24 + Q1 FY 25). Showing up to 4 quarters ending {selectedQuarter}.
      </p>
    </div>
  );
};

export default DispersionBoxes;
