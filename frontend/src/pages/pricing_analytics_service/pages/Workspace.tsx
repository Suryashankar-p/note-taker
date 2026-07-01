import { BarChart3, BriefcaseBusiness, Check } from "lucide-react";
import { useState } from "react";
import {
  pricingAnalyticsServiceBreadCrumbsWorkspace,
  workspaces,
} from "../constants/constants";
import { useNavigate } from "react-router-dom";
import Header from "../../../components/Header";
import UploadSidebar from "../components/UploadSidebar";

const Workspace = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(0);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header breadCrumbs={pricingAnalyticsServiceBreadCrumbsWorkspace} />
      <div className="flex flex-1 overflow-hidden mt-16">
        <UploadSidebar />
        <div className="overflow-y-auto w-full max-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center py-12">
          <div className="w-[900px]">
          <div className="text-center mb-10">
            <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow">
              <BarChart3 className="text-red-600" size={20} />
            </div>

            <h1 className="text-xl font-bold">Select your Workspace</h1>

            <p className="text-xs text-gray-500 mt-2">
              GIA Enterprise AI is tailored to your specific strategic focus.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-5">
            {workspaces.map((item, index) => {
              const isSelected = selected === index;

              return (
                <div
                  key={item.title}
                  onClick={() => setSelected(index)}
                  className={`cursor-pointer rounded-xl bg-white
                border
                p-5
                transition-all
                duration-300

                ${
                  isSelected
                    ? `
                    border-red-400
                    shadow-xl
                  `
                    : `
                    border-gray-200
                    hover:-translate-y-1
                    hover:shadow-lg
                    hover:border-red-300
                  `
                }
              `}
                >
                  <div className="flex justify-between">
                    <div
                      className={`
                    flex h-8 w-8 items-center justify-center rounded-md
                    
                    ${isSelected ? "bg-red-100" : "bg-blue-50"}
                  `}
                    >
                      {isSelected ? (
                        <Check size={16} className="text-red-600" />
                      ) : (
                        <BriefcaseBusiness size={16} className="text-red-600" />
                      )}
                    </div>

                    {isSelected && <span className="text-red-600">→</span>}
                  </div>

                  <h2 className="mt-5 font-semibold text-sm">{item.title}</h2>

                  <p className="mt-2 text-xs leading-5 text-gray-500">
                    {item.description}
                  </p>

                  <ul className="mt-4 space-y-2 text-xs text-gray-600">
                    <li>◉ Market Volatility Metrics</li>
                    <li>◉ Macroeconomic Impacts</li>
                    <li>◉ Revenue Forecasting</li>
                  </ul>

                  <button
                    onClick={() => {
                      navigate(
                        index === 0
                          ? "dashboard/ceo/overall-margin"
                          : "dashboard/analyst/overall-margin",
                      );
                    }}
                    className={`
                  mt-6 w-full rounded-lg py-2 text-xs font-medium

                  ${
                    isSelected
                      ? "bg-red-500 text-white"
                      : "border border-red-300 text-red-600"
                  }
                `}
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

export default Workspace;
