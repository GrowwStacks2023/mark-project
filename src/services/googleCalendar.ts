import type { Meeting, Attendee } from '../lib/database.types';

const GOOGLE_CALENDAR_API = 'https://www.googleapis.com/calendar/v3';

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: string;
  }>;
  hangoutLink?: string;
  conferenceData?: {
    entryPoints?: Array<{
      entryPointType: string;
      uri: string;
    }>;
  };
  status: string;
}

export const fetchGoogleCalendarEvents = async (
  accessToken: string,
  timeMin?: string,
  timeMax?: string
): Promise<GoogleCalendarEvent[]> => {
  const now = timeMin || new Date().toISOString();
  const maxTime = timeMax || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const url = new URL(`${GOOGLE_CALENDAR_API}/calendars/primary/events`);
  url.searchParams.append('timeMin', now);
  url.searchParams.append('timeMax', maxTime);
  url.searchParams.append('singleEvents', 'true');
  url.searchParams.append('orderBy', 'startTime');
  url.searchParams.append('maxResults', '50');

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to fetch calendar events: ${error.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.items || [];
};

export const convertGoogleEventToMeeting = (
  event: GoogleCalendarEvent,
  userId: string
): Omit<Meeting, 'id' | 'created_at' | 'updated_at'> => {
  const now = new Date();
  const startTime = new Date(event.start.dateTime);
  const endTime = new Date(event.end.dateTime);

  let status: 'upcoming' | 'in_progress' | 'completed' = 'upcoming';
  if (now >= startTime && now <= endTime) {
    status = 'in_progress';
  } else if (now > endTime) {
    status = 'completed';
  }

  const attendees: Attendee[] = (event.attendees || []).map(a => ({
    email: a.email,
    name: a.displayName,
    responseStatus: a.responseStatus as any,
  }));

  const meetingLink = event.hangoutLink ||
    event.conferenceData?.entryPoints?.find(e => e.entryPointType === 'video')?.uri ||
    null;

  return {
    user_id: userId,
    google_event_id: event.id,
    title: event.summary || 'Untitled Meeting',
    description: event.description || '',
    start_time: event.start.dateTime,
    end_time: event.end.dateTime,
    timezone: event.start.timeZone || 'UTC',
    meeting_link: meetingLink,
    status,
    attendees: attendees as any,
    recording_status: 'none',
    fireflies_transcript_id: null,
    notes: '',
  };
};

export const refreshAccessToken = async (refreshToken: string): Promise<string> => {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh access token');
  }

  const data = await response.json();
  return data.access_token;
};

export const getUserProfile = async (accessToken: string) => {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }

  return response.json();
};
