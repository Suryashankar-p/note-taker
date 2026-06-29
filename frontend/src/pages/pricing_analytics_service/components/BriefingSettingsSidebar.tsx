import React from "react";
import { Users } from "lucide-react";
import { useLocation } from "react-router-dom";
import SidebarItem from "./SidebarItem";

const BriefingSettingsSidebar = () => {
  const { pathname } = useLocation();
  const normalizedPath = pathname.replace(/\/+$/, "");

  const baseUploadPath = "/ai-studio/pas";

  const sidebarItems = [
    {
      label: "Members",
      path: `${baseUploadPath}/settings/members`,
      icon: Users,
    },
  ];

  return (
    <aside
      className="flex flex-col w-64 h-full p-5 bg-[#131517] 
      border-r 
      border-[#202226]
      justify-between
      text-white
    "
    >
      <div className="flex flex-col">
        {/* Header */}
        <div className="mb-6 px-1">
          <h2 className="text-lg font-bold tracking-tight text-white">
            Pricing <span className="text-[#a61c1e]">Analytics</span>
          </h2>
          <p className="text-[10px] text-gray-500 font-semibold tracking-wider uppercase mt-0.5">
            Pricing Analytics Service
          </p>
        </div>

        <nav className="flex flex-col gap-1.5">
          {sidebarItems.map((item) => (
            <SidebarItem
              key={item.label}
              label={item.label}
              path={item.path}
              icon={item.icon}
              isActive={normalizedPath === item.path}
            />
          ))}
        </nav>

        <hr className="border-t border-[#202226] my-5" />
      </div>
    </aside>
  );
};

export default BriefingSettingsSidebar;
