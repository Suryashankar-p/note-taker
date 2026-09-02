import React, { useState, useEffect } from "react";
import MeetingControls from "../../components/MeetingControls";
import MeetingCard, { Meeting } from "../../components/MeetingCard";
import { GetCalendarMeetings } from "../../services/notetaker_ai";

const DEFAULT_MEETINGS: Meeting[] = [
  {
    id: "1",
    title: "Product Sync",
    date: "Today",
    time: "10:00 AM - 11:00 AM",
    attendees: 5,
    badgeColor: "red",
    type: "upcoming",
  },
  {
    id: "2",
    title: "Weekly Standup",
    date: "Tomorrow",
    time: "09:30 AM - 10:00 AM",
    attendees: 12,
    badgeColor: "gray",
    type: "upcoming",
  },
  {
    id: "3",
    title: "Design Review: Q4 Roadmap",
    date: "Oct 26, 2024",
    time: "02:00 PM - 03:30 PM",
    attendees: 8,
    badgeColor: "red",
    type: "upcoming",
  },
];

interface DashboardProps {
  onMeetingClick?: (meetingId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onMeetingClick }) => {
  const [meetings, setMeetings] = useState<Meeting[]>(DEFAULT_MEETINGS);
  const [selectedTab, setSelectedTab] = useState<"upcoming" | "past">("upcoming");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    GetCalendarMeetings()
      .then((data: any) => {
        if (data && data.length > 0) {
          const mapped = data.map((item: any, idx: number) => ({
            id: String(item.id || idx + 1),
            title: item.title || item.subject || item.name || "Untitled Meeting",
            date: item.date || item.start_date || "Today",
            time: item.time || item.meeting_time || "10:00 AM",
            attendees: item.attendees ?? item.attendee_count ?? item.participants?.length ?? 1,
            type: item.type || "upcoming",
          }));
          setMeetings(mapped);
        }
      })
      .catch(() => {});
  }, []);

  /**
   * Filter function to return meetings matching active tab and search query
   */
  const getFilteredMeetings = (): Meeting[] => {
    return meetings.filter(
      (m) =>
        m.type === selectedTab &&
        m.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  /**
   * Handler to switch active filter tab
   */
  const handleTabChange = (key: string) => {
    setSelectedTab(key as "upcoming" | "past");
  };

  const activeMeetings = getFilteredMeetings();

  /**
   * Helper function to render meeting list extracted from backend using MeetingCard
   */
  const renderMeetingsList = () => {
    if (activeMeetings.length === 0) {
      return (
        <div className="p-8 text-center bg-white rounded-2xl border border-[#E5E7EB] text-gray-400 text-sm">
          No {selectedTab} meetings found.
        </div>
      );
    }

    return activeMeetings.map((meeting) => (
      <MeetingCard
        key={meeting.id}
        meeting={meeting}
        onClick={() => onMeetingClick && onMeetingClick(meeting.id)}
      />
    ));
  };

  return (
    <div className="w-full px-8 md:px-12 py-6">
      {/* Header Controls with Search Bar & Tab Switcher */}
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Meetings Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1 font-normal">
            Manage and review your AI-generated meeting notes.
          </p>
        </div>

        {/* Reusable MeetingControls Component Call */}
        <MeetingControls
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedTab={selectedTab}
          onTabChange={handleTabChange}
        />
      </div>

      {/* Meetings Card List calling MeetingCard */}
      <div className="flex flex-col gap-4">
        {renderMeetingsList()}
      </div>
    </div>
  );
};

export default Dashboard;