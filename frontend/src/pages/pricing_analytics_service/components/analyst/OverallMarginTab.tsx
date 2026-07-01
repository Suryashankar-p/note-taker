import React, { useState, useEffect } from "react";
import MarginTrendChart from "../ceo/components/MarginTrendChart";
import RevenueVsCogsChart from "../ceo/components/RevenueVsCogsChart";
import { Sparkles, ArrowRight, AlertCircle } from "lucide-react";
import HeatingMarginsGrid from "../ceo/components/HeatingMarginsGrid";
import { useGetOverallMargin, useGetBusinessInsights, useGetSkyscraper } from "../../services/query/query";

const OverallMarginTab = () => {
  const sessionId = Number(localStorage.getItem("pricing_session_id")) || 10;
  const { data: overallData, isLoading: isOverallLoading } = useGetOverallMargin(sessionId);
  const { data: skyscraperData, isLoading: isSkyLoading } = useGetSkyscraper(sessionId);
  const { data: insightsData, isLoading: isInsightsLoading } = useGetBusinessInsights(sessionId);

  const [selectedFamily, setSelectedFamily] = useState("All families (109)");

  const sortQuarters = (a: string, b: string) => {
    const matchA = a.match(/Q(\d) /);
    const matchB = b.match(/Q(\d) /);
    const yearA = a.match(/FY (\d+)/);
    const yearB = b.match(/FY (\d+)/);
    if (!matchA || !matchB || !yearA || !yearB) return 0;
    const qA = parseInt(matchA[1], 10);
    const yA = parseInt(yearA[1], 10);
    const qB = parseInt(matchB[1], 10);
    const yB = parseInt(yearB[1], 10);
    if (yA !== yB) return yA - yB;
    return qA - qB;
  };

  if (isOverallLoading || isSkyLoading || isInsightsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-700"></div>
      </div>
    );
  }

  const bridgeTable = overallData?.bridge_table || [];
  const activeQuarters = bridgeTable.length > 0 ? Object.keys(bridgeTable[0].quarters).sort(sortQuarters) : [];

  const headers = [
    { label: "Baseline\n(Q4 FY24+Q1 FY25)", colSpan: 2 },
    ...activeQuarters.map((q: string) => ({ label: q, colSpan: 2 })),
  ];

  const subHeaders = Array(headers.length).fill(["Rev Cr", "GM %"]).flat();

  const rows = bridgeTable.map((item: any) => {
    const baselineGm = item.baseline_gm_pct;
    return {
      type: item.label,
      data: [
        {
          rev: item.baseline_rev_cr !== null ? item.baseline_rev_cr.toFixed(1) : "-",
          gm: item.baseline_gm_pct !== null ? `${item.baseline_gm_pct.toFixed(1)}%` : "-",
          isGreen: false,
          isRed: false,
        },
        ...activeQuarters.map((q) => {
          const qData = item.quarters[q];
          if (!qData || qData.gm_pct === null) {
            return {
              rev: qData && qData.rev_cr !== null ? qData.rev_cr.toFixed(1) : "-",
              gm: "-",
              isGreen: false,
              isRed: false,
            };
          }
          const isGreen = qData.gm_pct > baselineGm;
          const isRed = qData.gm_pct < baselineGm;
          return {
            rev: qData.rev_cr !== null ? qData.rev_cr.toFixed(1) : "-",
            gm: `${qData.gm_pct.toFixed(1)}%`,
            isGreen,
            isRed,
          };
        }),
      ],
    };
  });

  // Calculate dynamic executive snapshots
  const heatingOverall = bridgeTable.find((row: any) => row.label === "Heating (Overall)");
  const latestQuarter = activeQuarters[activeQuarters.length - 1] || "";

  const latestRevenue = heatingOverall && latestQuarter ? heatingOverall.quarters[latestQuarter]?.rev_cr || 0 : 0;
  const latestGm = heatingOverall && latestQuarter ? heatingOverall.quarters[latestQuarter]?.gm_pct || 0 : 0;
  const baselineGmOverall = heatingOverall ? heatingOverall.baseline_gm_pct || 0 : 0;

  const deltaVsBaseline = latestGm - baselineGmOverall;
  const heatingTarget = 55.3;
  const deltaVsTarget = latestGm - heatingTarget;

  const rawFamilies = skyscraperData?.[latestQuarter] || [];
  const familiesAboveTarget = rawFamilies.filter((fam: any) => fam.actual_gm_pct >= fam.target_gm_pct).length;
  const familiesBelowTarget = rawFamilies.filter((fam: any) => fam.actual_gm_pct < fam.target_gm_pct).length;
  const familiesAboveBaseline = rawFamilies.filter((fam: any) => fam.actual_gm_pct >= fam.baseline_gm_pct).length;

  const stats = [
    { label: "HEATING REVENUE", value: `₹${latestRevenue.toFixed(1)} Cr` },
    { label: "OVERALL GM%", value: `${latestGm.toFixed(1)}%` },
    { label: "Δ VS BASELINE", value: `${deltaVsBaseline >= 0 ? "+" : ""}${deltaVsBaseline.toFixed(1)}%`, isPositive: deltaVsBaseline >= 0, isNegative: deltaVsBaseline < 0 },
    { label: `Δ VS HEATING TARGET (${heatingTarget.toFixed(1)}%)`, value: `${deltaVsTarget >= 0 ? "+" : ""}${deltaVsTarget.toFixed(1)}%`, isPositive: deltaVsTarget >= 0, isNegative: deltaVsTarget < 0 },
    { label: "FAMILIES ABOVE TARGET", value: String(familiesAboveTarget) },
    { label: "FAMILIES ABOVE BASELINE", value: String(familiesAboveBaseline) },
    { label: "FAMILIES BELOW TARGET", value: String(familiesBelowTarget) },
  ];

  const topInsights = insightsData && insightsData.length > 0 ? insightsData : [
    "Heating GM improved +0.3% vs Q3 FY26 (51.9% → 52.2%) — about -3.2 pp from revenue mix.",
    "Fan Spares added the most to portfolio GM QoQ (+1.4 pp net: 0.0 mix, 1.4 margin).",
    "He (Shell) leads on target beat (+12.3%, 64.3% actual on 0.4% of quarter revenue).",
    "HE (Coil) gained the most revenue share (+2.5 pp vs Q3 FY26, now 20.7% of heating) at 51.7% GM."
  ];

  return (
    <div className="flex flex-col gap-8 text-gray-800 pb-12">
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold tracking-tight text-gray-850">
            Heating — overall QoQ (standard vs non-standard)
          </h3>
          <span className="text-[10px] bg-red-50 text-red-700 px-2 py-0.5 rounded font-bold uppercase tracking-wide border border-red-200">
            Internal Operations
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-55 text-gray-500 font-bold uppercase text-[9px] tracking-wider">
                <th className="py-3 px-4">Segment</th>
                {headers.map((h, i) => (
                  <th
                    key={i}
                    colSpan={h.colSpan}
                    className="py-3 px-4 text-center border-l border-gray-100 whitespace-pre-line"
                  >
                    {h.label}
                  </th>
                ))}
              </tr>
              <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase text-[8px] tracking-wider bg-gray-50/30">
                <th className="py-1.5 px-4"></th>
                {subHeaders.map((sh, i) => (
                  <th
                    key={i}
                    className={`py-1.5 px-2 text-right ${i % 2 === 0 ? "border-l border-gray-100" : ""
                      }`}
                  >
                    {sh}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {rows.map((row: any, rowIdx: number) => (
                <tr key={rowIdx} className="hover:bg-slate-50/40">
                  <td className="py-3 px-4 font-bold text-gray-800 bg-gray-50/20">{row.type}</td>
                  {row.data.map((col: any, colIdx: number) => (
                    <React.Fragment key={colIdx}>
                      <td className="py-3 px-2 text-right border-l border-gray-100">{col.rev}</td>
                      <td
                        className={`py-3 px-2 text-right font-bold ${col.isGreen ? "text-emerald-600" : col.isRed ? "text-rose-600" : "text-gray-700"
                          }`}
                      >
                        {col.gm}
                      </td>
                    </React.Fragment>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-slate-100/50 border border-gray-200 rounded-xl p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Product families</span>
            <select
              value={selectedFamily}
              onChange={(e) => setSelectedFamily(e.target.value)}
              className="bg-white border border-gray-200 rounded-md px-3 py-1.5 text-xs font-semibold text-[#a61c1e] focus:outline-none focus:ring-1 focus:ring-[#a61c1e] cursor-pointer shadow-sm"
            >
              <option>All families (109)</option>
              <option>Spares & Fans</option>
              <option>Burners</option>
              <option>Boilers</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MarginTrendChart data={overallData?.margin_trend} />
          <RevenueVsCogsChart data={overallData?.revenue_vs_cogs} />
        </div>
      </div>

      <HeatingMarginsGrid />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="text-sm font-bold tracking-tight text-gray-800">
              Executive snapshot
            </h3>
            <span className="text-xs font-bold text-[#a61c1e] bg-red-50 border border-red-100 px-2 py-0.5 rounded">
              {latestQuarter}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map((st) => (
              <div key={st.label} className="border border-gray-100 rounded-xl p-4 bg-slate-50/50 shadow-sm flex flex-col justify-between">
                <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wide leading-tight mb-2">
                  {st.label}
                </span>
                <span className={`text-base font-extrabold tracking-tight ${st.isPositive ? "text-emerald-600" : st.isNegative ? "text-rose-600" : "text-gray-800"
                  }`}>
                  {st.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#131517] text-white border border-[#202226] rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold tracking-tight text-white mb-4 border-b border-[#202226] pb-3 flex items-center gap-2">
              <Sparkles size={16} className="text-[#a61c1e]" />
              TOP INSIGHTS — {latestQuarter}
            </h3>
            <ul className="space-y-4 text-xs font-medium text-gray-300">
              {topInsights.map((insight: string, idx: number) => (
                <li key={idx} className="flex gap-2">
                  <span className="text-[#a61c1e] font-bold">{idx + 1}.</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-bold tracking-tight text-gray-800 mb-6 pb-3 border-b border-gray-100 flex items-center gap-2">
          <AlertCircle size={16} className="text-[#a61c1e]" />
          Business insights
        </h3>

        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <div className="bg-[#e6f4f1] text-[#0d9488] p-3 rounded-lg text-xs font-bold leading-relaxed border border-[#ccfbf1]">
              <span className="font-extrabold uppercase">QoQ GM bridge (Q3 FY 26 → Q4 FY 26): % GM bridge</span>
              {" — "}
              <span className="text-gray-700 font-medium">GM% +0.3 pp (51.9% → 52.2%). Mix -3.2 pp + margin +3.5 pp = +0.3 pp (check vs ΔGM%).</span>
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
                        <tr>
                          <td className="py-2 px-2">1. HE (Coil)</td>
                          <td className="py-2 px-2 text-right text-emerald-600 font-bold">+1.4 pp</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-2">2. IBH Tube</td>
                          <td className="py-2 px-2 text-right text-emerald-600 font-bold">+0.8 pp</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-2">3. Burner 4 (VA Fab)</td>
                          <td className="py-2 px-2 text-right text-emerald-600 font-bold">+0.6 pp</td>
                        </tr>
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
                        <tr>
                          <td className="py-2 px-2">1. Gas train</td>
                          <td className="py-2 px-2 text-right text-rose-600 font-bold">-1.2 pp</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-2">2. HE (Bank Tubes)</td>
                          <td className="py-2 px-2 text-right text-rose-600 font-bold">-0.8 pp</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-2">3. Furnace</td>
                          <td className="py-2 px-2 text-right text-rose-600 font-bold">-0.6 pp</td>
                        </tr>
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
                        <tr>
                          <td className="py-2 px-2">1. Fan Spares</td>
                          <td className="py-2 px-2 text-right text-emerald-600 font-bold">+1.4 pp</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-2">2. NA</td>
                          <td className="py-2 px-2 text-right text-emerald-600 font-bold">+0.7 pp</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-2">3. HEAT EXCHANGER</td>
                          <td className="py-2 px-2 text-right text-emerald-600 font-bold">+0.4 pp</td>
                        </tr>
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
                        <tr>
                          <td className="py-2 px-2">1. HE (Coil)</td>
                          <td className="py-2 px-2 text-right text-rose-600 font-bold">-0.6 pp</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-2">2. APH</td>
                          <td className="py-2 px-2 text-right text-rose-600 font-bold">-0.3 pp</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-2">3. IBH Tube</td>
                          <td className="py-2 px-2 text-right text-rose-600 font-bold">-0.3 pp</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          <div className="flex flex-col gap-4">
            <div className="bg-[#e6f4f1] text-[#0d9488] p-3 rounded-lg text-xs font-bold leading-relaxed border border-[#ccfbf1]">
              <span className="font-extrabold uppercase">Absolute GM bridge</span>
              {" — "}
              <span className="text-gray-700 font-medium">AGM +₹48.6 L (₹10.9 Cr → ₹11.4 Cr). Mix -₹27.4 L + margin +₹76.0 L = +₹48.6 L.</span>
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
                          <th className="py-1.5 px-2 text-right">Impact</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-medium text-gray-755">
                        <tr>
                          <td className="py-2 px-2">1. HE (Coil)</td>
                          <td className="py-2 px-2 text-right text-emerald-600 font-bold">+₹37.4 L</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-2">2. IBH Tube</td>
                          <td className="py-2 px-2 text-right text-emerald-600 font-bold">+₹17.3 L</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-2">3. Burner 4 (VA Fab)</td>
                          <td className="py-2 px-2 text-right text-emerald-600 font-bold">+₹13.2 L</td>
                        </tr>
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
                      <tbody className="divide-y divide-gray-100 font-medium text-gray-755">
                        <tr>
                          <td className="py-2 px-2">1. Gas train</td>
                          <td className="py-2 px-2 text-right text-rose-600 font-bold">-₹23.8 L</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-2">2. HE (Bank Tubes)</td>
                          <td className="py-2 px-2 text-right text-rose-600 font-bold">-₹16.0 L</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-2">3. Furnace</td>
                          <td className="py-2 px-2 text-right text-rose-600 font-bold">-₹13.1 L</td>
                        </tr>
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
                          <th className="py-1.5 px-2 text-right">Impact</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-medium text-gray-755">
                        <tr>
                          <td className="py-2 px-2">1. Fan Spares</td>
                          <td className="py-2 px-2 text-right text-emerald-600 font-bold">+₹29.6 L</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-2">2. NA</td>
                          <td className="py-2 px-2 text-right text-emerald-600 font-bold">+₹16.3 L</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-2">3. HEAT EXCHANGER</td>
                          <td className="py-2 px-2 text-right text-emerald-600 font-bold">+₹9.7 L</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Negative */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] text-rose-600 font-bold uppercase tracking-wide">Negative (Top 3)</span>
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-gray-400 font-bold uppercase text-[8px] border-b border-gray-150">
                          <th className="py-1.5 px-2">Family</th>
                          <th className="py-1.5 px-2 text-right">Impact</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-medium text-gray-755">
                        <tr>
                          <td className="py-2 px-2">1. HE (Coil)</td>
                          <td className="py-2 px-2 text-right text-rose-600 font-bold">-₹12.7 L</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-2">2. APH</td>
                          <td className="py-2 px-2 text-right text-rose-600 font-bold">-₹7.5 L</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-2">3. IBH Tube</td>
                          <td className="py-2 px-2 text-right text-rose-600 font-bold">-₹6.2 L</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverallMarginTab;
