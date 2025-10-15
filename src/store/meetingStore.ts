import { create } from 'zustand';
import type { Meeting } from '../lib/database.types';

interface MeetingStore {
  meetings: Meeting[];
  isLoading: boolean;
  lastSyncTime: Date | null;
  isSyncing: boolean;
  searchQuery: string;
  filterStatus: 'all' | 'today' | 'week' | 'recorded';
  viewMode: 'grid' | 'list';

  setMeetings: (meetings: Meeting[]) => void;
  addMeeting: (meeting: Meeting) => void;
  updateMeeting: (id: string, updates: Partial<Meeting>) => void;
  removeMeeting: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setLastSyncTime: (time: Date) => void;
  setSyncing: (syncing: boolean) => void;
  setSearchQuery: (query: string) => void;
  setFilterStatus: (status: 'all' | 'today' | 'week' | 'recorded') => void;
  setViewMode: (mode: 'grid' | 'list') => void;

  getUpcomingMeetings: () => Meeting[];
  getInProgressMeetings: () => Meeting[];
  getTodayMeetings: () => Meeting[];
  getRecordedMeetings: () => Meeting[];
  getFilteredMeetings: () => Meeting[];
}

export const useMeetingStore = create<MeetingStore>((set, get) => ({
  meetings: [],
  isLoading: false,
  lastSyncTime: null,
  isSyncing: false,
  searchQuery: '',
  filterStatus: 'all',
  viewMode: 'grid',

  setMeetings: (meetings) => set({ meetings }),

  addMeeting: (meeting) => set((state) => ({
    meetings: [...state.meetings, meeting]
  })),

  updateMeeting: (id, updates) => set((state) => ({
    meetings: state.meetings.map((m) =>
      m.id === id ? { ...m, ...updates } : m
    )
  })),

  removeMeeting: (id) => set((state) => ({
    meetings: state.meetings.filter((m) => m.id !== id)
  })),

  setLoading: (loading) => set({ isLoading: loading }),
  setLastSyncTime: (time) => set({ lastSyncTime: time }),
  setSyncing: (syncing) => set({ isSyncing: syncing }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilterStatus: (status) => set({ filterStatus: status }),
  setViewMode: (mode) => set({ viewMode: mode }),

  getUpcomingMeetings: () => {
    const now = new Date();
    return get().meetings.filter(m =>
      m.status === 'upcoming' && new Date(m.start_time) > now
    ).sort((a, b) =>
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );
  },

  getInProgressMeetings: () => {
    return get().meetings.filter(m => m.status === 'in_progress');
  },

  getTodayMeetings: () => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    return get().meetings.filter(m => {
      const meetingStart = new Date(m.start_time);
      return meetingStart >= startOfDay && meetingStart < endOfDay;
    }).sort((a, b) =>
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );
  },

  getRecordedMeetings: () => {
    return get().meetings.filter(m =>
      m.recording_status === 'completed' || m.recording_status === 'recording'
    ).sort((a, b) =>
      new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
    );
  },

  getFilteredMeetings: () => {
    const { meetings, searchQuery, filterStatus } = get();

    let filtered = meetings;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m =>
        m.title.toLowerCase().includes(query) ||
        m.description.toLowerCase().includes(query) ||
        (m.attendees as any[]).some(a =>
          a.email?.toLowerCase().includes(query) ||
          a.name?.toLowerCase().includes(query)
        )
      );
    }

    switch (filterStatus) {
      case 'today':
        return filtered.filter(m => {
          const now = new Date();
          const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
          const meetingStart = new Date(m.start_time);
          return meetingStart >= startOfDay && meetingStart < endOfDay;
        });
      case 'week':
        return filtered.filter(m => {
          const now = new Date();
          const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          const meetingStart = new Date(m.start_time);
          return meetingStart >= now && meetingStart <= weekFromNow;
        });
      case 'recorded':
        return filtered.filter(m =>
          m.recording_status === 'completed' || m.recording_status === 'recording'
        );
      default:
        return filtered;
    }
  }
}));
