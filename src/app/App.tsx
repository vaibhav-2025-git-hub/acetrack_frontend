import React, { useState, useEffect } from "react";
import {
  StudyPlanProvider,
  useStudyPlan,
} from "./context/StudyPlanContext";
import { AuthPage } from "./components/AuthPage";
import { ProfileSetup } from "./components/ProfileSetup";
import { PsychometricTest } from "./components/PsychometricTest";
import { SubjectDifficulty } from "./components/SubjectDifficulty";
import { StudyDashboard } from "./components/StudyDashboard";
import { FacultyDashboard } from "./components/FacultyDashboard";
import { curriculumData } from "./data/curriculum";
import { generateImprovedStudyPlan } from "./utils/improvedPlanGenerator";
import { toISODate } from "./utils/helpers";
import {
  UserProfile,
  LearningSpeed,
  Difficulty,
} from "./types";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";

type Step =
  | "auth"
  | "profile"
  | "psychometric"
  | "difficulty"
  | "dashboard";

console.log("App.tsx script executing");

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: 'red', background: 'white', minHeight: '100vh', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }}>
          <h2>Component Crash Caught by ErrorBoundary</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error?.message}</pre>
          <pre style={{ fontSize: '12px', opacity: 0.7 }}>{this.state.error?.stack}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

const mapBackendPlanToFrontend = (backendPlan: any) => {
  if (!backendPlan) return null;

  const mappedDailyPlans: Record<string, any> = {};
  const days: any[] = [];

  if (backendPlan.daily_plans) {
    backendPlan.daily_plans.forEach((dp: any) => {
      const dateKey = toISODate(dp.date);
      const mappedSessions = (dp.sessions || []).map((s: any) => ({
        id: s.id?.toString() || Math.random().toString(),
        topicId: s.topic_id || 'unassigned',
        topicName: s.topic_name || 'Study Session',
        chapterId: s.chapter_id || 'unassigned',
        chapterName: s.chapter_name || 'General',
        subjectId: s.subject_id || 'unassigned',
        subjectName: s.subject_name || 'Subject',
        date: dateKey,
        startTime: s.start_time || '09:00',
        duration: s.duration || 60,
        status: s.status || (s.completed ? 'completed' : 'not-started'),
        completed: s.completed || s.status === 'completed',
        isRevision: s.is_revision || false,
        completionPercentage: s.completion_percentage || 0,
        notes: s.notes,
        completedAt: s.completed_at
      }));

      mappedDailyPlans[dateKey] = {
        date: dateKey,
        sessions: mappedSessions,
        totalHours: (dp.sessions || []).reduce((acc: number, s: any) => acc + (s.duration || 60), 0) / 60,
        completedHours: (dp.sessions || []).filter((s: any) => s.status === 'completed' || s.completed).reduce((acc: number, s: any) => acc + (s.duration || 60), 0) / 60,
        burnoutLevel: dp.burnout_level || 0
      };

      days.push({
        date: dateKey,
        sessions: mappedSessions.map((s: any) => ({
          id: s.id,
          topicId: s.topicId,
          topicName: s.topicName,
          chapterId: s.chapterId,
          chapterName: s.chapterName,
          subjectId: s.subjectId,
          duration: s.duration,
          completed: s.completed
        }))
      });
    });
  }

  return {
    dailyPlans: mappedDailyPlans,
    days: days,
    overallProgress: backendPlan.overall_progress || 0,
    currentStreak: backendPlan.current_streak || 0,
    longestStreak: backendPlan.longest_streak || 0,
    subjectTracking: {},
    parentAlerts: []
  };
};

