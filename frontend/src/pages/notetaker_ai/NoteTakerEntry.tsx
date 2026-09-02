import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import NoteTakerMain from "./Main";
import CalendarSync from "./CalendarSync";
import PageLoading from "../../components/PageLoading";
import { CheckCalendarSyncStatus } from "../../services/notetaker_ai";

interface NoteTakerEntryProps {}

const NoteTakerEntry: React.FC<NoteTakerEntryProps> = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [isCalendarSynced, setIsCalendarSynced] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const forceSyncView =
    searchParams.get("sync") === "true" || searchParams.get("tab") === "calendar";

  useEffect(() => {
    checkCalendarStatus();
  }, [forceSyncView]);

  const checkCalendarStatus = async () => {
    if (forceSyncView) {
      setIsCalendarSynced(false);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const isSynced = await CheckCalendarSyncStatus();
      setIsCalendarSynced(isSynced === true);
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

  // If user has NOT synced calendar (false) or explicitly requested sync view -> Show CalendarSync page
  if (!isCalendarSynced || forceSyncView) {
    return (
      <CalendarSync
        onSyncComplete={() => {
          localStorage.setItem("notetaker_calendar_synced", "true");
          setIsCalendarSynced(true);
          if (forceSyncView) {
            setSearchParams({ tab: "dashboard" });
          }
        }}
      />
    );
  }

  // If user HAS synced calendar (true) -> Show Main Notetaker AI workspace
  return <NoteTakerMain />;
};

export default NoteTakerEntry;
