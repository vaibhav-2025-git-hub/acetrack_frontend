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
import { LandingPage } from "./components/LandingPage";
import { AdminLogin } from "./components/AdminLogin";
import { AdminDashboard } from "./components/AdminDashboard";
import { curriculumData } from "./data/curriculum";
import { generateImprovedStudyPlan } from "./utils/improvedPlanGenerator";
import { toISODate } from "./utils/helpers";
import {
  UserProfile,
  LearningSpeed,
  Difficulty,
  PsychometricDetails,
} from "./types";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";

type Step =
  | "landing"
  | "auth"
  | "profile"
  | "psychometric"
  | "difficulty"
  | "dashboard"
  | "admin-login"
  | "admin-dashboard";

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

// Local mapper removed in favor of shared helper
import { mapBackendPlanToFrontend } from "./utils/helpers";

const AppContent: React.FC = () => {
  console.log("AppContent rendering");
  const {
    userProfile, setUserProfile,
    setStudyPlan, setProgressData,
    isAuthenticated, setIsAuthenticated,
    setIsParentMode
  } = useStudyPlan();
  const [currentStep, setCurrentStep] = useState<Step>("landing");
  const [tempProfile, setTempProfile] = useState<
    Partial<UserProfile>
  >({});
  const [userType, setUserType] = useState<
    "student" | "parent" | "faculty" | "platform_admin"
  >("student");
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');

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
          setCurrentStep("landing");
          return;
        }

        setIsAuthenticated(true);
        const type = savedUserType as "student" | "parent" | "faculty" | "platform_admin";
        setUserType(type);
        localStorage.setItem("isAuthenticated", "true"); // Ensure it's set if we restored
        localStorage.setItem("userType", type);

        if (type === "parent") {
          setIsParentMode(true);
          // Simple restoration for parents
          if (savedProfile) setUserProfile(JSON.parse(savedProfile));
          if (savedPlan) setStudyPlan(JSON.parse(savedPlan));
          setCurrentStep("dashboard");
          return;
        }

        setIsParentMode(false);
        if (type === "faculty" || type === "platform_admin") {
          console.log(`Restoring ${type} session... skipping profile fetch.`);
          setCurrentStep(type === "platform_admin" ? "admin-dashboard" : "dashboard");
          return;
        }

        // If data is missing but we're authenticated, we need to fetch from backend
        try {
          const { profileAPI, studyPlanAPI, progressAPI } = await import("./services/api");

          console.log("Restoring student session from backend...");
          const profileResponse = await profileAPI.get();

          if (profileResponse.success && profileResponse.data) {
            const rawProfile = profileResponse.data;
            let parsedPsychometric = rawProfile.psychometric_details || rawProfile.psychometricDetails;

            // Safely parse if it's a string
            if (typeof parsedPsychometric === 'string') {
              try { parsedPsychometric = JSON.parse(parsedPsychometric); } catch (e) { }
            }
            if (typeof parsedPsychometric === 'string') {
              try { parsedPsychometric = JSON.parse(parsedPsychometric); } catch (e) { }
            }

            if (parsedPsychometric && parsedPsychometric.category_scores) {
              parsedPsychometric = {
                ...parsedPsychometric,
                categoryScores: {
                  numerical: parsedPsychometric.category_scores.numerical || 0,
                  verbal: parsedPsychometric.category_scores.verbal || 0,
                  logical: parsedPsychometric.category_scores.logical || 0,
                  spatial: parsedPsychometric.category_scores.spatial || 0,
                }
              };
            }

            const profile: UserProfile = {
              ...rawProfile,
              learningSpeed: rawProfile.learning_speed || rawProfile.learningSpeed,
              learningStyle: rawProfile.learning_style || rawProfile.learningStyle,
              studyHoursPerDay: rawProfile.study_duration || rawProfile.studyHoursPerDay,
              totalDays: rawProfile.study_duration || rawProfile.totalDays,
              studentCode: rawProfile.student_code,
              email: rawProfile.email,
              psychometricDetails: parsedPsychometric
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
              // If no profile at all, send to landing
              console.log("No profile found and not a parent/faculty, redirecting to landing");
              setIsAuthenticated(false);
              setCurrentStep("landing");
            }
          }
        } catch (e) {
          console.error("Critical error during session restoration", e);
        }
      } else {
        // No saved auth, ensure we start at landing
        setIsAuthenticated(false);
        setCurrentStep("landing");
      }
    };

    restoreSession();
  }, []);

  const handleLogin = async (
    type: "student" | "parent" | "faculty" | "platform_admin",
    userData: any,
  ) => {
    setIsAuthenticated(true);
    setUserType(type);
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("userType", type);

    // Save token immediately if present
    if (userData?.token) {
      localStorage.setItem("acetrack_token", userData.token);
    }

    // Faculty goes directly to their dashboard
    if (type === "faculty") {
      setCurrentStep("dashboard");
      return;
    }

    // Admin goes directly to admin dashboard
    if (type === "platform_admin") {
      setCurrentStep("admin-dashboard");
      return;
    }

    // Parent also goes to dashboard (parent view)
    if (type === "parent") {
      setIsParentMode(true);
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

          let parsedPsychometric = rawProfile.psychometric_details || rawProfile.psychometricDetails;
          // Safely parse if it's a string
          if (typeof parsedPsychometric === 'string') {
            try { parsedPsychometric = JSON.parse(parsedPsychometric); } catch (e) { }
          }
          if (typeof parsedPsychometric === 'string') {
            try { parsedPsychometric = JSON.parse(parsedPsychometric); } catch (e) { }
          }
          if (parsedPsychometric && parsedPsychometric.category_scores) {
            parsedPsychometric = {
              ...parsedPsychometric,
              categoryScores: {
                numerical: parsedPsychometric.category_scores.numerical || 0,
                verbal: parsedPsychometric.category_scores.verbal || 0,
                logical: parsedPsychometric.category_scores.logical || 0,
                spatial: parsedPsychometric.category_scores.spatial || 0,
              }
            };
          }

          // Map snake_case to camelCase
          const profile: UserProfile = {
            ...rawProfile,
            learningSpeed: rawProfile.learning_speed || rawProfile.learningSpeed,
            learningStyle: rawProfile.learning_style || rawProfile.learningStyle,
            studyHoursPerDay: rawProfile.study_duration || rawProfile.studyHoursPerDay,
            totalDays: rawProfile.study_duration || rawProfile.totalDays,
            studentCode: rawProfile.student_code, // Mapped from backend join
            email: rawProfile.email,
            psychometricDetails: parsedPsychometric
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

              // Fetch fresh plan with DB IDs
              const freshPlanRes = await studyPlanAPI.get();
              if (freshPlanRes.success && freshPlanRes.data) {
                const mappedPlan = mapBackendPlanToFrontend(freshPlanRes.data);
                if (mappedPlan) {
                  setStudyPlan(mappedPlan as any);
                  localStorage.setItem("studyPlan", JSON.stringify(mappedPlan));
                }
              }
            } catch (syncErr) {
              console.error("Failed to sync generated plan to backend", syncErr);
            }
          }

          setIsParentMode(false); // Force student mode
          localStorage.setItem('isParentMode', 'false');

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
    psychometricDetails?: PsychometricDetails,
  ) => {
    setTempProfile((prev) => ({
      ...prev,
      learningSpeed,
      learningStyle,
      psychometricDetails,
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
        subject_difficulties: completeProfile.subjectDifficulties,
        psychometric_details: completeProfile.psychometricDetails
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
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='800' height='800' viewBox='0 0 800 800' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 100c50-20 100-20 150 0s100 20 150 0 100-20 150 0 100 20 150 0 100-20 150 0M0 200c50-20 100-20 150 0s100 20 150 0 100-20 150 0 100 20 150 0 100-20 150 0M0 300c50-20 100-20 150 0s100 20 150 0 100-20 150 0 100 20 150 0 100-20 150 0M0 400c50-20 100-20 150 0s100 20 150 0 100-20 150 0 100 20 150 0 100-20 150 0M0 500c50-20 100-20 150 0s100 20 150 0 100-20 150 0 100 20 150 0 100-20 150 0M0 600c50-20 100-20 150 0s100 20 150 0 100-20 150 0 100 20 150 0 100-20 150 0' stroke='%236366f1' stroke-width='0.5' fill='none' opacity='0.5'/%3E%3Cpath d='M50 150c30 10 60 10 90 0s60-10 90 0 60 10 90 0 60-10 90 0 60 10 90 0 60-10 90 0M50 250c30 10 60 10 90 0s60-10 90 0 60 10 90 0 60-10 90 0 60 10 90 0 60-10 90 0M50 350c30 10 60 10 90 0s60-10 90 0 60 10 90 0 60-10 90 0 60 10 90 0 60-10 90 0M50 450c30 10 60 10 90 0s60-10 90 0 60 10 90 0 60-10 90 0 60 10 90 0 60-10 90 0M50 550c30 10 60 10 90 0s60-10 90 0 60 10 90 0 60-10 90 0 60 10 90 0 60-10 90 0' stroke='%238b5cf6' stroke-width='0.3' fill='none' opacity='0.3'/%3E%3C/svg%3E")`,
          backgroundSize: '1200px 1200px',
        }}
      ></div>
      {currentStep === "landing" && (
        <LandingPage
          onGetStarted={() => {
            setAuthInitialMode('register');
            setCurrentStep("auth");
          }}
          onLogin={() => {
            setAuthInitialMode('login');
            setCurrentStep("auth");
          }}
          onAdminLogin={() => setCurrentStep("admin-login")}
        />
      )}
      {currentStep === "auth" && (
        <AuthPage onLogin={handleLogin} initialMode={authInitialMode} />
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
      {currentStep === "admin-login" && (
        <AdminLogin
          onLogin={async (creds) => {
            try {
              const { authAPI } = await import("./services/api");
              const res = await authAPI.login(creds);
              if (res.success && res.data.is_admin) {
                await handleLogin("platform_admin", res.data);
              } else {
                toast.error("Unauthorized. Admin privileges required.");
              }
            } catch (err) {
              toast.error("Invalid admin credentials.");
            }
          }}
          onBack={() => setCurrentStep("landing")}
        />
      )}
      {currentStep === "admin-dashboard" && (
        <AdminDashboard
          onLogout={() => {
            localStorage.clear();
            setIsAuthenticated(false);
            setCurrentStep("landing");
          }}
        />
      )}
      {currentStep === "dashboard" &&
        (userType === "faculty" ? (
          <FacultyDashboard />
        ) : userType !== "platform_admin" ? (
          <StudyDashboard userType={userType as "student" | "parent"} />
        ) : null)}
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