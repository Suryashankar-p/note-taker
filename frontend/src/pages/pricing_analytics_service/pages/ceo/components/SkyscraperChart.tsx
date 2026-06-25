import React, { useState } from "react";

const SkyscraperChart = () => {
  const [compareMode, setCompareMode] = useState<"target" | "baseline">("target");
  const [zoom, setZoom] = useState(100);

  // Generate 75 mock vertical deltas to represent the skyscraper visualization
  const dataPoints = Array.from({ length: 75 }, (_, i) => {
    if (i < 21) {
      return { val: 12 - (i * 0.4) + Math.random() * 0.5, type: "positive" };
    }
    return { val: -0.2 - ((i - 21) * 0.4) - Math.random() * 1.5, type: "negative" };
  });

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
        <div>
          <h2 className="text-base font-bold text-gray-900">Skyscraper — margin delta vs target × revenue share</h2>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setCompareMode("target")}
              className={`px-3 py-1 rounded text-xs font-bold transition-all border ${
                compareMode === "target"
                  ? "bg-[#a61c1e] text-white border-[#a61c1e]"
                  : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
              }`}
            >
              Target (PMA)
            </button>
            <button
              onClick={() => setCompareMode("baseline")}
              className={`px-3 py-1 rounded text-xs font-bold transition-all border ${
                compareMode === "baseline"
                  ? "bg-[#a61c1e] text-white border-[#a61c1e]"
                  : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
              }`}
            >
              Baseline (file)
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-md self-start md:self-auto">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Quarter</span>
          <select className="bg-transparent text-xs font-semibold text-gray-700 outline-none border-none cursor-pointer">
            <option>Q4 FY 26</option>
          </select>
        </div>
      </div>

      <div className="text-xs text-gray-500 font-semibold mb-6">
        <span className="text-gray-950 font-bold">75</span> families -{" "}
        <span className="text-emerald-600 font-bold">21</span> above target -{" "}
        <span className="text-rose-600 font-bold">54</span> below target (Δ = actual - target, pp).
      </div>

      {/* Zoom Control */}
      <div className="flex items-center gap-4 mb-6">
        <span className="text-xs text-gray-400 font-bold">Chart zoom</span>
        <input
          type="range"
          min="50"
          max="150"
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-40 accent-[#a61c1e]"
        />
        <button
          onClick={() => setZoom(100)}
          className="px-2 py-0.5 border border-gray-300 rounded text-[10px] text-gray-600 hover:bg-gray-50"
        >
          Reset to 100%
        </button>
        <span className="text-xs font-bold text-gray-700">Zoom {zoom}%</span>
      </div>

      {/* Skyscraper Bar Visualizer */}
      <div className="h-64 border border-dashed border-gray-200 rounded-lg p-6 bg-gray-50/20 flex items-center justify-center overflow-x-auto">
        <div
          className="flex items-end justify-center gap-[2px] h-full w-full max-w-5xl"
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: "bottom center", transition: "transform 0.1s" }}
        >
          {dataPoints.map((point, idx) => {
            const heightPct = Math.min(Math.max(Math.abs(point.val) * 6, 4), 100);
            const isPositive = point.type === "positive";

            return (
              <div key={idx} className="flex flex-col items-center justify-end h-full w-2">
                <div
                  className={`w-full rounded-t-sm transition-all duration-300 ${
                    isPositive
                      ? "bg-gradient-to-t from-emerald-400 to-teal-500 shadow-emerald-500/20"
                      : "bg-gradient-to-b from-rose-400 to-orange-500 shadow-rose-500/20 mt-auto"
                  }`}
                  style={{
                    height: `${heightPct}%`,
                    transform: isPositive ? "none" : "translateY(50%)",
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SkyscraperChart;
