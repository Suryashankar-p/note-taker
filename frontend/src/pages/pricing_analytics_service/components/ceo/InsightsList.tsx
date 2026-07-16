import React from "react";
import CustomSelect from "../CustomSelect";

type FamilyItem = {
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
  families?: FamilyItem[];
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

  // Derive top drivers from families array (flat API structure)
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
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-2">
        <h2 className="text-sm font-bold tracking-wider text-gray-500 uppercase">
          CEO Business Insights
        </h2>
        {quartersList && quartersList.length > 0 && setSelectedQuarter && (
          <CustomSelect
            options={quartersList}
            value={selectedQuarter || ""}
            onChange={setSelectedQuarter}
            labelPrefix="Quarter: "
            alignRight
          />
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold tracking-wider text-gray-500 uppercase mb-4">
          Top Insights {bridge?.curr_q ? `— ${bridge.curr_q}` : ""}
        </h3>
        <div className="flex flex-col gap-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-b-2 border-red-700"></div>
          </div>
        ) : insights.length > 0 ? (
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

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold tracking-wider text-gray-500 uppercase mb-4">
          Business Insights
        </h3>
        {hasBridge ? (
          <div className="border border-gray-200 bg-gray-50/50 rounded-lg p-5">
            {/* % GM Bridge summary */}
            <p className={`text-xs font-semibold leading-normal mb-6 p-3 rounded-lg ${
              bridge!.total_change_pp >= 0
                ? "text-emerald-700 bg-emerald-50/80 border border-emerald-100"
                : "text-rose-700 bg-rose-50/80 border border-rose-100"
            }`}>
              QoQ GM bridge ({bridge!.prev_q} – {bridge!.curr_q}): GM%&nbsp;
              {bridge!.total_change_pp >= 0 ? "+" : ""}{bridge!.total_change_pp.toFixed(2)} pp&nbsp;
              ({bridge!.gm_prev.toFixed(1)}% → {bridge!.gm_curr.toFixed(1)}%).&nbsp;
              Mix {bridge!.mix_effect_pp >= 0 ? "+" : ""}{bridge!.mix_effect_pp.toFixed(2)} pp&nbsp;
              + Margin {bridge!.margin_effect_pp >= 0 ? "+" : ""}{bridge!.margin_effect_pp.toFixed(2)} pp.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
              <div>
                <h4 className="font-bold text-gray-500 uppercase tracking-wide border-b border-gray-200 pb-1.5 mb-3">
                  Mix impact (% GM)
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-emerald-600 font-bold tracking-wider uppercase block mb-2">Positive (Top 3)</span>
                    <div className="space-y-1.5 text-gray-600 font-medium">
                      {top_mix_pos.map((item, index) => (
                        <div key={index} className="flex justify-between gap-2">
                          <span className="truncate" title={item.name}>{item.name}</span>
                          <span className="text-emerald-600 font-bold flex-shrink-0">
                            +{item.mix_contrib_pp.toFixed(2)} pp
                          </span>
                        </div>
                      ))}
                      {top_mix_pos.length === 0 && (
                        <div className="text-gray-400 italic">No positive drivers</div>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-rose-600 font-bold tracking-wider uppercase block mb-2">Negative (Top 3)</span>
                    <div className="space-y-1.5 text-gray-600 font-medium">
                      {top_mix_neg.map((item, index) => (
                        <div key={index} className="flex justify-between gap-2">
                          <span className="truncate" title={item.name}>{item.name}</span>
                          <span className="text-rose-600 font-bold flex-shrink-0">
                            {item.mix_contrib_pp.toFixed(2)} pp
                          </span>
                        </div>
                      ))}
                      {top_mix_neg.length === 0 && (
                        <div className="text-gray-400 italic">No negative drivers</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-500 uppercase tracking-wide border-b border-gray-200 pb-1.5 mb-3">
                  Margin impact (% GM)
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-emerald-600 font-bold tracking-wider uppercase block mb-2">Positive (Top 3)</span>
                    <div className="space-y-1.5 text-gray-600 font-medium">
                      {top_margin_pos.map((item, index) => (
                        <div key={index} className="flex justify-between gap-2">
                          <span className="truncate" title={item.name}>{item.name}</span>
                          <span className="text-emerald-600 font-bold flex-shrink-0">
                            +{item.margin_contrib_pp.toFixed(2)} pp
                          </span>
                        </div>
                      ))}
                      {top_margin_pos.length === 0 && (
                        <div className="text-gray-400 italic">No positive drivers</div>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-rose-600 font-bold tracking-wider uppercase block mb-2">Negative (Top 3)</span>
                    <div className="space-y-1.5 text-gray-600 font-medium">
                      {top_margin_neg.map((item, index) => (
                        <div key={index} className="flex justify-between gap-2">
                          <span className="truncate" title={item.name}>{item.name}</span>
                          <span className="text-rose-600 font-bold flex-shrink-0">
                            {item.margin_contrib_pp.toFixed(2)} pp
                          </span>
                        </div>
                      ))}
                      {top_margin_neg.length === 0 && (
                        <div className="text-gray-400 italic">No negative drivers</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <hr className="my-6 border-gray-200" />

            {/* Absolute GM Bridge summary */}
            <p className={`text-xs font-semibold leading-normal mb-6 p-3 rounded-lg ${
              bridge!.total_change_abs >= 0
                ? "text-teal-700 bg-teal-50/80 border border-teal-100"
                : "text-rose-700 bg-rose-50/80 border border-rose-100"
            }`}>
              Absolute GM bridge ({bridge!.prev_q} – {bridge!.curr_q}) — Total&nbsp;
              {bridge!.total_change_abs >= 0 ? "+" : ""}{formatAbsoluteInr(bridge!.total_change_abs)}.&nbsp;
              Mix {bridge!.mix_effect_abs >= 0 ? "+" : ""}{formatAbsoluteInr(bridge!.mix_effect_abs)}&nbsp;
              + Margin {bridge!.margin_effect_abs >= 0 ? "+" : ""}{formatAbsoluteInr(bridge!.margin_effect_abs)}.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
              <div>
                <h4 className="font-bold text-gray-500 uppercase tracking-wide border-b border-gray-200 pb-1.5 mb-3">
                  Mix impact (absolute ₹)
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-emerald-600 font-bold tracking-wider uppercase block mb-2">Positive (Top 3)</span>
                    <div className="space-y-1.5 text-gray-600 font-medium">
                      {abs_mix_pos.map((item, index) => (
                        <div key={index} className="flex justify-between gap-2">
                          <span className="truncate" title={item.name}>{item.name}</span>
                          <span className="text-emerald-600 font-bold flex-shrink-0">
                            +{formatAbsoluteInr(item.abs_mix_contrib)}
                          </span>
                        </div>
                      ))}
                      {abs_mix_pos.length === 0 && (
                        <div className="text-gray-400 italic">No positive drivers</div>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-rose-600 font-bold tracking-wider uppercase block mb-2">Negative (Top 3)</span>
                    <div className="space-y-1.5 text-gray-600 font-medium">
                      {abs_mix_neg.map((item, index) => (
                        <div key={index} className="flex justify-between gap-2">
                          <span className="truncate" title={item.name}>{item.name}</span>
                          <span className="text-rose-600 font-bold flex-shrink-0">
                            {formatAbsoluteInr(item.abs_mix_contrib)}
                          </span>
                        </div>
                      ))}
                      {abs_mix_neg.length === 0 && (
                        <div className="text-gray-400 italic">No negative drivers</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-500 uppercase tracking-wide border-b border-gray-200 pb-1.5 mb-3">
                  Margin impact (absolute ₹)
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-emerald-600 font-bold tracking-wider uppercase block mb-2">Positive (Top 3)</span>
                    <div className="space-y-1.5 text-gray-600 font-medium">
                      {abs_margin_pos.map((item, index) => (
                        <div key={index} className="flex justify-between gap-2">
                          <span className="truncate" title={item.name}>{item.name}</span>
                          <span className="text-emerald-600 font-bold flex-shrink-0">
                            +{formatAbsoluteInr(item.abs_margin_contrib)}
                          </span>
                        </div>
                      ))}
                      {abs_margin_pos.length === 0 && (
                        <div className="text-gray-400 italic">No positive drivers</div>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-rose-600 font-bold tracking-wider uppercase block mb-2">Negative (Top 3)</span>
                    <div className="space-y-1.5 text-gray-600 font-medium">
                      {abs_margin_neg.map((item, index) => (
                        <div key={index} className="flex justify-between gap-2">
                          <span className="truncate" title={item.name}>{item.name}</span>
                          <span className="text-rose-600 font-bold flex-shrink-0">
                            {formatAbsoluteInr(item.abs_margin_contrib)}
                          </span>
                        </div>
                      ))}
                      {abs_margin_neg.length === 0 && (
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
            {selectedQuarter && quartersList && quartersList[0] === selectedQuarter
              ? `QoQ GM bridge analysis is not available for ${selectedQuarter} as it is the first quarter with transaction data.`
              : "QoQ GM bridge data requires at least two quarters of transaction data."}
          </div>
        )}
      </div>
    </div>
  );
};

export default InsightsList;
