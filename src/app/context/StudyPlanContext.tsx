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
  userEmail: string | null;
  loading: boolean;
}

const StudyPlanContext = createContext<StudyPlanContextType | undefined>(undefined);

export const StudyPlanProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('userProfile');
    return saved ? JSON.parse(saved) : null;
  });

  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(() => {
    const saved = localStorage.getItem('studyPlan');
    return saved ? JSON.parse(saved) : null;
  });

  const [progressData, setProgressData] = useState<Record<string, ProgressData>>(() => {
    const saved = localStorage.getItem('progressData');
    return saved ? JSON.parse(saved) : {};
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
    } else {
      localStorage.removeItem('studyPlan');
    }
  }, [studyPlan]);

  // Save progress data changes (with debounce)
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (Object.keys(progressData).length > 0) {
        localStorage.setItem('progressData', JSON.stringify(progressData));
      }
    }, 500); // Save 0.5 second after last change

    return () => clearTimeout(timeout);
  }, [progressData]);

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
        userEmail,
        loading,
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
