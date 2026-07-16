import React, { useState, Suspense } from "react";
import { useNavigate, NavLink, Outlet } from "react-router-dom";
import PageLoading from "../../../components/PageLoading";

const PricingAnalyst = () => {
  const navigate = useNavigate();

  const [selectedQoqCell, setSelectedQoqCell] = useState<any | null>(null);
  const [selectedFamily, setSelectedFamily] = useState<string | null>(null);

  const SETTINGS_BASE = "/ai-studio/pricing-analytics/workspace/dashboard";

  const tabItems = [
    { label: "1 - OVERALL MARGIN", path: `${SETTINGS_BASE}/analyst/overall-margin` },
    { label: "2 - SKYSCRAPER", path: `${SETTINGS_BASE}/analyst/skyscraper` },
    { label: "3 - QOQ MATRIX", path: `${SETTINGS_BASE}/analyst/qoq-matrix` },
    { label: "4 - SKU DRILL-DOWN", path: `${SETTINGS_BASE}/analyst/sku-drill-down` },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800 font-sans flex flex-col">
      <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-200 shadow-sm">
        <h1 className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
          GIA — <span className="text-[#a61c1e]">Pricing Analyst / Pricing Council</span>
        </h1>
      </header>

      <div className="px-8 py-3 bg-white flex gap-3 border-b border-gray-200">
        {tabItems.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              `px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider transition-all duration-200 border ${isActive
                ? "bg-[#a61c1e]/10 text-[#a61c1e] border-[#a61c1e]"
                : "bg-gray-105 text-gray-600 border-gray-200 hover:bg-gray-150"
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </div>

      <main className="flex-1 p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
        <Suspense fallback={<PageLoading />}>
          <Outlet
            context={{
              selectedQoqCell,
              setSelectedQoqCell,
              selectedFamily,
              setSelectedFamily,
              onNavigateToSku: () =>
                navigate(`${SETTINGS_BASE}/analyst/sku-drill-down`),
              onNavigateToTab: (tabId: string) =>
                navigate(`${SETTINGS_BASE}/analyst/${tabId}`),
            }}
          />
        </Suspense>
      </main>
    </div>
  );
};

export default PricingAnalyst;
