import React from "react";
import { AlertCircle } from "lucide-react";

interface DriverItem {
  name: string;
  mix_contrib_pp?: number;
  margin_contrib_pp?: number;
  abs_mix_contrib?: number;
  abs_margin_contrib?: number;
}

interface GMDecompositionAnalysisProps {
  bridge?: {
    prev_q: string;
    curr_q: string;
    pct: {
      total_change_pp: number;
      mix_effect_pp: number;
      margin_effect_pp: number;
      gm_prev: number;
      gm_curr: number;
      top_mix_pos: DriverItem[];
      top_mix_neg: DriverItem[];
      top_margin_pos: DriverItem[];
      top_margin_neg: DriverItem[];
    };
    abs: {
      total_change_abs: number;
      mix_effect_abs: number;
      margin_effect_abs: number;
      top_mix_pos: DriverItem[];
      top_mix_neg: DriverItem[];
      top_margin_pos: DriverItem[];
      top_margin_neg: DriverItem[];
    };
  } | null;
}

const GMDecompositionAnalysis = ({ bridge }: GMDecompositionAnalysisProps) => {
  const formatAbsoluteInr = (val: number) => {
    const isNegative = val < 0;
    const absVal = Math.abs(val);
    let str = "";
    if (absVal >= 10000000) {
      str = `₹${(absVal / 10000000).toFixed(2)}Cr`;
    } else {
      str = `₹${(absVal / 100000).toFixed(2)}L`;
    }
    return `${isNegative ? "-" : ""}${str}`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-sm font-bold tracking-tight text-gray-800 mb-6 pb-3 border-b border-gray-105 flex items-center gap-2">
        <AlertCircle size={16} className="text-[#a61c1e]" />
        GM% Decomposition Analysis
      </h3>

      {bridge ? (
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <div className={`p-3 rounded-lg text-xs font-bold leading-relaxed border ${
              bridge.pct.total_change_pp >= 0 
                ? "bg-emerald-50 text-emerald-800 border-emerald-100" 
                : "bg-rose-50 text-rose-800 border-rose-100"
            }`}>
              <span className="font-extrabold uppercase">QoQ GM bridge ({bridge.prev_q} → {bridge.curr_q}): % GM bridge</span>
              {" — "}
              <span className="text-gray-700 font-medium">
                GM% {bridge.pct.total_change_pp >= 0 ? "+" : ""}{bridge.pct.total_change_pp.toFixed(1)} pp ({bridge.pct.gm_prev.toFixed(1)}% → {bridge.pct.gm_curr.toFixed(1)}%). Mix {bridge.pct.mix_effect_pp >= 0 ? "+" : ""}{bridge.pct.mix_effect_pp.toFixed(1)} pp + margin {bridge.pct.margin_effect_pp >= 0 ? "+" : ""}{bridge.pct.margin_effect_pp.toFixed(1)} pp = {bridge.pct.total_change_pp >= 0 ? "+" : ""}{bridge.pct.total_change_pp.toFixed(1)} pp (check vs ΔGM%).
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="flex flex-col gap-3">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Mix impact (% GM)</span>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-wide">Positive (Top 3)</span>
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-gray-400 font-bold uppercase text-[8px] border-b border-gray-150">
                          <th className="py-1.5 px-2">Family</th>
                          <th className="py-1.5 px-2 text-right">Impact</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-medium text-gray-750">
                        {bridge.pct.top_mix_pos?.map((item: any, i: number) => (
                          <tr key={i}>
                            <td className="py-2 px-2 truncate max-w-[120px]" title={item.name}>{i + 1}. {item.name}</td>
                            <td className="py-2 px-2 text-right text-emerald-600 font-bold">+{item.mix_contrib_pp?.toFixed(1)} pp</td>
                          </tr>
                        ))}
                        {(!bridge.pct.top_mix_pos || bridge.pct.top_mix_pos.length === 0) && (
                          <tr>
                            <td colSpan={2} className="py-2 px-2 text-gray-400 italic text-center">No drivers</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] text-rose-600 font-bold uppercase tracking-wide">Negative (Top 3)</span>
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-gray-400 font-bold uppercase text-[8px] border-b border-gray-150">
                          <th className="py-1.5 px-2">Family</th>
                          <th className="py-1.5 px-2 text-right">Impact</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-medium text-gray-750">
                        {bridge.pct.top_mix_neg?.map((item: any, i: number) => (
                          <tr key={i}>
                            <td className="py-2 px-2 truncate max-w-[120px]" title={item.name}>{i + 1}. {item.name}</td>
                            <td className="py-2 px-2 text-right text-rose-600 font-bold">{item.mix_contrib_pp?.toFixed(1)} pp</td>
                          </tr>
                        ))}
                        {(!bridge.pct.top_mix_neg || bridge.pct.top_mix_neg.length === 0) && (
                          <tr>
                            <td colSpan={2} className="py-2 px-2 text-gray-400 italic text-center">No drivers</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Margin impact (% GM)</span>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-wide">Positive (Top 3)</span>
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-gray-400 font-bold uppercase text-[8px] border-b border-gray-150">
                          <th className="py-1.5 px-2">Family</th>
                          <th className="py-1.5 px-2 text-right">Impact</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-medium text-gray-750">
                        {bridge.pct.top_margin_pos?.map((item: any, i: number) => (
                          <tr key={i}>
                            <td className="py-2 px-2 truncate max-w-[120px]" title={item.name}>{i + 1}. {item.name}</td>
                            <td className="py-2 px-2 text-right text-emerald-600 font-bold">+{item.margin_contrib_pp?.toFixed(1)} pp</td>
                          </tr>
                        ))}
                        {(!bridge.pct.top_margin_pos || bridge.pct.top_margin_pos.length === 0) && (
                          <tr>
                            <td colSpan={2} className="py-2 px-2 text-gray-400 italic text-center">No drivers</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] text-rose-600 font-bold uppercase tracking-wide">Negative (Top 3)</span>
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-gray-400 font-bold uppercase text-[8px] border-b border-gray-150">
                          <th className="py-1.5 px-2">Family</th>
                          <th className="py-1.5 px-2 text-right">Impact</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-medium text-gray-750">
                        {bridge.pct.top_margin_neg?.map((item: any, i: number) => (
                          <tr key={i}>
                            <td className="py-2 px-2 truncate max-w-[120px]" title={item.name}>{i + 1}. {item.name}</td>
                            <td className="py-2 px-2 text-right text-rose-600 font-bold">{item.margin_contrib_pp?.toFixed(1)} pp</td>
                          </tr>
                        ))}
                        {(!bridge.pct.top_margin_neg || bridge.pct.top_margin_neg.length === 0) && (
                          <tr>
                            <td colSpan={2} className="py-2 px-2 text-gray-400 italic text-center">No drivers</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Absolute section */}
          <div className="flex flex-col gap-4">
            <div className={`p-3 rounded-lg text-xs font-bold leading-relaxed border ${
              bridge.abs.total_change_abs >= 0 
                ? "bg-[#e6f4f1] text-[#0d9488] border-[#ccfbf1]" 
                : "bg-rose-50 text-rose-800 border-rose-100"
            }`}>
              <span className="font-extrabold uppercase">Absolute GM bridge ({bridge.prev_q} → {bridge.curr_q})</span>
              {" — "}
              <span className="text-gray-700 font-medium">
                Total change {bridge.abs.total_change_abs >= 0 ? "+" : ""}{formatAbsoluteInr(bridge.abs.total_change_abs)}. Mix {bridge.abs.mix_effect_abs >= 0 ? "+" : ""}{formatAbsoluteInr(bridge.abs.mix_effect_abs)} + margin {bridge.abs.margin_effect_abs >= 0 ? "+" : ""}{formatAbsoluteInr(bridge.abs.margin_effect_abs)} = {bridge.abs.total_change_abs >= 0 ? "+" : ""}{formatAbsoluteInr(bridge.abs.total_change_abs)}.
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="flex flex-col gap-3">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Mix impact (absolute ₹)</span>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-wide">Positive (Top 3)</span>
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-gray-400 font-bold uppercase text-[8px] border-b border-gray-150">
                          <th className="py-1.5 px-2">Family</th>
                          <th className="py-1.5 px-2 text-right">Impact (INR)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-medium text-gray-750">
                        {bridge.abs.top_mix_pos?.map((item: any, i: number) => (
                          <tr key={i}>
                            <td className="py-2 px-2 truncate max-w-[120px]" title={item.name}>{i + 1}. {item.name}</td>
                            <td className="py-2 px-2 text-right text-emerald-600 font-bold">+{formatAbsoluteInr(item.abs_mix_contrib)}</td>
                          </tr>
                        ))}
                        {(!bridge.abs.top_mix_pos || bridge.abs.top_mix_pos.length === 0) && (
                          <tr>
                            <td colSpan={2} className="py-2 px-2 text-gray-400 italic text-center">No drivers</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] text-rose-600 font-bold uppercase tracking-wide">Negative (Top 3)</span>
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-gray-400 font-bold uppercase text-[8px] border-b border-gray-150">
                          <th className="py-1.5 px-2">Family</th>
                          <th className="py-1.5 px-2 text-right">Impact (INR)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-medium text-gray-750">
                        {bridge.abs.top_mix_neg?.map((item: any, i: number) => (
                          <tr key={i}>
                            <td className="py-2 px-2 truncate max-w-[120px]" title={item.name}>{i + 1}. {item.name}</td>
                            <td className="py-2 px-2 text-right text-rose-600 font-bold">{formatAbsoluteInr(item.abs_mix_contrib)}</td>
                          </tr>
                        ))}
                        {(!bridge.abs.top_mix_neg || bridge.abs.top_mix_neg.length === 0) && (
                          <tr>
                            <td colSpan={2} className="py-2 px-2 text-gray-400 italic text-center">No drivers</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Margin impact (absolute ₹)</span>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-wide">Positive (Top 3)</span>
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-gray-400 font-bold uppercase text-[8px] border-b border-gray-150">
                          <th className="py-1.5 px-2">Family</th>
                          <th className="py-1.5 px-2 text-right">Impact (INR)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-medium text-gray-750">
                        {bridge.abs.top_margin_pos?.map((item: any, i: number) => (
                          <tr key={i}>
                            <td className="py-2 px-2 truncate max-w-[120px]" title={item.name}>{i + 1}. {item.name}</td>
                            <td className="py-2 px-2 text-right text-emerald-600 font-bold">+{formatAbsoluteInr(item.abs_margin_contrib)}</td>
                          </tr>
                        ))}
                        {(!bridge.abs.top_margin_pos || bridge.abs.top_margin_pos.length === 0) && (
                          <tr>
                            <td colSpan={2} className="py-2 px-2 text-gray-400 italic text-center">No drivers</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] text-rose-600 font-bold uppercase tracking-wide">Negative (Top 3)</span>
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-gray-400 font-bold uppercase text-[8px] border-b border-gray-150">
                          <th className="py-1.5 px-2">Family</th>
                          <th className="py-1.5 px-2 text-right">Impact (INR)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-medium text-gray-750">
                        {bridge.abs.top_margin_neg?.map((item: any, i: number) => (
                          <tr key={i}>
                            <td className="py-2 px-2 truncate max-w-[120px]" title={item.name}>{i + 1}. {item.name}</td>
                            <td className="py-2 px-2 text-right text-rose-600 font-bold">{formatAbsoluteInr(item.abs_margin_contrib)}</td>
                          </tr>
                        ))}
                        {(!bridge.abs.top_margin_neg || bridge.abs.top_margin_neg.length === 0) && (
                          <tr>
                            <td colSpan={2} className="py-2 px-2 text-gray-400 italic text-center">No drivers</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-dashed border-gray-300 p-6 text-center text-xs text-gray-500 rounded-lg">
          GM% decomposition data requires at least two quarters of transaction data.
        </div>
      )}
    </div>
  );
};

export default GMDecompositionAnalysis;
