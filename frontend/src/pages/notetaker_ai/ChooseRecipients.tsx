import React, { useState } from "react";
import Button from "../../components/Button";
import calendarIcon from "../../assets/calendar_icon.svg";
import tickIcon from "../../assets/tick.svg";
import thermaxIcon from "../../assets/thermax_icon.svg";
import { Recipient } from "./types/Interfaces";

interface ChooseRecipientsProps {
  onBack?: () => void;
}

const DEFAULT_RECIPIENTS: Recipient[] = [
  { id: "1", name: "Pooja K.", email: "pooja.k@thermax.com", selected: true },
  { id: "2", name: "Alex M.", email: "alex.m@thermax.com", selected: true },
  { id: "3", name: "Sarah J.", email: "sarah.j@thermax.com", selected: false },
];

const ChooseRecipients: React.FC<ChooseRecipientsProps> = () => {
  const [recipients, setRecipients] = useState<Recipient[]>(DEFAULT_RECIPIENTS);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(true);

  const [actionItems, setActionItems] = useState([
    { id: "1", task: "Update roadmap document with mobile priorities (Pooja)", completed: true },
    { id: "2", task: "Schedule follow-up design review for onboarding changes (Alex)", completed: false },
    { id: "3", task: "Draft initial API documentation structure (Sarah)", completed: false },
  ]);

  const toggleItem = (id: string) => {
    setActionItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const toggleRecipient = (id: string) => {
    setRecipients((prev) =>
      prev.map((r) => (r.id === id ? { ...r, selected: !r.selected } : r))
    );
  };

  const selectAllAttendees = () => {
    const allSelected = recipients.every((r) => r.selected);
    setRecipients((prev) => prev.map((r) => ({ ...r, selected: !allSelected })));
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-2 pb-16">
      {/* Top Outer Email Header Box */}
      <div className="border border-gray-200 bg-white rounded-2xl p-5 mb-6 shadow-2xs">
        <div className="flex items-start justify-between">
          <h2 className="text-xl font-bold text-gray-900">Meeting Summary: Product Sync</h2>
          <span className="text-[11px] text-gray-400 font-medium">Oct 24, 2024, 11:00 AM</span>
        </div>

        <div className="mt-4 space-y-1.5 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-gray-400 font-medium w-12">From:</span>
            <span className="text-gray-800 font-semibold">AI Notetaker &lt;bot@ainotetaker.ai&gt;</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-gray-400 font-medium w-12">To:</span>
            <span className="text-gray-600">
              {recipients.filter((r) => r.selected).map((r) => `${r.name} <${r.email}>`).join(", ") || "No recipients selected"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Container: Email Document on Left + Recipients Dropdown Controls on Right */}
      <div className="flex flex-col lg:flex-row items-start gap-6">
        
        {/* Email Document Body */}
        <div className="flex-1 bg-white border-t-4 border-t-[#D32F2F] border-x border-b border-gray-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-8">
            
            {/* Header / Brand */}
            <div className="flex items-center justify-center gap-2 pb-6 border-b border-gray-100">
              <img src={thermaxIcon} alt="Thermax" className="h-4 w-auto" />
              <span className="text-[11px] font-bold text-gray-700 tracking-wider uppercase">AI NOTETAKER REPORT</span>
            </div>

            {/* Meeting Title & Meta */}
            <div className="text-center my-6">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Product Sync</h1>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-2 font-medium">
                <img src={calendarIcon} alt="date" className="w-3.5 h-3.5 opacity-60" />
                <span>Tuesday, Oct 24, 2024 | 10:00 AM - 10:45 AM</span>
              </div>
            </div>

            {/* Attendees Box */}
            <div className="border border-gray-200 rounded-xl p-4 mb-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-2">ATTENDEES</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center -space-x-1.5">
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop&crop=faces" alt="user" className="w-6 h-6 rounded-full border border-white object-cover" />
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=faces" alt="user" className="w-6 h-6 rounded-full border border-white object-cover" />
                  <span className="w-6 h-6 rounded-full bg-gray-100 border border-white text-[10px] font-semibold text-gray-500 flex items-center justify-center">+3</span>
                </div>
                <span className="text-xs text-gray-700 font-medium">Pooja K., Alex M., Sarah J. + 2 others</span>
              </div>
            </div>

            {/* Summary - Key Points */}
            <div className="mb-6 pb-6 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800">SUMMARY – KEY POINTS</h3>
              </div>
              <ul className="space-y-2.5 text-xs text-gray-600 leading-relaxed pl-1">
                <li>• Prioritized mobile sync features for Q4 roadmap, shifting desktop enhancements to Q1.</li>
                <li>• Decided on API documentation deadline: targeting draft completion by end of next week.</li>
                <li>• Reviewed recent user feedback regarding onboarding flow; agreed to streamline step 2.</li>
              </ul>
            </div>

            {/* Action Items */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-4 h-4 rounded-full bg-[#D32F2F] flex items-center justify-center text-white shrink-0">
                  <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800">ACTION ITEMS</h3>
              </div>
              <div className="space-y-3 pl-1">
                {actionItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className="flex items-start gap-3 text-xs cursor-pointer group select-none"
                  >
                    <button type="button" className="mt-0.5 shrink-0 flex items-center justify-center">
                      {item.completed ? (
                        <div className="w-4 h-4 rounded-full bg-[#D32F2F] flex items-center justify-center text-white shrink-0">
                          <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-gray-400 group-hover:border-[#D32F2F] transition-colors"></div>
                      )}
                    </button>
                    <span className={`leading-relaxed text-xs ${item.completed ? "line-through text-gray-400" : "text-gray-800"}`}>
                      {item.task}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions inside Email */}
            <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-100">
              <button 
                type="button"
                className="bg-[#D32F2F] hover:bg-[#b71c1c] text-white text-xs font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-xs cursor-pointer transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                <span>View Full Transcript</span>
              </button>
              <button 
                type="button"
                className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 text-xs font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-xs cursor-pointer transition"
              >
                <svg className="w-3 h-3 fill-current text-gray-700" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span className="text-gray-800 font-semibold text-xs">Play Recording</span>
              </button>
            </div>
          </div>

          {/* Email Footer */}
          <div className="bg-gray-50 border-t border-gray-100 py-3.5 px-6 text-center text-[11px] text-gray-400">
            Sent by AI Notetaker. You're receiving this because you recorded the "Product Sync" meeting.
          </div>
        </div>

        {/* Right Side Controls */}
        <div className="w-full lg:w-72 flex flex-col gap-3 shrink-0">
          {/* All Attendees Toggle Button */}
          <button
            type="button"
            onClick={selectAllAttendees}
            className="w-full border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 text-xs font-semibold py-2.5 px-4 rounded-xl shadow-xs cursor-pointer transition text-center"
          >
            All Attendees
          </button>

          {/* Send Email Button */}
          <Button className="w-full bg-[#D32F2F] hover:bg-[#b71c1c] text-white text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer text-center">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>Send Email</span>
          </Button>
        </div>

      </div>
    </div>
  );
};

export default ChooseRecipients;
