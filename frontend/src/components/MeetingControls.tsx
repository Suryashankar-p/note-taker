import React from "react";
import Input from "./Input";
import TabSwitcher, { TabOption } from "./TabSwitcher";
import searchIcon from "../assets/search_icon.svg";

interface MeetingControlsProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedTab: string;
  onTabChange: (key: string) => void;
  tabOptions?: TabOption[];
}

const DEFAULT_TAB_OPTIONS: TabOption[] = [
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past" },
];

/**
 * Reusable MeetingControls Component
 * Combines search input and filter tab switcher into a single component call.
 */
const MeetingControls: React.FC<MeetingControlsProps> = ({
  searchQuery,
  onSearchChange,
  selectedTab,
  onTabChange,
  tabOptions = DEFAULT_TAB_OPTIONS,
}) => {
  return (
    <div className="flex items-center gap-3">
      <Input
        placeholder="Search meetings..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        prefixIcon={<img src={searchIcon} alt="search" className="w-4 h-4 opacity-60" />}
        fixed_size="small"
        inputClasssName="!w-64 sm:!w-72"
      />
      <TabSwitcher
        options={tabOptions}
        activeTab={selectedTab}
        onTabChange={onTabChange}
      />
    </div>
  );
};

export default MeetingControls;
