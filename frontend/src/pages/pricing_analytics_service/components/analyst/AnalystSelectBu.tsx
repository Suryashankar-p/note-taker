import React from "react";
import { useNavigate } from "react-router-dom";

const AnalystSelectBu = () => {
  const navigate = useNavigate();

  const businessUnits = [
    {
      id: "heating",
      title: "Heating",
      description: "Analyze boiler efficiencies, industrial heat recovery setups, and standard thermal catalog margins.",
      colorClass: "hover:border-red-400 hover:shadow-md",
    },
    {
      id: "cooling",
      title: "Cooling",
      description: "Examine chillers, cooling tower performance ratios, and standard equipment vs custom catalog pricing.",
      colorClass: "hover:border-red-400 hover:shadow-md",
    },
    {
      id: "water",
      title: "Water",
      description: "Monitor reverse osmosis membranes, water purification systems, spares distribution, and contract pricing.",
      colorClass: "hover:border-red-400 hover:shadow-md",
    },
  ];

  return (
    <div className="min-h-[70vh] flex flex-col justify-center items-center px-4 py-8 bg-slate-50 text-gray-800">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            Select <span className="text-[#a61c1e]">Business Unit</span>
          </h2>
          <p className="text-xs text-gray-500 mt-2 max-w-lg mx-auto">
            Deep dive into granular SKU performance, elasticity modeling, and competitive benchmark datasets. Select a business unit to upload files and begin analysis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {businessUnits.map((bu) => (
            <div
              key={bu.id}
              onClick={() => navigate(`../${bu.id}/upload`)}
              className={`cursor-pointer bg-white border border-gray-200 p-6 rounded-xl transition-all duration-300 flex flex-col justify-between h-56 shadow-sm ${bu.colorClass}`}
            >
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{bu.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-4">
                  {bu.description}
                </p>
              </div>
              <div className="text-[#a61c1e] text-xs font-bold tracking-wider uppercase mt-4 flex items-center gap-1 hover:text-red-750">
                Explore Analytics →
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalystSelectBu;
