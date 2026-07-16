import React from "react";
import { AlertCircle } from "lucide-react";
import CustomSelect from "../CustomSelect";
import { type QoqMatrixData } from "../../services/query/query";

interface QoqMatrixTableProps {
  matrixData: QoqMatrixData;
  activeQuarter: string;
  sortedQuarters: string[];
  selectedQuarter: string;
  setSelectedQuarter: (q: string) => void;
  selectedQoqCell: any;
  handleCellClick: (row: string, col: string) => void;
  getRowTotal: (row: string) => number;
}

const QoqMatrixTable: React.FC<QoqMatrixTableProps> = ({
  matrixData,
  activeQuarter,
  sortedQuarters,
  selectedQuarter,
  setSelectedQuarter,
  selectedQoqCell,
  handleCellClick,
  getRowTotal,
}) => {
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

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-6">
        <div>
          <h3 className="text-sm font-bold tracking-tight text-gray-800">
            QoQ matrix — margin vs PMA × revenue momentum
          </h3>
          <p className="text-[11px] text-gray-400 font-semibold uppercase mt-0.5">
            Revenue trend vs GM vs PMA matrix.
          </p>
        </div>
        {sortedQuarters.length > 0 && (
          <CustomSelect
            options={sortedQuarters}
            value={activeQuarter}
            onChange={setSelectedQuarter}
            labelPrefix="Quarter: "
            alignRight
          />
        )}
      </div>

      <div className="flex items-center gap-3 bg-[#a61c1e]/5 border border-[#a61c1e]/20 text-gray-700 p-4 rounded-xl mb-6 text-xs font-semibold">
        <AlertCircle className="text-[#a61c1e] shrink-0" size={16} />
        <p>Click any number in the matrix below to see which product families sit in that cell.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-center text-xs border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-gray-400 font-extrabold uppercase text-[8px] tracking-wider text-center">
              <th className="py-2 px-3 text-left"></th>
              <th className="py-2 px-3 border-l border-gray-200" colSpan={5}>Revenue Trend (Product families — {activeQuarter})</th>
              <th></th>
            </tr>
            <tr className="border-b border-gray-200 bg-gray-50 text-gray-700 font-bold uppercase text-[9px] tracking-wider">
              <th className="py-3 px-4 w-52 text-left">GM vs PMA \ Revenue vs PY</th>
              {columns.map((colName) => (
                <th key={colName} className="py-3 px-3 text-center border-l border-gray-200 w-36 font-semibold leading-snug">
                  {colName}
                </th>
              ))}
              <th className="py-3 px-4 text-center border-l border-gray-200 bg-gray-100/50 w-24">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-center font-semibold">
            {rows.map((rowName) => {
              const total = getRowTotal(rowName);
              return (
                <tr key={rowName} className="hover:bg-slate-50/40">
                  <td className="py-4 px-4 font-bold text-gray-800 text-left bg-gray-50/20 border-r border-gray-200">
                    {rowName}
                  </td>

                  {columns.map((colName) => {
                    const item = matrixData[rowName]?.[colName] || { count: 0, color: "bg-slate-100 text-slate-400" };
                    const isSelected = selectedQoqCell?.row === rowName && selectedQoqCell?.col === colName;
                    return (
                      <td key={colName} className="py-4 px-3 border-r border-gray-200">
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
  );
};

export default QoqMatrixTable;
