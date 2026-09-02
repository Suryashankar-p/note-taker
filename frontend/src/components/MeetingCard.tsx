import React from "react";
import calendarRed from "../assets/calendar_red.svg";
import calendarGray from "../assets/calendar_gray.svg";
import calendarIcon from "../assets/calendar_icon.svg";
import clockIcon from "../assets/clock_icon.svg";
import attendeesIcon from "../assets/attendees_icon.svg";

export interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  attendees: number;
  badgeColor?: "red" | "gray";
  type: "upcoming" | "past";
}

interface MeetingCardProps {
  meeting: Meeting;
  onClick?: () => void;
}

/**
 * Checks if the meeting date is Today or Tomorrow (supports both string labels and backend ISO/date objects)
 */
const isTodayOrTomorrow = (dateStr: string): boolean => {
  if (!dateStr) return false;
  const d = dateStr.trim().toLowerCase();
  if (d === "today" || d === "tomorrow") return true;

  // Compare actual calendar dates extracted from backend
  const meetingDate = new Date(dateStr);
  if (isNaN(meetingDate.getTime())) return false;

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  return isSameDay(meetingDate, today) || isSameDay(meetingDate, tomorrow);
};

/**
 * Reusable MeetingCard Component
 * Renders an individual meeting item card with calendar badge and metadata.
 * The calendar badge is RED if the meeting is Today or Tomorrow, otherwise GRAY.
 */
const MeetingCard: React.FC<MeetingCardProps> = ({ meeting, onClick }) => {
  const isRed = isTodayOrTomorrow(meeting.date);

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-xs hover:border-gray-300 hover:shadow-md transition flex items-center gap-5 cursor-pointer"
    >
      {/* Calendar Badge Icon Box - Red for Today/Tomorrow, Gray otherwise */}
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
          isRed ? "bg-[#FEE2E2]" : "bg-[#F3F4F6]"
        }`}
      >
        <img
          src={isRed ? calendarRed : calendarGray}
          alt="calendar"
          className="w-5 h-5"
        />
      </div>

      {/* Meeting Information */}
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-base font-semibold text-gray-900 truncate">
          {meeting.title}
        </span>
        <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-500 flex-wrap">
          {/* Date */}
          <div className="flex items-center gap-1.5">
            <img src={calendarIcon} alt="date" className="w-3.5 h-3.5 opacity-50" />
            <span>{meeting.date}</span>
          </div>

          {/* Time */}
          <div className="flex items-center gap-1.5">
            <img src={clockIcon} alt="time" className="w-3.5 h-3.5 opacity-50" />
            <span>{meeting.time}</span>
          </div>

          {/* Attendees */}
          <div className="flex items-center gap-1.5">
            <img src={attendeesIcon} alt="attendees" className="w-3.5 h-3.5 opacity-50" />
            <span>{meeting.attendees} Attendees</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingCard;
