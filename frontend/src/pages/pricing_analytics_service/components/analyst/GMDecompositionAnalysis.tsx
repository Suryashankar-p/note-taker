import React from "react";
import { AlertCircle } from "lucide-react";

interface DriverItem {
  product_family: string;
  mix_contrib_pp: number;
  margin_contrib_pp: number;
  mix_contrib_abs_inr: number;
  margin_contrib_abs_inr: number;
  share_change_pp: number;
  prev_gm_pct: number | null;
  curr_gm_pct: number | null;
  prev_share_pct: number;
  curr_share_pct: number;
  field_value: number;
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
  qoq_gm_bridge_narrative?: string;
  absolute_gm_bridge_narrative?: string;

  mix_impact_pp_positive?: DriverItem[];
  mix_impact_pp_negative?: DriverItem[];
  margin_impact_pp_positive?: DriverItem[];
  margin_impact_pp_negative?: DriverItem[];

  mix_impact_abs_positive?: DriverItem[];
  mix_impact_abs_negative?: DriverItem[];
  margin_impact_abs_positive?: DriverItem[];
  margin_impact_abs_negative?: DriverItem[];
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

  const activeBridge = (bridge as any)?.bridge || bridge || null;

  const top_mix_pos = activeBridge?.mix_impact_pp_positive || [];
  const top_mix_neg = activeBridge?.mix_impact_pp_negative || [];
  const top_margin_pos = activeBridge?.margin_impact_pp_positive || [];
  const top_margin_neg = activeBridge?.margin_impact_pp_negative || [];

  const abs_mix_pos = activeBridge?.mix_impact_abs_positive || [];
  const abs_mix_neg = activeBridge?.mix_impact_abs_negative || [];
  const abs_margin_pos = activeBridge?.margin_impact_abs_positive || [];
  const abs_margin_neg = activeBridge?.margin_impact_abs_negative || [];

