import {
  Database,
  MessageSquare,
  Users,
  BarChart3,
  Settings,
} from "lucide-react";

import { useLocation } from "react-router-dom";
import SidebarItem from "./SidebarItem";

const SETTINGS_BASE = "/ai-studio/pas/workspace/dashboard";


const SettingsSidebar = () => {
  const { pathname } = useLocation();
  const normalizedPath = pathname.replace(/\/+$/, "");

  const isCeo = pathname.includes("/ceo");
  const dashboardPath = isCeo
    ? `${SETTINGS_BASE}/ceo/overall-margin`
    : `${SETTINGS_BASE}/analyst/overall-margin`;

  const sidebarItems = [
    {
      label: "Dashboard",
      path: dashboardPath,
      icon: Database,
      match: (pathname: string) => {
        const subRoute = pathname.replace(`${SETTINGS_BASE}/`, "").split("/")[0];
        return (
          pathname === SETTINGS_BASE ||
          !["feedback", "members", "usage"].includes(subRoute)
        );
      },
    },
  ];

  return (
    <aside
      className="flex flex-col w-64 h-full p-5 bg-[#131517] 
      border-r 
      border-[#202226]
      justify-between
    "
    >
      <div className="flex flex-col">
        <div className="mb-6 px-1">
          <h2 className="text-lg font-bold tracking-tight text-white">
            Pricing <span className="text-[#a61c1e]">Analytics</span>
          </h2>
          <p className="text-[10px] text-gray-500 font-semibold tracking-wider uppercase mt-0.5">
            Pricing Analytics Service
          </p>
        </div>

        {/* Main Navigation (Restored to original items) */}
        <nav className="flex flex-col gap-1.5">
          {sidebarItems.map((item) => (
            <SidebarItem
              key={item.label}
              label={item.label}
              path={item.path}
              icon={item.icon}
              isActive={item.match?.(normalizedPath)}
            />
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default SettingsSidebar;
