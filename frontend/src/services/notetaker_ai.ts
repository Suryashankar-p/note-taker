import { NotetakerAPI } from "./Axios";

export interface MeetingItem {
  id: string;
  title: string;
  date: string;
  time: string;
  attendees: number;
  type: "upcoming" | "past";
}

/**
 * Checks with the backend whether the user has synced their calendar.
 * Interceptor automatically attaches the Authorization Bearer token
 * and handles 401/500 errors.
 */
export const CheckCalendarSyncStatus = async (): Promise<boolean> => {
  try {
    const data = await NotetakerAPI.get("/notetaker/calendar-status");
    return data?.is_synced ?? data ?? false;
  } catch (error) {
    console.error("Error checking calendar sync status:", error);
    return false;
  }
};

/**
 * Fetches extracted meetings from the user's synced calendar.
 */
export const GetCalendarMeetings = async (): Promise<MeetingItem[]> => {
  try {
    const data = await NotetakerAPI.get("/notetaker/meetings");
    return data?.result || data || [];
  } catch (error) {
    console.error("Error fetching calendar meetings:", error);
    return [];
  }
};

/**
 * Syncs the user's Microsoft 365 or Google Calendar.
 */
export const SyncCalendar = async (provider: "microsoft" | "google"): Promise<any> => {
  try {
    const data = await NotetakerAPI.post("/notetaker/sync-calendar", { provider });
    return data;
  } catch (error) {
    console.error("Error syncing calendar:", error);
    throw error;
  }
};

/**
 * Sends meeting summary email to selected recipients.
 */
export const SendMeetingEmail = async (
  meetingId: string,
  recipients: string[]
): Promise<any> => {
  try {
    const data = await NotetakerAPI.post(`/notetaker/meetings/${meetingId}/send-email`, {
      recipients,
    });
    return data;
  } catch (error) {
    console.error("Error sending meeting email:", error);
    throw error;
  }
};
