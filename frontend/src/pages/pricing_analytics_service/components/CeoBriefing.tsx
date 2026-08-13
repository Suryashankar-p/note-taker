import React, { Suspense } from "react";
import { NavLink, Outlet, useNavigate, useParams, useLocation } from "react-router-dom";
import PageLoading from "../../../components/PageLoading";

const CeoBriefing = () => {
  const navigate = useNavigate();
  const { bu } = useParams<{ bu?: string }>();
  const { pathname } = useLocation();

  const SETTINGS_BASE = "/ai-studio/pricing-analytics/workspace/dashboard";

  // Check if we are on overall margin or select-bu page
  const isOverallMargin = pathname.includes("/overall-margin");
  const isSelectBu = pathname.includes("/select-bu");

  const tabItems = bu
    ? [
        { label: "1 - CLASSIFICATION", path: `${SETTINGS_BASE}/ceo/${bu}/classification` },
        { label: "2 - REVENUE & GM LADDER", path: `${SETTINGS_BASE}/ceo/${bu}/revenue-gm-ladder` },
        { label: "3 - DISPERSION VIEW", path: `${SETTINGS_BASE}/ceo/${bu}/dispersion-view` },
      ]
    : [];

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800 font-sans flex flex-col">
      <header className="flex items-center justify-between px-8 py-4 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            Gross Margin Insights & Analytics — <span className="text-[#a61c1e]">{isOverallMargin ? "CEO/CFO portfolio overview" : "CEO/CFO briefing"}</span>
          </h1>
          {isOverallMargin && (
            <p className="text-[10px] text-gray-500 font-semibold tracking-wide mt-0.5 uppercase">
              All business units — overall margins
            </p>
          )}
          {!isOverallMargin && bu && (
            <p className="text-[10px] text-gray-500 font-semibold tracking-wide mt-0.5 uppercase">
              Business Unit: {bu}
            </p>
          )}
        </div>

        {/* Action/navigation buttons in header on the right */}
        {bu && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`${SETTINGS_BASE}/ceo/overall-margin`)}
              className="px-3.5 py-1.5 border border-gray-300 bg-white hover:bg-gray-50 text-gray-600 rounded-lg text-[10px] font-bold tracking-wide transition-colors"
            >
              ← Overall margins (all BUs)
            </button>
            <button
              onClick={() => navigate(`${SETTINGS_BASE}/ceo/select-bu`)}
              className="px-3.5 py-1.5 border border-gray-300 bg-white hover:bg-gray-50 text-gray-600 rounded-lg text-[10px] font-bold tracking-wide transition-colors"
            >
              ← Welcome
            </button>
          </div>
        )}
      </header>

      {/* Tabs list (Shown only when inside a business unit view) */}
      {bu && tabItems.length > 0 && (
        <div className="px-8 py-3 bg-white flex gap-3 border-b border-gray-200">
          {tabItems.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                `px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider transition-all duration-200 ${
                  isActive
                    ? "bg-[#a61c1e]/10 text-[#a61c1e] border border-[#a61c1e]"
                    : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </div>
      )}

      <main className="flex-1 p-8 overflow-y-auto bg-slate-50">
        <Suspense fallback={<PageLoading />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
};

export default CeoBriefing;
