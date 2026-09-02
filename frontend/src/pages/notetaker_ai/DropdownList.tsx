import React from "react";
import { DropdownListProps } from "./types/Interfaces";

const DropdownList: React.FC<DropdownListProps> = ({
  recipients,
  onToggleRecipient,
  onSelectAllAttendees,
  onDone,
}) => {
  return (
    <div className="w-full bg-white border border-gray-200 rounded-2xl p-4 shadow-xl flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-150">
      <span className="text-xs font-bold text-gray-500 tracking-wide uppercase">Attendees list</span>

      <div className="space-y-2.5">
        {recipients.map((recipient) => (
          <div
            key={recipient.id}
            onClick={() => onToggleRecipient(recipient.id)}
            className="flex items-center justify-between p-3 border border-gray-200 bg-white rounded-xl shadow-2xs hover:bg-gray-50 transition cursor-pointer select-none"
          >
            <span className="text-xs font-semibold text-gray-800">{recipient.name}</span>
            <div className="flex items-center justify-center">
              {recipient.selected ? (
                <div className="w-4 h-4 rounded-full bg-[#D32F2F] flex items-center justify-center text-white shrink-0">
                  <svg
                    className="w-2.5 h-2.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons: All Attendees & Done */}
      <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={onSelectAllAttendees}
          className="flex-1 border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 text-xs font-semibold py-2 px-3 rounded-lg shadow-2xs cursor-pointer transition text-center"
        >
          All Attendees
        </button>
        <button
          type="button"
          onClick={onDone}
          className="flex-1 bg-[#D32F2F] hover:bg-[#b71c1c] text-white text-xs font-semibold py-2 px-3 rounded-lg shadow-2xs cursor-pointer transition text-center"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default DropdownList;
