import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import NoteTakerMain from "./Main";
import CalendarSync from "./CalendarSync";

interface NoteTakerEntryProps { }

const NoteTakerEntry: React.FC<NoteTakerEntryProps> = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab");

  // By default, start with isCalendarSynced = false so CalendarSync lands first.
  // If the user directly navigates to a tab (like ?tab=dashboard), they can view the main workspace.
  const [isCalendarSynced, setIsCalendarSynced] = useState<boolean>(
    Boolean(requestedTab && requestedTab !== "calendar")
  );

  // Whenever the page is freshly opened without a tab query or with ?tab=calendar / ?sync=true, land on CalendarSync
  if (!isCalendarSynced || searchParams.get("sync") === "true" || requestedTab === "calendar") {
    return (
      <CalendarSync
        onSyncComplete={() => {
          setIsCalendarSynced(true);
          setSearchParams({ tab: "dashboard" });
        }}
      />
    );
  }

  // Once synced or navigated to a specific tab -> Show Main Notetaker AI workspace
  return <NoteTakerMain />;
};

export default NoteTakerEntry;
