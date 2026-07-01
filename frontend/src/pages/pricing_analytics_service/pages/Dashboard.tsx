import { useState, Suspense } from "react";
import { Outlet } from "react-router-dom";
import Header from "../../../components/Header";
import SettingsSidebar from "../components/Sidebar";
import { pricingAnalyticsServiceBreadCrumbs } from "../constants/constants";
import CopilotWidget from "../components/CopilotWidget";
import { Sparkles } from "lucide-react";
import PageLoading from "../../../components/PageLoading";

const Dashboard = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen overflow-hidden relative">
      <Header breadCrumbs={pricingAnalyticsServiceBreadCrumbs} />
      <div className="flex flex-1 overflow-hidden mt-16">
        <SettingsSidebar />
        <div className="overflow-y-auto w-full max-h-[calc(100vh-4rem)]">
          <Suspense fallback={<PageLoading />}>
            <Outlet />
          </Suspense>
        </div>
      </div>

      {isChatOpen && (
        <CopilotWidget onClose={() => setIsChatOpen(false)} />
      )}

      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-2 right-6 flex items-center gap-2 px-4 py-2.5 rounded-full border border-[#8b5cf6] bg-[#8b5cf6] hover:bg-[#7c3aed] text-white text-xs font-bold transition-all duration-200 shadow-lg z-50 hover:scale-105"
        >
          <Sparkles size={14} />
          GIA LLM Co-pilot
        </button>
      )}
    </div>
  );
};

export default Dashboard;