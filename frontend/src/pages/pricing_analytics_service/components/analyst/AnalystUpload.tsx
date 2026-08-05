import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FileText, Thermometer, BarChart3, List, DollarSign, X, Check, ArrowRight } from "lucide-react";

const AnalystUpload = () => {
  const { bu } = useParams<{ bu: string }>();
  const navigate = useNavigate();

  const activeBu = bu || "heating";
  const buLabel = activeBu.charAt(0).toUpperCase() + activeBu.slice(1);

  const mockFiles = [
    { title: "COGS Extract", fileName: `cogs_extract_${activeBu}_v1.csv`, icon: <FileText className="text-red-600" /> },
    { title: `${buLabel} Targets`, fileName: `${activeBu}_targets_approved.csv`, icon: <Thermometer className="text-red-600" /> },
    { title: `${buLabel} Baseline`, fileName: `${activeBu}_baseline_fy26.csv`, icon: <BarChart3 className="text-red-600" /> },
    { title: "Price List", fileName: `${activeBu}_standard_price_q4.csv`, icon: <List className="text-red-600" /> },
    { title: "Cost List", fileName: `${activeBu}_standard_cost_q4.csv`, icon: <DollarSign className="text-red-600" /> },
    { title: "Non-standard Targets", fileName: `${activeBu}_nonstd_targets_v2.csv`, icon: <X className="text-red-600" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8 text-gray-800">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
          <div>
            <h1 className="text-xl font-bold">Load Data Files — {buLabel}</h1>
            <p className="text-xs text-gray-500 mt-1">
              Verify that all files are loaded and validated correctly before launching the pricing analysis studio.
            </p>
          </div>
          <button
            onClick={() => navigate("../select-bu")}
            className="px-4 py-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-600 text-xs font-bold rounded-lg tracking-wide transition-colors shadow-sm"
          >
            ← Change BU
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
          {mockFiles.map((file) => (
            <div
              key={file.title}
              className="bg-white border border-gray-200 p-5 rounded-xl flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-red-55/10 rounded-lg flex items-center justify-center border border-red-100">
                  {file.icon}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">{file.title}</h4>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                    <Check size={12} /> Successfully validated
                  </p>
                  <span className="text-[10px] text-gray-400 block mt-1 truncate max-w-xs">
                    {file.fileName}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Loaded
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-center text-center gap-4">
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-semibold max-w-lg flex items-center gap-2">
            <Check size={16} className="text-emerald-600 shrink-0" /> All data files are present, validated, and cached successfully for this workspace session.
          </div>

          <button
            onClick={() => navigate(`../${activeBu}/overall-margin`)}
            className="flex items-center justify-center gap-2 w-[450px] rounded-xl px-6 py-3.5 text-xs font-bold shadow-sm transition-all duration-200 bg-[#a61c1e] text-white hover:bg-red-750 cursor-pointer mt-4"
          >
            Launch Pricing Analyst Studio <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalystUpload;
