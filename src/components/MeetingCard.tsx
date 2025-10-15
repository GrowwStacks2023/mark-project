import { Calendar, Clock, Users, Video, Circle, Loader2, ExternalLink } from 'lucide-react';
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
        return 'border-l-green-500';
      case 'completed':
        return 'border-l-gray-400';
      default:
        return 'border-l-blue-500';
    }
  };

  const getStatusBadge = () => {
    if (meeting.status === 'in_progress') {
      return (
        <div className="flex items-center gap-1.5 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
          <Circle className="w-2 h-2 fill-green-500 animate-pulse" />
          Live
        </div>
      );
    }
    if (meeting.status === 'completed') {
      return (
        <div className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
          Completed
        </div>
      );
    }
    return null;
  };

  const getRecordingBadge = () => {
    if (meeting.recording_status === 'recording') {
      return (
        <div className="flex items-center gap-1.5 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
          <Circle className="w-2 h-2 fill-red-500 animate-pulse" />
          Recording
        </div>
      );
    }
    if (meeting.recording_status === 'completed') {
      return (
        <div className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
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
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border-l-4 ${getStatusColor()} overflow-hidden group`}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">
              {meeting.title}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              {getStatusBadge()}
              {getRecordingBadge()}
              {meeting.status === 'upcoming' && timeUntilMeeting && (
                <div className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                  {timeUntilMeeting}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{startTime.format('MMM D, YYYY')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>
              {startTime.format('h:mm A')} - {endTime.format('h:mm A')} ({duration} min)
            </span>
          </div>
          {attendees.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <div className="flex items-center gap-1">
                <div className="flex -space-x-2">
                  {attendees.slice(0, 3).map((attendee) => (
                    <div
                      key={attendee.email}
                      className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-white flex items-center justify-center text-xs text-white font-medium"
                      title={attendee.email}
                    >
                      {attendee.name?.charAt(0) || attendee.email.charAt(0).toUpperCase()}
                    </div>
                  ))}
                </div>
                {attendees.length > 3 && (
                  <span className="text-xs text-gray-500 ml-1">
                    +{attendees.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {meeting.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {meeting.description}
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleJoinMeeting}
            disabled={!meeting.meeting_link}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
          >
            <Video className="w-4 h-4" />
            <span>Join Meeting</span>
            <ExternalLink className="w-3 h-3" />
          </button>

          <button
            onClick={handleStartRecording}
            disabled={
              !meeting.meeting_link ||
              isRecordingLoading ||
              meeting.recording_status === 'recording'
            }
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
              meeting.recording_status === 'recording'
                ? 'bg-red-100 text-red-700 cursor-default'
                : 'bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-600'
            }`}
          >
            {isRecordingLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Circle className={`w-4 h-4 ${meeting.recording_status === 'recording' ? 'fill-red-600 animate-pulse' : ''}`} />
            )}
            <span>
              {meeting.recording_status === 'recording'
                ? 'Recording...'
                : 'Start Recording'}
            </span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
