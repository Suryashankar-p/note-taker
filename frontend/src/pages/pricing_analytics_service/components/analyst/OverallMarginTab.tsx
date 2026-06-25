import React, { useState } from "react";
import MarginTrendChart from "./MarginTrendChart";
import RevenueCogsChart from "./RevenueCogsChart";
import { Sparkles, ArrowRight, AlertCircle } from "lucide-react";

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
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h3 className="text-sm font-bold tracking-tight text-gray-800">
              Heating Margins: QoQ view
            </h3>
            <p className="text-[11px] text-gray-400 font-semibold uppercase mt-0.5">
              Heating Spares — PMA target vs baseline by product family
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Window ending</span>
            <select
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-700 outline-none cursor-pointer focus:ring-1 focus:ring-[#a61c1e]"
            >
              <option>Q4 FY 26</option>
              <option>Q3 FY 26</option>
              <option>Q2 FY 26</option>
              <option>Q1 FY 26</option>
            </select>
          </div>
        </div>

        {/* 4 Cards representing the matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {["Q1 FY 26", "Q2 FY 26", "Q3 FY 26", "Q4 FY 26"].map((qName) => (
            <div key={qName} className="border border-gray-150 rounded-xl p-4 bg-slate-50/50 shadow-sm flex flex-col justify-between">
              <div className="text-center pb-3 border-b border-gray-100">
                <span className="text-xs font-extrabold text-gray-800 tracking-wide uppercase">{qName}</span>
                <div className="flex items-center justify-center gap-3 mt-1.5 text-[10px] font-bold">
                  <span className="text-rose-600">● B: 24/74 (31%)</span>
                  <span className="text-emerald-600">● A: 37/74 (50%)</span>
                </div>
              </div>

              {/* Heat Matrix Layout */}
              <div className="mt-4">
                <div className="text-center text-[8px] font-bold uppercase text-gray-400 mb-2">
                  ▲ Achieved gross margin (vs Baseline)
                </div>
                <div className="grid grid-cols-4 gap-1 text-center items-center">
                  {/* Row headers */}
                  <span className="text-[7px] font-bold text-gray-400 rotate-270 uppercase text-right leading-tight">Target vs Baseline</span>
                  <div className="bg-rose-50 border border-rose-100 p-2 rounded text-rose-800 flex flex-col">
                    <span className="text-xs font-bold">10</span>
                    <span className="text-[7px] opacity-70">11%</span>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 p-2 rounded text-amber-800 flex flex-col">
                    <span className="text-xs font-bold">13</span>
                    <span className="text-[7px] opacity-70">15%</span>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-100 p-2 rounded text-emerald-800 flex flex-col font-bold">
                    <span className="text-xs">15</span>
                    <span className="text-[7px] opacity-70">31%</span>
                  </div>

                  {/* Header labels */}
                  <span></span>
                  <span className="text-[8px] font-bold text-gray-400 uppercase">&lt; 0%</span>
                  <span className="text-[8px] font-bold text-gray-400 uppercase">0% to 5%</span>
                  <span className="text-[8px] font-bold text-gray-400 uppercase">&gt; 5%</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 text-center text-[9px] text-gray-400 font-semibold leading-tight">
                Cell top-left = # families; bottom-right = % revenue share.
              </div>
            </div>
          ))}
        </div>
      </div>

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
                <span className={`text-base font-extrabold tracking-tight ${
                  st.isPositive ? "text-emerald-600" : st.isNegative ? "text-rose-600" : "text-gray-800"
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
          <button className="mt-6 flex items-center justify-center gap-2 w-full py-2 bg-[#a61c1e] hover:bg-[#8e181a] text-white font-bold rounded-lg text-xs tracking-wide transition-colors">
            Ask GIA Co-pilot
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* 5. Business insights */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-bold tracking-tight text-gray-800 mb-6 pb-3 border-b border-gray-100 flex items-center gap-2">
          <AlertCircle size={16} className="text-[#a61c1e]" />
          Business insights
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Mix impact table */}
          <div className="flex flex-col">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">QoQ GM bridge (Q3 FY26 → Q4 FY26): % GM bridge</h4>
            <div className="border border-gray-100 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-gray-400 font-bold uppercase text-[9px] border-b border-gray-100">
                    <th className="py-2 px-3">Mix Impact Positive (Top 3)</th>
                    <th className="py-2 px-3 text-right">Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  <tr>
                    <td className="py-2 px-3 text-gray-700">HE (Coil)</td>
                    <td className="py-2 px-3 text-right text-emerald-600 font-bold">+1.4 pp</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-gray-700">IBH Tube</td>
                    <td className="py-2 px-3 text-right text-emerald-600 font-bold">+0.8 pp</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Margin impact table */}
          <div className="flex flex-col">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Margin impact (% GM)</h4>
            <div className="border border-gray-100 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-gray-400 font-bold uppercase text-[9px] border-b border-gray-100">
                    <th className="py-2 px-3">Margin Impact Positive (Top 3)</th>
                    <th className="py-2 px-3 text-right">Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  <tr>
                    <td className="py-2 px-3 text-gray-700">Fan Spares</td>
                    <td className="py-2 px-3 text-right text-emerald-600 font-bold">+1.4 pp</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-gray-700">HEAT EXCHANGER</td>
                    <td className="py-2 px-3 text-right text-emerald-600 font-bold">+0.4 pp</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverallMarginTab;
