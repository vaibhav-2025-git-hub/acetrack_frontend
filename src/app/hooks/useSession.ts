import { useState, useEffect } from "react";
import { useStudyPlan } from "../context/StudyPlanContext";
import { 
  UserProfile, 
  LearningSpeed, 
  Difficulty, 
  PsychometricDetails 
} from "../types";
import { generateImprovedStudyPlan } from "../utils/improvedPlanGenerator";
import { toISODate, mapBackendPlanToFrontend } from "../utils/helpers";
import { toast } from "sonner";

export type UserType = "student" | "parent" | "faculty" | "platform_admin";

export const useSession = () => {
  const {
    userProfile, setUserProfile,
    setStudyPlan, setProgressData,
    isAuthenticated, setIsAuthenticated,
    setIsParentMode
  } = useStudyPlan();

  const [userType, setUserType] = useState<UserType>(() => {
    return (localStorage.getItem("userType") as UserType) || "student";
  });
  const [tempProfile, setTempProfile] = useState<Partial<UserProfile>>(() => {
    try {
      const saved = localStorage.getItem("acetrack_tempProfile");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');
  const [isInitializing, setIsInitializing] = useState(true);

  // Sync tempProfile to localStorage to prevent data loss on page refresh mid-setup
  useEffect(() => {
    if (Object.keys(tempProfile).length > 0) {
      localStorage.setItem("acetrack_tempProfile", JSON.stringify(tempProfile));
    } else {
      localStorage.removeItem("acetrack_tempProfile");
    }
  }, [tempProfile]);
  // Check for saved authentication and profile on mount
  useEffect(() => {
    const restoreSession = async () => {
      console.log("[DEBUG] restoreSession started");
      const savedAuth = localStorage.getItem("isAuthenticated");
      const savedUserType = localStorage.getItem("userType");
      const savedProfile = localStorage.getItem("userProfile");
      const savedPlan = localStorage.getItem("studyPlan");

      if (savedAuth === "true" && savedUserType) {
        // Verify token first
        try {
          const { authAPI } = await import("../services/api");
          const token = localStorage.getItem("acetrack_token");

          if (!token) throw new Error("No token found");

          const verifyRes = await authAPI.verifyToken(token).catch((err) => {
            console.error("Token verification HTTP error:", err);
            return { success: false, status: err.status || 500 };
          });

          if (!verifyRes.success) {
            console.warn("Token verification failed with status:", verifyRes.status);
            // Only clear storage and redirect if it's explicitly an unauthorized error (401)
            // If it's a 500 or network error, we might want to keep the session and try again
            if (verifyRes.status === 401) {
              console.warn("Explicit 401 Unauthorized, clearing session");
              localStorage.removeItem("isAuthenticated");
              localStorage.removeItem("acetrack_token");
              setIsAuthenticated(false);
            }
            setIsInitializing(false);
            return;
          }
        } catch (e) {
          console.error("Session verification error", e);
          // Do not clear everything on error. Only clear if we are sure the session is invalid.
          // For unknown errors, we let the user stay in their current state and hope for the best on next action.
          setIsInitializing(false);
          return;
        }

        setIsAuthenticated(true);
        const type = savedUserType as UserType;
        setUserType(type);
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userType", type);

        if (type === "parent") {
          setIsParentMode(true);
          if (savedProfile) setUserProfile(JSON.parse(savedProfile));
          if (savedPlan) setStudyPlan(JSON.parse(savedPlan));
          setIsInitializing(false);
          return;
        }

        setIsParentMode(false);
        if (type === "faculty" || type === "platform_admin") {
          setIsInitializing(false);
          return;
        }

        // If data is missing but we're authenticated, we need to fetch from backend
        try {
          const { profileAPI, studyPlanAPI, progressAPI } = await import("../services/api");

          console.log("Restoring student session from backend...");
          let profileResponse;
          let retryCount = 0;
          const maxRetries = 1;

          const fetchProfile = async () => {
            try {
              return await profileAPI.get();
            } catch (e: any) {
              console.warn(`Profile fetch attempt failed:`, e.message);
              return { success: false, status: e.status || 500 };
            }
          };

          profileResponse = await fetchProfile();

          // Simple retry for transient network errors (non-401)
          if (!profileResponse.success && profileResponse.status !== 401 && retryCount < maxRetries) {
            retryCount++;
            console.log(`Retrying profile fetch (attempt ${retryCount})...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            profileResponse = await fetchProfile();
          }

          if (profileResponse.success && profileResponse.data) {
            const rawProfile = profileResponse.data;
            // ... (rest of the mapping code remains the same)
            let parsedPsychometric = rawProfile.psychometric_details || rawProfile.psychometricDetails;

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
              psychometricDetails: parsedPsychometric,
              startDate: rawProfile.start_date || rawProfile.startDate || new Date().toISOString().split('T')[0]
            };
            setUserProfile(profile);
            localStorage.setItem("userProfile", JSON.stringify(profile));

            const [planRes, progRes] = await Promise.all([
              studyPlanAPI.get().catch(e => ({ success: false, status: e.status || 500 })),
              progressAPI.get().catch(e => ({ success: false, status: e.status || 500 }))
            ]);

            if (planRes.success && planRes.data) {
              const mappedPlan = mapBackendPlanToFrontend(planRes.data);
              setStudyPlan(mappedPlan as any);
              localStorage.setItem("studyPlan", JSON.stringify(mappedPlan));
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
          } else if (profileResponse.status === 401) {
             console.warn("Unauthorized profile fetch, clearing session");
             localStorage.removeItem("isAuthenticated");
             localStorage.removeItem("acetrack_token");
             setIsAuthenticated(false);
          } else if (savedProfile) {
            console.log("Using cached profile due to fetch failure (non-401)");
            setUserProfile(JSON.parse(savedProfile));
            if (savedPlan) setStudyPlan(JSON.parse(savedPlan));
          }
        } catch (e) {
          console.error("Critical error during session restoration", e);
        }
      } else {
        setIsAuthenticated(false);
      }
      setIsInitializing(false);
    };

    restoreSession();
  }, [setIsAuthenticated, setIsParentMode, setProgressData, setStudyPlan, setUserProfile]);

  const handleLogin = async (type: UserType, userData: any) => {
    setIsAuthenticated(true);
    setUserType(type);
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("userType", type);

    if (userData?.token) {
      localStorage.setItem("acetrack_token", userData.token);
    }

    if (type === "faculty" || type === "platform_admin") {
      return { success: true, redirect: true };
    }

    if (type === "parent") {
      setIsParentMode(true);
      return { success: true, redirect: true };
    }

    setIsParentMode(false);
    const hasProfile = userData.has_profile ?? (userData.isReturningUser && localStorage.getItem("userProfile"));

    if (hasProfile) {
      try {
        const { profileAPI, studyPlanAPI, progressAPI } = await import("../services/api");
        const profileResponse = await profileAPI.get();

        if (profileResponse.success && profileResponse.data) {
          const rawProfile = profileResponse.data;
          let parsedPsychometric = rawProfile.psychometric_details || rawProfile.psychometricDetails;
          
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
            psychometricDetails: parsedPsychometric,
            startDate: rawProfile.start_date || rawProfile.startDate || new Date().toISOString().split('T')[0]
          };

          setUserProfile(profile);
          localStorage.setItem("userProfile", JSON.stringify(profile));

          const [planRes, progRes] = await Promise.all([
            studyPlanAPI.get().catch(() => ({ success: false })),
            progressAPI.get().catch(() => ({ success: true, data: [] }))
          ]);

          if (planRes.success && planRes.data) {
            const mappedPlan = mapBackendPlanToFrontend(planRes.data);
            setStudyPlan(mappedPlan as any);
            localStorage.setItem("studyPlan", JSON.stringify(mappedPlan));
          } else {
            toast.info("Generating your study plan...");
            const generatedPlan = generateImprovedStudyPlan(profile);
            setStudyPlan(generatedPlan);
            localStorage.setItem("studyPlan", JSON.stringify(generatedPlan));

            try {
              const planPayload = {
                start_date: toISODate(profile.startDate || new Date()),
                end_date: toISODate(new Date(Date.now() + (profile.totalDays || 30) * 24 * 60 * 60 * 1000)),
                total_days: profile.totalDays || 30,
                subjects: profile.selectedSubjects || [],
                days: generatedPlan.days
              };
              await studyPlanAPI.create(planPayload);
              
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
          
          toast.success(`Welcome back, ${userData.name || profile.name}! 🎉`);
          return { success: true, redirect: true };
        }
      } catch (error) {
        console.error("Failed to fetch profile on login", error);
      }
    }

    if (!hasProfile) {
      if (userData.class && userData.board && userData.stream) {
        setTempProfile({
          name: userData.name,
          class: userData.class,
          board: userData.board,
          stream: userData.stream,
        });
      }
      return { success: true, redirect: false, step: 'profile' };
    }
    
    return { success: true, redirect: true };
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setUserProfile(null);
    setStudyPlan(null);
    setProgressData({});
    toast.success("Logged out successfully");
  };

  const handleProfileComplete = (profile: Omit<UserProfile, "learningSpeed" | "subjectDifficulties">) => {
    setTempProfile(profile);
  };

  const handlePsychometricComplete = (learningSpeed: LearningSpeed, learningStyle: string, psychometricDetails?: PsychometricDetails) => {
    setTempProfile((prev) => ({ ...prev, learningSpeed, learningStyle, psychometricDetails }));
  };

  const handleDifficultyComplete = async (subjectDifficulties: Record<string, Difficulty>) => {
    const completeProfile: UserProfile = { ...tempProfile, learningSpeed: tempProfile.learningSpeed!, subjectDifficulties } as UserProfile;
    setUserProfile(completeProfile);
    toast.loading("Generating your personalized study plan...");

    try {
      const plan = generateImprovedStudyPlan(completeProfile);
      setStudyPlan(plan);
      localStorage.setItem("userProfile", JSON.stringify(completeProfile));
      localStorage.setItem("studyPlan", JSON.stringify(plan));

      const { profileAPI, studyPlanAPI } = await import("../services/api");
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
        psychometric_details: completeProfile.psychometricDetails,
        start_date: toISODate(completeProfile.startDate)
      };

      await profileAPI.create(profilePayload);
      const planPayload = {
        start_date: toISODate(completeProfile.startDate),
        end_date: toISODate(new Date(new Date(completeProfile.startDate).getTime() + completeProfile.totalDays * 24 * 60 * 60 * 1000)),
        total_days: completeProfile.totalDays,
        subjects: completeProfile.selectedSubjects,
        days: plan.days
      };

      await studyPlanAPI.create(planPayload);
      
      setTempProfile({}); // Clear temp profile on success
      
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
    } catch (error) {
      console.error("Failed to generate or save profile/plan", error);
      toast.dismiss();
      toast.error("Warning: Could not save progress to server. Local backup created.");
    }
  };

  return {
    userProfile,
    userType,
    tempProfile,
    authInitialMode,
    isInitializing,
    isAuthenticated,
    setAuthInitialMode,
    handleLogin,
    handleLogout,
    handleProfileComplete,
    handlePsychometricComplete,
    handleDifficultyComplete,
    setTempProfile,
    setUserType
  };
};
