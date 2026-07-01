import React, { useState } from "react";
import MarginTrendChart from "./MarginTrendChart";
import RevenueCogsChart from "./RevenueCogsChart";
import { Sparkles, ArrowRight, AlertCircle } from "lucide-react";
import HeatingMarginsGrid from "../ceo/components/HeatingMarginsGrid";

const OverallMarginTab = () => {
  const [selectedFamily, setSelectedFamily] = useState("All families (109)");
  const [selectedQuarter, setSelectedQuarter] = useState("Q4 FY 26");

  // Executive snapshot metrics
  const stats = [
    { label: "HEATING REVENUE", value: "₹21.8 Cr", change: "" },
    { label: "OVERALL GM%", value: "52.2%", change: "" },
    { label: "Δ VS BASELINE", value: "+2.4%", change: "", isPositive: true },
    { label: "Δ VS HEATING TARGET (55.3%)", value: "-3.1%", change: "", isNegative: true },
    { label: "FAMILIES ABOVE TARGET", value: "21", change: "" },
    { label: "FAMILIES ABOVE BASELINE", value: "52", change: "" },
    { label: "FAMILIES BELOW TARGET", value: "54", change: "" },
  ];

  return (
    <div className="flex flex-col gap-8 text-gray-800 pb-12">
      {/* 1. QoQ Table Card */}
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
              <tr className="border-b border-gray-100 bg-gray-50/70 text-gray-500 font-bold uppercase text-[9px] tracking-wider">
                <th className="py-3 px-4">Segment</th>
                <th className="py-3 px-4 text-center border-l border-gray-100" colSpan={2}>Baseline (Q4 FY24+Q1 FY25)</th>
                <th className="py-3 px-4 text-center border-l border-gray-100" colSpan={2}>Q3 FY 25</th>
                <th className="py-3 px-4 text-center border-l border-gray-100" colSpan={2}>Q4 FY 25</th>
                <th className="py-3 px-4 text-center border-l border-gray-100" colSpan={2}>Q1 FY 26</th>
                <th className="py-3 px-4 text-center border-l border-gray-100" colSpan={2}>Q2 FY 26</th>
                <th className="py-3 px-4 text-center border-l border-gray-100" colSpan={2}>Q3 FY 26</th>
                <th className="py-3 px-4 text-center border-l border-gray-100" colSpan={2}>Q4 FY 26</th>
              </tr>
              <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase text-[8px] tracking-wider bg-gray-50/30">
                <th className="py-1.5 px-4"></th>
                <th className="py-1.5 px-2 text-right border-l border-gray-100">Rev Cr</th>
                <th className="py-1.5 px-2 text-right">GM %</th>
                <th className="py-1.5 px-2 text-right border-l border-gray-100">Rev Cr</th>
                <th className="py-1.5 px-2 text-right">GM %</th>
                <th className="py-1.5 px-2 text-right border-l border-gray-100">Rev Cr</th>
                <th className="py-1.5 px-2 text-right">GM %</th>
                <th className="py-1.5 px-2 text-right border-l border-gray-100">Rev Cr</th>
                <th className="py-1.5 px-2 text-right">GM %</th>
                <th className="py-1.5 px-2 text-right border-l border-gray-100">Rev Cr</th>
                <th className="py-1.5 px-2 text-right">GM %</th>
                <th className="py-1.5 px-2 text-right border-l border-gray-100">Rev Cr</th>
                <th className="py-1.5 px-2 text-right">GM %</th>
                <th className="py-1.5 px-2 text-right border-l border-gray-100">Rev Cr</th>
                <th className="py-1.5 px-2 text-right">GM %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              <tr>
                <td className="py-3 px-4 font-bold text-gray-900 bg-gray-50/20">Heating (Overall)</td>
                <td className="py-3 px-2 text-right border-l border-gray-100">17.1</td>
                <td className="py-3 px-2 text-right text-gray-700">49.8%</td>
                <td className="py-3 px-2 text-right border-l border-gray-100">18.9</td>
                <td className="py-3 px-2 text-right text-emerald-600 font-bold">51.9%</td>
                <td className="py-3 px-2 text-right border-l border-gray-100">24.1</td>
                <td className="py-3 px-2 text-right text-rose-600 font-bold">47.7%</td>
                <td className="py-3 px-2 text-right border-l border-gray-100">15.2</td>
                <td className="py-3 px-2 text-right text-emerald-600 font-bold">50.4%</td>
                <td className="py-3 px-2 text-right border-l border-gray-100">20.7</td>
                <td className="py-3 px-2 text-right text-emerald-600 font-bold">51.7%</td>
                <td className="py-3 px-2 text-right border-l border-gray-100">21.0</td>
                <td className="py-3 px-2 text-right text-emerald-600 font-bold">51.9%</td>
                <td className="py-3 px-2 text-right border-l border-gray-100">21.8</td>
                <td className="py-3 px-2 text-right text-emerald-600 font-bold">52.2%</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-gray-600 pl-6">Standard</td>
                <td className="py-3 px-2 text-right border-l border-gray-100">8.1</td>
                <td className="py-3 px-2 text-right text-gray-600">50.8%</td>
                <td className="py-3 px-2 text-right border-l border-gray-100">9.3</td>
                <td className="py-3 px-2 text-right text-emerald-600 font-bold">52.1%</td>
                <td className="py-3 px-2 text-right border-l border-gray-100">10.2</td>
                <td className="py-3 px-2 text-right text-rose-600 font-bold">49.8%</td>
                <td className="py-3 px-2 text-right border-l border-gray-100">8.4</td>
                <td className="py-3 px-2 text-right text-emerald-600 font-bold">51.7%</td>
                <td className="py-3 px-2 text-right border-l border-gray-100">9.3</td>
                <td className="py-3 px-2 text-right text-emerald-600 font-bold">52.8%</td>
                <td className="py-3 px-2 text-right border-l border-gray-100">10.0</td>
                <td className="py-3 px-2 text-right text-emerald-600 font-bold">52.8%</td>
                <td className="py-3 px-2 text-right border-l border-gray-100">9.2</td>
                <td className="py-3 px-2 text-right text-emerald-600 font-bold">54.1%</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-gray-600 pl-6">Non-standard</td>
                <td className="py-3 px-2 text-right border-l border-gray-100">9.0</td>
                <td className="py-3 px-2 text-right text-gray-600">49.1%</td>
                <td className="py-3 px-2 text-right border-l border-gray-100">9.6</td>
                <td className="py-3 px-2 text-right text-emerald-600 font-bold">51.0%</td>
                <td className="py-3 px-2 text-right border-l border-gray-100">13.9</td>
                <td className="py-3 px-2 text-right text-rose-600 font-bold">47.0%</td>
                <td className="py-3 px-2 text-right border-l border-gray-100">8.9</td>
                <td className="py-3 px-2 text-right text-rose-600 font-bold">48.8%</td>
                <td className="py-3 px-2 text-right border-l border-gray-100">11.4</td>
                <td className="py-3 px-2 text-right text-emerald-600 font-bold">50.9%</td>
                <td className="py-3 px-2 text-right border-l border-gray-100">11.0</td>
                <td className="py-3 px-2 text-right text-emerald-600 font-bold">51.1%</td>
                <td className="py-3 px-2 text-right border-l border-gray-100">12.7</td>
                <td className="py-3 px-2 text-right text-emerald-600 font-bold">50.5%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Charts Section - Row */}
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
          <MarginTrendChart selectedFamily={selectedFamily} />
          <RevenueCogsChart />
        </div>
      </div>

      {/* 3. Margins QoQ view Heatmap grid */}
      <HeatingMarginsGrid />

      {/* 4. Executive snapshot and insights row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Metric Cards Box */}
        <div className="xl:col-span-2 bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="text-sm font-bold tracking-tight text-gray-800">
              Executive snapshot
            </h3>
            <span className="text-xs font-bold text-[#a61c1e] bg-red-50 border border-red-100 px-2 py-0.5 rounded">
              Q4 FY 26
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

        {/* Top Insights Box */}
        <div className="bg-[#131517] text-white border border-[#202226] rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold tracking-tight text-white mb-4 border-b border-[#202226] pb-3 flex items-center gap-2">
              <Sparkles size={16} className="text-[#a61c1e]" />
              TOP INSIGHTS — Q4 FY 26
            </h3>
            <ul className="space-y-4 text-xs font-medium text-gray-300">
              <li className="flex gap-2">
                <span className="text-[#a61c1e] font-bold">1.</span>
                <span>Heating GM improved <strong>+0.3% vs Q3 FY26</strong> (51.9% → 52.2%) — about -3.2 pp from revenue mix.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#a61c1e] font-bold">2.</span>
                <span>Fan Spares added the most to portfolio GM QoQ (<strong>+1.4 pp net</strong>: 0.0 mix, 1.4 margin).</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#a61c1e] font-bold">3.</span>
                <span>He (Shell) leads on target beat (+12.3%, 64.3% actual on 0.4% of quarter revenue).</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#a61c1e] font-bold">4.</span>
                <span>HE (Coil) gained the most revenue share (+2.5 pp vs Q3 FY26, now 20.7% of heating) at 51.7% GM.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 5. Business insights */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-bold tracking-tight text-gray-800 mb-6 pb-3 border-b border-gray-100 flex items-center gap-2">
          <AlertCircle size={16} className="text-[#a61c1e]" />
          Business insights
        </h3>

        <div className="flex flex-col gap-8">
          {/* Section 1: QoQ GM Bridge */}
          <div className="flex flex-col gap-4">
            <div className="bg-[#e6f4f1] text-[#0d9488] p-3 rounded-lg text-xs font-bold leading-relaxed border border-[#ccfbf1]">
              <span className="font-extrabold uppercase">QoQ GM bridge (Q3 FY 26 → Q4 FY 26): % GM bridge</span>
              {" — "}
              <span className="text-gray-700 font-medium">GM% +0.3 pp (51.9% → 52.2%). Mix -3.2 pp + margin +3.5 pp = +0.3 pp (check vs ΔGM%).</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Mix Impact (% GM) */}
              <div className="flex flex-col gap-3">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Mix impact (% GM)</span>
                <div className="grid grid-cols-2 gap-6">
                  {/* Positive */}
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

              {/* Margin Impact (% GM) */}
              <div className="flex flex-col gap-3">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Margin impact (% GM)</span>
                <div className="grid grid-cols-2 gap-6">
                  {/* Positive */}
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

          {/* Section 2: Absolute GM Bridge */}
          <div className="flex flex-col gap-4">
            <div className="bg-[#e6f4f1] text-[#0d9488] p-3 rounded-lg text-xs font-bold leading-relaxed border border-[#ccfbf1]">
              <span className="font-extrabold uppercase">Absolute GM bridge</span>
              {" — "}
              <span className="text-gray-700 font-medium">AGM +₹48.6 L (₹10.9 Cr → ₹11.4 Cr). Mix -₹27.4 L + margin +₹76.0 L = +₹48.6 L.</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Mix Impact (Absolute ₹) */}
              <div className="flex flex-col gap-3">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Mix impact (absolute ₹)</span>
                <div className="grid grid-cols-2 gap-6">
                  {/* Positive */}
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

              {/* Margin Impact (Absolute ₹) */}
              <div className="flex flex-col gap-3">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Margin impact (absolute ₹)</span>
                <div className="grid grid-cols-2 gap-6">
                  {/* Positive */}
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
