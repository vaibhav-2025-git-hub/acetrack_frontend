import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, StudyPlan, DailyPlan, ProgressData } from '../types';
import { checkSubjectNeglect } from '../utils/subjectTracker';
import { toast } from 'sonner';

interface ScheduleChange {
  id: string;
  timestamp: string;
  type: 'reschedule' | 'adaptation' | 'burnout' | 'completion' | 'difficulty_adjustment';
  title: string;
  description: string;
  details?: {
    from?: string;
    to?: string;
    subject?: string;
    reason?: string;
  };
}

interface StudyPlanContextType {
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile | null) => void;
  studyPlan: StudyPlan | null;
  setStudyPlan: (plan: StudyPlan | null) => void;
  progressData: Record<string, ProgressData>;
  setProgressData: (data: Record<string, ProgressData>) => void;
  updateProgress: (topicId: string, progress: Partial<ProgressData>) => void;
  isParentMode: boolean;
  setIsParentMode: (mode: boolean) => void;
  checkAndUpdateSubjectTracking: () => void;
  scheduleChanges: ScheduleChange[];
  addScheduleChange: (change: Omit<ScheduleChange, 'id' | 'timestamp'>) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  userEmail: string | null;
  setUserEmail: (email: string | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const StudyPlanContext = createContext<StudyPlanContextType | undefined>(undefined);

export const StudyPlanProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('userProfile');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Error parsing userProfile from localStorage", e);
      return null;
    }
  });

  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(() => {
    try {
      const saved = localStorage.getItem('studyPlan');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Error parsing studyPlan from localStorage", e);
      return null;
    }
  });

  const [progressData, setProgressData] = useState<Record<string, ProgressData>>(() => {
    try {
      const saved = localStorage.getItem('progressData');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.error("Error parsing progressData from localStorage", e);
      return {};
    }
  });

  const [scheduleChanges, setScheduleChanges] = useState<ScheduleChange[]>(() => {
    const saved = localStorage.getItem('scheduleChanges');
    return saved ? JSON.parse(saved) : [];
  });

  const [isParentMode, setIsParentMode] = useState(false);

  // Save user profile to localStorage when it changes
  useEffect(() => {
    if (userProfile) {
      localStorage.setItem('userProfile', JSON.stringify(userProfile));
    } else {
      localStorage.removeItem('userProfile');
    }
  }, [userProfile]);

  // Save study plan to localStorage when it changes
  useEffect(() => {
    if (studyPlan) {
      localStorage.setItem('studyPlan', JSON.stringify(studyPlan));

      // Sync to backend (debounced)
      const timeoutId = setTimeout(async () => {
        if (!isParentMode && isAuthenticated) {
          try {
            const { studyPlanAPI } = await import('../services/api');
            // We don't have a full plan update yet, but we can iterate and find differences 
            // OR we just use this as a trigger for session updates if we had a more granular system.
            // For now, let's assume we might implement a full plan PUT if needed, 
            // but the session updates are handled in DailyView.
            console.log("Study plan changed, local storage updated.");
          } catch (e) {
            console.error("Failed to sync study plan to backend", e);
          }
        }
      }, 2000);
      return () => clearTimeout(timeoutId);
    } else {
      localStorage.removeItem('studyPlan');
    }
  }, [studyPlan, isAuthenticated, isParentMode]);

  // Save progress data changes (with debounce) and sync to backend
  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (Object.keys(progressData).length > 0) {
        localStorage.setItem('progressData', JSON.stringify(progressData));

        // Sync to backend
        if (!isParentMode && isAuthenticated) {
          try {
            const { progressAPI } = await import('../services/api');
            // Progress data is a record of topicId -> ProgressData
            // Backend expects array or single object. 
            // We'll send the latest changes or the whole thing if it's small.
            // For now, let's just log. DailyView handles immediate sync for completions.
            console.log("Progress data changed, local storage updated.");
          } catch (e) {
            console.error("Failed to sync progress to backend", e);
          }
        }
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [progressData, isAuthenticated, isParentMode]);

  // Save schedule changes to localStorage
  useEffect(() => {
    if (scheduleChanges.length > 0) {
      localStorage.setItem('scheduleChanges', JSON.stringify(scheduleChanges));
    }
  }, [scheduleChanges]);

  const addScheduleChange = (change: Omit<ScheduleChange, 'id' | 'timestamp'>) => {
    const newChange: ScheduleChange = {
      ...change,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };

    setScheduleChanges((prev) => [...prev, newChange]);

    // Show toast notification
    const getToastIcon = (type: string) => {
      switch (type) {
        case 'reschedule': return '📅';
        case 'adaptation': return '🔄';
        case 'burnout': return '⚠️';
        case 'completion': return '✅';
        case 'difficulty_adjustment': return '⚙️';
        default: return '📌';
      }
    };

    toast.success(`${getToastIcon(change.type)} ${change.title}`, {
      description: change.description,
      duration: 5000,
    });
  };

  const updateProgress = (topicId: string, progress: Partial<ProgressData>) => {
    setProgressData((prev) => ({
      ...prev,
      [topicId]: {
        ...prev[topicId],
        ...progress,
        topicId,
      },
    }));
  };

  const checkAndUpdateSubjectTracking = () => {
    if (studyPlan) {
      const currentDate = new Date().toISOString().split('T')[0];
      const updatedPlan = checkSubjectNeglect(studyPlan, currentDate);
      setStudyPlan(updatedPlan);
    }
  };

  return (
    <StudyPlanContext.Provider
      value={{
        userProfile,
        setUserProfile,
        studyPlan,
        setStudyPlan,
        progressData,
        setProgressData,
        updateProgress,
        isParentMode,
        setIsParentMode,
        checkAndUpdateSubjectTracking,
        scheduleChanges,
        addScheduleChange,
        isAuthenticated,
        setIsAuthenticated,
        userEmail,
        setUserEmail,
        loading,
        setLoading,
      }}
    >
      {children}
    </StudyPlanContext.Provider>
  );
};

export const useStudyPlan = () => {
  const context = useContext(StudyPlanContext);
  if (context === undefined) {
    throw new Error('useStudyPlan must be used within a StudyPlanProvider');
  }
  return context;
};