  const hasBridge = !!(
    activeBridge &&
    (activeBridge.prev_q || activeBridge.curr_q)
  );

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-sm font-bold tracking-tight text-gray-800 mb-6 pb-3 border-b border-gray-105 flex items-center gap-2">
        <AlertCircle size={16} className="text-[#a61c1e]" />
        Business insights
      </h3>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-b-2 border-red-700"></div>
        </div>
      ) : hasBridge ? (
        <div className="flex flex-col gap-8">
          {/* % GM Bridge */}
          <div className="flex flex-col gap-4">
            <div className={`p-3 rounded-lg text-xs font-bold leading-relaxed border ${activeBridge!.total_change_pp >= 0
                ? "bg-emerald-50 text-emerald-800 border-emerald-100"
                : "bg-rose-50 text-rose-800 border-rose-100"
              }`}>
              <span className="font-extrabold uppercase">
                QoQ GM bridge ({activeBridge!.prev_q} → {activeBridge!.curr_q}): % GM bridge
              </span>
              {" — "}
              <span className="text-gray-700 font-medium font-semibold">
                {activeBridge!.qoq_gm_bridge_narrative ||
                  `GM% ${activeBridge!.total_change_pp >= 0 ? "+" : ""}${activeBridge!.total_change_pp.toFixed(2)} pp (${activeBridge!.gm_prev.toFixed(1)}% → ${activeBridge!.gm_curr.toFixed(1)}%). Mix ${activeBridge!.mix_effect_pp >= 0 ? "+" : ""}${activeBridge!.mix_effect_pp.toFixed(2)} pp + margin ${activeBridge!.margin_effect_pp >= 0 ? "+" : ""}${activeBridge!.margin_effect_pp.toFixed(2)} pp.`
                }
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Mix Impact % GM */}
              <div>
                <h4 className="font-bold text-gray-500 uppercase tracking-wide border-b border-gray-200 pb-1.5 mb-3 text-[11px]">
                  Mix impact (% GM)
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-emerald-600 font-bold tracking-wider uppercase block mb-2">Positive (Top 3)</span>
                    <div className="space-y-1.5 text-gray-600 font-medium text-xs">
                      {top_mix_pos.map((item, index) => (
                        <div key={index} className="flex justify-between gap-2">
                          <span className="truncate" title={item.product_family}>{item.product_family}</span>
                          <span className="text-emerald-600 font-bold flex-shrink-0">
                            +{item.field_value.toFixed(2)} pp
                          </span>
                        </div>
                      ))}
                      {top_mix_pos.length === 0 && (
                        <div className="text-gray-400 italic text-[10px]">No drivers</div>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-rose-600 font-bold tracking-wider uppercase block mb-2">Negative (Top 3)</span>
                    <div className="space-y-1.5 text-gray-600 font-medium text-xs">
                      {top_mix_neg.map((item, index) => (
                        <div key={index} className="flex justify-between gap-2">
                          <span className="truncate" title={item.product_family}>{item.product_family}</span>
                          <span className="text-rose-600 font-bold flex-shrink-0">
                            {item.field_value.toFixed(2)} pp
                          </span>
                        </div>
                      ))}
                      {top_mix_neg.length === 0 && (
                        <div className="text-gray-400 italic text-[10px]">No drivers</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Margin Impact % GM */}
              <div>
                <h4 className="font-bold text-gray-500 uppercase tracking-wide border-b border-gray-200 pb-1.5 mb-3 text-[11px]">
                  Margin impact (% GM)
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-emerald-600 font-bold tracking-wider uppercase block mb-2">Positive (Top 3)</span>
                    <div className="space-y-1.5 text-gray-600 font-medium text-xs">
                      {top_margin_pos.map((item, index) => (
                        <div key={index} className="flex justify-between gap-2">
                          <span className="truncate" title={item.product_family}>{item.product_family}</span>
                          <span className="text-emerald-600 font-bold flex-shrink-0">
                            +{item.field_value.toFixed(2)} pp
                          </span>
                        </div>
                      ))}
                      {top_margin_pos.length === 0 && (
                        <div className="text-gray-400 italic text-[10px]">No drivers</div>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-rose-600 font-bold tracking-wider uppercase block mb-2">Negative (Top 3)</span>
                    <div className="space-y-1.5 text-gray-600 font-medium text-xs">
                      {top_margin_neg.map((item, index) => (
                        <div key={index} className="flex justify-between gap-2">
                          <span className="truncate" title={item.product_family}>{item.product_family}</span>
                          <span className="text-rose-600 font-bold flex-shrink-0">
                            {item.field_value.toFixed(2)} pp
                          </span>
                        </div>
                      ))}
                      {top_margin_neg.length === 0 && (
                        <div className="text-gray-400 italic text-[10px]">No drivers</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Absolute GM Bridge */}
          <div className="flex flex-col gap-4">
            <div className={`p-3 rounded-lg text-xs font-bold leading-relaxed border ${activeBridge!.total_change_abs >= 0
                ? "bg-[#e6f4f1] text-[#0d9488] border-[#ccfbf1]"
                : "bg-rose-50 text-rose-800 border-rose-100"
              }`}>
              <span className="font-extrabold uppercase">
                Absolute GM bridge ({activeBridge!.prev_q} → {activeBridge!.curr_q})
              </span>
              {" — "}
              <span className="text-gray-700 font-medium font-semibold">
                {activeBridge!.absolute_gm_bridge_narrative ||
                  `Total change ${activeBridge!.total_change_abs >= 0 ? "+" : ""}${formatAbsoluteInr(activeBridge!.total_change_abs)}. Mix ${activeBridge!.mix_effect_abs >= 0 ? "+" : ""}${formatAbsoluteInr(activeBridge!.mix_effect_abs)} + margin ${activeBridge!.margin_effect_abs >= 0 ? "+" : ""}${formatAbsoluteInr(activeBridge!.margin_effect_abs)}.`
                }
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h4 className="font-bold text-gray-500 uppercase tracking-wide border-b border-gray-200 pb-1.5 mb-3 text-[11px]">
                  Mix impact (absolute ₹)
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-emerald-600 font-bold tracking-wider uppercase block mb-2">Positive (Top 3)</span>
                    <div className="space-y-1.5 text-gray-600 font-medium text-xs">
                      {abs_mix_pos.map((item, index) => (
                        <div key={index} className="flex justify-between gap-2">
                          <span className="truncate" title={item.product_family}>{item.product_family}</span>
                          <span className="text-emerald-600 font-bold flex-shrink-0">
                            +{formatAbsoluteInr(item.field_value)}
                          </span>
                        </div>
                      ))}
                      {abs_mix_pos.length === 0 && (
                        <div className="text-gray-400 italic text-[10px]">No drivers</div>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-rose-600 font-bold tracking-wider uppercase block mb-2">Negative (Top 3)</span>
                    <div className="space-y-1.5 text-gray-600 font-medium text-xs">
                      {abs_mix_neg.map((item, index) => (
                        <div key={index} className="flex justify-between gap-2">
                          <span className="truncate" title={item.product_family}>{item.product_family}</span>
                          <span className="text-rose-600 font-bold flex-shrink-0">
                            {formatAbsoluteInr(item.field_value)}
                          </span>
                        </div>
                      ))}
                      {abs_mix_neg.length === 0 && (
                        <div className="text-gray-400 italic text-[10px]">No drivers</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Margin Impact Absolute */}
              <div>
                <h4 className="font-bold text-gray-500 uppercase tracking-wide border-b border-gray-200 pb-1.5 mb-3 text-[11px]">
                  Margin impact (absolute ₹)
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-emerald-600 font-bold tracking-wider uppercase block mb-2">Positive (Top 3)</span>
                    <div className="space-y-1.5 text-gray-600 font-medium text-xs">
                      {abs_margin_pos.map((item, index) => (
                        <div key={index} className="flex justify-between gap-2">
                          <span className="truncate" title={item.product_family}>{item.product_family}</span>
                          <span className="text-emerald-600 font-bold flex-shrink-0">
                            +{formatAbsoluteInr(item.field_value)}
                          </span>
                        </div>
                      ))}
                      {abs_margin_pos.length === 0 && (
                        <div className="text-gray-400 italic text-[10px]">No drivers</div>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-rose-600 font-bold tracking-wider uppercase block mb-2">Negative (Top 3)</span>
                    <div className="space-y-1.5 text-gray-600 font-medium text-xs">
                      {abs_margin_neg.map((item, index) => (
                        <div key={index} className="flex justify-between gap-2">
                          <span className="truncate" title={item.product_family}>{item.product_family}</span>
                          <span className="text-rose-600 font-bold flex-shrink-0">
                            {formatAbsoluteInr(item.field_value)}
                          </span>
                        </div>
                      ))}
                      {abs_margin_neg.length === 0 && (
                        <div className="text-gray-400 italic text-[10px]">No drivers</div>
                      )}
                    </div>
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
