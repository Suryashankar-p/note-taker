import React from "react";
import CustomSelect from "../CustomSelect";

type DriverItem = {
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
};

type BridgeData = {
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
};

type InsightsData = {
  insights: string[];
  bridge?: BridgeData | null;
};

type Props = {
  data: InsightsData | undefined | null;
  isLoading?: boolean;
  selectedQuarter?: string;
  setSelectedQuarter?: (q: string) => void;
  quartersList?: string[];
};

const InsightsList = ({ data, isLoading, selectedQuarter, setSelectedQuarter, quartersList }: Props) => {
  const insights = data?.insights || [];
  const bridge = data?.bridge;

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

  const top_mix_pos = bridge?.mix_impact_pp_positive || [];
  const top_mix_neg = bridge?.mix_impact_pp_negative || [];
  const top_margin_pos = bridge?.margin_impact_pp_positive || [];
  const top_margin_neg = bridge?.margin_impact_pp_negative || [];

  const abs_mix_pos = bridge?.mix_impact_abs_positive || [];
  const abs_mix_neg = bridge?.mix_impact_abs_negative || [];
  const abs_margin_pos = bridge?.margin_impact_abs_positive || [];
  const abs_margin_neg = bridge?.margin_impact_abs_negative || [];

  const hasBridge = !!(
    bridge &&
    bridge.prev_q &&
    bridge.curr_q &&
    bridge.total_change_pp !== undefined
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      {/* CEO Top Insights */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-semibold tracking-wider text-gray-500 uppercase mb-6 pb-3 border-b border-gray-100 flex items-center justify-between">
            <span>Top Insights</span>
            {quartersList && setSelectedQuarter && selectedQuarter && (
              <CustomSelect
                options={quartersList}
                value={selectedQuarter}
                onChange={setSelectedQuarter}
                labelPrefix="Qtr: "
                alignRight
              />
            )}
          </h3>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-red-700"></div>
            </div>
          ) : (
            <ul className="flex flex-col gap-3.5 text-xs text-gray-600 leading-relaxed font-semibold">
              {insights.map((insight, idx) => (
                <li key={idx} className="flex gap-2.5 items-start">
                  <span className="text-[#a61c1e] mt-1 font-bold">▶</span>
                  <span>{insight}</span>
                </li>
              ))}
              {insights.length === 0 && (
                <li className="text-gray-400 italic font-medium">No insights available.</li>
              )}
            </ul>
          )}
        </div>
      </div>

      {/* CEO Business Insights (GM Decomposition) */}
      <div className="xl:col-span-2 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold tracking-wider text-gray-500 uppercase mb-6 pb-3 border-b border-gray-100">
          Business insights
        </h3>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-b-2 border-red-700"></div>
          </div>
        ) : hasBridge ? (
          <div className="flex flex-col gap-6">
            {/* % GM Bridge */}
            <div className="flex flex-col gap-3">
              <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">
                QoQ GM bridge ({bridge!.prev_q} → {bridge!.curr_q}): % GM bridge
              </span>
              <p className="text-xs font-semibold text-gray-700 leading-relaxed bg-slate-50 border border-gray-150 p-2.5 rounded-lg">
                {bridge!.qoq_gm_bridge_narrative || 
                  `GM% ${bridge!.total_change_pp >= 0 ? "+" : ""}${bridge!.total_change_pp.toFixed(2)} pp (${bridge!.gm_prev.toFixed(1)}% → ${bridge!.gm_curr.toFixed(1)}%). Mix ${bridge!.mix_effect_pp >= 0 ? "+" : ""}${bridge!.mix_effect_pp.toFixed(2)} pp + margin ${bridge!.margin_effect_pp >= 0 ? "+" : ""}${bridge!.margin_effect_pp.toFixed(2)} pp.`
                }
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-1">
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
            <div className="flex flex-col gap-3">
              <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">
                Absolute GM bridge ({bridge!.prev_q} → {bridge!.curr_q})
              </span>
              <p className="text-xs font-semibold text-gray-700 leading-relaxed bg-slate-50 border border-gray-150 p-2.5 rounded-lg">
                {bridge!.absolute_gm_bridge_narrative || 
                  `Total change ${bridge!.total_change_abs >= 0 ? "+" : ""}${formatAbsoluteInr(bridge!.total_change_abs)}. Mix ${bridge!.mix_effect_abs >= 0 ? "+" : ""}${formatAbsoluteInr(bridge!.mix_effect_abs)} + margin ${bridge!.margin_effect_abs >= 0 ? "+" : ""}${formatAbsoluteInr(bridge!.margin_effect_abs)}.`
                }
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-1">
                {/* Mix Impact Absolute */}
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
          <div className="border border-dashed border-gray-300 bg-gray-50/50 rounded-lg p-6 text-center text-xs text-gray-500">
            QoQ GM bridge data requires at least two quarters of transaction data.
          </div>
        )}
      </div>
    </div>
  );
};

export default InsightsList;
