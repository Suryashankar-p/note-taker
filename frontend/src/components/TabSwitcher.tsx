import React from "react";

export interface TabOption {
  key: string;
  label: string;
}

interface TabSwitcherProps {
  options: TabOption[];
  activeTab: string;
  onTabChange: (key: string) => void;
  className?: string;
  activeColorClass?: string;
}

/**
 * Reusable TabSwitcher Component
 * Displays a pill container with selectable tab options.
 */
const TabSwitcher: React.FC<TabSwitcherProps> = ({
  options,
  activeTab,
  onTabChange,
  className = "",
  activeColorClass = "bg-danger text-white shadow-sm",
}) => {
  return (
    <div className={`flex items-center bg-[#F3F4F6] p-1 rounded-xl border border-[#E5E7EB] ${className}`}>
      {options.map((option) => {
        const isActive = activeTab === option.key;
        return (
          <button
            key={option.key}
            onClick={() => onTabChange(option.key)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition duration-150 cursor-pointer ${
              isActive
                ? activeColorClass
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

export default TabSwitcher;
