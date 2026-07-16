import React from "react";
import { AlertCircle } from "lucide-react";

interface FamilyItem {
  nk: string;
  name: string;
  prev_rev: number;
  curr_rev: number;
  prev_gm: number;
  curr_gm: number;
  prev_share_pct: number;
  curr_share_pct: number;
  share_chg_pp: number;
  mix_contrib_pp: number;
  margin_contrib_pp: number;
  net_contrib_pp: number;
  abs_mix_contrib: number;
  abs_margin_contrib: number;
  net_contrib_abs: number;
}

interface BridgeData {
  prev_q: string;
  curr_q: string;
  gm_prev: number;
  gm_curr: number;
  total_change_pp: number;
  mix_effect_pp: number;
  margin_effect_pp: number;
  total_change_abs: number;
  mix_effect_abs: number;
  margin_effect_abs: number;
  prev_total_rev?: number;
  curr_total_rev?: number;
  families?: FamilyItem[];
}

interface GMDecompositionAnalysisProps {
  bridge?: BridgeData | null;
  isLoading?: boolean;
  selectedQuarter?: string;
  quartersList?: string[];
}

const GMDecompositionAnalysis = ({ bridge, isLoading, selectedQuarter, quartersList }: GMDecompositionAnalysisProps) => {
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

  // Derive top drivers from the families array (flat API structure)
  const families = bridge?.families || [];

  const top_mix_pos = [...families]
    .filter(f => f.mix_contrib_pp > 0)
    .sort((a, b) => b.mix_contrib_pp - a.mix_contrib_pp)
    .slice(0, 3);
  const top_mix_neg = [...families]
    .filter(f => f.mix_contrib_pp < 0)
    .sort((a, b) => a.mix_contrib_pp - b.mix_contrib_pp)
    .slice(0, 3);
  const top_margin_pos = [...families]
    .filter(f => f.margin_contrib_pp > 0)
    .sort((a, b) => b.margin_contrib_pp - a.margin_contrib_pp)
    .slice(0, 3);
  const top_margin_neg = [...families]
    .filter(f => f.margin_contrib_pp < 0)
    .sort((a, b) => a.margin_contrib_pp - b.margin_contrib_pp)
    .slice(0, 3);

  const abs_mix_pos = [...families]
    .filter(f => f.abs_mix_contrib > 0)
    .sort((a, b) => b.abs_mix_contrib - a.abs_mix_contrib)
    .slice(0, 3);
  const abs_mix_neg = [...families]
    .filter(f => f.abs_mix_contrib < 0)
    .sort((a, b) => a.abs_mix_contrib - b.abs_mix_contrib)
    .slice(0, 3);
  const abs_margin_pos = [...families]
    .filter(f => f.abs_margin_contrib > 0)
    .sort((a, b) => b.abs_margin_contrib - a.abs_margin_contrib)
    .slice(0, 3);
  const abs_margin_neg = [...families]
    .filter(f => f.abs_margin_contrib < 0)
    .sort((a, b) => a.abs_margin_contrib - b.abs_margin_contrib)
    .slice(0, 3);

  const hasBridge = !!(
    bridge &&
    bridge.prev_q &&
    bridge.curr_q &&
    bridge.total_change_pp !== undefined
  );

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-sm font-bold tracking-tight text-gray-800 mb-6 pb-3 border-b border-gray-105 flex items-center gap-2">
        <AlertCircle size={16} className="text-[#a61c1e]" />
        GM% Decomposition Analysis
      </h3>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-b-2 border-red-700"></div>
        </div>
      ) : hasBridge ? (
        <div className="flex flex-col gap-8">
          {/* % GM Bridge */}
          <div className="flex flex-col gap-4">
            <div className={`p-3 rounded-lg text-xs font-bold leading-relaxed border ${
              bridge!.total_change_pp >= 0
                ? "bg-emerald-50 text-emerald-800 border-emerald-100"
                : "bg-rose-50 text-rose-800 border-rose-100"
            }`}>
              <span className="font-extrabold uppercase">
                QoQ GM bridge ({bridge!.prev_q} → {bridge!.curr_q}): % GM bridge
              </span>
              {" — "}
              <span className="text-gray-700 font-medium">
                GM% {bridge!.total_change_pp >= 0 ? "+" : ""}{bridge!.total_change_pp.toFixed(2)} pp ({bridge!.gm_prev.toFixed(1)}% → {bridge!.gm_curr.toFixed(1)}%).&nbsp;
                Mix {bridge!.mix_effect_pp >= 0 ? "+" : ""}{bridge!.mix_effect_pp.toFixed(2)} pp + margin {bridge!.margin_effect_pp >= 0 ? "+" : ""}{bridge!.margin_effect_pp.toFixed(2)} pp.
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
                        {top_mix_pos.map((item, i) => (
                          <tr key={i}>
                            <td className="py-2 px-2 truncate max-w-[120px]" title={item.name}>{i + 1}. {item.name}</td>
                            <td className="py-2 px-2 text-right text-emerald-600 font-bold">+{item.mix_contrib_pp.toFixed(2)} pp</td>
                          </tr>
                        ))}
                        {top_mix_pos.length === 0 && (
                          <tr><td colSpan={2} className="py-2 px-2 text-gray-400 italic text-center">No drivers</td></tr>
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
                        {top_mix_neg.map((item, i) => (
                          <tr key={i}>
                            <td className="py-2 px-2 truncate max-w-[120px]" title={item.name}>{i + 1}. {item.name}</td>
                            <td className="py-2 px-2 text-right text-rose-600 font-bold">{item.mix_contrib_pp.toFixed(2)} pp</td>
                          </tr>
                        ))}
                        {top_mix_neg.length === 0 && (
                          <tr><td colSpan={2} className="py-2 px-2 text-gray-400 italic text-center">No drivers</td></tr>
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
                        {top_margin_pos.map((item, i) => (
                          <tr key={i}>
                            <td className="py-2 px-2 truncate max-w-[120px]" title={item.name}>{i + 1}. {item.name}</td>
                            <td className="py-2 px-2 text-right text-emerald-600 font-bold">+{item.margin_contrib_pp.toFixed(2)} pp</td>
                          </tr>
                        ))}
                        {top_margin_pos.length === 0 && (
                          <tr><td colSpan={2} className="py-2 px-2 text-gray-400 italic text-center">No drivers</td></tr>
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
                        {top_margin_neg.map((item, i) => (
                          <tr key={i}>
                            <td className="py-2 px-2 truncate max-w-[120px]" title={item.name}>{i + 1}. {item.name}</td>
                            <td className="py-2 px-2 text-right text-rose-600 font-bold">{item.margin_contrib_pp.toFixed(2)} pp</td>
                          </tr>
                        ))}
                        {top_margin_neg.length === 0 && (
                          <tr><td colSpan={2} className="py-2 px-2 text-gray-400 italic text-center">No drivers</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Absolute GM Bridge */}
          <div className="flex flex-col gap-4">
            <div className={`p-3 rounded-lg text-xs font-bold leading-relaxed border ${
              bridge!.total_change_abs >= 0
                ? "bg-[#e6f4f1] text-[#0d9488] border-[#ccfbf1]"
                : "bg-rose-50 text-rose-800 border-rose-100"
            }`}>
              <span className="font-extrabold uppercase">
                Absolute GM bridge ({bridge!.prev_q} → {bridge!.curr_q})
              </span>
              {" — "}
              <span className="text-gray-700 font-medium">
                Total change {bridge!.total_change_abs >= 0 ? "+" : ""}{formatAbsoluteInr(bridge!.total_change_abs)}.&nbsp;
                Mix {bridge!.mix_effect_abs >= 0 ? "+" : ""}{formatAbsoluteInr(bridge!.mix_effect_abs)} + margin {bridge!.margin_effect_abs >= 0 ? "+" : ""}{formatAbsoluteInr(bridge!.margin_effect_abs)}.
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
                        {abs_mix_pos.map((item, i) => (
                          <tr key={i}>
                            <td className="py-2 px-2 truncate max-w-[120px]" title={item.name}>{i + 1}. {item.name}</td>
                            <td className="py-2 px-2 text-right text-emerald-600 font-bold">+{formatAbsoluteInr(item.abs_mix_contrib)}</td>
                          </tr>
                        ))}
                        {abs_mix_pos.length === 0 && (
                          <tr><td colSpan={2} className="py-2 px-2 text-gray-400 italic text-center">No drivers</td></tr>
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
                        {abs_mix_neg.map((item, i) => (
                          <tr key={i}>
                            <td className="py-2 px-2 truncate max-w-[120px]" title={item.name}>{i + 1}. {item.name}</td>
                            <td className="py-2 px-2 text-right text-rose-600 font-bold">{formatAbsoluteInr(item.abs_mix_contrib)}</td>
                          </tr>
                        ))}
                        {abs_mix_neg.length === 0 && (
                          <tr><td colSpan={2} className="py-2 px-2 text-gray-400 italic text-center">No drivers</td></tr>
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
                        {abs_margin_pos.map((item, i) => (
                          <tr key={i}>
                            <td className="py-2 px-2 truncate max-w-[120px]" title={item.name}>{i + 1}. {item.name}</td>
                            <td className="py-2 px-2 text-right text-emerald-600 font-bold">+{formatAbsoluteInr(item.abs_margin_contrib)}</td>
                          </tr>
                        ))}
                        {abs_margin_pos.length === 0 && (
                          <tr><td colSpan={2} className="py-2 px-2 text-gray-400 italic text-center">No drivers</td></tr>
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
                        {abs_margin_neg.map((item, i) => (
                          <tr key={i}>
                            <td className="py-2 px-2 truncate max-w-[120px]" title={item.name}>{i + 1}. {item.name}</td>
                            <td className="py-2 px-2 text-right text-rose-600 font-bold">{formatAbsoluteInr(item.abs_margin_contrib)}</td>
                          </tr>
                        ))}
                        {abs_margin_neg.length === 0 && (
                          <tr><td colSpan={2} className="py-2 px-2 text-gray-400 italic text-center">No drivers</td></tr>
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
          {selectedQuarter && quartersList && quartersList[0] === selectedQuarter
            ? `GM% decomposition analysis is not available for ${selectedQuarter} as it is the first quarter with transaction data.`
            : "GM% decomposition data requires at least two quarters of transaction data."}
        </div>
      )}
    </div>
  );
};

export default GMDecompositionAnalysis;
