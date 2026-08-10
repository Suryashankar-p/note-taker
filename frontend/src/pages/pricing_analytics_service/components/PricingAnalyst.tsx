import React, { useState, Suspense } from "react";
import { useNavigate, NavLink, Outlet, useParams, useLocation } from "react-router-dom";
import PageLoading from "../../../components/PageLoading";

const PricingAnalyst = () => {
  const navigate = useNavigate();
  const { bu } = useParams<{ bu?: string }>();
  const { pathname } = useLocation();

  const [selectedQoqCell, setSelectedQoqCell] = useState<any | null>(null);
  const [selectedFamily, setSelectedFamily] = useState<string | null>(null);

  const SETTINGS_BASE = "/ai-studio/pricing-analytics/workspace/dashboard";

  const isUpload = pathname.includes("/upload");
  const showTabs = bu && !isUpload;

  const tabItems = bu
    ? [
        { label: "1 - OVERALL MARGIN", path: `${SETTINGS_BASE}/analyst/${bu}/overall-margin` },
        { label: "2 - REVENUE & GM LADDER", path: `${SETTINGS_BASE}/analyst/${bu}/revenue-gm-ladder` },
        { label: "3 - QOQ MATRIX", path: `${SETTINGS_BASE}/analyst/${bu}/qoq-matrix` },
        { label: "4 - SKU DRILL-DOWN", path: `${SETTINGS_BASE}/analyst/${bu}/sku-drill-down` },
      ]
    : [];

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800 font-sans flex flex-col">
      <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            GIA — <span className="text-[#a61c1e]">{bu ? "Pricing Analyst / Pricing Council" : "Pricing Analyst Studio"}</span>
          </h1>
          {bu && (
            <p className="text-[10px] text-gray-500 font-semibold tracking-wide mt-0.5 uppercase">
              Business Unit: {bu}
            </p>
          )}
        </div>

        {/* Action/navigation buttons in header on the right */}
        {bu && (
          <div className="flex items-center gap-3">
            {!isUpload && (
              <button
                onClick={() => navigate(`${SETTINGS_BASE}/analyst/${bu}/upload`)}
                className="px-3.5 py-1.5 bg-[#a61c1e] hover:bg-red-750 text-white rounded-lg text-[10px] font-bold tracking-wide transition-colors shadow-sm"
              >
                Upload Files 📤
              </button>
            )}
            <button
              onClick={() => navigate(`${SETTINGS_BASE}/analyst/select-bu`)}
              className="px-3.5 py-1.5 border border-gray-300 bg-white hover:bg-gray-50 text-gray-600 rounded-lg text-[10px] font-bold tracking-wide transition-colors"
            >
              ← Business units
            </button>
            <button
              onClick={() => navigate("/ai-studio/pricing-analytics")}
              className="px-3.5 py-1.5 border border-gray-300 bg-white hover:bg-gray-50 text-gray-600 rounded-lg text-[10px] font-bold tracking-wide transition-colors"
            >
              ← Welcome
            </button>
          </div>
        )}
      </header>

      {showTabs && tabItems.length > 0 && (
        <div className="px-8 py-3 bg-white flex gap-3 border-b border-gray-200">
          {tabItems.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                `px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider transition-all duration-200 border ${
                  isActive
                    ? "bg-[#a61c1e]/10 text-[#a61c1e] border-[#a61c1e]"
                    : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </div>
      )}

      <main className="flex-1 p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
        <Suspense fallback={<PageLoading />}>
          <Outlet
            context={{
              selectedQoqCell,
              setSelectedQoqCell,
              selectedFamily,
              setSelectedFamily,
              onNavigateToSku: () => navigate(`${SETTINGS_BASE}/analyst/${bu}/sku-drill-down`),
              onNavigateToTab: (tabId: string) => navigate(`${SETTINGS_BASE}/analyst/${bu}/${tabId}`),
            }}
          />
        </Suspense>
      </main>
    </div>
  );
};

export default PricingAnalyst;
