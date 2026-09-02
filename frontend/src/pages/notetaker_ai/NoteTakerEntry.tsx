import React, { useEffect, useState } from "react";
import NoteTakerMain from "./Main";
import CalendarSync from "./CalendarSync";
import PageLoading from "../../components/PageLoading";
import { CheckCalendarSyncStatus } from "../../services/notetaker_ai";

interface NoteTakerEntryProps {}

const NoteTakerEntry: React.FC<NoteTakerEntryProps> = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [isCalendarSynced, setIsCalendarSynced] = useState<boolean>(false);

  useEffect(() => {
    checkCalendarStatus();
  }, []);

  const checkCalendarStatus = async () => {
    try {
      setLoading(true);
      // Calls backend function to check calendar connect status (returns boolean true/false)
      const isSynced = await CheckCalendarSyncStatus();
      setIsCalendarSynced(isSynced);
    } catch (error) {
      console.error("Error checking calendar sync status:", error);
      setIsCalendarSynced(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <PageLoading />;
  }

  // If user has NOT synced calendar (false) -> Show CalendarSync page
  if (!isCalendarSynced) {
    return (
      <CalendarSync
        onSyncComplete={() => {
          setIsCalendarSynced(true);
        }}
      />
    );
  }

  // If user HAS synced calendar (true) -> Show Main Notetaker AI workspace
  return <NoteTakerMain />;
};

export default NoteTakerEntry;
