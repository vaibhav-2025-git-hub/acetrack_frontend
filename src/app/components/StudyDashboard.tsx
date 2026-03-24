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
import { GlobalAnnouncement } from './GlobalAnnouncement';
import { exportToPDF } from '../utils/pdfExport';
import { calculateAceScore } from '../utils/helpers';
import { toast } from 'sonner';
import {
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
  Bell,
  Clock,
  ArrowRight,
  Sparkles,
  Info,
  CalendarCheck,
  Loader2,
  Trophy,
  Award,
  Shield,
  Star
} from 'lucide-react';
import { notificationAPI, studyPlanAPI } from '../services/api';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

import { StudySession } from '../types';

import { useNavigate, useLocation } from 'react-router-dom';

interface StudyDashboardProps {
  userType: 'student' | 'parent';
  onLogout: () => void;
}

export const StudyDashboard: React.FC<StudyDashboardProps> = ({ userType, onLogout }) => {
  console.log("StudyDashboard rendered with userType:", userType);
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile, studyPlan, refreshStudyPlan, isAuthenticated } = useStudyPlan();
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Tab state derived from URL
  const [activeView, setActiveView] = useState<'schedule' | 'study-tools' | 'analytics'>('schedule');
  
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/dashboard/study-tools')) {
      setActiveView('study-tools');
    } else if (path.includes('/dashboard/analytics')) {
      setActiveView('analytics');
    } else {
      setActiveView('schedule');
    }
  }, [location]);

  const handleTabChange = (view: 'schedule' | 'study-tools' | 'analytics') => {
    navigate(`/dashboard/${view}`);
    setActiveView(view);
  };
  const [scheduleTab, setScheduleTab] = useState('daily');
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
    daysWithActivity: 0,
    todayProgress: 0,
    todayCompleted: 0,
    todayTotal: 0,
    aceScore: 0
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

  // AI Recommendations
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isApplyingRec, setIsApplyingRec] = useState<number | null>(null);

  // Calculate real-time statistics from actual data
  const calculateStats = () => {
    if (!studyPlan?.days || studyPlan.days.length === 0) {
      return {
        overallProgress: 0,
        totalSessions: 0,
        completedSessions: 0,
        totalHours: 0,
        completedHours: 0,
        daysWithActivity: 0,
        todayProgress: 0,
        todayCompleted: 0,
        todayTotal: 0,
        aceScore: 0
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

    // Today's progress
    const todayStr = new Date().toISOString().split('T')[0];
    const todayData = studyPlan.days.find(d => d.date === todayStr);
    const todayCompleted = todayData?.sessions.filter(s => s.completed).length || 0;
    const todayTotal = todayData?.sessions.length || 0;
    const todayProgress = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0;

    return {
      overallProgress: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0,
      totalSessions,
      completedSessions,
      totalHours: Math.round(totalMinutes / 60 * 10) / 10,
      completedHours: Math.round(completedMinutes / 60 * 10) / 10,
      daysWithActivity,
      todayProgress,
      todayCompleted,
      todayTotal,
      aceScore: calculateAceScore(studyPlan)
    };
  };

  const updateStats = () => {
    const newStats = calculateStats();
    setStats(newStats);
  };

  const fetchRecommendations = async () => {
    try {
      const response = await studyPlanAPI.getRecommendations();
      if (response.success) {
        setRecommendations(response.data);
      }
    } catch (error) {
      console.error("Failed to load recommendations");
    }
  };

  const handleApplyRecommendation = async (rec: any) => {
    setIsApplyingRec(rec.id);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    try {
      const response = await studyPlanAPI.applyRecommendation(rec.id, dateStr);
      if (response.success) {
        toast.success(`Planned! Deep Dive for ${rec.topic_id} added to tomorrow's schedule.`);
        setRecommendations(recommendations.filter(r => r.id !== rec.id));
        refreshStudyPlan();
      } else {
        toast.error(response.message || "Failed to apply recommendation");
      }
    } catch (error) {
      toast.error("Network error while applying recommendation");
    } finally {
      setIsApplyingRec(null);
    }
  };

  const loadNotifications = async () => {
    if (!isAuthenticated) return;
    console.log("[DEBUG] loadNotifications triggered");
    try {
      const response = await notificationAPI.getAll();
      console.log("[DEBUG] Notifications response:", response);
      if (response.success) {
        setNotifications(response.data);
      } else {
        console.warn("[WARN] Failed to fetch notifications:", response.message);
        if (response.status === 401) {
           // useSession will handle the redirection if it's a persistent 401
           console.log("Unauthorized, waiting for session handler...");
        } else {
           toast.error("Cloud sync: Could not load notifications.");
        }
      }
    } catch (error: any) {
      console.error("[ERROR] Network error while loading notifications:", error);
      // Only show toast for non-401 errors
      if (error.status !== 401) {
        toast.error("Network error: Notifications may be out of date.");
      }
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

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout? All your data is safely saved.')) {
      onLogout();
    }
  };

  // Update stats on component mount and when studyPlan changes
  useEffect(() => {
    updateStats();
  }, [studyPlan, studyPlan?.days]);

  useEffect(() => {
    loadNotifications();
    fetchRecommendations();
  }, []);

  useEffect(() => {
    if (showNotifications) {
      loadNotifications();
    }
  }, [showNotifications]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

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

  useEffect(() => {
    if (!userProfile) {
      navigate('/profile');
    }
  }, [userProfile, navigate]);

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

  return (
    <div className="min-h-screen bg-[#F8FAFC] relative overflow-hidden">
      <GlobalAnnouncement />
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-100/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-100/30 rounded-full blur-3xl"></div>
      </div>

      {/* Premium Profile Header */}
      <div className="relative pt-6 pb-2 px-6 lg:px-8 max-w-7xl mx-auto z-10 w-full">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 to-transparent pointer-events-none" />
        <div className="relative w-full rounded-[36px] bg-white/60 backdrop-blur-3xl border-2 border-white/60 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] p-3 flex flex-col lg:flex-row justify-between items-center gap-4 transition-all duration-500 hover:shadow-[0_16px_60px_-15px_rgba(79,70,229,0.15)] group">
          {/* Left section: Identity */}
          <div className="flex items-center gap-5 w-full lg:w-auto px-2">
            <div className="relative group-hover:scale-105 transition-transform duration-500">
              <div className="absolute -inset-2 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-3xl opacity-30 blur-lg group-hover:opacity-60 transition duration-500 animate-pulse" />
              <div className="relative w-16 h-16 rounded-[20px] bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 flex items-center justify-center shadow-2xl border border-white/20">
                <span className="text-white font-black text-3xl drop-shadow-md">{userProfile.name.charAt(0)}</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-4 border-white shadow-sm flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-700 tracking-tight leading-tight">
                {userProfile.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-1.5">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/80 border border-slate-200/60 shadow-sm text-slate-700 text-[11px] font-bold uppercase tracking-widest">
                  <span className="text-indigo-500 text-[14px]">📖</span> Class {userProfile.class}
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/80 border border-slate-200/60 shadow-sm text-slate-700 text-[11px] font-bold uppercase tracking-widest">
                  <span className="text-purple-500 text-[14px]">🎓</span> {userProfile.stream}
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/80 border border-slate-200/60 shadow-sm text-slate-700 text-[11px] font-bold uppercase tracking-widest">
                  <span className="text-blue-500 text-[14px]">🏫</span> {userProfile.board.toUpperCase()}
                </div>
              </div>
            </div>
          </div>

          {/* Center/Right section: AceTrack ID & Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto mt-2 lg:mt-0 px-2 lg:px-4">

            {/* Highly Prominent ID Badge */}
            <div className="relative overflow-hidden group/badge cursor-default w-full sm:w-auto flex justify-center">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 opacity-10 group-hover/badge:opacity-20 transition-opacity duration-300" />
              <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-100/50 shadow-inner">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-600/70 mb-0.5">AceTrack ID</p>
                  <p className="text-sm font-black text-emerald-700 tracking-wider">
                    {userProfile.studentCode || `ACE-${userProfile.name.split(' ')[0].toUpperCase()}-${new Date().getFullYear()}`}
                  </p>
                </div>
              </div>
            </div>

            <div className="w-px h-10 bg-slate-200/50 hidden sm:block mx-1" />

            {/* Action Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Popover open={showNotifications} onOpenChange={setShowNotifications}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="relative h-12 w-12 rounded-2xl bg-white hover:bg-slate-50 border-slate-200 shadow-sm transition-all hover:scale-105 hover:shadow-md p-0 flex items-center justify-center">
                    <Bell className="w-5 h-5 tracking-tight text-slate-600" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-rose-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-sm animate-bounce">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0 shadow-2xl border-none rounded-[24px]" align="end" sideOffset={12}>
                  <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-[24px]">
                    <h4 className="font-black text-white">Notifications</h4>
                    <p className="text-xs text-indigo-100/80 font-medium">{unreadCount} unread message{unreadCount !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto bg-white/95 backdrop-blur-xl rounded-b-[24px]">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center">
                          <Bell className="w-5 h-5 text-slate-300" />
                        </div>
                        <p className="text-sm font-bold text-slate-400">All caught up!</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer ${!n.is_read ? 'bg-indigo-50/30' : ''}`}
                          onClick={() => handleMarkRead(n.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 shadow-sm ${!n.is_read ? 'bg-indigo-500 animate-pulse' : 'bg-slate-200'}`} />
                            <div>
                              <p className={`text-sm tracking-tight ${!n.is_read ? 'font-black text-slate-900' : 'font-bold text-slate-600'}`}>{n.title}</p>
                              <p className="text-xs font-medium text-slate-500 mt-1 leading-relaxed">{n.message}</p>
                              <p className="text-[10px] font-bold text-slate-400 mt-2 tracking-wider uppercase">{new Date(n.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              <Button onClick={handleExportPDF} className="h-12 px-5 rounded-2xl bg-slate-900 hover:bg-indigo-600 text-white font-bold shadow-sm flex-1 sm:flex-none transition-all hover:scale-105 hover:shadow-indigo-500/25">
                <Download className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Export</span> PDF
              </Button>
              <Button onClick={handleLogout} variant="outline" className="h-12 px-4 rounded-2xl border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 font-bold flex-1 sm:flex-none transition-all">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-8">

        {/* Prominent AI Recommendation Card */}
        {recommendations.length > 0 && (
          <div className="mb-8 group relative animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-[32px] opacity-20 blur-2xl group-hover:opacity-40 transition-opacity"></div>
            <div className="relative overflow-hidden rounded-[28px] bg-white border-2 border-indigo-100 shadow-[0_20px_50px_-20px_rgba(79,70,229,0.2)] p-6 lg:p-8">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Brain className="w-48 h-48 rotate-12" />
              </div>

              <div className="flex flex-col lg:flex-row items-center gap-8 relative z-10">
                <div className="shrink-0">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-indigo-500/20 rounded-full blur-xl animate-pulse"></div>
                    <div className="relative w-24 h-24 rounded-[32px] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg transform -rotate-3 group-hover:rotate-0 transition-transform duration-500">
                      <Sparkles className="w-12 h-12 text-white" />
                    </div>
                  </div>
                </div>

                <div className="flex-1 text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                    <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-wider border border-indigo-100">Smart Recommendation</span>
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                    We noticed you might need a <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Deep Dive</span>
                  </h2>
                  <p className="text-slate-600 font-medium leading-relaxed max-w-2xl">
                    Based on your score of <span className="text-rose-500 font-black">{parseFloat(recommendations[0].score).toFixed(0)}%</span> in the recent
                    <span className="font-bold text-slate-800"> {recommendations[0].topic_id}</span> quiz, we've prepared a specialized study session to help you master this topic.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <Button
                    onClick={() => handleApplyRecommendation(recommendations[0])}
                    disabled={isApplyingRec === recommendations[0].id}
                    className="h-14 px-8 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black shadow-xl shadow-slate-200 transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
                  >
                    {isApplyingRec === recommendations[0].id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <CalendarCheck className="w-5 h-5" />
                    )}
                    Add to Tomorrow's Plan
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setRecommendations(recommendations.slice(1))}
                    className="h-14 px-6 rounded-2xl text-slate-400 font-bold hover:bg-slate-50 transition-all"
                  >
                    Maybe Later
                  </Button>
                </div>
              </div>

              {recommendations.length > 1 && (
                <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-widest">
                  <span>+ {recommendations.length - 1} more suggestions waiting</span>
                  <div className="flex gap-1">
                    {recommendations.map((_, i) => (
                      <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-indigo-500 w-4' : 'bg-slate-200'} transition-all`} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

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

          {/* Ace Score Card */}
          <div className="group relative">
            <div className="absolute -inset-0.5 rounded-[24px] opacity-75 group-hover:opacity-100 blur transition duration-500 group-hover:duration-200 bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500"></div>
            <div className="relative overflow-hidden rounded-[22px] p-7 shadow-2xl border-2 border-white/30 hover:scale-105 transition-all duration-500 h-full bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-12 -mb-12 group-hover:scale-150 transition-transform duration-700"></div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex items-center justify-between mb-2">
                  <Star className={`w-8 h-8 text-white drop-shadow-2xl ${stats.aceScore >= 90 ? 'animate-pulse' : ''}`} />
                  <div className="text-right">
                    <div className="text-5xl font-black text-white drop-shadow-2xl tracking-tight">{stats.aceScore}</div>
                  </div>
                </div>
                <div className="space-y-2 mt-auto">
                  <div className="text-white/90 font-bold text-sm drop-shadow">Ace Score</div>
                  <div className="text-white/80 font-semibold text-xs drop-shadow">
                    Overall study health
                  </div>
                  <div className="pt-2">
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm shadow-inner relative">
                       <div 
                         className="absolute inset-y-0 left-0 bg-white rounded-full transition-all duration-1000"
                         style={{ width: `${stats.aceScore}%` }}
                       />
                    </div>
                    <div className="flex justify-between text-white/70 text-[10px] uppercase font-bold tracking-widest mt-1.5">
                       <span>Needs Work</span>
                       <span>Excellent</span>
                    </div>
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
                  onClick={() => handleTabChange('schedule')}
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
                  onClick={() => handleTabChange('study-tools')}
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
                  onClick={() => handleTabChange('analytics')}
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

                    {/* "Up Next" Hero Action Card */}
                    {(() => {
                      const todayStr = new Date().toISOString().split('T')[0];
                      const todayPlan = studyPlan.days?.find(d => d.date === todayStr);
                      const nextSession = todayPlan?.sessions.find(s => !s.completed && s.status !== 'skipped');

                      if (!nextSession) return null;

                      // Derive a beautiful gradient based on the subject for the hero card
                      const subject = nextSession.subjectName.toLowerCase();
                      let gradient = 'from-indigo-500 via-purple-600 to-indigo-700';
                      let shadowColor = 'rgba(99,102,241,0.5)';

                      if (subject.includes('phys')) {
                        gradient = 'from-cyan-500 via-blue-600 to-indigo-600'; shadowColor = 'rgba(6,182,212,0.5)';
                      } else if (subject.includes('math')) {
                        gradient = 'from-rose-500 via-orange-600 to-amber-600'; shadowColor = 'rgba(244,63,94,0.5)';
                      } else if (subject.includes('chem')) {
                        gradient = 'from-emerald-500 via-teal-600 to-cyan-600'; shadowColor = 'rgba(16,185,129,0.5)';
                      } else if (subject.includes('bio')) {
                        gradient = 'from-lime-500 via-green-600 to-emerald-600'; shadowColor = 'rgba(132,204,22,0.5)';
                      }

                      return (
                        <div className="mb-10 group relative">
                          <div className={`absolute -inset-1 bg-gradient-to-r ${gradient} rounded-[28px] opacity-60 group-hover:opacity-100 blur-xl transition duration-500 animate-pulse`}></div>
                          <div className={`relative overflow-hidden rounded-[26px] bg-gradient-to-br ${gradient} p-8 shadow-2xl border-2 border-white/20 transform transition-all duration-300 group-hover:scale-[1.02]`}>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>

                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                              <div>
                                <div className="flex items-center gap-2 mb-3">
                                  <Zap className="w-5 h-5 text-yellow-300 animate-bounce" />
                                  <span className="text-white/90 font-black text-sm tracking-widest uppercase">Up Next</span>
                                </div>
                                <h3 className="text-3xl font-black text-white mb-2 tracking-tight drop-shadow-md">{nextSession.subjectName}</h3>
                                <p className="text-white/80 font-bold text-lg">{nextSession.chapterName || 'General Review'}</p>

                                <div className="flex items-center gap-4 mt-6">
                                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-white font-bold text-sm">
                                    <Clock className="w-4 h-4" /> {nextSession.duration} min
                                  </div>
                                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-white font-bold text-sm">
                                    <Target className="w-4 h-4" /> Focus Session
                                  </div>
                                </div>
                              </div>


                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* The Interactive Horizontal Timeline */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-slate-700">Timeline</h3>
                        <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner border border-slate-200/50">
                          {['daily', 'weekly', 'monthly'].map((mode) => (
                            <button
                              key={mode}
                              onClick={() => setScheduleTab(mode)}
                              className={`px-4 py-1.5 text-xs font-bold capitalize rounded-lg transition-all ${scheduleTab === mode
                                ? 'bg-white shadow-md text-indigo-600'
                                : 'text-slate-600 hover:text-slate-900'
                                } outline-none`}
                            >
                              {mode}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Horizontal Date Scroller */}
                      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x">
                        {Array.from({ length: 14 }).map((_, i) => {
                          const d = new Date();
                          d.setDate(d.getDate() - 3 + i); // Show 3 days past, 10 days future
                          const ISODate = d.toISOString().split('T')[0];
                          const isSelected = ISODate === currentDate;
                          const isToday = ISODate === new Date().toISOString().split('T')[0];
                          const dayOfWeek = d.toLocaleDateString('en-US', { weekday: 'short' });
                          const dateNum = d.getDate();

                          // Check completed status
                          const dailyPlan = studyPlan.days?.find(day => day.date === ISODate);
                          const hasPending = dailyPlan && dailyPlan.sessions.some(s => !s.completed);
                          const isAllDone = dailyPlan && dailyPlan.sessions.length > 0 && dailyPlan.sessions.every(s => s.completed);

                          return (
                            <button
                              key={ISODate}
                              onClick={() => setCurrentDate(ISODate)}
                              className={`snap-center flex-shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-[18px] transition-all duration-300 relative border-2 ${isSelected
                                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 border-indigo-400 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] scale-110 z-10'
                                : isToday
                                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 hover:scale-105'
                                  : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300 hover:shadow-md hover:scale-105'
                                }`}
                            >
                              {/* Status Indicators */}
                              {isAllDone && !isSelected && (
                                <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                              )}
                              {hasPending && !isSelected && (
                                <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-pulse"></div>
                              )}

                              <span className={`text-[10px] uppercase font-bold mb-1 opacity-80 ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>{dayOfWeek}</span>
                              <span className={`text-xl font-black leading-none ${isSelected ? 'text-white' : 'text-slate-800'}`}>{dateNum}</span>

                              {isToday && !isSelected && <span className="absolute -bottom-2.5 text-[8px] font-black tracking-widest text-indigo-500 uppercase">Today</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <Tabs value={scheduleTab} onValueChange={setScheduleTab} className="w-full">
                      <TabsList className="hidden">
                        <TabsTrigger value="daily">daily</TabsTrigger>
                        <TabsTrigger value="weekly">weekly</TabsTrigger>
                        <TabsTrigger value="monthly">monthly</TabsTrigger>
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
                  </div >
                </div>
              </div>
            </div>
          </div>
        )
        }

        {/* Study Tools View */}
        {
          activeView === 'study-tools' && (
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
                      <TabsList className="flex bg-slate-100/50 p-1.5 rounded-2xl w-fit mx-auto shadow-inner border border-slate-200/50 mb-8 backdrop-blur-md">
                        <TabsTrigger
                          value="flashcards"
                          className="rounded-xl px-8 py-3 font-black text-sm transition-all duration-300 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-indigo-600 text-slate-500 hover:text-slate-700 data-[state=active]:scale-105"
                        >
                          <span className="mr-2 text-base">📚</span> Flashcards
                        </TabsTrigger>
                        <TabsTrigger
                          value="quizzes"
                          className="rounded-xl px-8 py-3 font-black text-sm transition-all duration-300 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-indigo-600 text-slate-500 hover:text-slate-700 data-[state=active]:scale-105"
                        >
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
          )
        }

        {/* Analytics View */}
        {
          activeView === 'analytics' && (
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
          )
        }
      </div >
    </div >
  );
};