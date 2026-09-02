import { SSOAPI } from "./Axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_NOTETAKER_URL || import.meta.env.VITE_BACKEND_SSO_URL;

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
 * Returns true if synced, false otherwise.
 */
export const CheckCalendarSyncStatus = async (): Promise<boolean> => {
  try {
    const response = await SSOAPI.get(`${BACKEND_URL}/notetaker/calendar-status`);
    return response.data?.is_synced ?? response.data ?? false;
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
    const response = await SSOAPI.get(`${BACKEND_URL}/notetaker/meetings`);
    return response.data?.result || response.data || [];
  } catch (error) {
    console.error("Error fetching calendar meetings:", error);
    return [];
  }
};
