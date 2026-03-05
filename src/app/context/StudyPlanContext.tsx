import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, StudyPlan, DailyPlan, ProgressData } from '../types';
import { toast } from 'sonner';
import { mapBackendPlanToFrontend } from '../utils/helpers';


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
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  userEmail: string | null;
  setUserEmail: (email: string | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  refreshStudyPlan: () => Promise<void>;
  scheduleChanges: any[];
  setScheduleChanges: React.Dispatch<React.SetStateAction<any[]>>;
  addScheduleChange: (change: any) => void;
}

const StudyPlanContext = createContext<StudyPlanContextType | undefined>(undefined);

export const StudyPlanProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });
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

  const [scheduleChanges, setScheduleChanges] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('scheduleChanges');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Error parsing scheduleChanges from localStorage", e);
      return [];
    }
  });


  const [isParentMode, setIsParentMode] = useState(() => {
    return localStorage.getItem('isParentMode') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('isParentMode', isParentMode.toString());
  }, [isParentMode]);

  // Initial refresh from backend
  useEffect(() => {
    if (isAuthenticated && !isParentMode) {
      refreshStudyPlan();
    }
  }, [isAuthenticated, isParentMode]);

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
    localStorage.setItem('scheduleChanges', JSON.stringify(scheduleChanges));
  }, [scheduleChanges]);

  const addScheduleChange = (change: any) => {
    const newChange = {
      id: `change-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...change
    };
    setScheduleChanges((prev) => [newChange, ...prev]);
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




  const refreshStudyPlan = async () => {
    try {
      const { studyPlanAPI, flashcardsAPI } = await import('../services/api');

      // Fetch study plan and flashcards in parallel
      const [planResponse, flashcardsResponse] = await Promise.all([
        studyPlanAPI.get(),
        flashcardsAPI.get().catch(e => {
          console.error("Failed to fetch flashcards:", e);
          return { success: false, data: [] };
        })
      ]);

      if (planResponse.success && planResponse.data) {
        const mappedPlan = mapBackendPlanToFrontend(planResponse.data);

        // If flashcards fetch was successful, map them too (assuming they return arrays of cards)
        let backendFlashcards = [];
        if (flashcardsResponse.success && Array.isArray(flashcardsResponse.data)) {
          // We might need to map them to the frontend Flashcard type if they differ
          backendFlashcards = flashcardsResponse.data.map((fc: any) => ({
            id: fc.id.toString(),
            topicId: fc.topic_id || 'general',
            subjectId: fc.subject_id,
            front: fc.question,
            back: fc.answer,
            difficulty: fc.difficulty || 'medium',
            reviewCount: fc.review_count || 0,
            confidence: fc.correct_count ? Math.min(5, Math.max(1, Math.round(fc.correct_count / (fc.review_count || 1) * 5))) : 0,
            lastReviewed: fc.last_reviewed,
            nextReview: fc.next_review_date,
            createdAt: fc.created_at || new Date().toISOString()
          }));
        }

        // Merge mapped plan and preserve/update flashcards
        setStudyPlan(prev => ({
          ...prev, // preserve old state if mapBackendPlanToFrontend omits fields
          ...mappedPlan,
          flashcards: backendFlashcards.length > 0 ? backendFlashcards : (prev?.flashcards || [])
        }) as any);
      }
    } catch (error) {
      console.error("Failed to refresh study plan:", error);
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
        isAuthenticated,
        setIsAuthenticated,
        userEmail,
        setUserEmail,
        loading,
        setLoading,
        refreshStudyPlan,
        scheduleChanges,
        setScheduleChanges,
        addScheduleChange,
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
