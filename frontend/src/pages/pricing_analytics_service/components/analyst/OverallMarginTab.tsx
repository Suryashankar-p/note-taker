import React, { useState } from "react";
import MarginTrendChart from "../ceo/components/MarginTrendChart";
import RevenueVsCogsChart from "../ceo/components/RevenueVsCogsChart";
import { Sparkles, AlertCircle } from "lucide-react";
import HeatingMarginsGrid from "../ceo/components/HeatingMarginsGrid";

const mockOverallData = {
  bridge_table: [
    {
      segment: "overall",
      label: "Heating (Overall)",
      baseline_rev_cr: 17.1,
      baseline_gm_pct: 49.8,
      quarters: {
        "Q3 FY 25": { rev_cr: 18.9, gm_pct: 51.9 },
        "Q4 FY 25": { rev_cr: 24.1, gm_pct: 47.7 },
        "Q1 FY 26": { rev_cr: 15.2, gm_pct: 50.4 },
        "Q2 FY 26": { rev_cr: 20.7, gm_pct: 51.7 },
        "Q3 FY 26": { rev_cr: 21.0, gm_pct: 51.9 },
        "Q4 FY 26": { rev_cr: 21.8, gm_pct: 52.2 },
      },
    },
    {
      segment: "standard",
      label: "Standard",
      baseline_rev_cr: 8.1,
      baseline_gm_pct: 50.6,
      quarters: {
        "Q3 FY 25": { rev_cr: 9.3, gm_pct: 52.1 },
        "Q4 FY 25": { rev_cr: 10.2, gm_pct: 49.6 },
        "Q1 FY 26": { rev_cr: 8.4, gm_pct: 51.7 },
        "Q2 FY 26": { rev_cr: 9.3, gm_pct: 52.8 },
        "Q3 FY 26": { rev_cr: 10.0, gm_pct: 52.8 },
        "Q4 FY 26": { rev_cr: 9.2, gm_pct: 54.1 },
      },
    },
    {
      segment: "non_standard",
      label: "Non-standard",
      baseline_rev_cr: 9.0,
      baseline_gm_pct: 49.1,
      quarters: {
        "Q3 FY 25": { rev_cr: 9.6, gm_pct: 51.0 },
        "Q4 FY 25": { rev_cr: 13.9, gm_pct: 47.0 },
        "Q1 FY 26": { rev_cr: 6.9, gm_pct: 48.8 },
        "Q2 FY 26": { rev_cr: 11.4, gm_pct: 50.9 },
        "Q3 FY 26": { rev_cr: 11.0, gm_pct: 51.1 },
        "Q4 FY 26": { rev_cr: 12.7, gm_pct: 50.9 },
      },
    },
  ],
  margin_trend: [
    { quarter: "Q3 FY 25", overall_gm_pct: 51.6, standard_gm_pct: null, non_standard_gm_pct: 51.6 },
    { quarter: "Q4 FY 25", overall_gm_pct: 48.1, standard_gm_pct: null, non_standard_gm_pct: 48.1 },
    { quarter: "Q1 FY 26", overall_gm_pct: 50.3, standard_gm_pct: null, non_standard_gm_pct: 50.3 },
    { quarter: "Q2 FY 26", overall_gm_pct: 51.5, standard_gm_pct: null, non_standard_gm_pct: 51.5 },
    { quarter: "Q3 FY 26", overall_gm_pct: 51.9, standard_gm_pct: null, non_standard_gm_pct: 51.9 },
    { quarter: "Q4 FY 26", overall_gm_pct: 52.2, standard_gm_pct: 54.1, non_standard_gm_pct: 50.9 },
  ],
  revenue_vs_cogs: [
    { quarter: "Q3 FY 25", revenue_inr: 189000000, cogs_inr: 91300000 },
    { quarter: "Q4 FY 25", revenue_inr: 241300000, cogs_inr: 125200000 },
    { quarter: "Q1 FY 26", revenue_inr: 152500000, cogs_inr: 75700000 },
    { quarter: "Q2 FY 26", revenue_inr: 207300000, cogs_inr: 100500000 },
    { quarter: "Q3 FY 26", revenue_inr: 210300000, cogs_inr: 101100000 },
    { quarter: "Q4 FY 26", revenue_inr: 218300000, cogs_inr: 104200000 },
  ],
};

