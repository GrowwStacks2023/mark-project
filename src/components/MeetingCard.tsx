import { Calendar, Clock, Users, Video, Circle, Loader2, ExternalLink, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import type { Meeting, Attendee } from '../lib/database.types';
import { inviteFirefliesBot } from '../services/fireflies';
import { useMeetingStore } from '../store/meetingStore';

dayjs.extend(relativeTime);

interface MeetingCardProps {
  meeting: Meeting;
}

export default function MeetingCard({ meeting }: MeetingCardProps) {
  const [isRecordingLoading, setIsRecordingLoading] = useState(false);
  const [timeUntilMeeting, setTimeUntilMeeting] = useState('');
  const { updateMeeting } = useMeetingStore();

  const startTime = dayjs(meeting.start_time);
  const endTime = dayjs(meeting.end_time);
  const duration = endTime.diff(startTime, 'minute');
  const attendees = meeting.attendees as Attendee[];

  useEffect(() => {
    const interval = setInterval(() => {
      const now = dayjs();
      if (meeting.status === 'upcoming') {
        const diff = startTime.diff(now, 'minute');
        if (diff > 60) {
          setTimeUntilMeeting(`in ${Math.floor(diff / 60)}h ${diff % 60}m`);
        } else if (diff > 0) {
          setTimeUntilMeeting(`in ${diff}m`);
        } else {
          setTimeUntilMeeting('starting now');
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [meeting.status, startTime]);

  const handleJoinMeeting = () => {
    if (meeting.meeting_link) {
      window.open(meeting.meeting_link, '_blank');
      toast.success('Opening meeting...');
    } else {
      toast.error('No meeting link available');
    }
  };

  const handleStartRecording = async () => {
    if (!meeting.meeting_link) {
      toast.error('No meeting link to record');
      return;
    }

    if (meeting.recording_status === 'recording') {
      toast('Recording is already active', { icon: '🔴' });
      return;
    }

    setIsRecordingLoading(true);

    try {
      const result = await inviteFirefliesBot(meeting.meeting_link, meeting.title);

      if (result.success) {
        updateMeeting(meeting.id, {
          recording_status: 'recording',
          fireflies_transcript_id: result.transcriptId || null,
        });
        toast.success('Fireflies bot invited! Recording will start shortly.');
      } else {
        toast.error(result.error || 'Failed to start recording');
      }
    } catch (error) {
      console.error('Recording error:', error);
      toast.error('Failed to start recording');
    } finally {
      setIsRecordingLoading(false);
    }
  };

  const getStatusColor = () => {
    switch (meeting.status) {
      case 'in_progress':
        return 'from-emerald-500 to-teal-500';
      case 'completed':
        return 'from-slate-400 to-gray-500';
      default:
        return 'from-blue-500 to-cyan-500';
    }
  };

  const getStatusBadge = () => {
    if (meeting.status === 'in_progress') {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full text-xs font-semibold shadow-lg shadow-emerald-500/30">
          <Circle className="w-2 h-2 fill-white animate-pulse" />
          Live Now
        </div>
      );
    }
    if (meeting.status === 'completed') {
      return (
        <div className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold">
          Completed
        </div>
      );
    }
    return null;
  };

  const getRecordingBadge = () => {
    if (meeting.recording_status === 'recording') {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-full text-xs font-semibold shadow-lg shadow-red-500/30">
          <Circle className="w-2 h-2 fill-white animate-pulse" />
          Recording
        </div>
      );
    }
    if (meeting.recording_status === 'completed') {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-full text-xs font-semibold shadow-lg shadow-violet-500/30">
          <Play className="w-3 h-3 fill-white" />
          Recorded
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -4 }}
      className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
    >
      <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${getStatusColor()}`} />

      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0 pr-4">
            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 leading-tight">
              {meeting.title}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              {getStatusBadge()}
              {getRecordingBadge()}
              {meeting.status === 'upcoming' && timeUntilMeeting && (
                <div className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full text-xs font-semibold shadow-lg shadow-blue-500/30">
                  {timeUntilMeeting}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-5">
          <div className="flex items-center gap-3 text-sm text-gray-700">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <span className="font-medium">{startTime.format('MMM D, YYYY')}</span>
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-700">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <span className="font-medium">
              {startTime.format('h:mm A')} - {endTime.format('h:mm A')}
              <span className="text-gray-500 ml-2">({duration} min)</span>
            </span>
          </div>

          {attendees.length > 0 && (
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {attendees.slice(0, 4).map((attendee, idx) => (
                    <div
                      key={attendee.email}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500 border-2 border-white flex items-center justify-center text-xs text-white font-bold shadow-md"
                      title={attendee.email}
                      style={{ zIndex: 10 - idx }}
                    >
                      {attendee.name?.charAt(0) || attendee.email.charAt(0).toUpperCase()}
                    </div>
                  ))}
                </div>
                {attendees.length > 4 && (
                  <span className="text-xs font-semibold text-gray-600 ml-1">
                    +{attendees.length - 4}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {meeting.description && (
          <p className="text-sm text-gray-600 mb-5 line-clamp-2 leading-relaxed">
            {meeting.description}
          </p>
        )}

        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <button
            onClick={handleJoinMeeting}
            disabled={!meeting.meeting_link}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:from-gray-400 disabled:to-gray-400"
          >
            <Video className="w-4 h-4" />
            <span>Join</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleStartRecording}
            disabled={
              !meeting.meeting_link ||
              isRecordingLoading ||
              meeting.recording_status === 'recording'
            }
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
              meeting.recording_status === 'recording'
                ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/30 cursor-default'
                : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:from-gray-400 disabled:to-gray-400'
            }`}
          >
            {isRecordingLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Circle className={`w-4 h-4 ${meeting.recording_status === 'recording' ? 'fill-white animate-pulse' : ''}`} />
            )}
            <span>
              {meeting.recording_status === 'recording'
                ? 'Recording'
                : 'Record'}
            </span>
          </button>
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-500 pointer-events-none" />
    </motion.div>
  );
}
