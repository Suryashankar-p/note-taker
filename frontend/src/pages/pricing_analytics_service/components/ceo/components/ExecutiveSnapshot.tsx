import React from "react";

const ExecutiveSnapshot = () => {
  const snapshotData = [
    { label: "HEATING REVENUE", value: "₹21.8 Cr" },
    { label: "OVERALL GM%", value: "52.2%" },
    { label: "Δ VS BASELINE", value: "+2.4%", highlight: "text-emerald-600" },
    { label: "Δ VS HEATING TARGET (55.3%)", value: "-3.1%", highlight: "text-rose-600" },
    { label: "FAMILIES ABOVE TARGET", value: "21" },
    { label: "FAMILIES ABOVE BASELINE", value: "52" },
    { label: "FAMILIES BELOW TARGET", value: "54", highlight: "text-rose-500" },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold tracking-wider text-gray-500 uppercase">
          Executive Snapshot
        </h3>
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-250 px-3 py-1 rounded-md">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Quarter</span>
          <select className="bg-transparent text-xs font-semibold text-gray-700 outline-none border-none cursor-pointer">
            <option value="Q4-FY26">Q4 FY 26</option>
            <option value="Q3-FY26">Q3 FY 26</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {snapshotData.map((item, idx) => (
          <div key={idx} className="bg-gray-50 border border-gray-200 p-4 rounded-lg flex flex-col justify-between shadow-xs">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2 leading-tight">
              {item.label}
            </span>
            <span className={`text-lg font-bold text-gray-900 ${item.highlight || ""}`}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExecutiveSnapshot;
