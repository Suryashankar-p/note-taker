import Header from "../../components/Header";
import { breadCrumbs, workspaces } from "./constants/constants";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, BriefcaseBusiness, Check } from "lucide-react";
import UploadSidebar from "./components/UploadSidebar";

const PricingAnalyticsService = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(0);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50">
      <Header breadCrumbs={breadCrumbs} />
      <div className="flex flex-1 overflow-hidden mt-16">
        <UploadSidebar />
        <div className="flex-1 overflow-y-auto bg-slate-50 flex items-center justify-center py-12">
          <div className="w-[850px] px-8 py-10 bg-white rounded-2xl border border-gray-200 shadow-lg">
            <div className="text-center mb-8">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 border border-red-100 shadow-sm">
                <BarChart3 className="text-[#a61c1e]" size={24} />
              </div>

              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Select your Workspace</h1>

              <p className="text-xs text-gray-505 mt-2">
                GIA Enterprise AI is tailored to your specific strategic focus.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {workspaces.map((item, index) => {
                const isSelected = selected === index;

                return (
                  <div
                    key={item.title}
                    onClick={() => setSelected(index)}
                    className={`cursor-pointer rounded-xl p-5 transition-all duration-350 border bg-white ${
                      isSelected
                        ? "border-[#a61c1e] shadow-md bg-red-50/10"
                        : "border-gray-200 hover:-translate-y-0.5 hover:shadow-md hover:border-red-300"
                    }`}
                  >
                    <div className="flex justify-between">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                          isSelected ? "bg-red-50 text-[#a61c1e]" : "bg-gray-50 text-gray-500"
                        }`}
                      >
                        {isSelected ? (
                          <Check size={18} className="text-[#a61c1e]" />
                        ) : (
                          <BriefcaseBusiness size={18} />
                        )}
                      </div>

                      {isSelected && <span className="text-[#a61c1e] font-bold">→</span>}
                    </div>

                    <h2 className="mt-4 font-bold text-gray-900 text-sm">{item.title}</h2>

                    <p className="mt-2 text-xs leading-relaxed text-gray-550">
                      {item.description}
                    </p>

                    <ul className="mt-4 space-y-2 text-xs text-gray-600">
                      <li>◉ Market Volatility Metrics</li>
                      <li>◉ Macroeconomic Impacts</li>
                      <li>◉ Revenue Forecasting</li>
                    </ul>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(
                          index === 0
                            ? "workspace/dashboard/ceo/overall-margin"
                            : "workspace/dashboard/analyst/select-bu"
                        );
                      }}
                      className={`mt-5 w-full rounded-xl py-2 text-xs font-bold transition-all ${
                        isSelected
                          ? "bg-[#a61c1e] text-white hover:bg-red-750 shadow-sm"
                          : "border border-red-200 text-[#a61c1e] hover:bg-red-50/20"
                      }`}
                    >
                      {item.button}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingAnalyticsService;
