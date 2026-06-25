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
  "/ai-studio/pas/workspace/dashboard";

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
      className="flex flex-col w-64 h-full p-5 bg-[#131517] 
      border-r 
      border-[#202226]
      justify-between
    "
    >
      <div className="flex flex-col">
        {/* Header matching requested style */}
        <div className="mb-6 px-1">
          <h2 className="text-lg font-bold tracking-tight text-white">
            Industrial <span className="text-[#a61c1e]">Intel</span>
          </h2>
          <p className="text-[10px] text-gray-500 font-semibold tracking-wider uppercase mt-0.5">
            GLOBAL OPERATIONS
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

      {/* User Profile Info Footer matching requested style */}
      <div className="flex items-center gap-3 px-1 py-2 border-t border-[#202226] mt-auto">
        <img
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80"
          alt="User Profile"
          className="w-9 h-9 rounded-full object-cover border border-[#2d3139]"
        />
        <div className="flex flex-col leading-tight">
          <span className="text-xs font-semibold text-white">Executive User</span>
          <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">
            CORPORATE HQ
          </span>
        </div>
      </div>
    </aside>
  );
};

export default SettingsSidebar;
