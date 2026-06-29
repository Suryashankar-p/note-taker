import Header from "../../components/Header";
import { breadCrumbs } from "./constants/constants";
import UploadSidebar from "./components/UploadSidebar";
import LoadFiles from "./pages/LoadDataFiles";

const PricingAnalyticsService = () => {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header breadCrumbs={breadCrumbs} />
      <div className="flex flex-1 overflow-hidden mt-16">
        <UploadSidebar />
        <div className="overflow-y-auto w-full max-h-[calc(100vh-4rem)] bg-slate-50">
          <LoadFiles />
        </div>
      </div>
    </div>
  );
};

export default PricingAnalyticsService;
