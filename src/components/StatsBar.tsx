import { Calendar, Circle, Clock, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import { useMeetingStore } from '../store/meetingStore';

export default function StatsBar() {
  const { meetings } = useMeetingStore();

  const todayMeetings = meetings.filter((m) => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const meetingStart = new Date(m.start_time);
    return meetingStart >= startOfDay && meetingStart < endOfDay;
  });

  const activeRecordings = meetings.filter((m) => m.recording_status === 'recording').length;

  const upcomingMeetings = meetings.filter((m) => {
    const now = new Date();
    return m.status === 'upcoming' && new Date(m.start_time) > now;
  }).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  const nextMeeting = upcomingMeetings[0];
  const timeUntilNext = nextMeeting
    ? dayjs(nextMeeting.start_time).diff(dayjs(), 'minute')
    : null;

  const stats = [
    {
      label: 'Meetings Today',
      value: todayMeetings.length,
      icon: Calendar,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50',
    },
    {
      label: 'Active Recordings',
      value: activeRecordings,
      icon: Circle,
      gradient: 'from-red-500 to-rose-500',
      bgGradient: 'from-red-50 to-rose-50',
    },
    {
      label: 'Upcoming',
      value: upcomingMeetings.length,
      icon: TrendingUp,
      gradient: 'from-emerald-500 to-teal-500',
      bgGradient: 'from-emerald-50 to-teal-50',
    },
    {
      label: 'Next Meeting',
      value: timeUntilNext !== null ? (timeUntilNext > 60 ? `${Math.floor(timeUntilNext / 60)}h` : `${timeUntilNext}m`) : 'None',
      icon: Clock,
      gradient: 'from-violet-500 to-purple-500',
      bgGradient: 'from-violet-50 to-purple-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1, ease: 'easeOut' }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 overflow-hidden group"
        >
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`} />

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-2">{stat.label}</p>
              <p className={`text-4xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                {stat.value}
              </p>
            </div>
            <div className={`p-4 rounded-xl bg-gradient-to-br ${stat.bgGradient} shadow-md`}>
              <stat.icon className={`w-7 h-7 bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`} strokeWidth={2.5} />
            </div>
          </div>

          <div className={`absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.bgGradient} rounded-full blur-3xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 -mr-16 -mb-16`} />
        </motion.div>
      ))}
    </div>
  );
}
