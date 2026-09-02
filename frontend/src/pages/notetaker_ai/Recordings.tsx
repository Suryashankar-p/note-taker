import React from "react";

const Recordings: React.FC = () => {
  return (
    <div className="w-full px-8 md:px-12 py-6 flex flex-col gap-6">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-primary_text tracking-tight">Recordings</h1>
        <p className="text-xs text-faint_text mt-1 font-normal">View, search, and manage your recorded meetings and transcripts.</p>
      </div>

      <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-primary_text border-b border-[#F0F0F0] pb-3">Recent Meetings</h2>
        <p className="text-xs text-faint_text pt-4">No recent meeting recordings found.</p>
      </div>
    </div>
  );
};

export default Recordings;
