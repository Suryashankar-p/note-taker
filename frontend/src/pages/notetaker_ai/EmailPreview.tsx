import React, { useState } from "react";
import Button from "../../components/Button";
import calendarIcon from "../../assets/calendar_icon.svg";
import thermaxIcon from "../../assets/thermax_icon.svg";
import { EmailPreviewProps, Recipient } from "./types/Interfaces";
import DropdownList from "./DropdownList";

const DEFAULT_RECIPIENTS: Recipient[] = [
  { id: "1", name: "Pooja K.", email: "pooja.k@thermax.com", selected: false },
  { id: "2", name: "Alex M.", email: "alex.m@thermax.com", selected: false },
  { id: "3", name: "Sarah J.", email: "sarah.j@thermax.com", selected: false },
];

const EmailPreview: React.FC<EmailPreviewProps> = () => {
  const [recipients, setRecipients] = useState<Recipient[]>(DEFAULT_RECIPIENTS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [showSelectedPopup, setShowSelectedPopup] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

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

    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id]; // Adds in the exact order selected
      }
    });
  };

  const selectAllAttendees = () => {
    setRecipients((prev) => prev.map((r) => ({ ...r, selected: true })));
    setSelectedIds(recipients.map((r) => r.id));
  };

  const handleDone = () => {
    setIsSubmitted(true);
    setIsDropdownOpen(false);
  };

  // Ordered list of selected recipients according to selection sequence
  const selectedRecipients = selectedIds
    .map((id) => recipients.find((r) => r.id === id))
    .filter((r): r is Recipient => Boolean(r));

  const allSelected = selectedRecipients.length === recipients.length && recipients.length > 0;

  const getButtonText = () => {
    // 1. If dropdown is open (currently selecting), show names in selection order (e.g. Sarah J., Pooja K. +1)
    if (isDropdownOpen) {
      if (selectedRecipients.length === 0) {
        return "Choose Email Recipients";
      }
      if (selectedRecipients.length <= 2) {
        return selectedRecipients.map((r) => r.name).join(", ");
      }
      return `${selectedRecipients.slice(0, 2).map((r) => r.name).join(", ")} +${selectedRecipients.length - 2}`;
    }

    // 2. If user hasn't opened/submitted anything yet
    if (!isSubmitted) {
      return "Choose Email Recipients";
    }

    // 3. After clicking DONE:
    if (selectedRecipients.length === 0) {
      return "No Recipients Selected";
    }
    if (allSelected) {
      return "All Attendees Selected";
    }
    if (selectedRecipients.length <= 2) {
      return selectedRecipients.map((r) => r.name).join(", ");
    }
    return `${selectedRecipients.slice(0, 2).map((r) => r.name).join(", ")} +${selectedRecipients.length - 2}`;
  };

  const handleButtonClick = () => {
    if (isSubmitted && !isDropdownOpen) {
      setShowSelectedPopup(true);
    } else {
      setIsDropdownOpen(!isDropdownOpen);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-2 pb-16 relative">
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
              {selectedRecipients.map((r) => `${r.name} <${r.email}>`).join(", ") || "No recipients selected"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Email Content Wrapper with Right Side Action Buttons */}
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

        {/* Right Side Control Buttons & Dropdown */}
        <div className="w-full lg:w-64 flex flex-col gap-3 shrink-0 relative">
          
          {/* Action / Trigger Button */}
          <button 
            type="button"
            onClick={handleButtonClick}
            className="w-full bg-[#D32F2F] hover:bg-[#b71c1c] text-white text-xs font-semibold py-3 px-4 rounded-xl shadow-xs cursor-pointer flex items-center justify-center text-center transition truncate"
            title={getButtonText()}
          >
            {getButtonText()}
          </button>

          {/* 1. Recipient Selection Dropdown Menu (Positioned directly BETWEEN the two buttons) */}
          {isDropdownOpen && (
            <DropdownList
              recipients={recipients}
              onToggleRecipient={toggleRecipient}
              onSelectAllAttendees={selectAllAttendees}
              onDone={handleDone}
            />
          )}

          {/* Send Email Button */}
          <button 
            type="button"
            className="w-full bg-[#D32F2F] hover:bg-[#b71c1c] text-white text-xs font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer text-center transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>Send Email</span>
          </button>

          {/* Re-edit selection button if already configured */}
          {isSubmitted && !isDropdownOpen && (
            <button
              type="button"
              onClick={() => setIsDropdownOpen(true)}
              className="text-[11px] text-gray-500 hover:text-[#D32F2F] text-center font-medium transition cursor-pointer"
            >
              ✎ Edit Recipients
            </button>
          )}

        </div>
      </div>

      {/* 2. Selected Attendees Popup Modal */}
      {showSelectedPopup && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="text-sm font-bold text-gray-900">Selected Recipients ({selectedRecipients.length})</h3>
              <button 
                type="button"
                onClick={() => setShowSelectedPopup(false)}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {selectedRecipients.length > 0 ? (
                selectedRecipients.map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <p className="text-xs font-semibold text-gray-900">{r.name}</p>
                      <p className="text-[11px] text-gray-500">{r.email}</p>
                    </div>
                    <div className="w-4 h-4 rounded-full bg-[#D32F2F] flex items-center justify-center text-white shrink-0">
                      <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 text-center py-4">No recipients selected.</p>
              )}
            </div>

            <div className="flex gap-2 mt-5">
              <button
                type="button"
                onClick={() => {
                  setShowSelectedPopup(false);
                  setIsDropdownOpen(true);
                }}
                className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold py-2 rounded-xl transition cursor-pointer"
              >
                Change
              </button>
              <button
                type="button"
                onClick={() => setShowSelectedPopup(false)}
                className="flex-1 bg-[#D32F2F] hover:bg-[#b71c1c] text-white text-xs font-semibold py-2 rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default EmailPreview;
