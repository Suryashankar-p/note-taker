import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import Button from "../../components/Button";
import FeatureCard from "../../components/FeatureCard";
import Sidebar from "./Sidebar";
import InitialsAvatar from "../../components/Initials";
import { GetUserDetails } from "../../services/common";
import { SyncCalendar } from "../../services/notetaker_ai";

interface CalendarSyncProps {
  onSyncComplete?: () => void;
}

const breadCrumbs = [
  {
    title: "AI Studio",
    url: "/ai-studio",
  },
  {
    title: "Notetaker AI",
    url: "/ai-studio/notetaker",
  },
];

const FEATURE_CARDS = [
  {
    title: "Auto-join Meetings",
    subtitle: "Never miss a recording.",
    path: "M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z",
  },
  {
    title: "Summaries & Recaps",
    subtitle: "Insights delivered to your inbox.",
    path: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },
];

const CalendarSync: React.FC<CalendarSyncProps> = ({ onSyncComplete }) => {
  const [user, setUser] = useState({ name: "Pooja K.", initials: "PK" });
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    try {
      const userObj = JSON.parse(localStorage.getItem("user") || "{}");
      if (userObj.first_name || userObj.name || userObj.email) {
        formatUser(userObj);
      } else {
        GetUserDetails().then((u) => u && formatUser(u)).catch(() => {});
      }
    } catch (e) {}
  }, []);

  const formatUser = (u: any) => {
    if (!u) return;
    const name = u.name || `${u.first_name || "Pooja"} ${(u.last_name || "K.").charAt(0)}.`;
    const initials = u.initials || u.initial || "PK";
    setUser({ name, initials });
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await SyncCalendar("microsoft").catch(() => {});
    } finally {
      setTimeout(() => {
        setIsSyncing(false);
        localStorage.setItem("notetaker_calendar_synced", "true");
        onSyncComplete?.();
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Fixed Header */}
      <div className="fixed w-full z-50">
        <Header breadCrumbs={breadCrumbs} />
      </div>

      {/* Main Content Layout with Sidebar */}
      <div className="flex flex-1 mt-[8vh] md:mt-[6.5vh] lg:mt-[6vh] xl:mt-[8vh] relative bg-background">
        {/* Sidebar matching exact Dr. Conbot settings dark theme */}
        <div className="w-full md:w-[20rem] lg:w-[20rem] bg-primary_text flex flex-col">
          <Sidebar selected="" onSelect={() => {}} />
        </div>

        {/* Center View Area */}
        <div className="flex-1 bg-background flex flex-col items-center justify-center p-8 overflow-y-auto relative z-0">
          <div className="flex flex-col items-center max-w-xl w-full text-center">
            
            {/* User Profile Badge */}
            <div className="flex flex-col items-center mb-6">
              <InitialsAvatar name={user.name} size={56} fontSize="20px" bgColor="#A6192E" />
              <span className="text-gray-700 text-sm font-medium mt-2.5 tracking-tight">
                {user.name}
              </span>
            </div>

            {/* Heading and Subtitle */}
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Connect your calendar to get started.</h1>
            <p className="text-gray-500 text-sm max-w-md mb-8 leading-relaxed">
              AI Notetaker works best when it knows your schedule. We'll automatically prepare for your upcoming meetings.
            </p>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg mb-6">
              {FEATURE_CARDS.map((card) => (
                <FeatureCard key={card.title} {...card} />
              ))}
            </div>

            {/* Action Button */}
            <Button
              onClick={handleSync}
              disabled={isSyncing}
              className="w-full max-w-lg bg-danger hover:opacity-90 text-white py-3.5 px-6 rounded-xl font-medium flex items-center justify-center gap-2.5 shadow-sm cursor-pointer"
            >
              <svg className={`w-4 h-4 text-white ${isSyncing ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{isSyncing ? "Syncing..." : "Sync Calendar"}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarSync;
