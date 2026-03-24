import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { useStudyPlan } from '../context/StudyPlanContext';
import type { StudyPlan, StudySession } from '../types';
import { ChevronLeft, ChevronRight, Check, X, Clock, Edit, Settings, ExternalLink, BookOpen, Video, FileText, PenTool, AlertTriangle, Shield, Keyboard, CheckCircle2 } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Badge } from './ui/badge';
import { SessionCustomizationModal } from './SessionCustomizationModal';
import { adaptPlanAfterSession, reorderSession, changeSessionSubject } from '../utils/improvedPlanGenerator';
import { getReferenceLinks } from '../data/referenceLinks';
import { curriculumData } from '../data/curriculum';
import { toast } from 'sonner';
import { Tooltip } from './ui/tooltip';
import { formatDate, isToday } from '../utils/helpers';

// Session Timer Component
const SessionTimer = ({ session, onComplete }: { session: StudySession, onComplete: () => void }) => {
  // Key for local storage to persist timer state locally
  const storageId = session.id || 'temp';
  const storageKey = `timer_${storageId}`;

  // Initialize from LocalStorage -> Backend -> Default
  const [timeLeft, setTimeLeft] = useState(() => {
    // 1. Try local storage (most recent local interaction)
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const { left, timestamp, isActive } = JSON.parse(saved);
      if (isActive) {
        // Calculate elapsed time if it was running
        const elapsed = Math.floor((Date.now() - timestamp) / 1000);
        return Math.max(0, left - elapsed);
      }
      return left;
    }

    // 2. Try backend data
    if (session.time_remaining !== undefined && session.time_remaining !== null) {
      // If the timer was active on backend, we might need to adjust for time elapsed since last update
      // But for simplicity, we'll trust the stored time or maybe start from there
      // If we had a 'timer_last_updated' from backend, we could calculate accurate drift
      if (session.is_timer_active && session.timer_last_updated) {
        const lastUpdate = new Date(session.timer_last_updated).getTime();
        const elapsed = Math.floor((Date.now() - lastUpdate) / 1000);
        return Math.max(0, session.time_remaining - elapsed);
      }
      return session.time_remaining;
    }

    // 3. Default
    return session.duration * 60;
  });

  const [isActive, setIsActive] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) return JSON.parse(saved).isActive;

    return session.is_timer_active !== undefined ? Boolean(session.is_timer_active) : true;
  });

  // Timer Count Down
  useEffect(() => {
    let interval: any;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev: number) => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            setIsActive(false);
            return 0;
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // Persist to Local Storage
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify({
      left: timeLeft,
      isActive,
      timestamp: Date.now()
    }));
  }, [timeLeft, isActive, storageKey]);

  // Sync to Backend (Periodic + Manual)
  const syncToBackend = async (time: number, active: boolean) => {
    try {
      const { studyPlanAPI } = await import('../services/api');
      await studyPlanAPI.updateSession(session.id, {
        time_remaining: time,
        is_timer_active: active
      });
    } catch (e) {
      console.error("Failed to sync timer to backend", e);
    }
  };

  // Periodic sync every 30s if active
  useEffect(() => {
    if (!isActive) return;

    const syncInterval = setInterval(() => {
      syncToBackend(timeLeft, isActive);
    }, 30000);

    return () => clearInterval(syncInterval);
  }, [isActive, timeLeft]); // depend on timeLeft to capture current value in interval? No, closure.
  // Actually, standard setInterval closure problem. Use a ref or just rely on re-render?
  // Use a different pattern for interval to access latest state without resetting interval
  // For simplicity, let's just sync on pause/resume mostly, and maybe simple interval with ref

  const timeLeftRef = React.useRef(timeLeft);
  useEffect(() => { timeLeftRef.current = timeLeft; }, [timeLeft]);

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      syncToBackend(timeLeftRef.current, true);
    }, 30000);
    return () => clearInterval(interval);
  }, [isActive]);

  const toggleTimer = () => {
    const newState = !isActive;
    setIsActive(newState);
    // Immediate sync on toggle
    syncToBackend(timeLeft, newState);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((session.duration * 60 - timeLeft) / (session.duration * 60)) * 100;

  return (
    <div className="mt-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-5xl font-['Outfit'] font-black text-slate-900 tracking-tight tabular-nums drop-shadow-sm">
          {formatTime(timeLeft)}
        </div>
        <div className="flex gap-2">
          <Button
            onClick={toggleTimer}
            variant={isActive ? "outline" : "default"}
            size="sm"
            className={`rounded-full px-4 ${isActive ? 'border-amber-500 text-amber-600 hover:bg-amber-50' : 'bg-green-600 hover:bg-green-700'}`}
          >
            {isActive ? (
              <>
                <span className="mr-2">⏸</span> Pause
              </>
            ) : (
              <>
                <span className="mr-2">▶</span> Resume
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-500 transition-all duration-1000 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      <Button
        onClick={() => {
          localStorage.removeItem(storageKey); // Clear timer state
          // Also clear from backend? Maybe update to fully completed
          onComplete();
        }}
        size="sm"
        className="w-full group relative overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-emerald-300/50 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-6 rounded-2xl"
      >
        <Check className="w-5 h-5 mr-2 relative z-10" />
        <span className="relative z-10">Mark as Complete</span>
      </Button>
    </div>
  );
};

interface DailyViewProps {
  currentDate: string;
  setCurrentDate: (date: string) => void;
  onNavigateToQuiz?: (sessionData: {
    topicId: string;
    subjectId: string;
    chapterId: string;
    topicName: string;
    subjectName: string;
    chapterName: string;
  }) => void;
}

export const DailyView: React.FC<DailyViewProps> = ({ currentDate, setCurrentDate, onNavigateToQuiz }) => {
  const { studyPlan, setStudyPlan, updateProgress, isParentMode, refreshStudyPlan, userProfile } = useStudyPlan();
  const [customizeModalOpen, setCustomizeModalOpen] = useState(false);
  const [quizPromptOpen, setQuizPromptOpen] = useState(false);
  const [completedSessionForQuiz, setCompletedSessionForQuiz] = useState<any | null>(null);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Arrow keys for navigation
      if (e.key === 'ArrowLeft' && !e.shiftKey) {
        navigateDay(-1);
      } else if (e.key === 'ArrowRight' && !e.shiftKey) {
        navigateDay(1);
      }
      // T for today
      else if (e.key === 't' || e.key === 'T') {
        const today = new Date().toISOString().split('T')[0];
        setCurrentDate(today);
        toast.success('Jumped to today!');
      }
      // ? for keyboard shortcuts help
      else if (e.key === '?') {
        setShowKeyboardShortcuts(!showKeyboardShortcuts);
      }
      // Escape to close modals
      else if (e.key === 'Escape') {
        setCustomizeModalOpen(false);
        setQuizPromptOpen(false);
        setShowKeyboardShortcuts(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentDate, showKeyboardShortcuts]);

  if (!studyPlan || !userProfile || !studyPlan.dailyPlans) return null;

  const dailyPlan = studyPlan.dailyPlans[currentDate];

  const navigateDay = (direction: number) => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + direction);
    setCurrentDate(date.toISOString().split('T')[0]);
  };

  const updateSessionStatus = async (sessionId: string, status: 'completed' | 'skipped' | 'in-progress' | 'not-started') => {
    if (!dailyPlan) return;

    const session = dailyPlan.sessions.find((s) => s.id === sessionId);
    if (!session) return;

    // Simplified skip logic without tracking

    const updatedSessions = dailyPlan.sessions.map((s) =>
      s.id === sessionId
        ? {
          ...s,
          status,
          completed: status === 'completed',
          completionPercentage: status === 'completed' ? 100 : status === 'in-progress' ? 50 : 0,
          ...(status === 'completed' ? { completedAt: new Date().toISOString() } : {}),
        }
        : s
    );

    const completedHours = updatedSessions
      .filter((s) => s.status === 'completed')
      .reduce((sum, s) => sum + s.duration / 60, 0);

    // Create a completely new study plan object to ensure React detects the change
    let updatedPlan: StudyPlan = {
      ...studyPlan,
      dailyPlans: {
        ...studyPlan.dailyPlans,
        [currentDate]: {
          ...dailyPlan,
          sessions: updatedSessions,
          completedHours,
        },
      },
      // Also update the days array for analytics - create a new array
      days: (studyPlan.days || []).map(day =>
        day.date === currentDate
          ? {
            date: day.date,
            sessions: updatedSessions.map(s => ({
              ...s, 
              completed: s.completed || s.status === 'completed',
              ...(s.status === 'completed' ? { completedAt: s.completedAt || new Date().toISOString() } : {})
            }))
          }
          : { ...day, sessions: [...day.sessions] } 
      )
    };

    setStudyPlan(updatedPlan);

    // Sync to backend if authenticated and it's a real session ID (numeric database ID), and NOT in parent mode
    const isRealSessionId = session.id && !isNaN(Number(session.id));

    if (!isParentMode && session && isRealSessionId) {
      try {
        const { studyPlanAPI } = await import('../services/api');
        await studyPlanAPI.updateSession(session.id, {
          completed: status === 'completed',
          status: status
        });
      } catch (e) {
        console.warn("Failed to sync session status to server", e);
      }
    }

    // Update progress for the topic
    if (session && status === 'completed') {
      updateProgress(session.topicId, {
        progress: 100,
        timeSpent: session.duration,
        lastStudied: currentDate,
      });

      // Sync progress data to backend if NOT in parent mode
      if (!isParentMode) {
        try {
          const { progressAPI } = await import('../services/api');
          await progressAPI.update({
            topic_id: session.topicId,
            mastery_level: 100,
            time_spent: session.duration,
            last_studied: currentDate
          });
        } catch (e) {
          console.warn("Failed to sync topic progress to server", e);
        }
      }

      // Simple success message
      toast.success(
        `✅ Session Completed!`,
        {
          description: `${session.duration} minutes logged for ${session.subjectName}`,
          duration: 4000,
        }
      );

      // Store session for quiz prompt later
      setCompletedSessionForQuiz(session);
      setQuizPromptOpen(true);
    } else if (status === 'skipped') {
      toast.warning(`⚠️ ${session.subjectName} session skipped. Try not to skip this subject too often!`);
    }
  };

  const handleReorderSession = (fromIndex: number, toIndex: number) => {
    const updatedPlan = reorderSession(studyPlan, currentDate, fromIndex, toIndex);
    setStudyPlan(updatedPlan);

    // Track the schedule change (Simplified)
    console.log("Session order changed", { fromIndex, toIndex });

    toast.success('Session order updated!');
  };

  const handleChangeSubject = (sessionId: string, newSubjectId: string) => {
    if (!dailyPlan) return;
    const session = dailyPlan.sessions.find(s => s.id === sessionId);
    const oldSubjectName = session?.subjectName || 'Unknown';

    const updatedPlan = changeSessionSubject(studyPlan, userProfile, currentDate, sessionId, newSubjectId);
    setStudyPlan(updatedPlan);

    // Find new subject name
    const newSubject = availableSubjects.find(s => s.id === newSubjectId);

    // Track the schedule change (Simplified)
    console.log("Subject changed", { oldSubjectName, newSubjectId });

    toast.success('Subject changed successfully!');
  };

  const handleChangeDuration = (sessionId: string, newDuration: number) => {
    if (!dailyPlan) return;

    const session = dailyPlan.sessions.find(s => s.id === sessionId);
    const oldDuration = session?.duration || 0;

    const updatedSessions = dailyPlan.sessions.map((s) =>
      s.id === sessionId ? { ...s, duration: newDuration } : s
    );

    // Recalculate total hours
    const totalHours = updatedSessions.reduce((sum, s) => sum + s.duration / 60, 0);

    const updatedPlan = {
      ...studyPlan,
      dailyPlans: {
        ...studyPlan.dailyPlans,
        [currentDate]: {
          ...dailyPlan,
          sessions: updatedSessions,
          totalHours,
        },
      },
    };

    setStudyPlan(updatedPlan);

    // Track the schedule change (Simplified)
    console.log("Duration changed", { sessionId, newDuration });
  };

  if (!dailyPlan) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No study plan for this date</p>
      </div>
    );
  }

  const completionPercentage = dailyPlan.totalHours > 0 ? (dailyPlan.completedHours / dailyPlan.totalHours) * 100 : 0;

  // Get available subjects for customization
  const boardData = curriculumData.find((b: any) => b.id === userProfile.board);
  const streamData = boardData?.classes[userProfile.class]?.find((s: any) => s.id === userProfile.stream);
  const availableSubjects = streamData?.subjects.map((s: any) => ({ id: s.id, name: s.name })) || [];

  return (
    <div className="space-y-6">
      {/* Ultra-Modern Date Navigator */}
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 rounded-[24px] opacity-20 blur-lg"></div>
        <div className="relative flex items-center justify-between p-6 bg-gradient-to-r from-white/95 via-indigo-50/40 to-purple-50/40 backdrop-blur-xl rounded-[22px] border-2 border-white/60 shadow-2xl">
          <Button
            onClick={() => navigateDay(-1)}
            variant="outline"
            size="sm"
            className="group relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border-2 border-indigo-200/50 bg-white/80 backdrop-blur px-6 py-5 rounded-2xl font-bold text-indigo-700"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
            <ChevronLeft className="w-5 h-5 mr-2 relative z-10 group-hover:-translate-x-1 transition-transform" />
            <span className="relative z-10">Previous</span>
          </Button>
          <div className="text-center">
            <h2 className="font-black text-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              {new Date(currentDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </h2>
            <div className="flex items-center gap-3 justify-center mt-3">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 text-sm font-bold border-2 border-indigo-200/50 shadow-lg shadow-indigo-500/20">
                <span className="text-base">📚</span> {dailyPlan.totalHours.toFixed(1)}h Planned
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 text-sm font-bold border-2 border-emerald-200/50 shadow-lg shadow-emerald-500/20">
                <span className="text-base">✅</span> {dailyPlan.completedHours.toFixed(1)}h Done
              </span>
            </div>
          </div>
          <Button
            onClick={() => navigateDay(1)}
            variant="outline"
            size="sm"
            className="group relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border-2 border-indigo-200/50 bg-white/80 backdrop-blur px-6 py-5 rounded-2xl font-bold text-indigo-700"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
            <span className="relative z-10">Next</span>
            <ChevronRight className="w-5 h-5 ml-2 relative z-10 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>

      {/* Customize Button */}
      <div className="flex justify-between items-center">
        <div className="flex gap-3">
          {!isToday(currentDate) && (
            <Tooltip content="Jump to today (Press T)">
              <Button
                onClick={() => {
                  const today = new Date().toISOString().split('T')[0];
                  setCurrentDate(today);
                  toast.success('Jumped to today!');
                }}
                variant="outline"
                className="group relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-blue-300/50 bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 text-blue-700 font-bold px-6 py-3 rounded-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <span className="relative z-10">📅 Today</span>
              </Button>
            </Tooltip>
          )}
          <Tooltip content="Keyboard shortcuts (Press ?)">
            <Button
              onClick={() => setShowKeyboardShortcuts(!showKeyboardShortcuts)}
              variant="outline"
              className="group relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-gray-300/50 bg-gradient-to-r from-gray-50 to-slate-50 hover:from-gray-100 hover:to-slate-100 text-gray-700 font-bold px-4 py-3 rounded-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-gray-400/20 to-slate-400/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <Keyboard className="w-5 h-5 relative z-10" />
            </Button>
          </Tooltip>
        </div>
        <Button
          onClick={() => setCustomizeModalOpen(true)}
          className="group relative overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-purple-300/50 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 text-purple-700 font-bold px-6 py-5 rounded-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          <Settings className="w-5 h-5 mr-2 relative z-10" />
          <span className="relative z-10">Customize Today's Plan</span>
        </Button>
      </div>

      {/* Ultra-Premium Progress Card */}
      <div className="group relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 rounded-[28px] opacity-75 blur-lg group-hover:opacity-100 transition duration-500"></div>
        <div className="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 p-8 shadow-2xl border-2 border-white/30">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full -ml-16 -mb-16 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-sm font-black tracking-wider uppercase text-indigo-100 mb-1 block">Today's Progress</span>
                <span className="text-xs text-white/80 font-semibold">Keep up the momentum! 🚀</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-6xl font-black text-white drop-shadow-2xl">{Math.round(completionPercentage)}</span>
                <span className="text-3xl font-black text-white/90 mb-2">%</span>
              </div>
            </div>
            <div className="h-4 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm border border-white/30 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-white via-yellow-100 to-white rounded-full transition-all duration-1000 shadow-xl relative overflow-hidden"
                style={{ width: `${completionPercentage}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ultra-Premium Session Cards */}
      <div className="space-y-5">
        {dailyPlan.sessions.map((session, index) => {
          // Get reference links for this topic
          const referenceLinks = getReferenceLinks(session.topicId, session.subjectId);
          const getLinkIcon = (type: string) => {
            switch (type) {
              case 'video': return <Video className="w-3.5 h-3.5" />;
              case 'article': return <FileText className="w-3.5 h-3.5" />;
              case 'practice': return <PenTool className="w-3.5 h-3.5" />;
              case 'notes': return <BookOpen className="w-3.5 h-3.5" />;
              case 'interactive': return <ExternalLink className="w-3.5 h-3.5" />;
              default: return <ExternalLink className="w-3.5 h-3.5" />;
            }
          };

          // Advanced Color Mapping By Subject
          const subject = session.subjectName.toLowerCase();
          let baseGradients = {
            border: 'from-indigo-400 via-purple-500 to-pink-500',
            bg: 'from-white via-indigo-50/30 to-purple-50/30',
            icon: 'from-indigo-500 to-purple-600',
            badge: 'from-blue-100 to-cyan-100 text-blue-700 border-blue-200/50',
          };

          if (subject.includes('phys')) {
            baseGradients = { border: 'from-cyan-400 via-blue-500 to-indigo-500', bg: 'from-white via-cyan-50/30 to-blue-50/30', icon: 'from-cyan-500 to-blue-600', badge: 'from-cyan-100 to-blue-100 text-cyan-700 border-cyan-200/50' };
          } else if (subject.includes('math')) {
            baseGradients = { border: 'from-rose-400 via-orange-500 to-amber-500', bg: 'from-white via-rose-50/30 to-orange-50/30', icon: 'from-rose-500 to-orange-600', badge: 'from-rose-100 to-orange-100 text-rose-700 border-rose-200/50' };
          } else if (subject.includes('chem')) {
            baseGradients = { border: 'from-emerald-400 via-teal-500 to-cyan-500', bg: 'from-white via-emerald-50/30 to-teal-50/30', icon: 'from-emerald-500 to-teal-600', badge: 'from-emerald-100 to-teal-100 text-emerald-700 border-emerald-200/50' };
          } else if (subject.includes('bio')) {
            baseGradients = { border: 'from-lime-400 via-green-500 to-emerald-500', bg: 'from-white via-lime-50/30 to-green-50/30', icon: 'from-lime-500 to-green-600', badge: 'from-lime-100 to-green-100 text-lime-700 border-lime-200/50' };
          }

          const isCompleted = session.status === 'completed';
          const isInProgress = session.status === 'in-progress';
          const isSkipped = session.status === 'skipped';

          const cardGradient = isCompleted ? 'from-emerald-400 via-teal-500 to-green-500'
            : isInProgress ? 'from-amber-400 via-orange-500 to-pink-500'
              : isSkipped ? 'from-slate-300 to-gray-400'
                : baseGradients.border;

          const cardBg = isCompleted ? 'from-emerald-50/95 via-teal-50/95 to-green-50/95'
            : isInProgress ? 'from-amber-50/95 via-orange-50/95 to-pink-50/95'
              : isSkipped ? 'from-slate-50 to-gray-50'
                : baseGradients.bg;

          const iconGradient = (isCompleted || isInProgress) ? 'from-white/20 to-transparent' : baseGradients.icon;

          return (
            <div
              key={session.id}
              className="group relative flex gap-6 mt-8"
            >
              {/* Timeline Node */}
              <div className="flex flex-col items-center mt-6">
                <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${cardGradient} shadow-lg ring-4 ring-white z-10`}></div>
                {index !== dailyPlan.sessions.length - 1 && (
                  <div className="w-0.5 h-full bg-slate-200 mt-2 rounded-full hidden sm:block"></div>
                )}
              </div>

              {/* Session Core Content */}
              <div className="flex-1">
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${cardGradient} rounded-[28px] ${session.status === 'skipped' ? 'opacity-20' : 'opacity-30 group-hover:opacity-50'} blur transition duration-500`}></div>
                <div className={`relative overflow-hidden rounded-[26px] bg-gradient-to-br ${cardBg} backdrop-blur-xl p-7 shadow-xl border border-white/80 ${session.status !== 'skipped' && 'group-hover:translate-y-[-2px] hover:shadow-2xl'} transition-all duration-500`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/20 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tl from-black/5 to-transparent rounded-full -ml-12 -mb-12"></div>

                  <div className="relative flex items-start gap-5">
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <div className={`absolute -inset-1 bg-gradient-to-r ${cardGradient} rounded-[18px] opacity-30 blur`}></div>
                        <div className={`relative w-16 h-16 rounded-[16px] bg-gradient-to-br ${iconGradient} flex items-center justify-center text-white font-black text-2xl shadow-lg`}>
                          {session.subjectName.charAt(0)}
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Badge className="px-3 py-1.5 text-xs font-bold bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border-2 border-blue-200/50 shadow-lg rounded-xl">
                              <span className="mr-1.5">⏱️</span>{session.duration} min
                            </Badge>
                            {session.isRevision && (
                              <Badge className="px-3 py-1.5 text-xs font-bold bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border-2 border-amber-200/50 shadow-lg rounded-xl">
                                <span className="mr-1.5">🔄</span>Revision
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-black text-xl text-slate-900 mb-1.5">{session.subjectName}</h3>
                          {(() => {
                            let displayTopicName = session.topicName;
                            const isGeneric = !displayTopicName ||
                              displayTopicName === 'Study Session' ||
                              displayTopicName === 'Topic' ||
                              displayTopicName === 'General' ||
                              displayTopicName === 'Unassigned';

                            if (isGeneric) {
                              // If we have a topicId, try to find it
                              if (session.topicId) {
                                // 1. Try specific context lookup first (fast path)
                                let foundTopic = null;
                                if (userProfile?.board && userProfile?.class && userProfile?.stream) {
                                  const board = curriculumData.find(b => b.id === userProfile.board);
                                  const stream = board?.classes[userProfile.class]?.find(s => s.id === userProfile.stream);
                                  if (stream) {
                                    // Search in stream
                                    for (const sub of stream.subjects) {
                                      for (const ch of sub.chapters) {
                                        const t = ch.topics.find(top => top.id === session.topicId);
                                        if (t) { foundTopic = t; break; }
                                      }
                                      if (foundTopic) break;
                                    }
                                  }
                                }

                                // 2. Brute force lookup (slow path) if context failed
                                if (!foundTopic) {
                                  for (const board of curriculumData) {
                                    for (const classKey in board.classes) {
                                      for (const stream of board.classes[classKey]) {
                                        for (const sub of stream.subjects) {
                                          for (const ch of sub.chapters) {
                                            const t = ch.topics.find(top => top.id === session.topicId);
                                            if (t) { foundTopic = t; break; }
                                          }
                                          if (foundTopic) break;
                                        }
                                        if (foundTopic) break;
                                      }
                                      if (foundTopic) break;
                                    }
                                    if (foundTopic) break;
                                  }
                                }

                                if (foundTopic) {
                                  displayTopicName = foundTopic.name;
                                } else {
                                  // 3. Last resort: Format the ID
                                  if (session.topicId.startsWith('revision-')) {
                                    displayTopicName = "Revision: " + session.subjectName;
                                  } else {
                                    // "physics-laws" -> "Physics Laws"
                                    displayTopicName = session.topicId
                                      .split('-')
                                      .filter(p => p !== 'topic' && p.length > 0)
                                      .map(p => p.charAt(0).toUpperCase() + p.slice(1))
                                      .join(' ');
                                  }
                                }
                              } else {
                                // If NO topicId, use a sensible default based on subject
                                displayTopicName = `${session.subjectName} Review`;
                              }
                            }
                            return (
                              <p className="text-sm text-slate-700 font-bold mb-1">{displayTopicName || 'General Session'}</p>
                            );
                          })()}
                          <p className="text-xs text-slate-600 font-semibold">{session.chapterName}</p>
                          {session.completed && (
                            <span className="ml-auto flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                              <CheckCircle2 className="w-3 h-3" />
                              Done
                            </span>
                          )}

                          {/* Rescheduled Badge */}

                          {session.notes && (
                            <p className="text-xs text-slate-600 mt-3 italic bg-white/50 px-3 py-2 rounded-xl border border-slate-200">
                              💬 {session.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {session.status === 'not-started' && (
                        <div className="flex gap-3 mt-5">
                          <Button
                            onClick={() => updateSessionStatus(session.id, 'in-progress')}
                            size="sm"
                            className="flex-1 group relative overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-blue-300/50 bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 text-blue-700 font-bold py-5 rounded-2xl"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            <Clock className="w-5 h-5 mr-2 relative z-10" />
                            <span className="relative z-10">Start Session</span>
                          </Button>
                          <Button
                            onClick={() => updateSessionStatus(session.id, 'completed')}
                            size="sm"
                            className="flex-1 group relative overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-emerald-300/50 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-5 rounded-2xl"
                          >
                            <Check className="w-5 h-5 mr-2 relative z-10" />
                            <span className="relative z-10">Complete</span>
                          </Button>
                          <Button
                            onClick={() => updateSessionStatus(session.id, 'skipped')}
                            size="sm"
                            className="group relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-slate-300/50 bg-gradient-to-r from-slate-50 to-gray-50 hover:from-slate-100 hover:to-gray-100 text-slate-700 font-bold px-5 py-5 rounded-2xl"
                          >
                            <X className="w-5 h-5 relative z-10" />
                          </Button>
                        </div>
                      )}

                      {session.status === 'in-progress' && (
                        <SessionTimer
                          session={session}
                          onComplete={() => updateSessionStatus(session.id, 'completed')}
                        />
                      )}

                      {session.status === 'completed' && (
                        <div className="mt-5 space-y-4">
                          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm shadow-md border border-emerald-300/50">
                            <span className="text-base">✓</span> Completed Successfully
                          </div>

                          {/* Inline Quiz Prompt */}
                          {completedSessionForQuiz && completedSessionForQuiz.id === session.id && (
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-purple-100 shadow-sm mt-4 isolate relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-50 rounded-full -mr-16 -mt-16 -z-10"></div>
                              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 relative z-10">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg flex-shrink-0">
                                  <span className="text-2xl">🎯</span>
                                </div>
                                <div className="flex-1">
                                  <h4 className="text-lg font-black text-slate-900 leading-tight">Test Your Knowledge!</h4>
                                  <p className="text-sm font-semibold text-slate-600 mt-1">Take a quick quiz to reinforce what you've learned about <span className="text-purple-600 font-bold">{session.topicName || session.subjectName}</span>.</p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                                  <Button
                                    onClick={() => {
                                      if (onNavigateToQuiz) {
                                        onNavigateToQuiz({
                                          topicId: session.topicId,
                                          subjectId: session.subjectId,
                                          chapterId: session.chapterId || session.topicId,
                                          topicName: session.topicName,
                                          subjectName: session.subjectName,
                                          chapterName: session.chapterName || ''
                                        });
                                      } else {
                                        window.location.hash = `#quiz-${session.topicId}`;
                                        toast.success('Opening quiz interface...');
                                      }
                                      setCompletedSessionForQuiz(null);
                                    }}
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-md sm:w-auto w-full"
                                  >
                                    Start Quiz
                                  </Button>
                                  <Button
                                    onClick={() => {
                                      toast.info('You can take the quiz later from Study Tools!');
                                      setCompletedSessionForQuiz(null);
                                    }}
                                    variant="outline"
                                    className="border-slate-200 text-slate-600 hover:bg-slate-50 font-bold rounded-xl sm:w-auto w-full"
                                  >
                                    Later
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {session.status === 'skipped' && (
                        <div className="mt-5 flex items-center justify-between p-4 bg-slate-100 rounded-2xl border-2 border-slate-200">
                          <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                            <X className="w-4 h-4" /> Skipped
                          </div>
                          <Button
                            onClick={() => updateSessionStatus(session.id, 'not-started')}
                            size="sm"
                            variant="ghost"
                            className="text-indigo-600 hover:text-indigo-700 font-bold hover:bg-white/50"
                          >
                            Undo Skip
                          </Button>
                        </div>
                      )}

                      {/* Reference Links Section */}
                      {referenceLinks && referenceLinks.length > 0 && (
                        <Collapsible className="mt-5">
                          <CollapsibleTrigger asChild>
                            <Button className="w-full justify-between group/trigger relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-purple-300/50 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 text-purple-700 font-bold py-5 rounded-2xl">
                              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 translate-x-full group-hover/trigger:translate-x-0 transition-transform duration-300"></div>
                              <span className="flex items-center gap-2 relative z-10">
                                <BookOpen className="w-5 h-5" />
                                Study Resources ({referenceLinks.length})
                              </span>
                              <ChevronRight className="w-5 h-5 relative z-10 group-hover/trigger:translate-x-1 transition-transform" />
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="mt-4">
                            <div className="grid grid-cols-1 gap-3">
                              {referenceLinks.map((link, idx) => (
                                <a
                                  key={idx}
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group/link relative"
                                >
                                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-[18px] opacity-40 group-hover/link:opacity-70 blur transition duration-300"></div>
                                  <div className="relative flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50/90 to-purple-50/90 backdrop-blur-xl rounded-[16px] border-2 border-white/60 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                                    <div className="flex items-center gap-4 flex-1">
                                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0 shadow-xl">{getLinkIcon(link.type)}</div>
                                      <div className="flex-1 min-w-0">
                                        <div className="font-bold text-sm text-slate-900 mb-1">{link.title}</div>
                                        <div className="text-xs text-slate-600 font-semibold">{link.type.charAt(0).toUpperCase() + link.type.slice(1)}</div>
                                      </div>
                                      <ExternalLink className="w-5 h-5 text-indigo-600 flex-shrink-0 group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
                                    </div>
                                  </div>
                                </a>
                              ))}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Burnout Warning */}
      {
        dailyPlan.burnoutLevel > 60 && (
          <Card className="p-4 bg-orange-50 border-orange-200">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div className="flex-1">
                <h4 className="font-semibold text-orange-900">High Burnout Level Detected</h4>
                <p className="text-sm text-orange-700 mt-1">
                  You seem stressed. Consider taking a break or reducing study hours for today.
                </p>
              </div>
            </div>
          </Card>
        )
      }

      {/* Session Customization Modal */}
      <SessionCustomizationModal
        isOpen={customizeModalOpen}
        onClose={() => setCustomizeModalOpen(false)}
        sessions={dailyPlan.sessions}
        availableSubjects={availableSubjects}
        onReorder={handleReorderSession}
        onChangeSubject={handleChangeSubject}
        onChangeDuration={handleChangeDuration}
        date={currentDate}
      />

      {/* Removed Screen-Blocking Quiz Prompt Modal (Now rendered inline) */}

      {/* Keyboard Shortcuts Tooltip */}
      {
        showKeyboardShortcuts && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
            onClick={() => setShowKeyboardShortcuts(false)}
          >
            <div
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 transform animate-in zoom-in duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-500 to-slate-600 flex items-center justify-center shadow-xl">
                  <Keyboard className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">
                  Keyboard Shortcuts
                </h3>
                <p className="text-slate-600 font-semibold text-sm">
                  Navigate faster with these shortcuts
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-sm font-bold text-slate-700">Previous Day</span>
                  <kbd className="px-3 py-1.5 bg-white border-2 border-gray-300 rounded-lg text-xs font-bold text-slate-700 shadow-sm">
                    ← Left Arrow
                  </kbd>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-sm font-bold text-slate-700">Next Day</span>
                  <kbd className="px-3 py-1.5 bg-white border-2 border-gray-300 rounded-lg text-xs font-bold text-slate-700 shadow-sm">
                    → Right Arrow
                  </kbd>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-sm font-bold text-slate-700">Jump to Today</span>
                  <kbd className="px-3 py-1.5 bg-white border-2 border-gray-300 rounded-lg text-xs font-bold text-slate-700 shadow-sm">
                    T
                  </kbd>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-sm font-bold text-slate-700">Show Shortcuts</span>
                  <kbd className="px-3 py-1.5 bg-white border-2 border-gray-300 rounded-lg text-xs font-bold text-slate-700 shadow-sm">
                    ?
                  </kbd>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-sm font-bold text-slate-700">Close Modals</span>
                  <kbd className="px-3 py-1.5 bg-white border-2 border-gray-300 rounded-lg text-xs font-bold text-slate-700 shadow-sm">
                    Esc
                  </kbd>
                </div>
              </div>

              <Button
                onClick={() => setShowKeyboardShortcuts(false)}
                className="w-full mt-6 font-bold py-3 rounded-2xl"
              >
                Got it!
              </Button>
            </div>
          </div>
        )
      }
    </div>
  );
};