import Header from "../../components/Header";
import { breadCrumbs } from "./constants/constants";
import LoadFiles from "./pages/LoadDataFiles";

const PricingAnalyticsService = () => {
  return (
    <div className="flex flex-col h-screen">
      <Header breadCrumbs={breadCrumbs} />

      <main className="flex-1 overflow-y-auto mt-10">
        <LoadFiles />
      </main>
    </div>
  );
};

export default PricingAnalyticsService;
