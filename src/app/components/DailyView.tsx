import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { useStudyPlan } from '../context/StudyPlanContext';
import { StudyPlan } from '../types';
import { ChevronLeft, ChevronRight, Check, X, Clock, Edit, Settings, ExternalLink, BookOpen, Video, FileText, PenTool, AlertTriangle, Shield, Keyboard } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Badge } from './ui/badge';
import { SessionCustomizationModal } from './SessionCustomizationModal';
import { adaptPlanAfterSession, reorderSession, changeSessionSubject } from '../utils/improvedPlanGenerator';
import { getReferenceLinks } from '../data/referenceLinks';
import {
  canSkipSubject,
  updateSubjectTracking,
  checkSubjectNeglect,
  clearSubjectAlerts
} from '../utils/subjectTracker';
import {
  checkAndTriggerRescheduling,
  generateRescheduleSuggestions,
  analyzeSkipPatterns
} from '../utils/intelligentRescheduler';
import { curriculumData } from '../data/curriculum';
import { toast } from 'sonner';
import { Tooltip } from './ui/tooltip';
import { formatDate, isToday } from '../utils/helpers';

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
  const { studyPlan, setStudyPlan, updateProgress, userProfile, addScheduleChange } = useStudyPlan();
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

  const updateSessionStatus = async (sessionId: string, status: 'completed' | 'skipped' | 'in-progress') => {
    if (!dailyPlan) return;

    const session = dailyPlan.sessions.find((s) => s.id === sessionId);
    if (!session) return;

    // Check if subject can be skipped
    if (status === 'skipped') {
      const skipCheck = canSkipSubject(studyPlan, session.subjectId, currentDate);

      // Show warning if subject hasn't been studied for 2+ days
      if (skipCheck.shouldAlert) {
        toast.warning(
          skipCheck.reason || `⚠️ This subject hasn't been studied recently. Parents have been notified.`,
          {
            duration: 6000,
            icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
          }
        );
        // Create parent alert
        const updatedPlan = checkSubjectNeglect(studyPlan, currentDate);
        setStudyPlan(updatedPlan);
      }
    }

    const updatedSessions = dailyPlan.sessions.map((s) =>
      s.id === sessionId
        ? {
          ...s,
          status,
          completed: status === 'completed',
          completionPercentage: status === 'completed' ? 100 : status === 'in-progress' ? 50 : 0,
          completedAt: status === 'completed' ? new Date().toISOString() : undefined,
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
              id: s.id,
              topicId: s.topicId,
              topicName: s.topicName,
              chapterId: s.chapterId,
              chapterName: s.chapterName,
              subjectId: s.subjectId,
              duration: s.duration,
              completed: s.completed || s.status === 'completed'
            }))
          }
          : { ...day, sessions: [...day.sessions] } // Create new references for unchanged days too
      )
    };

    // Update subject tracking
    updatedPlan = updateSubjectTracking(updatedPlan, {
      ...session,
      status,
      date: currentDate,
    });

    // Check for subject neglect and generate parent alerts
    updatedPlan = checkSubjectNeglect(updatedPlan, currentDate);

    // Clear alerts if subject was completed
    if (status === 'completed') {
      updatedPlan = clearSubjectAlerts(updatedPlan, session.subjectId);
    }

    setStudyPlan(updatedPlan);

    // Update progress for the topic
    if (session && status === 'completed') {
      updateProgress(session.topicId, {
        progress: 100,
        timeSpent: session.duration,
        lastStudied: currentDate,
      });

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

    // Track the schedule change
    const fromSession = dailyPlan.sessions[fromIndex];
    const toSession = dailyPlan.sessions[toIndex];

    addScheduleChange({
      type: 'reschedule',
      title: 'Session Order Changed',
      description: `Reordered "${fromSession.subjectName}" session in your schedule`,
      details: {
        from: `Position ${fromIndex + 1}`,
        to: `Position ${toIndex + 1}`,
        subject: fromSession.subjectName,
        reason: 'Manual rescheduling requested'
      }
    });

    toast.success('Session order updated!');
  };

  const handleChangeSubject = (sessionId: string, newSubjectId: string) => {
    const session = dailyPlan.sessions.find(s => s.id === sessionId);
    const oldSubjectName = session?.subjectName || 'Unknown';

    const updatedPlan = changeSessionSubject(studyPlan, userProfile, currentDate, sessionId, newSubjectId);
    setStudyPlan(updatedPlan);

    // Find new subject name
    const newSubject = availableSubjects.find(s => s.id === newSubjectId);

    // Track the schedule change
    addScheduleChange({
      type: 'adaptation',
      title: 'Subject Changed',
      description: `Changed session subject to better match your learning goals`,
      details: {
        from: oldSubjectName,
        to: newSubject?.name || 'New Subject',
        reason: 'Student preference'
      }
    });

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

    // Track the schedule change
    addScheduleChange({
      type: 'adaptation',
      title: 'Session Duration Adjusted',
      description: `Modified "${session?.subjectName}" session duration`,
      details: {
        from: `${oldDuration} minutes`,
        to: `${newDuration} minutes`,
        subject: session?.subjectName,
        reason: 'Duration customization'
      }
    });
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
                <span className="text-base">📚</span> {dailyPlan.totalHours.toFixed(1)}h planned
              </span>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 text-sm font-bold border-2 border-emerald-200/50 shadow-lg shadow-emerald-500/20">
                <span className="text-base">✅</span> {dailyPlan.completedHours.toFixed(1)}h done
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

          const cardGradient = session.status === 'completed'
            ? 'from-emerald-400 via-teal-500 to-green-500'
            : session.status === 'in-progress'
              ? 'from-blue-400 via-cyan-500 to-indigo-500'
              : session.status === 'skipped'
                ? 'from-slate-300 to-gray-400'
                : 'from-indigo-400 via-purple-500 to-pink-500';

          const cardBg = session.status === 'completed'
            ? 'from-emerald-50/95 via-teal-50/95 to-green-50/95'
            : session.status === 'in-progress'
              ? 'from-blue-50/95 via-cyan-50/95 to-indigo-50/95'
              : session.status === 'skipped'
                ? 'from-slate-50 to-gray-50'
                : 'from-white via-indigo-50/30 to-purple-50/30';

          return (
            <div
              key={session.id}
              className="group relative"
            >
              <div className={`absolute -inset-1 bg-gradient-to-r ${cardGradient} rounded-[28px] ${session.status === 'skipped' ? 'opacity-20' : 'opacity-75 group-hover:opacity-100'} blur-lg transition duration-500`}></div>
              <div className={`relative overflow-hidden rounded-[26px] bg-gradient-to-br ${cardBg} backdrop-blur-xl p-7 shadow-2xl border-2 border-white/60 ${session.status !== 'skipped' && 'group-hover:scale-[1.02]'} transition-all duration-500`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/20 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tl from-black/5 to-transparent rounded-full -ml-12 -mb-12"></div>

                <div className="relative flex items-start gap-5">
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className={`absolute -inset-1 bg-gradient-to-r ${cardGradient} rounded-[18px] opacity-50 blur`}></div>
                      <div className={`relative w-16 h-16 rounded-[16px] bg-gradient-to-br ${cardGradient} flex items-center justify-center text-white font-black text-2xl shadow-2xl`}>
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
                        <p className="text-sm text-slate-700 font-bold mb-1">{session.topicName}</p>
                        <p className="text-xs text-slate-600 font-semibold">{session.chapterName}</p>
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
                      <div className="flex gap-3 mt-5">
                        <Button
                          onClick={() => updateSessionStatus(session.id, 'completed')}
                          size="sm"
                          className="flex-1 group relative overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-emerald-300/50 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-6 rounded-2xl"
                        >
                          <Check className="w-5 h-5 mr-2 relative z-10" />
                          <span className="relative z-10">Mark as Complete</span>
                        </Button>
                      </div>
                    )}

                    {session.status === 'completed' && (
                      <div className="mt-5">
                        <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm shadow-xl border-2 border-emerald-300/50">
                          <span className="text-base">✓</span> Completed Successfully
                        </div>
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
          );
        })}
      </div>

      {/* Burnout Warning */}
      {dailyPlan.burnoutLevel > 60 && (
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
      )}

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

      {/* Quiz Prompt Modal */}
      {completedSessionForQuiz && (
        <div
          className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300 ${quizPromptOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          onClick={() => {
            setQuizPromptOpen(false);
            setCompletedSessionForQuiz(null);
          }}
        >
          <div
            className={`bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 transform transition-all duration-300 ${quizPromptOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
              }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-xl">
                <span className="text-4xl">🎯</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">
                Test Your Knowledge!
              </h3>
              <p className="text-slate-600 font-semibold">
                You've completed <span className="text-purple-600 font-bold">{completedSessionForQuiz.topicName}</span>
              </p>
              <p className="text-sm text-slate-500 mt-2 font-semibold">
                Would you like to take a quick quiz to reinforce what you've learned?
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => {
                  setQuizPromptOpen(false);
                  // Navigate to quiz with full session data
                  if (onNavigateToQuiz) {
                    onNavigateToQuiz({
                      topicId: completedSessionForQuiz.topicId,
                      subjectId: completedSessionForQuiz.subjectId,
                      chapterId: completedSessionForQuiz.chapterId || completedSessionForQuiz.topicId,
                      topicName: completedSessionForQuiz.topicName,
                      subjectName: completedSessionForQuiz.subjectName,
                      chapterName: completedSessionForQuiz.chapterName || ''
                    });
                  } else {
                    window.location.hash = `#quiz-${completedSessionForQuiz.topicId}`;
                    toast.success('Opening quiz interface...');
                  }
                  setCompletedSessionForQuiz(null);
                }}
                className="w-full group relative overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-4 rounded-2xl text-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                <span className="relative z-10">✓ Yes, Start Quiz!</span>
              </Button>

              <Button
                onClick={() => {
                  setQuizPromptOpen(false);
                  toast.info('You can always take the quiz later from Study Tools!');
                  setCompletedSessionForQuiz(null);
                }}
                variant="outline"
                className="w-full font-bold py-4 rounded-2xl text-slate-700 border-2 border-slate-300 hover:bg-slate-50"
              >
                Maybe Later
              </Button>
            </div>

            <p className="text-xs text-slate-400 text-center mt-4 font-semibold">
              💡 Taking quizzes helps solidify your understanding!
            </p>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Tooltip */}
      {showKeyboardShortcuts && (
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
      )}
    </div>
  );
};