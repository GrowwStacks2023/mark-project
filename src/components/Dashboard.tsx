import { useState, useEffect } from 'react';
import { Search, Grid, List, RefreshCw, LogOut, Clock, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useMeetingStore } from '../store/meetingStore';
import { useAuthStore } from '../store/authStore';
import { fetchGoogleCalendarEvents, convertGoogleEventToMeeting } from '../services/googleCalendar';
import MeetingCard from './MeetingCard';
import StatsBar from './StatsBar';

export default function Dashboard() {
  const {
    meetings,
    isLoading,
    isSyncing,
    searchQuery,
    filterStatus,
    viewMode,
    setMeetings,
    setLoading,
    setSyncing,
    setSearchQuery,
    setFilterStatus,
    setViewMode,
    getFilteredMeetings,
  } = useMeetingStore();

  const { accessToken, userEmail, logout } = useAuthStore();
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const syncCalendar = async () => {
    if (!accessToken) return;

    setSyncing(true);
    try {
      const events = await fetchGoogleCalendarEvents(accessToken);
      const convertedMeetings = events.map((event) =>
        convertGoogleEventToMeeting(event, userEmail || 'user')
      );

      setMeetings(convertedMeetings as any);
      setLastSync(new Date());
      toast.success('Calendar synced successfully!');
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Failed to sync calendar');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    syncCalendar();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      syncCalendar();
    }, 3 * 60 * 1000);

    return () => clearInterval(interval);
  }, [accessToken]);

  const filteredMeetings = getFilteredMeetings();

  const happeningNow = meetings.filter((m) => m.status === 'in_progress');
  const upcomingToday = filteredMeetings.filter(
    (m) => m.status === 'upcoming' && new Date(m.start_time).toDateString() === new Date().toDateString()
  );
  const laterThisWeek = filteredMeetings.filter((m) => {
    const now = new Date();
    const meetingDate = new Date(m.start_time);
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return (
      m.status === 'upcoming' &&
      meetingDate.toDateString() !== now.toDateString() &&
      meetingDate <= weekFromNow
    );
  });

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  const filterButtons = [
    { label: 'All', value: 'all' as const },
    { label: 'Today', value: 'today' as const },
    { label: 'This Week', value: 'week' as const },
    { label: 'Recorded', value: 'recorded' as const },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                MeetingHub
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isSyncing ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'
                  }`}
                />
                <span className="text-sm text-gray-600">
                  {isSyncing ? 'Syncing...' : 'Synced'}
                </span>
              </div>

              <button
                onClick={syncCalendar}
                disabled={isSyncing}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh calendar"
              >
                <RefreshCw className={`w-5 h-5 text-gray-600 ${isSyncing ? 'animate-spin' : ''}`} />
              </button>

              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                  {userEmail?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="text-sm text-gray-700">{userEmail}</span>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StatsBar />

        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search meetings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200">
              {filterButtons.map((button) => (
                <button
                  key={button.value}
                  onClick={() => setFilterStatus(button.value)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    filterStatus === button.value
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {button.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : (
          <div className="space-y-10">
            {happeningNow.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="relative">
                      <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-pulse" />
                      <div className="absolute inset-0 w-3 h-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-ping" />
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      Happening Now
                    </h2>
                    <span className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold rounded-full">
                      LIVE
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">Join your active meetings</p>
                </div>
                <div className={`grid gap-6 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                  {happeningNow.map((meeting) => (
                    <MeetingCard key={meeting.id} meeting={meeting} />
                  ))}
                </div>
              </motion.section>
            )}

            {upcomingToday.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Upcoming Today
                    </h2>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                      {upcomingToday.length}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">Your meetings scheduled for today</p>
                </div>
                <div className={`grid gap-6 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                  {upcomingToday.map((meeting) => (
                    <MeetingCard key={meeting.id} meeting={meeting} />
                  ))}
                </div>
              </motion.section>
            )}

            {laterThisWeek.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-violet-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Later This Week
                    </h2>
                    <span className="px-3 py-1 bg-violet-100 text-violet-700 text-xs font-bold rounded-full">
                      {laterThisWeek.length}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">Upcoming meetings in the next 7 days</p>
                </div>
                <div className={`grid gap-6 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                  {laterThisWeek.map((meeting) => (
                    <MeetingCard key={meeting.id} meeting={meeting} />
                  ))}
                </div>
              </motion.section>
            )}

            {filteredMeetings.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No meetings found</h3>
                <p className="text-gray-600">Try adjusting your search or filters</p>
              </motion.div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
