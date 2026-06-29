import React, { useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SkyscraperTab = () => {
  const [compareVs, setCompareVs] = useState("target");
  const [selectedQuarter, setSelectedQuarter] = useState("Q4 FY 26");
  // Sample data for 75 product families margin delta vs target
  // Alternating positive deltas and negative deltas
  const chartLabels = Array.from({ length: 45 }, (_, i) => `Family ${i + 1}`);
  const chartDeltas = [
    12.3, 10.3, 8.0, 5.8, 5.4, 5.2, 4.8, 4.3, 4.3, 3.5, 2.7, 1.8, 1.0, 0.5, 0.2,
    -0.1, -0.4, -0.9, -1.2, -1.8, -2.1, -2.5, -3.0, -3.2, -3.8, -4.1, -4.5, -5.0,
    -5.4, -5.8, -6.1, -6.5, -7.0, -7.8, -8.2, -8.9, -9.5, -10.1, -11.0, -11.7,
    -12.5, -13.2, -15.0, -17.4, -19.1
  ];

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: "Margin Delta (pp)",
        data: chartDeltas,
        backgroundColor: chartDeltas.map((val) =>
          val >= 0 ? "rgba(16, 185, 129, 0.75)" : "rgba(225, 29, 72, 0.75)"
        ),
        borderRadius: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#1e293b",
        callbacks: {
          label: (context: any) => `Delta: ${context.parsed.y > 0 ? "+" : ""}${context.parsed.y} pp`,
        },
      },
    },
    scales: {
      y: {
        ticks: {
          color: "#64748b",
          callback: (value: any) => `${value > 0 ? "+" : ""}${value} pp`,
        },
        grid: {
          color: "#f1f5f9",
        },
      },
      x: {
        display: false, // Hide individual family names for clean view
      },
    },
  };

  const tableData = [
    { name: "He (Shell)", actual: "64.3%", target: "52.0%", delta: "+12.3", revenue: "₹9.02L", share: "0.4%" },
    { name: "Furnace", actual: "74.6%", target: "64.3%", delta: "+10.3", revenue: "₹0.57L", share: "0.0%" },
    { name: "ID Fan", actual: "51.9%", target: "45.9%", delta: "+8.0", revenue: "₹21.67L", share: "1.0%" },
    { name: "VALVE 2 (VA)", actual: "65.8%", target: "60.0%", delta: "+5.8", revenue: "₹3.71L", share: "0.2%" },
    { name: "Pneumatic Cylinder", actual: "61.7%", target: "56.3%", delta: "+5.4", revenue: "₹5.00L", share: "0.2%" },
    { name: "Screw Feeder", actual: "63.3%", target: "58.1%", delta: "+5.2", revenue: "₹11.37L", share: "0.5%" },
    { name: "HE (MPA)", actual: "56.8%", target: "52.0%", delta: "+4.8", revenue: "₹74.34L", share: "3.4%" },
    { name: "WEGMAN CONE", actual: "64.2%", target: "59.9%", delta: "+4.3", revenue: "₹37.98L", share: "1.7%" },
    { name: "Sight Glass", actual: "63.8%", target: "59.5%", delta: "+4.3", revenue: "₹0.16L", share: "0.0%" },
    { name: "Hardware & Fitting", actual: "74.0%", target: "70.5%", delta: "+3.5", revenue: "₹2.47L", share: "0.1%" },
  ];

  return (
    <div className="flex flex-col gap-8 text-gray-800 pb-12">
      {/* 1. Main Skyscraper Graph Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-gray-100 gap-4">
          <div>
            <h3 className="text-sm font-bold tracking-tight text-gray-850">
              Skyscraper — margin delta vs target × revenue share
            </h3>
            <p className="text-[11px] text-gray-400 font-semibold uppercase mt-0.5">
              75 families — <strong>21 above target</strong> — <strong>54 below target</strong> (Δ = actual - target, pp).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
            {/* Compare Vs Selection Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setCompareVs("target")}
                className={`px-3 py-1 rounded-md transition-all ${
                  compareVs === "target" ? "bg-white text-[#a61c1e] shadow-sm" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Target (PMA)
              </button>
              <button
                onClick={() => setCompareVs("baseline")}
                className={`px-3 py-1 rounded-md transition-all ${
                  compareVs === "baseline" ? "bg-white text-[#a61c1e] shadow-sm" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Baseline (file)
              </button>
            </div>

            {/* Quarter Selector */}
            <select
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(e.target.value)}
              className="bg-gray-50 border border-gray-250 rounded-lg px-2.5 py-1 text-gray-700 outline-none cursor-pointer"
            >
              <option>Q4 FY 26</option>
              <option>Q3 FY 26</option>
              <option>Q2 FY 26</option>
              <option>Q1 FY 26</option>
            </select>
          </div>
        </div>

        {/* Skyscraper Chart Area */}
        <div className="h-72">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* 2. Skyscraper Insights Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            title: "Largest gap vs target",
            desc: "Fan at -19.1 pp below PMA (₹44.92L, 2.1% of quarter revenue). So what: this family alone is the single biggest target miss in Q4 FY 26.",
            borderColor: "border-teal-200 bg-teal-50/50 text-teal-800",
          },
          {
            title: "Highest revenue below target",
            desc: "HE (Coil) — ₹450.84L at -11.7 pp (20.7% share). So what: even if not the deepest miss, its size makes it the main lever to lift heating GM.",
            borderColor: "border-teal-200 bg-teal-50/50 text-teal-800",
          },
          {
            title: "Chronic drag",
            desc: "HE (Coil) (20.7% share, -11.7 pp); Tube (3.9% share, -6.5 pp); pump 1 (3.5% share, -3.2 pp); Burner 1 (4.9% share, -1.8 pp) (+ 1 more) — below target for 3 consecutive quarters.",
            borderColor: "border-teal-200 bg-teal-50/50 text-teal-800",
          },
          {
            title: "HE (Coil) — diagnosis",
            desc: "Standard GM 65.0% (16% of family rev) vs non-standard 49.1%. Non-standard mix is the primary drag — bespoke / non-catalogue volume is running below PMA target.",
            borderColor: "border-teal-200 bg-teal-50/50 text-teal-800",
          },
        ].map((alert, idx) => (
          <div key={idx} className={`border rounded-xl p-5 shadow-xs ${alert.borderColor}`}>
            <h4 className="text-xs font-extrabold uppercase tracking-wider mb-2">{alert.title}</h4>
            <p className="text-[11px] leading-relaxed opacity-90">{alert.desc}</p>
          </div>
        ))}
      </div>

      {/* 3. Product Families detailed table */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-bold tracking-tight text-gray-800 mb-4 pb-3 border-b border-gray-100">
          Product families — {selectedQuarter}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-gray-500 font-bold uppercase text-[9px] tracking-wider">
                <th className="py-3 px-4">Product Family</th>
                <th className="py-3 px-4 text-right">Actual GM %</th>
                <th className="py-3 px-4 text-right">Target GM %</th>
                <th className="py-3 px-4 text-right">Δ (PP)</th>
                <th className="py-3 px-4 text-right">Revenue (L)</th>
                <th className="py-3 px-4 text-right">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {tableData.map((row, idx) => {
                const isPositive = row.delta.startsWith("+");
                return (
                  <tr key={idx} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-4 font-semibold text-gray-900">{row.name}</td>
                    <td className="py-2.5 px-4 text-right">{row.actual}</td>
                    <td className="py-2.5 px-4 text-right">{row.target}</td>
                    <td className={`py-2.5 px-4 text-right font-bold ${isPositive ? "text-emerald-600" : "text-rose-600"}`}>
                      {row.delta}
                    </td>
                    <td className="py-2.5 px-4 text-right">{row.revenue}</td>
                    <td className="py-2.5 px-4 text-right">{row.share}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SkyscraperTab;
