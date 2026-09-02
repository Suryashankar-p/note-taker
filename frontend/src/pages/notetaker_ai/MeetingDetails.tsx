import React, { useState } from "react";
import Button from "../../components/Button";
import calendarIcon from "../../assets/calendar_icon.svg";
import clockIcon from "../../assets/clock_icon.svg";
import attendeesIcon from "../../assets/attendees_icon.svg";
import tickIcon from "../../assets/tick.svg";
import arrowIcon from "../../assets/down_arrow.svg.svg";
import { ActionItem } from "./types/Interfaces";

interface MeetingDetailsProps {
  meetingId?: string;
  onPreviewEmail?: () => void;
}

const MeetingDetails: React.FC<MeetingDetailsProps> = ({ meetingId = "1", onPreviewEmail }) => {
  const [autoEmailEnabled, setAutoEmailEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem("notetaker_auto_email");
    return saved !== null ? saved === "true" : true;
  });

  const [actionItems, setActionItems] = useState<ActionItem[]>([
    { id: "1", task: "Update roadmap document", assignee: "David Chen", completed: false },
    { id: "2", task: "Schedule follow-up with mobile team", assignee: "Sarah Jenkins", completed: false },
    { id: "3", task: "Draft API specs", assignee: "Michael Ross", completed: false },
  ]);

  const toggleActionItem = (id: string) => {
    setActionItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-2 pb-16">
      {/* Title & Actions Bar */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Product Sync</h1>
          <div className="flex items-center gap-4 text-xs text-gray-500 mt-2 font-medium">
            <span className="flex items-center gap-1.5">
              <img src={calendarIcon} alt="date" className="w-3.5 h-3.5 opacity-60" />
              Tuesday, Oct 24, 2024
            </span>
            <span className="flex items-center gap-1.5">
              <img src={clockIcon} alt="time" className="w-3.5 h-3.5 opacity-60" />
              10:00 AM – 10:45 AM
            </span>
          </div>
        </div>

        {/* Right side: Attendees & Conditional Preview Email Button */}
        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center -space-x-1.5 border border-gray-200 rounded-full px-2.5 py-1 bg-white shadow-xs">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=faces" alt="user" className="w-6 h-6 rounded-full border border-white object-cover" />
            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=faces" alt="user" className="w-6 h-6 rounded-full border border-white object-cover" />
            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=faces" alt="user" className="w-6 h-6 rounded-full border border-white object-cover" />
            <span className="text-[11px] font-semibold text-gray-500 pl-2">+3</span>
          </div>

          {/* Preview Email button is only shown if Auto Email is OFF */}
          {!autoEmailEnabled && (
            <Button
              onClick={onPreviewEmail}
              className="bg-[#D32F2F] hover:bg-[#b71c1c] text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Preview Email</span>
            </Button>
          )}
        </div>
      </div>

      {/* 1. Key Points Card */}
      <div className="border border-red-200/80 bg-white rounded-2xl p-6 shadow-xs mb-6">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center text-[#D32F2F]">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h2 className="text-sm font-bold text-gray-900">Key Points</h2>
        </div>

        <ul className="space-y-3.5 text-xs text-gray-700">
          <li className="flex items-start gap-2.5">
            <img src={arrowIcon} alt="bullet" className="w-2.5 h-2.5 mt-1 -rotate-90 opacity-50 shrink-0" />
            <span>Prioritized mobile sync features for Q4 roadmap, shifting resources from desktop enhancements to meet Q4 launch dates.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <img src={arrowIcon} alt="bullet" className="w-2.5 h-2.5 mt-1 -rotate-90 opacity-50 shrink-0" />
            <span>Decided on API documentation deadline: Drafts due next Friday, final review by end of month.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <img src={arrowIcon} alt="bullet" className="w-2.5 h-2.5 mt-1 -rotate-90 opacity-50 shrink-0" />
            <span>Marketing team requested early access to new feature mockups for upcoming campaign assets.</span>
          </li>
        </ul>
      </div>

      {/* 2. Action Items Card */}
      <div className="border border-red-200/80 bg-white rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center text-[#D32F2F]">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-sm font-bold text-gray-900">Action Items</h2>
        </div>

        <div className="space-y-3">
          {actionItems.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleActionItem(item.id)}
              className="flex items-start gap-3 p-3.5 border border-gray-200 rounded-xl bg-white hover:bg-gray-50/70 transition cursor-pointer"
            >
              <button type="button" className="mt-0.5 shrink-0 flex items-center justify-center">
                {item.completed ? (
                  <div className="w-4 h-4 rounded-full bg-[#D32F2F] flex items-center justify-center text-white shrink-0">
                    <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-gray-400"></div>
                )}
              </button>
              <div className="flex flex-col">
                <span className={`text-xs font-semibold ${item.completed ? "line-through text-gray-400" : "text-gray-900"}`}>
                  {item.task}
                </span>
                <span className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1.5">
                  <img src={attendeesIcon} alt="assignee" className="w-3.5 h-3.5 opacity-60" />
                  Assignee: {item.assignee}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MeetingDetails;
