import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { useStudyPlan } from '../context/StudyPlanContext';
import { DailyView } from './DailyView';
import { WeeklyView } from './WeeklyView';
import { MonthlyView } from './MonthlyView';
import { ProgressCharts } from './ProgressCharts';
import { FlashcardStudy } from './FlashcardStudy';
import { QuizInterface } from './QuizInterface';
import { ComprehensiveAnalytics } from './ComprehensiveAnalytics';
import { ParentDashboard } from './ParentDashboard';
import { exportToPDF } from '../utils/pdfExport';
import { toast } from 'sonner';
import {
  Trophy,
  Zap,
  Target,
  Calendar,
  Download,
  LogOut,
  CalendarDays,
  CalendarRange,
  Brain,
  TrendingUp,
  PieChart,
  BarChart3,
  Activity,
  Bell
} from 'lucide-react';
import { notificationAPI } from '../services/api';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

interface StudyDashboardProps {
  userType: 'student' | 'parent';
}

export const StudyDashboard: React.FC<StudyDashboardProps> = ({ userType }) => {
  console.log("StudyDashboard rendered with userType:", userType);
  const { userProfile, studyPlan } = useStudyPlan();
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeView, setActiveView] = useState<'schedule' | 'study-tools' | 'analytics'>('schedule');
  const [studyToolsTab, setStudyToolsTab] = useState<'flashcards' | 'quizzes'>('flashcards');
  const [selectedQuizData, setSelectedQuizData] = useState<{
    topicId: string;
    subjectId: string;
    chapterId: string;
    topicName: string;
    subjectName: string;
    chapterName: string;
  } | null>(null);
  const [stats, setStats] = useState({
    overallProgress: 0,
    totalSessions: 0,
    completedSessions: 0,
    totalHours: 0,
    completedHours: 0,
    currentStreak: 0,
    daysWithActivity: 0,
    todayProgress: 0,
    todayCompleted: 0,
    todayTotal: 0
  });

  // Notifications
  interface Notification {
    id: number;
    title: string;
    message: string;
    type: string;
    is_read: boolean;
    created_at: string;
  }
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await notificationAPI.getAll();
      if (response.success) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error("Failed to load notifications");
    }
  };

  const handleMarkRead = async (id: number) => {
    try {
      await notificationAPI.markRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (error) {
      console.error("Failed to mark read");
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout? All your data is safely saved.')) {
      try {
        // Clear all localStorage
        localStorage.clear();

        // Show success message
        toast.success('Logged out successfully!');

        // Reload to reset app state
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } catch (error) {
        console.error('Logout exception:', error);
        toast.error('Error logging out. Please try again.');
      }
    }
  };

  if (userType === 'parent') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-black text-slate-900">Parent Dashboard</h1>
              <p className="text-slate-600">Monitor your child's study progress and performance</p>
            </div>
            <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
          <ParentDashboard />
        </div>
      </div>
    );
  }

  if (!userProfile || !studyPlan) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <h2 className="text-2xl font-bold text-gray-900">Loading your Study Dashboard...</h2>
          <p className="text-gray-600 max-w-md mx-auto">
            We're fetching your personalized study plan and progress.
            If this takes too long, please try refreshing the page or logging out and back in.
          </p>
          <div className="flex gap-2 justify-center pt-4">
            <Button onClick={() => window.location.reload()} variant="outline">Refresh Page</Button>
            <Button onClick={handleLogout} variant="ghost">Logout</Button>
          </div>
        </div>
      </div>
    );
  }

  const handleExportPDF = () => {
    toast.loading('Generating detailed PDF with all sessions...');
    setTimeout(() => {
      try {
        exportToPDF(userProfile, studyPlan);
        toast.dismiss();
        toast.success('PDF exported successfully! Check your downloads folder.', {
          description: 'Your detailed study plan includes all sessions, topics, and progress statistics.',
        });
      } catch (error) {
        toast.dismiss();
        toast.error('Failed to generate PDF. Please try again.');
      }
    }, 500);
  };

  const handleNavigateToQuiz = (sessionData: {
    topicId: string;
    subjectId: string;
    chapterId: string;
    topicName: string;
    subjectName: string;
    chapterName: string;
  }) => {
    setSelectedQuizData(sessionData);
    setActiveView('study-tools');
    setStudyToolsTab('quizzes');
    toast.success(`Opening quiz for ${sessionData.topicName}!`);
  };

  // Calculate real-time statistics from actual data
  const calculateStats = () => {
    if (!studyPlan?.days || studyPlan.days.length === 0) {
      return {
        overallProgress: 0,
        totalSessions: 0,
        completedSessions: 0,
        totalHours: 0,
        completedHours: 0,
        currentStreak: 0,
        daysWithActivity: 0,
        todayProgress: 0,
        todayCompleted: 0,
        todayTotal: 0
      };
    }

    let totalSessions = 0;
    let completedSessions = 0;
    let totalMinutes = 0;
    let completedMinutes = 0;
    let daysWithActivity = 0;

    // Calculate from days array
    studyPlan.days.forEach(day => {
      let dayHasActivity = false;
      day.sessions.forEach(session => {
        totalSessions++;
        totalMinutes += session.duration;
        if (session.completed) {
          completedSessions++;
          completedMinutes += session.duration;
          dayHasActivity = true;
        }
      });
      if (dayHasActivity) daysWithActivity++;
    });

    // Calculate streak (consecutive days with at least 1 completed session)
    let streak = 0;
    const sortedDays = [...studyPlan.days].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    for (let i = 0; i < sortedDays.length; i++) {
      const day = sortedDays[i];
      const dayDate = new Date(day.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dayDate > today) continue;

      if (day.sessions.some(s => s.completed)) {
        streak++;
      } else {
        break;
      }
    }

    // Today's progress
    const today = new Date().toISOString().split('T')[0];
    const todayData = studyPlan.days.find(d => d.date === today);
    const todayCompleted = todayData?.sessions.filter(s => s.completed).length || 0;
    const todayTotal = todayData?.sessions.length || 0;
    const todayProgress = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0;

    return {
      overallProgress: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0,
      totalSessions,
      completedSessions,
      totalHours: Math.round(totalMinutes / 60 * 10) / 10,
      completedHours: Math.round(completedMinutes / 60 * 10) / 10,
      currentStreak: streak,
      daysWithActivity,
      todayProgress,
      todayCompleted,
      todayTotal
    };
  };

  const updateStats = () => {
    const newStats = calculateStats();
    setStats(newStats);
  };

  // Update stats on component mount and when studyPlan changes
  useEffect(() => {
    updateStats();
  }, [studyPlan, studyPlan?.days]);

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-100/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-100/30 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/90 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">{userProfile.name.charAt(0)}</span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                  Welcome back, {userProfile.name}! 👋
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-medium">
                    <span>📖</span> Class {userProfile.class}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-50 text-purple-700 text-xs font-medium">
                    <span>🎓</span> {userProfile.stream}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium">
                    <span>🏫</span> {userProfile.board.toUpperCase()}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-green-50 text-green-700 text-xs font-bold border border-green-200">
                    <span>🆔</span> {userProfile.studentCode || 'AceTrack ID'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 w-full lg:w-auto">
              <Popover open={showNotifications} onOpenChange={setShowNotifications}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="relative font-medium px-3 py-2 rounded-lg bg-white border-gray-200 hover:bg-gray-50 text-gray-700">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0 shadow-xl border-gray-200 rounded-xl" align="end">
                  <div className="p-4 border-b border-gray-100 bg-gray-50/50 rounded-t-xl">
                    <h4 className="font-semibold text-gray-900">Notifications</h4>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-sm text-gray-500">No new notifications</div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${!n.is_read ? 'bg-indigo-50/30' : ''}`}
                          onClick={() => handleMarkRead(n.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${!n.is_read ? 'bg-indigo-500' : 'bg-gray-300'}`} />
                            <div>
                              <p className={`text-sm ${!n.is_read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>{n.title}</p>
                              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{n.message}</p>
                              <p className="text-[10px] text-gray-400 mt-2">{new Date(n.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              <Button onClick={handleExportPDF} className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm flex-1 lg:flex-none">
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              <Button onClick={handleLogout} variant="outline" className="font-medium px-4 py-2 rounded-lg flex-1 lg:flex-none">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-8">
        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Progress Card */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 rounded-[24px] opacity-75 group-hover:opacity-100 blur transition duration-500 group-hover:duration-200"></div>
            <div className="relative overflow-hidden rounded-[22px] bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 p-7 shadow-2xl border-2 border-white/30 hover:scale-105 transition-all duration-500 h-full">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-12 -mb-12 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <Trophy className="w-10 h-10 text-white drop-shadow-2xl" />
                  <div className="text-right">
                    <div className="text-5xl font-black text-white drop-shadow-2xl tracking-tight">{stats.overallProgress}%</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-white/90 font-bold text-sm mb-2 drop-shadow">Overall Progress</div>
                    <div className="h-3.5 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm border border-white/30 shadow-inner">
                      <div
                        className="h-full bg-gradient-to-r from-white via-yellow-100 to-white rounded-full transition-all duration-1000 shadow-xl relative overflow-hidden"
                        style={{ width: `${stats.overallProgress}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 flex items-center gap-2 text-white/95 font-bold text-xs">
                    <Zap className="w-4 h-4" />
                    <span className="drop-shadow">
                      {studyPlan.days?.filter(d => d.sessions.every(s => s.completed)).length || 0} / {studyPlan.days?.length || 0} Days
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Streak Card */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-400 via-pink-500 to-fuchsia-500 rounded-[24px] opacity-75 group-hover:opacity-100 blur transition duration-500 group-hover:duration-200"></div>
            <div className="relative overflow-hidden rounded-[22px] bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-600 p-7 shadow-2xl border-2 border-white/30 hover:scale-105 transition-all duration-500 h-full">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-12 -mb-12 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-4xl drop-shadow-2xl">🔥</div>
                  <div className="text-right">
                    <div className="text-5xl font-black text-white drop-shadow-2xl tracking-tight">
                      {stats.currentStreak}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-white/90 font-bold text-sm drop-shadow">Day Streak</div>
                  <div className="text-white/80 font-semibold text-xs drop-shadow">
                    Keep the momentum going! 💪
                  </div>
                  <div className="pt-2 flex items-center gap-2 text-white/95 font-bold text-xs">
                    <Trophy className="w-4 h-4" />
                    <span className="drop-shadow">Consistency is key</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Daily Goal Card */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 via-cyan-500 to-teal-500 rounded-[24px] opacity-75 group-hover:opacity-100 blur transition duration-500 group-hover:duration-200"></div>
            <div className="relative overflow-hidden rounded-[22px] bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-600 p-7 shadow-2xl border-2 border-white/30 hover:scale-105 transition-all duration-500 h-full">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-12 -mb-12 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <Target className="w-10 h-10 text-white drop-shadow-2xl" />
                  <div className="text-right">
                    <div className="text-5xl font-black text-white drop-shadow-2xl tracking-tight">
                      {stats.todayProgress}%
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-white/90 font-bold text-sm mb-2 drop-shadow">Today's Goal</div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-3 bg-white/20 rounded-full overflow-hidden border border-white/30">
                        <div
                          className="h-full bg-gradient-to-r from-white to-cyan-100 rounded-full shadow-lg relative overflow-hidden transition-all duration-500"
                          style={{ width: `${stats.todayProgress}%` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse"></div>
                        </div>
                      </div>
                      <div className="text-white/95 font-bold text-xs drop-shadow whitespace-nowrap">
                        {stats.todayCompleted}/{stats.todayTotal}
                      </div>
                    </div>
                  </div>
                  <div className="pt-1 text-white/80 font-semibold text-xs drop-shadow">
                    Sessions completed today
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Plan Duration Card */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-400 via-teal-500 to-green-500 rounded-[24px] opacity-75 group-hover:opacity-100 blur transition duration-500 group-hover:duration-200"></div>
            <div className="relative overflow-hidden rounded-[22px] bg-gradient-to-br from-emerald-500 via-teal-500 to-green-600 p-7 shadow-2xl border-2 border-white/30 hover:scale-105 transition-all duration-500 h-full">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-12 -mb-12 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <Calendar className="w-10 h-10 text-white drop-shadow-2xl" />
                  <div className="text-right">
                    <div className="text-5xl font-black text-white drop-shadow-2xl tracking-tight">{studyPlan.days?.length || 0}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-white/90 font-bold text-sm drop-shadow">Plan Duration</div>
                  <div className="text-white/80 font-semibold text-xs drop-shadow">
                    Total study days
                  </div>
                  <div className="pt-2 flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-white/95 font-bold text-xs">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      <span className="drop-shadow">From: {studyPlan.days?.[0]?.date || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/95 font-bold text-xs">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      <span className="drop-shadow">To: {studyPlan.days?.[studyPlan.days.length - 1]?.date || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Navigation Tabs */}
        <div className="mb-8">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 rounded-[28px] opacity-20 blur-xl"></div>
            <div className="relative bg-white/80 backdrop-blur-2xl rounded-[26px] p-2.5 shadow-2xl border-2 border-white/60">
              <div className="flex gap-3 overflow-x-auto">
                <Button
                  variant={activeView === 'schedule' ? 'default' : 'outline'}
                  onClick={() => setActiveView('schedule')}
                  className={`flex-1 gap-2.5 whitespace-nowrap transition-all duration-500 font-bold text-sm py-6 rounded-[20px] ${activeView === 'schedule'
                    ? 'bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 text-white shadow-2xl shadow-indigo-500/50 scale-105 border-2 border-white/20'
                    : 'bg-white/60 hover:bg-white hover:shadow-xl border-2 border-slate-200/50 text-slate-700 hover:scale-105'
                    }`}
                >
                  <Target className="w-5 h-5" />
                  <span>Study Schedule</span>
                </Button>
                <Button
                  variant={activeView === 'study-tools' ? 'default' : 'outline'}
                  onClick={() => setActiveView('study-tools')}
                  className={`flex-1 gap-2.5 whitespace-nowrap transition-all duration-500 font-bold text-sm py-6 rounded-[20px] ${activeView === 'study-tools'
                    ? 'bg-gradient-to-r from-blue-500 via-cyan-600 to-teal-600 text-white shadow-2xl shadow-blue-500/50 scale-105 border-2 border-white/20'
                    : 'bg-white/60 hover:bg-white hover:shadow-xl border-2 border-slate-200/50 text-slate-700 hover:scale-105'
                    }`}
                >
                  <Brain className="w-5 h-5" />
                  <span>Study Tools</span>
                </Button>
                <Button
                  variant={activeView === 'analytics' ? 'default' : 'outline'}
                  onClick={() => setActiveView('analytics')}
                  className={`flex-1 gap-2.5 whitespace-nowrap transition-all duration-500 font-bold text-sm py-6 rounded-[20px] ${activeView === 'analytics'
                    ? 'bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 text-white shadow-2xl shadow-emerald-500/50 scale-105 border-2 border-white/20'
                    : 'bg-white/60 hover:bg-white hover:shadow-xl border-2 border-slate-200/50 text-slate-700 hover:scale-105'
                    }`}
                >
                  <TrendingUp className="w-5 h-5" />
                  <span>Analytics</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule View */}
        {activeView === 'schedule' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Study Plan */}
            <div className="lg:col-span-2 space-y-8">
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 rounded-[32px] opacity-20 blur-xl group-hover:opacity-30 transition duration-500"></div>
                <div className="relative rounded-[30px] bg-white/95 backdrop-blur-2xl shadow-2xl border-2 border-white/60 overflow-hidden">
                  <div className="border-b-2 border-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 bg-gradient-to-r from-indigo-50/80 via-purple-50/80 to-pink-50/80 backdrop-blur px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="absolute -inset-2 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-2xl opacity-50 blur"></div>
                        <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl">
                          <span className="text-3xl">📚</span>
                        </div>
                      </div>
                      <div>
                        <h2 className="font-black text-slate-900 text-xl tracking-tight">Study Schedule</h2>
                        <p className="text-sm text-slate-600 mt-1 font-semibold">Plan your learning journey with precision</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-8">
                    <Tabs defaultValue="daily">
                      <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-indigo-100/80 via-purple-100/80 to-pink-100/80 p-2 rounded-2xl border-2 border-white/50 shadow-xl mb-8">
                        <TabsTrigger
                          value="daily"
                          className="flex items-center justify-center gap-2 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-2xl data-[state=active]:text-indigo-700 font-bold text-sm py-3 transition-all duration-300 data-[state=active]:scale-105"
                        >
                          <Calendar className="w-4 h-4" />
                          <span>Daily</span>
                        </TabsTrigger>
                        <TabsTrigger
                          value="weekly"
                          className="flex items-center justify-center gap-2 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-2xl data-[state=active]:text-purple-700 font-bold text-sm py-3 transition-all duration-300 data-[state=active]:scale-105"
                        >
                          <CalendarDays className="w-4 h-4" />
                          <span>Weekly</span>
                        </TabsTrigger>
                        <TabsTrigger
                          value="monthly"
                          className="flex items-center justify-center gap-2 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-2xl data-[state=active]:text-pink-700 font-bold text-sm py-3 transition-all duration-300 data-[state=active]:scale-105"
                        >
                          <CalendarRange className="w-4 h-4" />
                          <span>Monthly</span>
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="daily">
                        <DailyView currentDate={currentDate} setCurrentDate={setCurrentDate} onNavigateToQuiz={handleNavigateToQuiz} />
                      </TabsContent>
                      <TabsContent value="weekly">
                        <WeeklyView />
                      </TabsContent>
                      <TabsContent value="monthly">
                        <MonthlyView />
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              </div>

              {/* Progress Charts */}
              <ProgressCharts />
            </div>

            {/* Right Column - Subject Progress & Time Stats */}
            <div className="space-y-8">
              {/* Subject Progress Analytics */}
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-violet-400 via-purple-500 to-fuchsia-500 rounded-[32px] opacity-20 blur-xl group-hover:opacity-30 transition duration-500"></div>
                <div className="relative rounded-[30px] bg-white/95 backdrop-blur-2xl shadow-2xl border-2 border-white/60 overflow-hidden">
                  <div className="border-b-2 bg-gradient-to-r from-violet-50/80 via-purple-50/80 to-fuchsia-50/80 px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                        <PieChart className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">Subject Progress</h3>
                        <p className="text-xs text-slate-600">Track performance by subject</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    {(() => {
                      if (!studyPlan.days) return null;
                      const subjectStats = new Map<string, { name: string; total: number; completed: number }>();

                      studyPlan.days.forEach(day => {
                        day.sessions.forEach(session => {
                          // Capitalize subject name if subjectName is missing (physics -> Physics)
                          const subjectName = session.subjectName ||
                            (session.subjectId.charAt(0).toUpperCase() + session.subjectId.slice(1));
                          const current = subjectStats.get(session.subjectId) || { name: subjectName, total: 0, completed: 0 };
                          current.total++;
                          if (session.completed) current.completed++;
                          subjectStats.set(session.subjectId, current);
                        });
                      });

                      const subjects = Array.from(subjectStats.entries()).map(([id, stats]) => ({
                        id,
                        name: stats.name,
                        progress: Math.round((stats.completed / stats.total) * 100),
                        completed: stats.completed,
                        total: stats.total
                      }));

                      const colors = [
                        { bg: 'bg-indigo-500', ring: 'ring-indigo-200' },
                        { bg: 'bg-purple-500', ring: 'ring-purple-200' },
                        { bg: 'bg-pink-500', ring: 'ring-pink-200' },
                        { bg: 'bg-rose-500', ring: 'ring-rose-200' },
                        { bg: 'bg-orange-500', ring: 'ring-orange-200' },
                      ];

                      return subjects.map((subject, idx) => (
                        <div key={subject.id}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold text-slate-700">{subject.name}</span>
                            <span className="text-sm font-black text-slate-900">{subject.progress}%</span>
                          </div>
                          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden ring-2 ring-slate-100">
                            <div
                              className={`h-full ${colors[idx % colors.length].bg} transition-all duration-500`}
                              style={{ width: `${subject.progress}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{subject.completed} of {subject.total} sessions completed</p>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>

              {/* Study Time Analytics */}
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 via-cyan-500 to-teal-500 rounded-[32px] opacity-20 blur-xl group-hover:opacity-30 transition duration-500"></div>
                <div className="relative rounded-[30px] bg-white/95 backdrop-blur-2xl shadow-2xl border-2 border-white/60 overflow-hidden">
                  <div className="border-b-2 bg-gradient-to-r from-blue-50/80 via-cyan-50/80 to-teal-50/80 px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">Study Time Stats</h3>
                        <p className="text-xs text-slate-600">Time allocation insights</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    {(() => {
                      if (!studyPlan.days) return null;

                      let totalMinutes = 0;
                      let completedMinutes = 0;
                      let totalSessions = 0;
                      let completedSessions = 0;

                      studyPlan.days.forEach(day => {
                        day.sessions.forEach(session => {
                          totalMinutes += session.duration;
                          totalSessions++;
                          if (session.completed) {
                            completedMinutes += session.duration;
                            completedSessions++;
                          }
                        });
                      });

                      const totalHours = Math.floor(totalMinutes / 60);
                      const completedHours = Math.floor(completedMinutes / 60);
                      const avgSessionTime = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;

                      return (
                        <>
                          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                            <div>
                              <p className="text-xs text-slate-600 font-semibold">Total Study Time</p>
                              <p className="text-2xl font-black text-blue-700">{totalHours}h</p>
                            </div>
                            <Activity className="w-8 h-8 text-blue-400" />
                          </div>

                          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-cyan-50 to-teal-50 rounded-xl border border-cyan-100">
                            <div>
                              <p className="text-xs text-slate-600 font-semibold">Time Completed</p>
                              <p className="text-2xl font-black text-cyan-700">{completedHours}h</p>
                            </div>
                            <Zap className="w-8 h-8 text-cyan-400" />
                          </div>

                          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl border border-teal-100">
                            <div>
                              <p className="text-xs text-slate-600 font-semibold">Avg Session</p>
                              <p className="text-2xl font-black text-teal-700">{avgSessionTime}min</p>
                            </div>
                            <Target className="w-8 h-8 text-teal-400" />
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Study Tools View */}
        {activeView === 'study-tools' && (
          <div className="space-y-8">
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 via-cyan-500 to-teal-500 rounded-[32px] opacity-20 blur-xl group-hover:opacity-30 transition duration-500"></div>
              <div className="relative rounded-[30px] bg-white/95 backdrop-blur-2xl shadow-2xl border-2 border-white/60 overflow-hidden">
                <div className="border-b-2 border-gradient-to-r from-blue-100 via-cyan-100 to-teal-100 bg-gradient-to-r from-blue-50/80 via-cyan-50/80 to-teal-50/80 backdrop-blur px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="absolute -inset-2 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-2xl opacity-50 blur"></div>
                      <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 via-cyan-500 to-teal-500 flex items-center justify-center shadow-2xl">
                        <span className="text-3xl">🧠</span>
                      </div>
                    </div>
                    <div>
                      <h2 className="font-black text-slate-900 text-xl tracking-tight">Study Tools</h2>
                      <p className="text-sm text-slate-600 mt-1 font-semibold">Flashcards, Quizzes & More</p>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <Tabs value={studyToolsTab} onValueChange={(val) => setStudyToolsTab(val as "flashcards" | "quizzes")}>
                    <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-blue-100/80 to-cyan-100/80 p-2 rounded-2xl border-2 border-white/50 shadow-xl">
                      <TabsTrigger value="flashcards" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-2xl data-[state=active]:text-cyan-700 font-bold text-sm py-3 transition-all duration-300 data-[state=active]:scale-105">
                        <span className="mr-2 text-base">📚</span> Flashcards
                      </TabsTrigger>
                      <TabsTrigger value="quizzes" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-2xl data-[state=active]:text-cyan-700 font-bold text-sm py-3 transition-all duration-300 data-[state=active]:scale-105">
                        <span className="mr-2 text-base">🎯</span> Quizzes
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="flashcards" className="mt-8">
                      <FlashcardStudy />
                    </TabsContent>
                    <TabsContent value="quizzes" className="mt-8">
                      <QuizInterface
                        topicId={selectedQuizData?.topicId}
                        subjectId={selectedQuizData?.subjectId}
                        chapterId={selectedQuizData?.chapterId}
                        subjectName={selectedQuizData?.subjectName}
                        chapterName={selectedQuizData?.chapterName}
                        topicName={selectedQuizData?.topicName}
                      />
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics View */}
        {activeView === 'analytics' && (
          <div className="space-y-6">
            {studyPlan && studyPlan.days && studyPlan.days.length > 0 ? (
              <ComprehensiveAnalytics />
            ) : (
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 rounded-[32px] opacity-20 blur-xl"></div>
                <div className="relative rounded-[30px] bg-white/95 backdrop-blur-2xl shadow-2xl border-2 border-white/60 overflow-hidden p-12 text-center">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">No Analytics Data Yet</h3>
                  <p className="text-slate-600">Complete some study sessions to see your analytics and progress charts.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};