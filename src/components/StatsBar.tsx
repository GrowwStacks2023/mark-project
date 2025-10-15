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
      color: 'bg-blue-100 text-blue-700',
    },
    {
      label: 'Active Recordings',
      value: activeRecordings,
      icon: Circle,
      color: 'bg-red-100 text-red-700',
    },
    {
      label: 'Upcoming',
      value: upcomingMeetings.length,
      icon: TrendingUp,
      color: 'bg-green-100 text-green-700',
    },
    {
      label: 'Next Meeting',
      value: timeUntilNext !== null ? `${timeUntilNext}m` : 'None',
      icon: Clock,
      color: 'bg-purple-100 text-purple-700',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-lg ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
