import { Outlet } from "react-router-dom";
import Header from "../../../components/Header";
import SettingsSidebar from "../components/Sidebar";
import { pricingAnalyticsServiceBreadCrumbs } from "../constants/constants";

const Dashboard = () => {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header breadCrumbs={pricingAnalyticsServiceBreadCrumbs} />
      <div className="flex flex-1 overflow-hidden mt-16">
        <SettingsSidebar />
        <div className="overflow-y-auto w-full max-h-[calc(100vh-4rem)]">
          <Outlet />
        </div>  
      </div>
    </div>
  );
};

export default Dashboard;