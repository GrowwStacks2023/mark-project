import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Calendar,
  CheckCircle2,
  Video,
  Users,
  Circle,
  Loader2,
  ExternalLink,
  Play,
  Download,
  FileText,
  TrendingUp,
  RefreshCw,
  Brain,
} from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import toast from 'react-hot-toast';
import { useMeetingStore } from '../store/meetingStore';
import { useAuthStore } from '../store/authStore';
import { fetchGoogleCalendarEvents, convertGoogleEventToMeeting } from '../services/googleCalendar';
import { inviteFirefliesBot, fetchTranscripts, FirefliesTranscript } from '../services/fireflies';
import type { Meeting, Attendee } from '../lib/database.types';
import MainLayout, { TabId } from './layout/MainLayout';
import Button from './ui/Button';
import Card, { CardContent } from './ui/Card';
import Badge from './ui/Badge';
import { cn, getGreeting, getTimeUntil, formatDuration } from '../lib/utils';

dayjs.extend(relativeTime);

export default function EnterpriseApp() {
  const [currentTab, setCurrentTab] = useState<TabId>('dashboard');
  const [recordings, setRecordings] = useState<FirefliesTranscript[]>([]);
  const [isLoadingRecordings, setIsLoadingRecordings] = useState(false);

  const {
    meetings,
    isSyncing,
    setSyncing,
    setMeetings,
    updateMeeting,
  } = useMeetingStore();

  const { accessToken, userEmail } = useAuthStore();

  const syncCalendar = async () => {
    if (!accessToken) return;

    setSyncing(true);
    try {
      const events = await fetchGoogleCalendarEvents(accessToken);
      const convertedMeetings = events.map((event) =>
        convertGoogleEventToMeeting(event, userEmail || 'user')
      );

      setMeetings(convertedMeetings as any);
      toast.success('Calendar synced successfully!');
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Failed to sync calendar');
    } finally {
      setSyncing(false);
    }
  };

  const loadRecordings = async () => {
    setIsLoadingRecordings(true);
    try {
      console.log('Loading recordings from Fireflies...');
      const transcripts = await fetchTranscripts(50);

      console.log('Received transcripts:', transcripts);
      setRecordings(transcripts);

      if (transcripts.length > 0) {
        toast.success(`Loaded ${transcripts.length} recordings`);
      } else {
        toast('No recordings found', {
          icon: '📹',
        });
      }
    } catch (error) {
      console.error('Error loading recordings:', error);
      toast.error('Failed to load recordings');
    } finally {
      setIsLoadingRecordings(false);
    }
  };

  useEffect(() => {
    syncCalendar();
    const interval = setInterval(syncCalendar, 3 * 60 * 1000);
    return () => clearInterval(interval);
  }, [accessToken]);

  useEffect(() => {
    if (currentTab === 'recordings') {
      loadRecordings();
      const interval = setInterval(loadRecordings, 30 * 1000);
      return () => clearInterval(interval);
    }
  }, [currentTab]);

  const happeningNow = meetings.filter((m) => m.status === 'in_progress');
  const upcomingToday = meetings.filter(
    (m) =>
      m.status === 'upcoming' &&
      dayjs(m.start_time).isSame(dayjs(), 'day')
  );
  const totalRecorded = recordings.length;
  const activeRecordings = meetings.filter((m) => m.recording_status === 'recording').length;

  const stats = [
    {
      label: "Today's Meetings",
      value: upcomingToday.length + happeningNow.length,
      icon: Calendar,
      color: 'text-primary-600',
      bg: 'bg-primary-100',
      trend: '+12%',
    },
    {
      label: 'Active Recordings',
      value: activeRecordings,
      icon: Circle,
      color: 'text-red-600',
      bg: 'bg-red-100',
      pulse: activeRecordings > 0,
    },
    {
      label: 'Completed Today',
      value: meetings.filter((m) => m.status === 'completed' && dayjs(m.start_time).isSame(dayjs(), 'day')).length,
      icon: CheckCircle2,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      label: 'Total Recorded',
      value: totalRecorded,
      icon: Video,
      color: 'text-secondary-600',
      bg: 'bg-secondary-100',
    },
  ];

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            {getGreeting()}, {userEmail?.split('@')[0] || 'User'}
          </h2>
          <p className="text-gray-600 mt-1">{dayjs().format('dddd, MMMM D, YYYY')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} hover className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                    {stat.trend && (
                      <div className="flex items-center gap-1 mt-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-600">{stat.trend}</span>
                      </div>
                    )}
                  </div>
                  <div className={cn('p-3 rounded-lg', stat.bg)}>
                    <Icon className={cn('w-6 h-6', stat.color, stat.pulse && 'animate-pulse')} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {happeningNow.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <h3 className="text-xl font-bold text-gray-900">Happening Now</h3>
          </div>
          {happeningNow.map((meeting) => (
            <MeetingCardEnhanced key={meeting.id} meeting={meeting} updateMeeting={updateMeeting} />
          ))}
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900">Upcoming Today</h3>
        {upcomingToday.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900">No meetings today</h4>
              <p className="text-gray-600 mt-1">Enjoy your free time!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingToday.map((meeting) => (
              <MeetingCardEnhanced key={meeting.id} meeting={meeting} updateMeeting={updateMeeting} />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderRecordings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Recordings Library</h2>
          <p className="text-gray-600 mt-1">
            {recordings.length > 0
              ? `${recordings.length} recordings available`
              : 'No recordings yet'}
          </p>
        </div>
        <Button onClick={loadRecordings} isLoading={isLoadingRecordings}>
          <Video className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {isLoadingRecordings ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-900 font-semibold text-lg">Loading recordings from Fireflies...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
        </div>
      ) : recordings.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center mx-auto mb-6">
              <Video className="w-10 h-10 text-blue-600" />
            </div>
            <h4 className="text-2xl font-bold text-gray-900 mb-2">No recordings yet</h4>
            <p className="text-gray-600 text-lg mb-6">
              Your recorded meetings will appear here after they finish processing.
            </p>
            <Button onClick={loadRecordings} className="mt-2" variant="secondary">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recordings.map((recording) => (
            <RecordingCard key={recording.id} recording={recording} />
          ))}
        </div>
      )}
    </div>
  );

  const renderInsights = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">AI-Powered Insights</h2>
        <p className="text-gray-600 mt-1">Actionable intelligence from your meetings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-blue-500"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Meeting Productivity</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Average Duration</span>
              <span className="text-lg font-bold text-gray-900">42 min</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Attendance Rate</span>
              <span className="text-lg font-bold text-green-600">94%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">On-Time Starts</span>
              <span className="text-lg font-bold text-blue-600">87%</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-emerald-500"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Action Items</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Created</span>
              <span className="text-lg font-bold text-gray-900">127</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Completed</span>
              <span className="text-lg font-bold text-emerald-600">98</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Completion Rate</span>
              <span className="text-lg font-bold text-emerald-600">77%</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-violet-500"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 flex items-center justify-center">
              <Users className="w-6 h-6 text-violet-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Participation</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Avg Attendees</span>
              <span className="text-lg font-bold text-gray-900">8.4</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active Speakers</span>
              <span className="text-lg font-bold text-violet-600">6.2</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Engagement</span>
              <span className="text-lg font-bold text-violet-600">High</span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Top Discussion Topics
          </h3>
          <div className="space-y-3">
            {[
              { topic: 'Product Roadmap Q2', count: 12, color: 'blue' },
              { topic: 'Budget Planning', count: 9, color: 'emerald' },
              { topic: 'Team Hiring', count: 8, color: 'violet' },
              { topic: 'Marketing Strategy', count: 7, color: 'amber' },
              { topic: 'Customer Feedback', count: 6, color: 'rose' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full bg-${item.color}-500`} />
                  <span className="font-medium text-gray-900">{item.topic}</span>
                </div>
                <span className="text-sm font-semibold text-gray-600">{item.count} mentions</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            Recent Key Decisions
          </h3>
          <div className="space-y-4">
            {[
              {
                decision: 'Approved Q2 marketing budget increase',
                meeting: 'Budget Review',
                date: '2 days ago',
              },
              {
                decision: 'Launch product beta by end of month',
                meeting: 'Product Planning',
                date: '5 days ago',
              },
              {
                decision: 'Hire 3 new engineers for platform team',
                meeting: 'Team Expansion',
                date: '1 week ago',
              },
              {
                decision: 'Implement new customer feedback system',
                meeting: 'Customer Success',
                date: '1 week ago',
              },
            ].map((item, idx) => (
              <div key={idx} className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border-l-4 border-emerald-500">
                <p className="font-semibold text-gray-900 mb-1">{item.decision}</p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">{item.meeting}</span>
                  <span>•</span>
                  <span>{item.date}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-lg p-8 border border-blue-100"
      >
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">AI Recommendation</h3>
            <p className="text-gray-700 text-lg leading-relaxed">
              Your team has 23% more meetings scheduled this week compared to last week. Consider consolidating similar topics to improve efficiency and reduce meeting fatigue. We've identified 4 meetings that could potentially be combined.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );

  return (
    <MainLayout
      currentTab={currentTab}
      onTabChange={setCurrentTab}
      isSyncing={isSyncing}
      onSync={syncCalendar}
    >
      <AnimatePresence mode="wait">
        {currentTab === 'dashboard' && renderDashboard()}
        {currentTab === 'meetings' && (
          <div className="text-center py-20">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900">All Meetings View</h3>
            <p className="text-gray-600 mt-2">Full calendar view coming soon</p>
          </div>
        )}
        {currentTab === 'recordings' && renderRecordings()}
        {currentTab === 'insights' && renderInsights()}
      </AnimatePresence>
    </MainLayout>
  );
}

interface MeetingCardEnhancedProps {
  meeting: Meeting;
  updateMeeting: (id: string, updates: Partial<Meeting>) => void;
}

function MeetingCardEnhanced({ meeting, updateMeeting }: MeetingCardEnhancedProps) {
  const [isRecordingLoading, setIsRecordingLoading] = useState(false);
  const startTime = dayjs(meeting.start_time);
  const endTime = dayjs(meeting.end_time);
  const duration = endTime.diff(startTime, 'minute');
  const attendees = (meeting.attendees as Attendee[]) || [];

  const handleStartRecording = async () => {
    if (!meeting.meeting_link || meeting.recording_status === 'recording') return;

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
      toast.error('Failed to start recording');
    } finally {
      setIsRecordingLoading(false);
    }
  };

  return (
    <Card hover className="relative overflow-hidden border-l-4 border-l-primary-500">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">{meeting.title}</h4>
            <div className="flex items-center gap-2 flex-wrap">
              {meeting.status === 'in_progress' && (
                <Badge variant="success" pulse>
                  <Circle className="w-2 h-2 fill-green-600" />
                  Live
                </Badge>
              )}
              {meeting.recording_status === 'recording' && (
                <Badge variant="danger" pulse>
                  <Circle className="w-2 h-2 fill-red-600" />
                  Recording
                </Badge>
              )}
              {meeting.status === 'upcoming' && (
                <Badge variant="primary">{getTimeUntil(new Date(meeting.start_time))}</Badge>
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
              <span>{attendees.length} attendees</span>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => meeting.meeting_link && window.open(meeting.meeting_link, '_blank')}
            disabled={!meeting.meeting_link}
            className="flex-1"
            size="sm"
          >
            <Video className="w-4 h-4" />
            Join
            <ExternalLink className="w-3 h-3" />
          </Button>

          <Button
            onClick={handleStartRecording}
            disabled={!meeting.meeting_link || isRecordingLoading || meeting.recording_status === 'recording'}
            variant={meeting.recording_status === 'recording' ? 'secondary' : 'danger'}
            className="flex-1"
            size="sm"
            isLoading={isRecordingLoading}
          >
            {meeting.recording_status === 'recording' ? (
              <>
                <Circle className="w-4 h-4 fill-red-600 animate-pulse" />
                Recording
              </>
            ) : (
              <>
                <Circle className="w-4 h-4" />
                Record
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface RecordingCardProps {
  recording: FirefliesTranscript;
}

function RecordingCard({ recording }: RecordingCardProps) {
  const recordingDate = dayjs(recording.date);
  const durationFormatted = recording.duration ? formatDuration(recording.duration) : 'N/A';
  const hasAnyUrl = recording.transcript_url || recording.audio_url || recording.video_url;

  return (
    <Card hover className="relative overflow-hidden border-l-4 border-l-green-500">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">
              {recording.title || 'Untitled Recording'}
            </h4>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="success">
                <CheckCircle2 className="w-3 h-3" />
                Completed
              </Badge>
              {recording.summary?.meeting_type && (
                <Badge variant="gray">{recording.summary.meeting_type}</Badge>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{recordingDate.isValid() ? recordingDate.format('MMM D, YYYY • h:mm A') : 'Date N/A'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{durationFormatted}</span>
          </div>
          {recording.speakers && recording.speakers.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>{recording.speakers.length} speaker{recording.speakers.length > 1 ? 's' : ''}</span>
            </div>
          )}
          {recording.meeting_attendees && recording.meeting_attendees.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>{recording.meeting_attendees.length} attendee{recording.meeting_attendees.length > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {recording.summary?.overview && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{recording.summary.overview}</p>
        )}

        {hasAnyUrl ? (
          <div className="flex gap-2 flex-wrap">
            {recording.transcript_url && (
              <Button
                onClick={() => window.open(recording.transcript_url, '_blank')}
                variant="secondary"
                size="sm"
                className="flex-1"
              >
                <FileText className="w-4 h-4" />
                Transcript
              </Button>
            )}
            {recording.audio_url && (
              <Button
                onClick={() => window.open(recording.audio_url, '_blank')}
                variant="secondary"
                size="sm"
                className="flex-1"
              >
                <Play className="w-4 h-4" />
                Audio
              </Button>
            )}
            {recording.video_url && (
              <Button
                onClick={() => window.open(recording.video_url, '_blank')}
                variant="primary"
                size="sm"
                className="flex-1"
              >
                <Video className="w-4 h-4" />
                Video
              </Button>
            )}
          </div>
        ) : (
          <div className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
            Processing... URLs will be available soon
          </div>
        )}

        {recording.summary?.action_items && Array.isArray(recording.summary.action_items) && recording.summary.action_items.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-700 mb-2">Action Items:</p>
            <ul className="space-y-1">
              {recording.summary.action_items.slice(0, 3).map((item, idx) => (
                <li key={idx} className="text-xs text-gray-600 line-clamp-1">• {item}</li>
              ))}
              {recording.summary.action_items.length > 3 && (
                <li className="text-xs text-gray-500 italic">
                  +{recording.summary.action_items.length - 3} more
                </li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
