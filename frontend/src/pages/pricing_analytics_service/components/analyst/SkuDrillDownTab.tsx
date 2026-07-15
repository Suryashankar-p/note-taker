
import React, { useState, useEffect, useMemo } from "react";
import { AlertCircle } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import {
  useGetSkuDeviation,
  type SkuNonStdRow,
  type SkuStandardRow,
  fmt,
  fmtLakhs,
  fmtPP,
} from "../../services/query/query";

interface SkuDrillDownTabProps {
  selectedFamily?: string | null;
}

const SkuDrillDownTab: React.FC<SkuDrillDownTabProps> = ({
  selectedFamily: propsSelectedFamily,
}) => {
  const context = useOutletContext<any>() || {};
  const onNavigateToTab = context.onNavigateToTab;
  const selectedFamily =
    propsSelectedFamily !== undefined
      ? propsSelectedFamily
      : context.selectedFamily;

  const sessionId = Number(localStorage.getItem("pricing_session_id")) || 10;
  const { data, isLoading, isError } = useGetSkuDeviation(sessionId, selectedFamily || null);

  const [selectedQuarter, setSelectedQuarter] = useState<string>("");

  useEffect(() => {
    if (data?.latestQuarter && !selectedQuarter) {
      setSelectedQuarter(data.latestQuarter);
    }
  }, [data?.latestQuarter, selectedQuarter]);

  const activeQuarter = selectedQuarter || data?.latestQuarter || "";
  const quarterData = data?.quarterMap?.[activeQuarter];

  // Only show rows when a family is actively selected from Step 3
  const nonstdRows: SkuNonStdRow[] = useMemo(() => {
    if (!selectedFamily) return [];
    const rows = quarterData?.nonstd_rows || [];
    const key = selectedFamily.toLowerCase();
    return rows.filter(
      (r) => r.product_family.toLowerCase() === key
    );
  }, [quarterData, selectedFamily]);

  const standardRows: SkuStandardRow[] = useMemo(() => {
    if (!selectedFamily) return [];
    const rows = quarterData?.standard_rows || [];
    const key = selectedFamily.toLowerCase();
    return rows.filter(
      (r) => r.product_family.toLowerCase() === key
    );
  }, [quarterData, selectedFamily]);

  // Aggregate notional loss for summary banner
  const totalNotionalLoss = useMemo(
    () => nonstdRows.reduce((s, r) => s + (r.notional_loss ?? 0), 0),
    [nonstdRows]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#a61c1e]" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[300px] text-rose-600 font-semibold text-sm">
        Failed to load SKU deviation data. Please try again.
      </div>
    );
  }

  const sortedQuarters = data?.sortedQuarters || [];

  return (
    <div className="flex flex-col gap-8 text-gray-800 pb-12">
      {/* ── Header ── */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h3 className="text-sm font-bold tracking-tight text-gray-850">
            SKU Drill-down — Deviation Analysis
          </h3>

          {/* Quarter picker */}
          {sortedQuarters.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Quarter</span>
              <div className="flex gap-1 flex-wrap">
                {sortedQuarters.map((q) => (
                  <button
                    key={q}
                    onClick={() => setSelectedQuarter(q)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                      activeQuarter === q
                        ? "bg-[#a61c1e] text-white border-[#a61c1e] shadow-sm"
                        : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Family / summary chips */}
        <div className="flex items-center gap-3 flex-wrap">
          {selectedFamily ? (
            <span className="font-extrabold text-[#a61c1e] bg-red-50 border border-red-200 px-3 py-1 rounded-lg text-xs">
              Active Family: {selectedFamily} · {activeQuarter}
            </span>
          ) : (
            <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-lg">
              ⚠ No family selected — go to Step 3
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 bg-teal-50 border border-teal-200 text-teal-800 p-4 rounded-xl text-xs font-semibold">
          <AlertCircle className="text-teal-600 shrink-0" size={16} />
          <p>
            {selectedFamily
              ? `Showing deviations for "${selectedFamily}". Use the QoQ Matrix to switch families.`
              : "Go back to Step 3 (QoQ Matrix) → click a cell → select a product family to see its SKU deviations here."}
          </p>
        </div>
      </div>

      {/* ── 1. Non-Standard SKUs ── */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm overflow-hidden">
        <div className="pb-3 border-b border-gray-100 mb-4 flex items-center justify-between">
          <h4 className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">
            Non-standard SKUs — margin vs. target
          </h4>
          <span className="text-[10px] text-gray-400 font-bold">
            {nonstdRows.length} rows
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-gray-150 bg-gray-55 text-gray-500 font-bold uppercase text-[9px] tracking-wider">
                <th className="py-2.5 px-3">PF</th>
                <th className="py-2.5 px-3 text-center">Order No</th>
                <th className="py-2.5 px-3 text-center">Item Code</th>
                <th className="py-2.5 px-3 w-72">Description</th>
                <th className="py-2.5 px-3">Channel / Direct</th>
                <th className="py-2.5 px-3 text-right">List Price</th>
                <th className="py-2.5 px-3 text-right">Actual Price</th>
                <th className="py-2.5 px-3 text-right">Price Deviation</th>
                <th className="py-2.5 px-3 text-right">List Cost</th>
                <th className="py-2.5 px-3 text-right">Actual Cost</th>
                <th className="py-2.5 px-3 text-right">Cost Deviation</th>
                <th className="py-2.5 px-3 text-right">Overall margin (actual)</th>
                <th className="py-2.5 px-3 text-right">PF target (overall)</th>
                <th className="py-2.5 px-3 text-right">Notional loss (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {nonstdRows.length > 0 ? (
                nonstdRows.map((item, idx) => {
                  const priceDevNum = item.price_deviation ?? 0;
                  const costDevNum = item.cost_deviation ?? 0;
                  return (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-semibold text-gray-900 whitespace-nowrap">
                        {item.product_family}
                      </td>
                      <td className="py-2.5 px-3 text-center text-gray-500 whitespace-nowrap">
                        {item.order_no}
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        {item.item_code}
                      </td>
                      <td className="py-2.5 px-3 text-gray-600 leading-relaxed font-normal">
                        {item.description}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-gray-700">
                        {item.channel_direct ?? item.channel ?? item.channel_or_direct ?? "—"}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {item.list_price != null ? fmt(item.list_price, 2) : "—"}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {item.actual_price != null ? fmt(item.actual_price, 2) : "—"}
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right font-bold ${
                          priceDevNum < 0 ? "text-rose-600" : "text-emerald-600"
                        }`}
                      >
                        {item.price_deviation != null ? fmtPP(priceDevNum) : "—"}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {item.list_cost != null ? fmt(item.list_cost, 2) : "—"}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {item.actual_cost != null ? fmt(item.actual_cost, 2) : "—"}
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right font-bold ${
                          costDevNum < 0 ? "text-rose-600" : "text-emerald-600"
                        }`}
                      >
                        {item.cost_deviation != null ? fmtPP(costDevNum) : "—"}
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap text-gray-700">
                        {item.overall_margin_actual != null
                          ? `${fmt(item.overall_margin_actual)}%`
                          : item.overall_actual != null
                          ? `${fmt(item.overall_actual)}%`
                          : "—"}
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap text-gray-700">
                        {item.overall_target_pf != null
                          ? `${fmt(item.overall_target_pf)}%`
                          : item.overall_target != null
                          ? `${fmt(item.overall_target)}%`
                          : "—"}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-rose-700 whitespace-nowrap">
                        {item.notional_loss != null
                          ? item.notional_loss >= 100000
                            ? fmtLakhs(item.notional_loss)
                            : `₹${item.notional_loss.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
                          : "—"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={14}
                    className="py-6 text-center text-gray-400 font-bold text-xs bg-slate-50/30"
                  >
                    {selectedFamily
                      ? `No non-standard SKU deviations found for "${selectedFamily}" in ${activeQuarter}.`
                      : "No non-standard SKU data available for this quarter."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 2. Standard SKUs ── */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm overflow-hidden">
        <div className="pb-3 border-b border-gray-100 mb-4 flex items-center justify-between">
          <h4 className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">
            Standard SKUs — price / cost deviations
          </h4>
          <span className="text-[10px] text-gray-400 font-bold">
            {standardRows.length} rows
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-gray-150 bg-gray-55 text-gray-500 font-bold uppercase text-[9px] tracking-wider">
                <th className="py-2.5 px-3">PF</th>
                <th className="py-2.5 px-3 text-center">Order No</th>
                <th className="py-2.5 px-3 text-center">Item Code</th>
                <th className="py-2.5 px-3 w-72">Description</th>
                <th className="py-2.5 px-3">Channel / Direct</th>
                <th className="py-2.5 px-3 text-right">List Price</th>
                <th className="py-2.5 px-3 text-right">Actual Price</th>
                <th className="py-2.5 px-3 text-right">Price Deviation</th>
                <th className="py-2.5 px-3 text-right">List Cost</th>
                <th className="py-2.5 px-3 text-right">Actual Cost</th>
                <th className="py-2.5 px-3 text-right">Cost Deviation</th>
                <th className="py-2.5 px-3 text-right">Overall margin (actual)</th>
                <th className="py-2.5 px-3 text-right">PF target (overall)</th>
                <th className="py-2.5 px-3 text-right">Notional loss (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {standardRows.length > 0 ? (
                standardRows.map((item, idx) => {
                  const priceDevNum = item.price_deviation ?? 0;
                  const costDevNum = item.cost_deviation ?? 0;
                  return (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-semibold text-gray-900 whitespace-nowrap">
                        {item.product_family}
                      </td>
                      <td className="py-2.5 px-3 text-center text-gray-500 whitespace-nowrap">
                        {item.order_no}
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        {item.item_code}
                      </td>
                      <td className="py-2.5 px-3 text-gray-600 leading-relaxed font-normal">
                        {item.description}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-gray-700">
                        {item.channel_direct ?? item.channel ?? item.channel_or_direct ?? "—"}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {item.list_price != null ? fmt(item.list_price, 2) : "—"}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {item.actual_price != null ? fmt(item.actual_price, 2) : "—"}
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right font-bold ${
                          priceDevNum < 0 ? "text-rose-600" : "text-emerald-600"
                        }`}
                      >
                        {item.price_deviation != null ? fmtPP(priceDevNum) : "—"}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {item.list_cost != null ? fmt(item.list_cost, 2) : "—"}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {item.actual_cost != null ? fmt(item.actual_cost, 2) : "—"}
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right font-bold ${
                          costDevNum < 0 ? "text-rose-600" : "text-emerald-600"
                        }`}
                      >
                        {item.cost_deviation != null ? fmtPP(costDevNum) : "—"}
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap text-gray-700">
                        {item.overall_margin_actual != null
                          ? `${fmt(item.overall_margin_actual)}%`
                          : item.overall_actual != null
                          ? `${fmt(item.overall_actual)}%`
                          : "—"}
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap text-gray-700">
                        {item.overall_target_pf != null
                          ? `${fmt(item.overall_target_pf)}%`
                          : item.overall_target != null
                          ? `${fmt(item.overall_target)}%`
                          : "—"}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-rose-700 whitespace-nowrap">
                        {item.notional_loss != null
                          ? item.notional_loss >= 100000
                            ? fmtLakhs(item.notional_loss)
                            : `₹${item.notional_loss.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
                          : "—"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={14}
                    className="py-6 text-center text-gray-400 font-bold text-xs bg-slate-50/30"
                  >
                    {selectedFamily
                      ? `No standard SKU deviations found for "${selectedFamily}" in ${activeQuarter}.`
                      : "No standard SKU data available for this quarter."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-start border-t border-gray-200 pt-6 mt-4">
        <button
          onClick={() => onNavigateToTab?.("qoq-matrix")}
          className="px-5 py-2 border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 rounded-lg text-xs font-semibold tracking-wide transition-colors shadow-sm"
        >
          Previous
        </button>
      </div>
    </div>
  );
};

export default SkuDrillDownTab;
