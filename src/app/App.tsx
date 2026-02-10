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

const AppContent: React.FC = () => {
  const { userProfile, setUserProfile, setStudyPlan } =
    useStudyPlan();
  const [currentStep, setCurrentStep] = useState<Step>("auth");
  const [tempProfile, setTempProfile] = useState<
    Partial<UserProfile>
  >({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<
    "student" | "parent" | "faculty"
  >("student");

  // Check for saved authentication and profile on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem("isAuthenticated");
    const savedUserType = localStorage.getItem("userType");
    const savedProfile = localStorage.getItem("userProfile");
    const savedPlan = localStorage.getItem("studyPlan");

    if (
      savedAuth === "true" &&
      savedUserType &&
      savedProfile &&
      savedPlan
    ) {
      // User has a complete profile - restore and go to dashboard
      setIsAuthenticated(true);
      setUserType(
        savedUserType as "student" | "parent" | "faculty",
      );
      setUserProfile(JSON.parse(savedProfile));
      setStudyPlan(JSON.parse(savedPlan));
      setCurrentStep("dashboard");
      toast.success("Welcome back! 👋");
    }
  }, []);

  const handleLogin = (
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
      setCurrentStep("dashboard");
      return;
    }

    // For students: Check if this is a login (returning user) or registration (new user)
    if (userData.isReturningUser) {
      // Returning user - check if they have a saved profile
      const savedProfile = localStorage.getItem("userProfile");
      const savedPlan = localStorage.getItem("studyPlan");

      if (savedProfile && savedPlan) {
        // User has completed profile setup before - go directly to dashboard
        toast.success(`Welcome back, ${userData.name}! 🎉`);
        setUserProfile(JSON.parse(savedProfile));
        setStudyPlan(JSON.parse(savedPlan));
        setCurrentStep("dashboard");
      } else {
        // User logged in but hasn't completed profile setup
        toast.info(
          "Please complete your profile setup to continue",
        );
        setCurrentStep("profile");
      }
    } else {
      // New registration - go through full profile setup
      // If user data includes profile info (from registration), pre-fill it
      if (userData.class && userData.board && userData.stream) {
        setTempProfile({
          name: userData.name,
          class: userData.class,
          board: userData.board,
          stream: userData.stream,
        });
      }

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

  const handleDifficultyComplete = (
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
    setTimeout(() => {
      try {
        const plan = generateImprovedStudyPlan(completeProfile);
        setStudyPlan(plan);
        toast.dismiss();
        toast.success("Your study plan is ready!");
        setCurrentStep("dashboard");
      } catch (error) {
        toast.error(
          "Failed to generate study plan. Please try again.",
        );
      }
    }, 2000);
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
      <AppContent />
    </StudyPlanProvider>
  );
};

export default App;