const OverallMarginTab = () => {
  const [selectedFamily, setSelectedFamily] = useState("All families (109)");

  const activeQuarters = ["Q3 FY 25", "Q4 FY 25", "Q1 FY 26", "Q2 FY 26", "Q3 FY 26", "Q4 FY 26"];
  const latestQuarter = "Q4 FY 26";

  const headers = [
    { label: "Baseline\n(Q4 FY24+Q1 FY25)", colSpan: 2 },
    ...activeQuarters.map((q) => ({ label: q, colSpan: 2 })),
  ];

  const subHeaders = Array(headers.length).fill(["Rev Cr", "GM %"]).flat();

  const rows = mockOverallData.bridge_table.map((item) => {
    const baselineGm = item.baseline_gm_pct;
    return {
      type: item.label,
      data: [
        {
          rev: item.baseline_rev_cr.toFixed(1),
          gm: `${item.baseline_gm_pct.toFixed(1)}%`,
          isGreen: false,
          isRed: false,
        },
        ...activeQuarters.map((q) => {
          const qData = item.quarters[q as keyof typeof item.quarters];
          const isGreen = qData.gm_pct > baselineGm;
          const isRed = qData.gm_pct < baselineGm;
          return {
            rev: qData.rev_cr.toFixed(1),
            gm: `${qData.gm_pct.toFixed(1)}%`,
            isGreen,
            isRed,
          };
        }),
      ],
    };
  });

  const stats = [
    { label: "HEATING REVENUE", value: "₹21.8 Cr" },
    { label: "OVERALL GM%", value: "52.2%" },
    { label: "Δ VS BASELINE", value: "+2.4%", isPositive: true },
    { label: "Δ VS HEATING TARGET", value: "-3.1%", isNegative: true },
    { label: "FAMILIES ABOVE TARGET", value: "21" },
    { label: "FAMILIES ABOVE BASELINE", value: "52" },
    { label: "FAMILIES BELOW TARGET", value: "54" },
  ];

  const topInsights = [
    "Heating GM improved +0.3% vs Q3 FY26 (51.9% → 52.2%) — about -3.2 pp from revenue mix.",
    "Fan Spares added the most to portfolio GM QoQ (+1.4 pp net: 0.0 mix, 1.4 margin).",
    "He (Shell) leads on target beat (+12.3%, 64.3% actual on 0.4% of quarter revenue).",
    "HE (Coil) gained the most revenue share (+2.5 pp vs Q3 FY26, now 20.7% of heating) at 51.7% GM.",
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
              <tr className="bg-slate-50 text-gray-500 font-extrabold uppercase text-[9px] border-b border-gray-150">
                <th rowSpan={2} className="py-3 px-4 font-bold text-gray-650 min-w-[140px]">
                  Segment
                </th>
                {headers.map((h, i) => (
                  <th
                    key={i}
                    colSpan={h.colSpan}
                    className={`py-2 px-2 text-center whitespace-pre-line font-bold ${
                      i % 2 === 0 ? "bg-slate-100/40 border-l border-gray-150" : ""
                    }`}
                  >
                    {h.label}
                  </th>
                ))}
              </tr>
              <tr className="bg-slate-50 text-gray-400 font-bold uppercase text-[8px] border-b border-gray-200">
                {subHeaders.map((sh, i) => (
                  <th
                    key={i}
                    className={`py-1.5 px-2 text-right ${i % 2 === 0 ? "border-l border-gray-100" : ""}`}
                  >
                    {sh}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {rows.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-slate-50/40">
                  <td className="py-3 px-4 font-bold text-gray-800 bg-gray-50/20">{row.type}</td>
                  {row.data.map((col, colIdx) => (
                    <React.Fragment key={colIdx}>
                      <td className="py-3 px-2 text-right border-l border-gray-100">{col.rev}</td>
                      <td
                        className={`py-3 px-2 text-right font-bold ${
                          col.isGreen ? "text-emerald-600" : col.isRed ? "text-rose-600" : "text-gray-700"
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
          <MarginTrendChart data={mockOverallData.margin_trend} />
          <RevenueVsCogsChart data={mockOverallData.revenue_vs_cogs} />
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
                <span className={`text-base font-extrabold tracking-tight ${st.isPositive ? "text-emerald-600" : st.isNegative ? "text-rose-600" : "text-gray-800"}`}>
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
              Strategic actions
            </h3>
            <ul className="flex flex-col gap-3.5 text-xs text-gray-300 leading-relaxed font-semibold">
              {topInsights.map((insight, idx) => (
                <li key={idx} className="flex gap-2.5 items-start">
                  <span className="text-[#a61c1e] mt-1 font-bold">▶</span>
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
          GM% Decomposition Analysis
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
                          <td className="py-2 px-2">1. Air nozzle</td>
                          <td className="py-2 px-2 text-right text-emerald-600 font-bold">+1.8 pp</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-2">2. Spiral</td>
                          <td className="py-2 px-2 text-right text-emerald-600 font-bold">+0.9 pp</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-2">3. level gauge 1</td>
                          <td className="py-2 px-2 text-right text-emerald-600 font-bold">+0.5 pp</td>
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
                          <td className="py-2 px-2">1. burner 3 (va)</td>
                          <td className="py-2 px-2 text-right text-rose-600 font-bold">-0.8 pp</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-2">2. fusible plug</td>
                          <td className="py-2 px-2 text-right text-rose-600 font-bold">-0.7 pp</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-2">3. damper</td>
                          <td className="py-2 px-2 text-right text-rose-600 font-bold">-0.4 pp</td>
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
              <span className="text-gray-700 font-medium">GM change absolute (INR) for Q3 FY26 → Q4 FY26.</span>
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
                        <tr>
                          <td className="py-2 px-2">1. HE (Coil)</td>
                          <td className="py-2 px-2 text-right text-emerald-600 font-bold">+₹45.6L</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-2">2. IBH Tube</td>
                          <td className="py-2 px-2 text-right text-emerald-600 font-bold">+₹28.4L</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-2">3. Burner 4 (VA Fab)</td>
                          <td className="py-2 px-2 text-right text-emerald-600 font-bold">+₹22.1L</td>
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
                          <th className="py-1.5 px-2 text-right">Impact (INR)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-medium text-gray-750">
                        <tr>
                          <td className="py-2 px-2">1. Gas train</td>
                          <td className="py-2 px-2 text-right text-rose-600 font-bold">-₹38.9L</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-2">2. HE (Bank Tubes)</td>
                          <td className="py-2 px-2 text-right text-rose-600 font-bold">-₹26.2L</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-2">3. Furnace</td>
                          <td className="py-2 px-2 text-right text-rose-600 font-bold">-₹18.4L</td>
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
                          <th className="py-1.5 px-2 text-right">Impact (INR)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-medium text-gray-750">
                        <tr>
                          <td className="py-2 px-2">1. Air nozzle</td>
                          <td className="py-2 px-2 text-right text-emerald-600 font-bold">+₹62.0L</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-2">2. Spiral</td>
                          <td className="py-2 px-2 text-right text-emerald-600 font-bold">+₹32.5L</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-2">3. level gauge 1</td>
                          <td className="py-2 px-2 text-right text-emerald-600 font-bold">+₹15.8L</td>
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
                          <th className="py-1.5 px-2 text-right">Impact (INR)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-medium text-gray-750">
                        <tr>
                          <td className="py-2 px-2">1. burner 3 (va)</td>
                          <td className="py-2 px-2 text-right text-rose-600 font-bold">-₹28.4L</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-2">2. fusible plug</td>
                          <td className="py-2 px-2 text-right text-rose-600 font-bold">-₹24.0L</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-2">3. damper</td>
                          <td className="py-2 px-2 text-right text-rose-600 font-bold">-₹12.3L</td>
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