const AppContent: React.FC = () => {
  console.log("AppContent rendering");
  const {
    userProfile, setUserProfile,
    setStudyPlan, setProgressData,
    isAuthenticated, setIsAuthenticated,
    setIsParentMode
  } = useStudyPlan();
  const [currentStep, setCurrentStep] = useState<Step>("auth");
  const [tempProfile, setTempProfile] = useState<
    Partial<UserProfile>
  >({});
  const [userType, setUserType] = useState<
    "student" | "parent" | "faculty"
  >("student");

  // Check for saved authentication and profile on mount
  useEffect(() => {
    const restoreSession = async () => {
      const savedAuth = localStorage.getItem("isAuthenticated");
      const savedUserType = localStorage.getItem("userType");
      const savedProfile = localStorage.getItem("userProfile");
      const savedPlan = localStorage.getItem("studyPlan");

      if (savedAuth === "true" && savedUserType) {
        // Verify token first
        try {
          const { authAPI } = await import("./services/api");
          const token = localStorage.getItem("acetrack_token");

          if (!token) throw new Error("No token found");

          const verifyRes = await authAPI.verifyToken(token).catch(() => ({ success: false }));

          if (!verifyRes.success) {
            console.warn("Token verification failed, clearing session");
            localStorage.clear();
            setIsAuthenticated(false);
            setCurrentStep("auth");
            return;
          }
        } catch (e) {
          console.error("Session verification error", e);
          localStorage.clear();
          setIsAuthenticated(false);
          setCurrentStep("auth");
          return;
        }

        setIsAuthenticated(true);
        const type = savedUserType as "student" | "parent" | "faculty";
        setUserType(type);

        if (type === "parent") {
          setIsParentMode(true);
          console.log("Restoring parent session... Always fetching fresh child data to stay synced.");
          try {
            const { parentAPI } = await import("./services/api");
            const response = await parentAPI.getChildData();
            if (response.success && response.data) {
              const studentData = response.data;
              console.log("Successfully fetched child data for parent:", studentData.profile?.name);

              if (studentData.profile) {
                setUserProfile(studentData.profile);
                localStorage.setItem("userProfile", JSON.stringify(studentData.profile));
              }
              if (studentData.studyPlan) {
                const mappedPlan = mapBackendPlanToFrontend(studentData.studyPlan);
                setStudyPlan(mappedPlan as any);
                localStorage.setItem("studyPlan", JSON.stringify(mappedPlan));
              }
              if (studentData.progress) {
                const mappedProgress: Record<string, any> = {};
                studentData.progress.forEach((p: any) => {
                  mappedProgress[p.topic_id] = {
                    topicId: p.topic_id,
                    masteryLevel: parseFloat(p.mastery_level || 0),
                    timeSpent: p.time_spent || 0,
                    lastStudied: p.last_studied,
                    notes: p.notes
                  };
                });
                setProgressData(mappedProgress);
                localStorage.setItem("progressData", JSON.stringify(mappedProgress));
              }
            } else {
              console.warn("Parent is logged in but no child data found. Parent might not be linked yet.");
            }
          } catch (e) {
            console.warn("Error fetching child data during session restoration", e);
          }
          setCurrentStep("dashboard");
          return;
        }

        setIsParentMode(false);
        if (type === "faculty") {
          console.log(`Restoring ${type} session... skipping profile fetch.`);
          setCurrentStep("dashboard");
          return;
        }

        // If data is missing but we're authenticated, we need to fetch from backend
        try {
          const { profileAPI, studyPlanAPI, progressAPI } = await import("./services/api");

          console.log("Restoring student session from backend...");
          const profileResponse = await profileAPI.get();

          if (profileResponse.success && profileResponse.data) {
            const rawProfile = profileResponse.data;
            const profile: UserProfile = {
              ...rawProfile,
              learningSpeed: rawProfile.learning_speed || rawProfile.learningSpeed,
              learningStyle: rawProfile.learning_style || rawProfile.learningStyle,
              studyHoursPerDay: rawProfile.study_duration || rawProfile.studyHoursPerDay,
              totalDays: rawProfile.study_duration || rawProfile.totalDays,
              studentCode: rawProfile.student_code,
              email: rawProfile.email
            };
            setUserProfile(profile);
            localStorage.setItem("userProfile", JSON.stringify(profile));

            const [planRes, progRes] = await Promise.all([
              studyPlanAPI.get().catch(e => ({ success: false, error: e })),
              progressAPI.get().catch(e => ({ success: false, error: e }))
            ]);

            if (planRes.success && planRes.data) {
              const mappedPlan = mapBackendPlanToFrontend(planRes.data);
              setStudyPlan(mappedPlan as any);
              localStorage.setItem("studyPlan", JSON.stringify(mappedPlan));
            } else {
              console.warn("No study plan found on server during restore");
            }

            if (progRes.success && progRes.data) {
              const mappedProgress: Record<string, any> = {};
              progRes.data.forEach((p: any) => {
                mappedProgress[p.topic_id] = {
                  topicId: p.topic_id,
                  masteryLevel: parseFloat(p.mastery_level || 0),
                  timeSpent: p.time_spent || 0,
                  lastStudied: p.last_studied,
                  notes: p.notes
                };
              });
              setProgressData(mappedProgress);
              localStorage.setItem("progressData", JSON.stringify(mappedProgress));
            }

            setCurrentStep("dashboard");
          } else {
            console.error("Profile fetch failed during restore", profileResponse);
            if (savedProfile) {
              setUserProfile(JSON.parse(savedProfile));
              if (savedPlan) setStudyPlan(JSON.parse(savedPlan));
              setCurrentStep("dashboard");
            } else {
              // If no profile at all, send to auth
              console.log("No profile found and not a parent/faculty, redirecting to auth");
              setIsAuthenticated(false);
              setCurrentStep("auth");
            }
          }
        } catch (e) {
          console.error("Critical error during session restoration", e);
        }
      } else {
        // No saved auth, ensure we start at auth
        setIsAuthenticated(false);
        setCurrentStep("auth");
      }
    };

    restoreSession();
  }, []);

  const handleLogin = async (
    type: "student" | "parent" | "faculty",
    userData: any,
  ) => {
    setIsAuthenticated(true);
    setUserType(type);

    // Save authentication
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("userType", type);

    // Faculty goes directly to their dashboard
    if (type === "faculty") {
      setCurrentStep("dashboard");
      return;
    }

    // Parent also goes to dashboard (parent view)
    if (type === "parent") {
      setIsParentMode(true);
      try {
        const { parentAPI } = await import("./services/api");
        const response = await parentAPI.getChildData();
        if (response.success && response.data) {
          const studentData = response.data;
          // Store child data in state/localStorage for ParentDashboard to consume
          if (studentData.profile) {
            setUserProfile(studentData.profile);
            localStorage.setItem("userProfile", JSON.stringify(studentData.profile));
          }
          if (studentData.studyPlan) {
            const mappedPlan = mapBackendPlanToFrontend(studentData.studyPlan);
            setStudyPlan(mappedPlan as any);
            localStorage.setItem("studyPlan", JSON.stringify(mappedPlan));
          }
          if (studentData.progress) {
            const mappedProgress: Record<string, any> = {};
            studentData.progress.forEach((p: any) => {
              mappedProgress[p.topic_id] = {
                topicId: p.topic_id,
                masteryLevel: parseFloat(p.mastery_level || 0),
                timeSpent: p.time_spent || 0,
                lastStudied: p.last_studied,
                notes: p.notes
              };
            });
            setProgressData(mappedProgress);
            localStorage.setItem("progressData", JSON.stringify(mappedProgress));
          }
          toast.success(`Linked to student: ${studentData.profile?.name || 'Your child'}`);
        }
      } catch (e) {
        console.warn("Could not fetch child data for parent", e);
      }
      setCurrentStep("dashboard");
      return;
    }

    setIsParentMode(false);

    // For students
    // Check if backend says they have a profile (from login response)
    // Or check localStorage as fallback
    console.log("handleLogin triggered", { type, userData });
    const hasProfile = userData.has_profile ?? (userData.isReturningUser && localStorage.getItem("userProfile"));
    console.log("hasProfile status:", hasProfile);

    if (hasProfile) {
      try {
        console.log("Fetching profile, plan and progress from backend...");
        const { profileAPI, studyPlanAPI, progressAPI } = await import("./services/api");

        const profileResponse = await profileAPI.get();
        console.log("Profile response:", profileResponse);

        if (profileResponse.success && profileResponse.data) {
          const rawProfile = profileResponse.data;

          // Map snake_case to camelCase
          const profile: UserProfile = {
            ...rawProfile,
            learningSpeed: rawProfile.learning_speed || rawProfile.learningSpeed,
            learningStyle: rawProfile.learning_style || rawProfile.learningStyle,
            studyHoursPerDay: rawProfile.study_duration || rawProfile.studyHoursPerDay,
            totalDays: rawProfile.study_duration || rawProfile.totalDays,
            studentCode: rawProfile.student_code, // Mapped from backend join
            email: rawProfile.email
          };

          setUserProfile(profile);
          localStorage.setItem("userProfile", JSON.stringify(profile));

          const [planRes, progRes] = await Promise.all([
            studyPlanAPI.get().catch(pe => {
              console.error("Plan fecth error", pe);
              return { success: false };
            }),
            progressAPI.get().catch(pre => {
              console.error("Progress fetch error", pre);
              // Return empty success to avoid blocking
              return { success: true, data: [] };
            })
          ]);

          if (planRes.success && planRes.data) {
            const mappedPlan = mapBackendPlanToFrontend(planRes.data);
            setStudyPlan(mappedPlan as any);
            localStorage.setItem("studyPlan", JSON.stringify(mappedPlan));
            console.log("Study plan mapped and set");
          } else {
            console.warn("User has profile but no study plan found on backend");
            // If no plan, we should probably generate one based on the profile
            toast.info("Generating your study plan...");
            const generatedPlan = generateImprovedStudyPlan(profile);
            setStudyPlan(generatedPlan);
            localStorage.setItem("studyPlan", JSON.stringify(generatedPlan));

            // Sync generated plan to backend
            try {
              const planPayload = {
                start_date: toISODate(profile.startDate || new Date()),
                end_date: toISODate(new Date(Date.now() + (profile.totalDays || 30) * 24 * 60 * 60 * 1000)),
                total_days: profile.totalDays || 30,
                subjects: profile.selectedSubjects || [],
                days: generatedPlan.days
              };
              await studyPlanAPI.create(planPayload);
              console.log("Generated plan successfully synced to backend");
            } catch (syncErr) {
              console.error("Failed to sync generated plan to backend", syncErr);
            }
          }

          if (progRes.success && progRes.data) {
            const mappedProgress: Record<string, any> = {};
            progRes.data.forEach((p: any) => {
              mappedProgress[p.topic_id] = {
                topicId: p.topic_id,
                masteryLevel: parseFloat(p.mastery_level || 0),
                timeSpent: p.time_spent || 0,
                lastStudied: p.last_studied,
                notes: p.notes
              };
            });
            setProgressData(mappedProgress);
            localStorage.setItem("progressData", JSON.stringify(mappedProgress));
            console.log("Progress data mapped and set");
          }

          setCurrentStep("dashboard");
          toast.success(`Welcome back, ${userData.name || profile.name}! 🎉`);
          return;
        } else {
          console.log("Profile response indicates failure, but hasProfile was true.");
          toast.error("Could not load your profile. Sending to setup.");
          setCurrentStep("profile");
        }
      } catch (error) {
        console.error("Failed to fetch profile on login", error);
        toast.error("Error connecting to server. Please try again.");
      }
    }

    // If no profile or new user
    if (!hasProfile) {
      // New registration or returning user without profile - go through full profile setup
      // If user data includes profile info (from registration), pre-fill it
      if (userData.class && userData.board && userData.stream) {
        setTempProfile({
          name: userData.name,
          class: userData.class,
          board: userData.board,
          stream: userData.stream,
        });
      }

      toast.info("Please complete your profile setup to continue");
      setCurrentStep("profile");
    }
  };

  const handleProfileComplete = (
    profile: Omit<
      UserProfile,
      "learningSpeed" | "subjectDifficulties"
    >,
  ) => {
    setTempProfile(profile);
    setCurrentStep("psychometric");
  };

  const handlePsychometricComplete = (
    learningSpeed: LearningSpeed,
    learningStyle: string,
  ) => {
    setTempProfile((prev) => ({
      ...prev,
      learningSpeed,
      learningStyle,
    }));
    setCurrentStep("difficulty");
  };

  const handleDifficultyComplete = async (
    subjectDifficulties: Record<string, Difficulty>,
  ) => {
    const completeProfile: UserProfile = {
      ...tempProfile,
      learningSpeed: tempProfile.learningSpeed!,
      subjectDifficulties,
    } as UserProfile;

    setUserProfile(completeProfile);

    // Generate study plan
    toast.loading("Generating your personalized study plan...");

    try {
      const plan = generateImprovedStudyPlan(completeProfile);
      setStudyPlan(plan);

      // Save to local storage as immediate backup
      localStorage.setItem("userProfile", JSON.stringify(completeProfile));
      localStorage.setItem("studyPlan", JSON.stringify(plan));

      // Import APIs
      const { profileAPI, studyPlanAPI } = await import("./services/api");

      // Map to backend format (snake_case)
      const profilePayload = {
        name: completeProfile.name,
        class: completeProfile.class,
        board: completeProfile.board,
        stream: completeProfile.stream,
        learning_speed: completeProfile.learningSpeed,
        learning_style: completeProfile.learningStyle,
        study_duration: completeProfile.totalDays,
        selected_subjects: completeProfile.selectedSubjects,
        subject_difficulties: completeProfile.subjectDifficulties
      };

      await profileAPI.create(profilePayload);

      // Create backend study plan with full days/sessions
      const planPayload = {
        start_date: toISODate(completeProfile.startDate),
        end_date: toISODate(new Date(new Date(completeProfile.startDate).getTime() + completeProfile.totalDays * 24 * 60 * 60 * 1000)),
        total_days: completeProfile.totalDays,
        subjects: completeProfile.selectedSubjects,
        days: plan.days // Send full detailed plan
      };

      await studyPlanAPI.create(planPayload);

      // Fetch fresh plan with DB IDs
      try {
        const freshPlanRes = await studyPlanAPI.get();
        if (freshPlanRes.success && freshPlanRes.data) {
          const mappedPlan = mapBackendPlanToFrontend(freshPlanRes.data);
          if (mappedPlan) {
            setStudyPlan(mappedPlan as any);
            localStorage.setItem("studyPlan", JSON.stringify(mappedPlan));
          }
        }
      } catch (innerError) {
        console.warn("Failed to fetch fresh plan after creation", innerError);
      }

      toast.dismiss();
      toast.success("Your study plan is ready!");
      setCurrentStep("dashboard");

    } catch (error) {
      console.error("Failed to generate or save profile/plan", error);
      toast.dismiss();
      toast.error("Warning: Could not save progress to server. Local backup created.");
      setCurrentStep("dashboard"); // Proceed anyway since local storage is set
    }
  };

  // Get subjects for difficulty assessment
  const getSubjects = () => {
    if (
      !tempProfile.board ||
      !tempProfile.class ||
      !tempProfile.stream
    )
      return [];

    const boardData = curriculumData.find(
      (b) => b.id === tempProfile.board,
    );
    if (!boardData) return [];

    const streamData = boardData.classes[
      tempProfile.class
    ]?.find((s) => s.id === tempProfile.stream);
    const allSubjects = streamData?.subjects || [];

    // Only return selected subjects
    if (
      tempProfile.selectedSubjects &&
      tempProfile.selectedSubjects.length > 0
    ) {
      return allSubjects.filter((subject) =>
        tempProfile.selectedSubjects?.includes(subject.id),
      );
    }

    return allSubjects;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 relative overflow-hidden">
      {/* Decorative Background Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      ></div>
      {currentStep === "auth" && (
        <AuthPage onLogin={handleLogin} />
      )}
      {currentStep === "profile" && (
        <ProfileSetup onComplete={handleProfileComplete} />
      )}
      {currentStep === "psychometric" && (
        <PsychometricTest
          onComplete={handlePsychometricComplete}
        />
      )}
      {currentStep === "difficulty" && (
        <SubjectDifficulty
          subjects={getSubjects()}
          onComplete={handleDifficultyComplete}
        />
      )}
      {currentStep === "dashboard" &&
        (userType === "faculty" ? (
          <FacultyDashboard />
        ) : (
          <StudyDashboard userType={userType} />
        ))}
      <Toaster />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <StudyPlanProvider>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </StudyPlanProvider>
  );
};

export default App;