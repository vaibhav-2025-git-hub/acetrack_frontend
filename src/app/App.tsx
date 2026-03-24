import React from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate
} from "react-router-dom";
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
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { useSession, UserType } from "./hooks/useSession";

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

const AppRoutes: React.FC = () => {
  const navigate = useNavigate();
  const {
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
    setUserType
  } = useSession();

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Get subjects for difficulty assessment
  const getSubjects = () => {
    if (!tempProfile.board || !tempProfile.class || !tempProfile.stream) return [];

    const boardData = curriculumData.find((b) => b.id === tempProfile.board);
    if (!boardData) return [];

    const streamData = boardData.classes[tempProfile.class]?.find((s) => s.id === tempProfile.stream);
    const allSubjects = streamData?.subjects || [];

    if (tempProfile.selectedSubjects && tempProfile.selectedSubjects.length > 0) {
      return allSubjects.filter((subject) => tempProfile.selectedSubjects?.includes(subject.id));
    }

    return allSubjects;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='800' height='800' viewBox='0 0 800 800' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 100c50-20 100-20 150 0s100 20 150 0 100-20 150 0 100 20 150 0 100-20 150 0M0 200c50-20 100-20 150 0s100 20 150 0 100-20 150 0 100 20 150 0 100-20 150 0M0 300c50-20 100-20 150 0s100 20 150 0 100-20 150 0 100 20 150 0 100-20 150 0M0 400c50-20 100-20 150 0s100 20 150 0 100-20 150 0 100 20 150 0 100-20 150 0M0 500c50-20 100-20 150 0s100 20 150 0 100-20 150 0 100 20 150 0 100-20 150 0M0 600c50-20 100-20 150 0s100 20 150 0 100-20 150 0 100 20 150 0 100-20 150 0' stroke='%236366f1' stroke-width='0.5' fill='none' opacity='0.5'/%3E%3Cpath d='M50 150c30 10 60 10 90 0s60-10 90 0 60 10 90 0 60-10 90 0 60 10 90 0 60-10 90 0M50 250c30 10 60 10 90 0s60-10 90 0 60 10 90 0 60-10 90 0 60 10 90 0 60-10 90 0M50 350c30 10 60 10 90 0s60-10 90 0 60 10 90 0 60-10 90 0 60 10 90 0 60-10 90 0M50 450c30 10 60 10 90 0s60-10 90 0 60 10 90 0 60-10 90 0 60 10 90 0 60-10 90 0M50 550c30 10 60 10 90 0s60-10 90 0 60 10 90 0 60-10 90 0 60 10 90 0 60-10 90 0' stroke='%238b5cf6' stroke-width='0.3' fill='none' opacity='0.3'/%3E%3C/svg%3E")`,
          backgroundSize: '1200px 1200px',
        }}
      ></div>

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : (
            <LandingPage
              onGetStarted={() => {
                setAuthInitialMode('register');
                navigate('/auth');
              }}
              onLogin={() => {
                setAuthInitialMode('login');
                navigate('/auth');
              }}
              onAdminLogin={() => navigate('/admin-login')}
            />
          )
        } />

        <Route path="/auth" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : (
            <AuthPage 
              onLogin={async (type, data) => {
                const res = await handleLogin(type, data);
                if (res.success) {
                  if (res.redirect) {
                    navigate('/dashboard');
                  } else if (res.step) {
                    navigate(`/${res.step}`);
                  }
                }
              }} 
              initialMode={authInitialMode} 
            />
          )
        } />

        <Route path="/admin-login" element={
          isAuthenticated && userType === 'platform_admin' ? <Navigate to="/admin-dashboard" replace /> : (
            <AdminLogin
              onLogin={async (creds) => {
                try {
                  const { authAPI } = await import("./services/api");
                  const res = await authAPI.login(creds);
                  if (res.success && res.data.is_admin) {
                    const loginRes = await handleLogin("platform_admin", res.data);
                    if (loginRes.success) navigate('/admin-dashboard');
                  } else {
                    toast.error("Unauthorized. Admin privileges required.");
                  }
                } catch (err) {
                  toast.error("Invalid admin credentials.");
                }
              }}
              onBack={() => navigate('/')}
            />
          )
        } />

        {/* Setup Routes */}
        <Route path="/profile" element={
          !isAuthenticated ? <Navigate to="/auth" replace /> : (
            <ProfileSetup onComplete={(p) => {
              handleProfileComplete(p);
              navigate('/psychometric');
            }} />
          )
        } />

        <Route path="/psychometric" element={
          !isAuthenticated ? <Navigate to="/auth" replace /> : (
            <PsychometricTest
              onComplete={(speed, style, details) => {
                handlePsychometricComplete(speed, style, details);
                navigate('/difficulty');
              }}
            />
          )
        } />

        <Route path="/difficulty" element={
          !isAuthenticated ? <Navigate to="/auth" replace /> : (
            <SubjectDifficulty
              subjects={getSubjects()}
              onComplete={async (diffs) => {
                await handleDifficultyComplete(diffs);
                navigate('/dashboard');
              }}
            />
          )
        } />

        {/* Protected Dashboard Routes */}
        <Route path="/dashboard/*" element={
          !isAuthenticated ? <Navigate to="/auth" replace /> : (
            userType === "faculty" ? (
              <FacultyDashboard onLogout={handleLogout} />
            ) : userType === "platform_admin" ? (
              <Navigate to="/admin-dashboard" replace />
            ) : (
              <StudyDashboard userType={userType as "student" | "parent"} onLogout={handleLogout} />
            )
          )
        } />

        <Route path="/dashboard" element={<Navigate to="/dashboard/schedule" replace />} />

        <Route path="/admin-dashboard" element={
          !isAuthenticated || userType !== "platform_admin" ? <Navigate to="/admin-login" replace /> : (
            <AdminDashboard
              onLogout={() => {
                handleLogout();
                navigate('/');
              }}
            />
          )
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <StudyPlanProvider>
      <ErrorBoundary>
        <AppRoutes />
      </ErrorBoundary>
    </StudyPlanProvider>
  );
};

export default App;