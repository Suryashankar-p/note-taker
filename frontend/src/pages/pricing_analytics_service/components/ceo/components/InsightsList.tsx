import React from "react";

type DriverItem = {
  name: string;
  mix_contrib_pp?: number;
  margin_contrib_pp?: number;
  abs_mix_contrib?: number;
  abs_margin_contrib?: number;
};

type InsightsData = {
  insights: string[];
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
};

type Props = {
  data: InsightsData | undefined | null;
};

const InsightsList = ({ data }: Props) => {
  console.log("InsightsList data:", data);

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

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Top Insights List */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold tracking-wider text-gray-500 uppercase mb-4">
          Top Insights {bridge?.curr_q ? `— ${bridge.curr_q}` : ""}
        </h3>
        <div className="flex flex-col gap-3">
          {insights.length > 0 ? (
            insights.map((item, index) => (
              <div key={index} className="flex gap-3 text-xs leading-relaxed text-gray-600">
                <span className="text-[#a61c1e] font-bold">{index + 1}.</span>
                <p>{item}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-400 italic">No insights available.</p>
          )}
        </div>
      </div>

      {/* 2. Business Insights (QoQ GM Bridge) */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold tracking-wider text-gray-500 uppercase mb-4">
          Business insights
        </h3>
        {bridge ? (
          <div className="border border-gray-200 bg-gray-50/50 rounded-lg p-5">
            {/* Percentage Bridge */}
            <p className={`text-xs font-semibold leading-normal mb-6 p-3 rounded-lg ${
              bridge.pct.total_change_pp >= 0
                ? "text-emerald-700 bg-emerald-50/80 border border-emerald-100"
                : "text-rose-700 bg-rose-50/80 border border-rose-100"
            }`}>
              QoQ GM bridge ({bridge.prev_q} – {bridge.curr_q}): % GM bridge — GMs {bridge.pct.total_change_pp >= 0 ? "+" : ""}{bridge.pct.total_change_pp.toFixed(1)} pp ({bridge.pct.gm_prev.toFixed(1)}% → {bridge.pct.gm_curr.toFixed(1)}%). Mix {bridge.pct.mix_effect_pp >= 0 ? "+" : ""}{bridge.pct.mix_effect_pp.toFixed(1)} pp + margin {bridge.pct.margin_effect_pp >= 0 ? "+" : ""}{bridge.pct.margin_effect_pp.toFixed(1)} pp = {bridge.pct.total_change_pp >= 0 ? "+" : ""}{bridge.pct.total_change_pp.toFixed(1)} pp (check vs ΔGM%).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
              {/* Mix Impact section */}
              <div>
                <h4 className="font-bold text-gray-500 uppercase tracking-wide border-b border-gray-200 pb-1.5 mb-3">
                  Mix impact (% GM)
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-emerald-600 font-bold tracking-wider uppercase block mb-2">Positive (Top 3)</span>
                    <div className="space-y-1.5 text-gray-600 font-medium">
                      {bridge.pct.top_mix_pos?.map((item, index) => (
                        <div key={index} className="flex justify-between gap-2">
                          <span className="truncate" title={item.name}>{item.name}</span>
                          <span className="text-emerald-600 font-bold flex-shrink-0">
                            +{item.mix_contrib_pp?.toFixed(1)} pp
                          </span>
                        </div>
                      ))}
                      {(!bridge.pct.top_mix_pos || bridge.pct.top_mix_pos.length === 0) && (
                        <div className="text-gray-400 italic">No positive drivers</div>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-rose-600 font-bold tracking-wider uppercase block mb-2">Negative (Top 3)</span>
                    <div className="space-y-1.5 text-gray-600 font-medium">
                      {bridge.pct.top_mix_neg?.map((item, index) => (
                        <div key={index} className="flex justify-between gap-2">
                          <span className="truncate" title={item.name}>{item.name}</span>
                          <span className="text-rose-600 font-bold flex-shrink-0">
                            {item.mix_contrib_pp?.toFixed(1)} pp
                          </span>
                        </div>
                      ))}
                      {(!bridge.pct.top_mix_neg || bridge.pct.top_mix_neg.length === 0) && (
                        <div className="text-gray-400 italic">No negative drivers</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Margin Impact section */}
              <div>
                <h4 className="font-bold text-gray-500 uppercase tracking-wide border-b border-gray-200 pb-1.5 mb-3">
                  Margin impact (% GM)
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-emerald-600 font-bold tracking-wider uppercase block mb-2">Positive (Top 3)</span>
                    <div className="space-y-1.5 text-gray-600 font-medium">
                      {bridge.pct.top_margin_pos?.map((item, index) => (
                        <div key={index} className="flex justify-between gap-2">
                          <span className="truncate" title={item.name}>{item.name}</span>
                          <span className="text-emerald-600 font-bold flex-shrink-0">
                            +{item.margin_contrib_pp?.toFixed(1)} pp
                          </span>
                        </div>
                      ))}
                      {(!bridge.pct.top_margin_pos || bridge.pct.top_margin_pos.length === 0) && (
                        <div className="text-gray-400 italic">No positive drivers</div>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-rose-600 font-bold tracking-wider uppercase block mb-2">Negative (Top 3)</span>
                    <div className="space-y-1.5 text-gray-600 font-medium">
                      {bridge.pct.top_margin_neg?.map((item, index) => (
                        <div key={index} className="flex justify-between gap-2">
                          <span className="truncate" title={item.name}>{item.name}</span>
                          <span className="text-rose-600 font-bold flex-shrink-0">
                            {item.margin_contrib_pp?.toFixed(1)} pp
                          </span>
                        </div>
                      ))}
                      {(!bridge.pct.top_margin_neg || bridge.pct.top_margin_neg.length === 0) && (
                        <div className="text-gray-400 italic">No negative drivers</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <hr className="my-6 border-gray-200" />

            {/* Absolute Bridge */}
            <p className={`text-xs font-semibold leading-normal mb-6 p-3 rounded-lg ${
              bridge.abs.total_change_abs >= 0
                ? "text-teal-700 bg-teal-50/80 border border-teal-100"
                : "text-rose-700 bg-rose-50/80 border border-rose-100"
            }`}>
              Absolute GM bridge ({bridge.prev_q} – {bridge.curr_q}) — Total change {bridge.abs.total_change_abs >= 0 ? "+" : ""}{formatAbsoluteInr(bridge.abs.total_change_abs)}. Mix {bridge.abs.mix_effect_abs >= 0 ? "+" : ""}{formatAbsoluteInr(bridge.abs.mix_effect_abs)} + margin {bridge.abs.margin_effect_abs >= 0 ? "+" : ""}{formatAbsoluteInr(bridge.abs.margin_effect_abs)} = {bridge.abs.total_change_abs >= 0 ? "+" : ""}{formatAbsoluteInr(bridge.abs.total_change_abs)}.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
              {/* Mix Impact section */}
              <div>
                <h4 className="font-bold text-gray-500 uppercase tracking-wide border-b border-gray-200 pb-1.5 mb-3">
                  Mix impact (absolute ₹)
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-emerald-600 font-bold tracking-wider uppercase block mb-2">Positive (Top 3)</span>
                    <div className="space-y-1.5 text-gray-600 font-medium">
                      {bridge.abs.top_mix_pos?.map((item, index) => (
                        <div key={index} className="flex justify-between gap-2">
                          <span className="truncate" title={item.name}>{item.name}</span>
                          <span className="text-emerald-600 font-bold flex-shrink-0">
                            +{formatAbsoluteInr(item.abs_mix_contrib || 0)}
                          </span>
                        </div>
                      ))}
                      {(!bridge.abs.top_mix_pos || bridge.abs.top_mix_pos.length === 0) && (
                        <div className="text-gray-400 italic">No positive drivers</div>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-rose-600 font-bold tracking-wider uppercase block mb-2">Negative (Top 3)</span>
                    <div className="space-y-1.5 text-gray-600 font-medium">
                      {bridge.abs.top_mix_neg?.map((item, index) => (
                        <div key={index} className="flex justify-between gap-2">
                          <span className="truncate" title={item.name}>{item.name}</span>
                          <span className="text-rose-600 font-bold flex-shrink-0">
                            {formatAbsoluteInr(item.abs_mix_contrib || 0)}
                          </span>
                        </div>
                      ))}
                      {(!bridge.abs.top_mix_neg || bridge.abs.top_mix_neg.length === 0) && (
                        <div className="text-gray-400 italic">No negative drivers</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Margin Impact section */}
              <div>
                <h4 className="font-bold text-gray-500 uppercase tracking-wide border-b border-gray-200 pb-1.5 mb-3">
                  Margin impact (absolute ₹)
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-emerald-600 font-bold tracking-wider uppercase block mb-2">Positive (Top 3)</span>
                    <div className="space-y-1.5 text-gray-600 font-medium">
                      {bridge.abs.top_margin_pos?.map((item, index) => (
                        <div key={index} className="flex justify-between gap-2">
                          <span className="truncate" title={item.name}>{item.name}</span>
                          <span className="text-emerald-600 font-bold flex-shrink-0">
                            +{formatAbsoluteInr(item.abs_margin_contrib || 0)}
                          </span>
                        </div>
                      ))}
                      {(!bridge.abs.top_margin_pos || bridge.abs.top_margin_pos.length === 0) && (
                        <div className="text-gray-400 italic">No positive drivers</div>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-rose-600 font-bold tracking-wider uppercase block mb-2">Negative (Top 3)</span>
                    <div className="space-y-1.5 text-gray-600 font-medium">
                      {bridge.abs.top_margin_neg?.map((item, index) => (
                        <div key={index} className="flex justify-between gap-2">
                          <span className="truncate" title={item.name}>{item.name}</span>
                          <span className="text-rose-600 font-bold flex-shrink-0">
                            {formatAbsoluteInr(item.abs_margin_contrib || 0)}
                          </span>
                        </div>
                      ))}
                      {(!bridge.abs.top_margin_neg || bridge.abs.top_margin_neg.length === 0) && (
                        <div className="text-gray-400 italic">No negative drivers</div>
                      )}
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
