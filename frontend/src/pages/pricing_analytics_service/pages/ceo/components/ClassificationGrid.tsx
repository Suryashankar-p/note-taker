import React from "react";

const ClassificationGrid = () => {
  const gridData = [
    {
      row: "Proprietary",
      cols: [
        { red: 0, green: 1, margin: "53.69% (+6.99%)", isGreen: true, rev: "₹0.24L (0.4%)" },
        { red: 0, green: 1, margin: "57.50% (+11.20%)", isGreen: true, rev: "₹34.75L (1.6%)" },
        { red: 0, green: 1, margin: "63.87% (+5.97%)", isGreen: true, rev: "₹7.2L (0.3%)" },
      ],
    },
    {
      row: "Value-added",
      cols: [
        { red: 0, green: 2, margin: "56.64% (+14.28%)", isGreen: true, rev: "₹11.90L (0.5%)" },
        { red: 0, green: 9, margin: "55.94% (+6.58%)", isGreen: true, rev: "₹187.48L (8.6%)" },
        { red: 0, green: 1, margin: "56.54% (+5.94%)", isGreen: true, rev: "₹70.43L (3.2%)" },
      ],
    },
    {
      row: "Commodity",
      cols: [
        { red: 4, green: 8, margin: "54.28% (+3.48%)", isGreen: true, rev: "₹98.63L (4.5%)" },
        { red: 7, green: 10, margin: "51.85% (-0.15%)", isRed: true, rev: "₹975.06L (44.7%)" },
        { red: 11, green: 18, margin: "50.38% (-0.75%)", isRed: true, rev: "₹424.21L (19.4%)" },
      ],
    },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-bold text-gray-900">Classification × Freq to buy</h2>
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-md">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Quarter</span>
          <select className="bg-transparent text-xs font-semibold text-gray-700 outline-none border-none cursor-pointer">
            <option>Q4 FY 26</option>
          </select>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50 mb-6">
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">
          Classification = Freq to buy • Q4 FY 26
        </div>
        <div className="text-xl font-extrabold text-gray-900 mt-1">
          Heating overall GM: <span className="text-[#a61c1e]">52.24%</span>
        </div>
      </div>

      {/* 3x3 Freq Grid */}
      <div className="grid grid-cols-4 gap-4 text-xs font-semibold">
        <div></div>
        <div className="text-center font-bold text-gray-500 bg-gray-50 py-2 border border-gray-200 rounded-md">Low</div>
        <div className="text-center font-bold text-gray-500 bg-gray-50 py-2 border border-gray-200 rounded-md">Medium</div>
        <div className="text-center font-bold text-gray-500 bg-gray-50 py-2 border border-gray-200 rounded-md">High</div>

        {gridData.map((row, rIdx) => (
          <React.Fragment key={rIdx}>
            <div className="flex items-center font-bold text-gray-700 bg-gray-50 px-3 border border-gray-200 rounded-md">
              {row.row}
            </div>
            {row.cols.map((col, cIdx) => (
              <div key={cIdx} className="bg-white border border-gray-200 p-3 rounded-lg flex flex-col gap-2 shadow-xs">
                <div className="flex justify-between items-center text-xs">
                  <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-100 font-bold">{col.red}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold">{col.green}</span>
                </div>
                <div className={`text-center font-bold py-1 px-1.5 rounded text-[10px] ${
                  col.isGreen ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"
                }`}>
                  {col.margin}
                </div>
                <div className="text-center text-[10px] text-gray-500 bg-gray-50 py-1 rounded">
                  {col.rev}
                </div>
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>

      {/* Metric Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Below / above baseline GM (# families)</span>
          <div className="flex gap-2">
            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">xx%</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">(+yy%)</span>
          </div>
        </div>
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Pooled GM% (Δ vs baseline)</span>
          <span className="text-xs font-bold text-gray-800">xx% (+yy%)</span>
        </div>
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Revenue (share of total)</span>
          <span className="text-xs font-bold text-gray-800">₹xxL (yy%)</span>
        </div>
      </div>
    </div>
  );
};

export default ClassificationGrid;
