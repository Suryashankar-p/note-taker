import {
  Database,
  MessageSquare,
  Users,
  BarChart3,
  Settings,
} from "lucide-react";

import { useLocation } from "react-router-dom";
import SidebarItem from "./SidebarItem";

const SETTINGS_BASE =
  "/ai-studio/pricing_analytics_service/workspace/dashboard";

const sidebarItems = [
  {
    label: "Knowledge Base",
    path: SETTINGS_BASE,
    icon: Database,

    match: (pathname: string) => {
      const subRoute = pathname.replace(`${SETTINGS_BASE}/`, "").split("/")[0];

      return (
        pathname === SETTINGS_BASE ||
        !["feedback", "members", "usage"].includes(subRoute)
      );
    },
  },

//   {
//     label: "Feedback",
//     path: `${SETTINGS_BASE}/feedback`,
//     icon: MessageSquare,
//   },

  {
    label: "Members",
    path: `${SETTINGS_BASE}/members`,
    icon: Users,
  },

//   {
//     label: "Usage",
//     path: `${SETTINGS_BASE}/usage`,
//     icon: BarChart3,
//   },
];

const SettingsSidebar = () => {
  const { pathname } = useLocation();

  const normalizedPath = pathname.replace(/\/+$/, "");

  return (
    <aside
      className="flex flex-col w-60 h-full p-4 bg-[#404042] 
      border-r 
      border-[#E5E5E5]
    "
    >
      <div className="flex items-center gap-3">
        <Settings className="w-5 h-5 text-white" />

        <h6 className="text-md font-medium text-white">Settings</h6>
      </div>

      <nav className="flex flex-col gap-1 mt-4">
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
    </aside>
  );
};

export default SettingsSidebar;
