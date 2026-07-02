import React from "react";
import { Settings } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

const UploadSidebar = () => {
  const { pathname } = useLocation();
  const normalizedPath = pathname.replace(/\/+$/, "");

  const baseUploadPath = "/ai-studio/pas";

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
        <div className="mb-6 px-1">
          <h2 className="text-lg font-bold tracking-tight text-white">
            Pricing <span className="text-[#a61c1e]">Analytics</span>
          </h2>
          <p className="text-[10px] text-gray-500 font-semibold tracking-wider uppercase mt-0.5">
            Pricing Analytics Service
          </p>
        </div>

        <hr className="border-t border-[#202226] mb-5" />
      </div>
      <nav className="flex flex-col">
        <NavLink
          to={`${baseUploadPath}/settings/members`}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${
              isActive
                ? "bg-[#a61c1e] text-white font-medium shadow-md"
                : "text-[#a3a3a6] hover:bg-[#202022] hover:text-white"
            }`
          }
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          <span>Settings</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default UploadSidebar;
