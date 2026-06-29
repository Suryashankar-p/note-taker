import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import OverallMarginTab from "./analyst/OverallMarginTab";
import SkyscraperTab from "./analyst/SkyscraperTab";
import QoqMatrixTab from "./analyst/QoqMatrixTab";
import SkuDrillDownTab from "./analyst/SkuDrillDownTab";

const PricingAnalyst = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overall-margin");
  
  // Shared state for matrix cell selection and product family drill-down
  const [selectedQoqCell, setSelectedQoqCell] = useState<any | null>(null);
  const [selectedFamily, setSelectedFamily] = useState<string | null>(null);

  const tabItems = [
    { id: "overall-margin", label: "1 - OVERALL MARGIN" },
    { id: "skyscraper", label: "2 - SKYSCRAPER" },
    { id: "qoq-matrix", label: "3 - QOQ MATRIX" },
    { id: "sku-drill-down", label: "4 - SKU DRILL-DOWN" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800 font-sans flex flex-col">
      {/* Top Header Row */}
      <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-200 shadow-sm">
        <h1 className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
          GIA — <span className="text-[#a61c1e]">Pricing Analyst / Pricing Council</span>
        </h1>
        <button
          onClick={() => navigate("/ai-studio/pas/workspace")}
          className="px-4 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors shadow-sm"
        >
          ← Welcome
        </button>
      </header>

      {/* Tabs Sub-Header Bar */}
      <div className="px-8 py-3 bg-white flex gap-3 border-b border-gray-200">
        {tabItems.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider transition-all duration-200 border ${
              activeTab === tab.id
                ? "bg-[#a61c1e]/10 text-[#a61c1e] border-[#a61c1e]"
                : "bg-gray-105 text-gray-600 border-gray-200 hover:bg-gray-150"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
        {activeTab === "overall-margin" && <OverallMarginTab />}
        {activeTab === "skyscraper" && <SkyscraperTab />}
        {activeTab === "qoq-matrix" && (
          <QoqMatrixTab
            selectedQoqCell={selectedQoqCell}
            setSelectedQoqCell={setSelectedQoqCell}
            selectedFamily={selectedFamily}
            setSelectedFamily={setSelectedFamily}
            onNavigateToSku={() => setActiveTab("sku-drill-down")}
            onNavigateToTab={(tabId) => setActiveTab(tabId)}
          />
        )}
        {activeTab === "sku-drill-down" && (
          <SkuDrillDownTab selectedFamily={selectedFamily} />
        )}
      </main>
    </div>
  );
};

export default PricingAnalyst;
