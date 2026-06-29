import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../../../components/Header";
import { pricingAnalyticsServicesettingsBreadCrumbs } from "../constants/constants";
import BriefingSettingsSidebar from "../components/BriefingSettingsSidebar";

const SettingsLayout = () => {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header breadCrumbs={pricingAnalyticsServicesettingsBreadCrumbs} />
      <div className="flex flex-1 overflow-hidden mt-16">
        <BriefingSettingsSidebar />
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;
