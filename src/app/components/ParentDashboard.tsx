import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useStudyPlan } from '../context/StudyPlanContext';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';
import { TrendingUp, TrendingDown, AlertTriangle, Award, Users, Clock, Eye, Activity, Sparkles, Star, CheckCircle2, Target, ShieldCheck, ArrowRight, Bell, BookOpen, PieChart as LucidePieChart, UserCircle } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, Legend, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { PsychometricResults } from './PsychometricResults';
import { calculateAceScore } from '../utils/helpers';
import { GlobalAnnouncement } from './GlobalAnnouncement';

export const ParentDashboard: React.FC = () => {
  const { userProfile, studyPlan, setUserProfile, setStudyPlan } = useStudyPlan();
  const [quizHistory, setQuizHistory] = React.useState<any[]>([]);
  const [skippedSessions, setSkippedSessions] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [linkCode, setLinkCode] = React.useState('');
  const [isLinking, setIsLinking] = React.useState(false);

  const fetchChildData = async () => {
    setIsLoading(true);
    try {
      const { parentAPI } = await import('../services/api');
      const res = await parentAPI.getChildData();
      if (res.success) {
        if (res.data.quizHistory) setQuizHistory(res.data.quizHistory);
        if (res.data.skippedSessions) setSkippedSessions(res.data.skippedSessions);

        if (res.data.profile || res.data.basic_info) {
          const rawProfile = res.data.profile || {};
          const basicInfo = res.data.basic_info || {};

          // Handle potential snake_case and double-stringification in psychometricDetails
          let parsedPsychometric = rawProfile.psychometric_details || rawProfile.psychometricDetails;

          // Safely parse if it's a string (fixes double stringification bugs)
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

          // Map the profile data
          const mappedProfile = {
            ...rawProfile,
            name: rawProfile.name || basicInfo.name || "Student",
            email: rawProfile.email || basicInfo.email,
            studentCode: basicInfo.student_code || rawProfile.studentCode,
            class: rawProfile.class || "N/A",
            board: rawProfile.board || "N/A",
            stream: rawProfile.stream || "N/A",
            learningSpeed: rawProfile.learning_speed || rawProfile.learningSpeed,
            learningStyle: rawProfile.learning_style || rawProfile.learningStyle,
            psychometricDetails: parsedPsychometric
          };
          setUserProfile(mappedProfile);
        }

        if (res.data.studyPlan) {
          const { mapBackendPlanToFrontend } = await import('../utils/helpers');
          const mappedPlan = mapBackendPlanToFrontend(res.data.studyPlan);
          setStudyPlan(mappedPlan as any);
        }
        setErrorMsg(null);
      } else {
        setErrorMsg(res.message || "Failed to load student data.");
      }
    } catch (error) {
      console.error("Failed to fetch child extra data", error);
      setErrorMsg("Failed to load student data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkCode.trim()) {
      toast.error("Please enter an AceTrack ID");
      return;
    }

    setIsLinking(true);
    try {
      const { parentAPI } = await import('../services/api');
      const res = await parentAPI.linkStudent({ studentCode: linkCode.trim() });
      if (res.success) {
        toast.success("Student linked successfully! Redirecting...");
        await fetchChildData();
      } else {
        toast.error(res.message || "Linking failed. Check the ID.");
      }
    } catch (err: any) {
      toast.error(err.message || "Connection error. Try again.");
    } finally {
      setIsLinking(false);
    }
  };

  React.useEffect(() => {
    const fetchChildData = async () => {
      try {
        const { parentAPI } = await import('../services/api');
        const res = await parentAPI.getChildData();
        if (res.success) {
          if (res.data.quizHistory) setQuizHistory(res.data.quizHistory);
          if (res.data.skippedSessions) setSkippedSessions(res.data.skippedSessions);

          if (res.data.profile || res.data.basic_info) {
            const rawProfile = res.data.profile || {};
            const basicInfo = res.data.basic_info || {};

            // Handle potential snake_case and double-stringification in psychometricDetails
            let parsedPsychometric = rawProfile.psychometric_details || rawProfile.psychometricDetails;

            // Safely parse if it's a string (fixes double stringification bugs)
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

            // Map the profile data
            const mappedProfile = {
              ...rawProfile,
              name: rawProfile.name || basicInfo.name || "Student",
              email: rawProfile.email || basicInfo.email,
              studentCode: basicInfo.student_code || rawProfile.studentCode,
              class: rawProfile.class || "N/A",
              board: rawProfile.board || "N/A",
              stream: rawProfile.stream || "N/A",
              learningSpeed: rawProfile.learning_speed || rawProfile.learningSpeed,
              learningStyle: rawProfile.learning_style || rawProfile.learningStyle,
              psychometricDetails: parsedPsychometric
            };
            setUserProfile(mappedProfile);
          }

          if (res.data.studyPlan) {
            // Need to map backend plan to frontend if needed, but for ParentDashboard 
            // it mainly uses dailyPlans or days. 
            // The backend returns daily_plans. We should map it to match studyPlan structure.
            import('../utils/helpers').then(({ mapBackendPlanToFrontend }) => {
              const mappedPlan = mapBackendPlanToFrontend(res.data.studyPlan);
              setStudyPlan(mappedPlan as any);
            });
          }
        } else {
          setErrorMsg(res.message || "Failed to load student data.");
        }
      } catch (error) {
        console.error("Failed to fetch child extra data", error);
        setErrorMsg("Failed to load student data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchChildData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
        <GlobalAnnouncement />
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-bold text-blue-900">Loading Student Dashboard...</h2>
      </div>
    );
  }

  // If no student is linked or profile couldn't load, show linking interface
  if (!userProfile || errorMsg) {
    return (
      <div className="min-h-[70vh] flex flex-col relative">
        <GlobalAnnouncement />
        <div className="flex-1 flex items-center justify-center p-6">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none -z-10" />
        
        <Card className="max-w-md w-full border-2 border-white/60 bg-white/80 backdrop-blur-2xl shadow-2xl rounded-[38px] overflow-hidden">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-indigo-500" />
            </div>
            <CardTitle className="text-2xl font-black text-slate-900">Link Your Student</CardTitle>
            <p className="text-slate-500 font-bold text-sm mt-1">Enter your child's unique AceTrack ID</p>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleLink} className="space-y-6">
              <div className="space-y-2">
                <div className="relative">
                  <UserCircle className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                  <Input 
                    placeholder="ACE-XXXX-XXXX" 
                    className="pl-10 h-12 rounded-xl border-slate-200 bg-white shadow-inner"
                    value={linkCode}
                    onChange={(e) => setLinkCode(e.target.value)}
                  />
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                  You can find this on your child's profile page
                </p>
              </div>

              {errorMsg && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <Button 
                type="submit"
                disabled={isLinking}
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-95"
              >
                {isLinking ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                    <span>Linking...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Synchronize Accounts</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        </div>
      </div>
    );
  }

  // Real data processing
  // Depending on how mapBackendPlanToFrontend structures it, it uses `days` array.
  const activePlan = studyPlan || { days: [] };

  // Calculate overall stats from days
  const dailyPlansArray = activePlan.days || [];
  const totalDays = dailyPlansArray.length;

  const completedDays = dailyPlansArray.filter(
    (day: any) => {
      const dayTotal = day.sessions?.length || 0;
      const dayCompleted = day.sessions?.filter((s: any) => s.completed || s.status === 'completed').length || 0;
      return dayTotal > 0 && (dayCompleted / dayTotal) >= 0.8;
    }
  ).length;

  const totalSessions = dailyPlansArray.reduce(
    (sum: number, day: any) => sum + (day.sessions?.length || 0),
    0
  );

  const completedSessions = dailyPlansArray.reduce(
    (sum: number, day: any) => sum + (day.sessions?.filter?.((s: any) => s.status === 'completed' || s.completed).length || 0),
    0
  );

  const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
  // Use calculateAceScore logic instead of simple completion
  const aceScore = calculateAceScore(activePlan);

  // Average burnout (if available, otherwise 0)
  const avgBurnout = 0;

  // Recent performance (last 7 days up to today)
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today

  const recentDays = dailyPlansArray
    .filter((day: any) => new Date(day.date) <= today) // Filter out future dates
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7)
    .reverse();

  const performanceData = recentDays.map((day: any) => {
    const dayTotal = day.sessions?.length || 0;
    const dayCompleted = day.sessions?.filter((s: any) => s.completed || s.status === 'completed').length || 0;
    return {
      date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      completion: dayTotal > 0 ? (dayCompleted / dayTotal) * 100 : 0,
      burnout: 0,
    };
  });

  // Subject Distribution Data (Pie Chart)
  const subjectStats: Record<string, number> = {};
  dailyPlansArray.forEach((day: any) => {
    (day.sessions || []).forEach((session: any) => {
      // Count completed or planned sessions? Usually completed shows actual effort.
      if (session.status === 'completed' || session.completed) {
        const subject = session.subjectName || 'Other';
        subjectStats[subject] = (subjectStats[subject] || 0) + (session.duration || 0);
      }
    });
  });

  const pieData = Object.entries(subjectStats)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // Calculate average session duration
  const totalStudyMinutes = Object.values(subjectStats).reduce((sum, val) => sum + val, 0);
  const avgSessionMinutes = totalSessions > 0 ? Math.round(totalStudyMinutes / totalSessions) : 0;

  // --------------------------------------------------------------------------------
  // NEW ANALYTICS: 2. Subject Weakness Radar (Using quiz history & completion)
  // --------------------------------------------------------------------------------
  const radarStats: Record<string, { totalScore: number, attempts: number, name: string }> = {};
  quizHistory.forEach((attempt: any) => {
    const subject = attempt.subject_name || 'General';
    if (!radarStats[subject]) radarStats[subject] = { totalScore: 0, attempts: 0, name: subject };

    // Calculate percentage score for this attempt
    if (attempt.total_questions > 0) {
      radarStats[subject].totalScore += (attempt.correct_answers / attempt.total_questions) * 100;
      radarStats[subject].attempts += 1;
    }
  });

  // If no quiz history, fallback to showing session completion rates
  let radarData = Object.keys(radarStats).map(subject => ({
    subject,
    accuracy: Math.round(radarStats[subject].totalScore / radarStats[subject].attempts),
    fullMark: 100
  }));

  // Fallback to time data if no quiz data
  if (radarData.length === 0) {
    // Generate from completion
    const fallbackStats: Record<string, { total: number, completed: number }> = {};
    dailyPlansArray.forEach((day: any) => {
      (day.sessions || []).forEach((session: any) => {
        const subject = session.subjectName || 'Other';
        if (!fallbackStats[subject]) fallbackStats[subject] = { total: 0, completed: 0 };
        fallbackStats[subject].total++;
        if (session.status === 'completed' || session.completed) {
          fallbackStats[subject].completed++;
        }
      });
    });

    radarData = Object.keys(fallbackStats).map(subject => ({
      subject,
      accuracy: Math.round((fallbackStats[subject].completed / fallbackStats[subject].total) * 100) || 0,
      fullMark: 100
    }));
  }

  // --------------------------------------------------------------------------------
  // NEW ANALYTICS: 3. Time Planned vs Time Executed (Simple KPI)
  // --------------------------------------------------------------------------------
  let totalPlannedMinutes = 0;
  let totalActualMinutes = 0;

  recentDays.forEach((day: any) => {
    (day.sessions || []).forEach((session: any) => {
      totalPlannedMinutes += (session.duration || 0);
      if (session.status === 'completed' || session.completed) {
        totalActualMinutes += (session.duration || 0);
      }
    });
  });

  const plannedHours = Math.round(totalPlannedMinutes / 60 * 10) / 10;
  const actualHours = Math.round(totalActualMinutes / 60 * 10) / 10;
  const timeCompletionPct = plannedHours > 0 ? Math.min(100, Math.round((actualHours / plannedHours) * 100)) : 0;

  // --------------------------------------------------------------------------------
  // NEW ANALYTICS: 5. Exam Readiness Gauge (Simple SVG realization)
  // --------------------------------------------------------------------------------
  // Weighting: 60% completion rate + 40% quiz accuracy
  const avgAccuracy = radarData.length > 0
    ? radarData.reduce((sum, d) => sum + d.accuracy, 0) / radarData.length
    : completionRate; // fallback

  let readinessScore = Math.round((completionRate * 0.6) + (avgAccuracy * 0.4));
  if (isNaN(readinessScore)) readinessScore = 0;

  // Calculate stroke dasharray for the gauge (semi-circle)
  const gaugeCircumference = Math.PI * 100; // r=100
  const dashOffset = gaugeCircumference - (readinessScore / 100) * gaugeCircumference;

  let gaugeColor = '#ef4444'; // Red < 40
  if (readinessScore >= 40 && readinessScore < 75) gaugeColor = '#eab308'; // Yellow 40-75
  if (readinessScore >= 75) gaugeColor = '#22c55e'; // Green > 75



  return (
    <div className="relative space-y-10 pb-12">
      <GlobalAnnouncement />
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-1/2 left-0 w-[400px] h-[400px] bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/3 blur-[150px] rounded-full pointer-events-none -z-10" />

      {/* guardian Eye - Hero Section */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-[40px] opacity-10 blur-2xl group-hover:opacity-20 transition duration-700"></div>
        <div className="relative bg-white/70 backdrop-blur-3xl border-2 border-white/60 rounded-[38px] p-8 md:p-10 shadow-2xl overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-3xl -mr-32 -mt-32"></div>

          <div className="flex flex-col lg:flex-row gap-10 items-center relative z-10">
            {/* The "Eye" - Progress Ring */}
            <div className="relative w-56 h-56 flex-shrink-0">
              {/* Outer Glow Ring */}
              <div className="absolute inset-0 rounded-full border-4 border-slate-100/50"></div>
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="112" cy="112" r="100"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="12"
                  className="text-slate-100"
                />
                <circle
                  cx="112" cy="112" r="100"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="12"
                  strokeDasharray={628}
                  strokeDashoffset={628 - (628 * (aceScore / 100))}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out text-pink-500"
                  style={{ filter: 'drop-shadow(0 0 8px currentColor)' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-slate-900">{aceScore}</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Ace Score</span>
              </div>
            </div>

            {/* Student Pulse Info */}
            <div className="flex-1 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-emerald-500 w-2 h-2 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Student Pulse: Active</span>
                  </div>
                  <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                    {userProfile.name}<span className="text-indigo-600">.</span>
                  </h1>
                  <p className="text-slate-500 font-bold mt-1">Class {userProfile.class} • {userProfile.stream || 'Standard'}</p>
                </div>
                <div className="flex gap-2">
                  <div className="bg-white/50 backdrop-blur px-4 py-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2">
                    <Target className="w-4 h-4 text-indigo-500" />
                    <span className="text-xs font-black text-slate-700">{completedSessions}/{totalSessions} <span className="text-slate-400 font-bold">Sessions</span></span>
                  </div>
                </div>
              </div>

              {/* Weekly Momentum Mini Chart */}
              <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Weekly Momentum</h4>
                  <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs">
                    <TrendingUp className="w-3 h-3" />
                    <span>+12% vs last week</span>
                  </div>
                </div>
                <div className="h-20 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceData}>
                      <defs>
                        <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="completion" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorPerf)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Subject Insights */}
        <Card className="rounded-[32px] border-2 border-white/60 bg-white/80 backdrop-blur-2xl shadow-xl overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
                  <LucidePieChart className="w-6 h-6 text-blue-500" />
                </div>
                <CardTitle className="text-lg font-black text-slate-800">Subject Distribution</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={90}
                      fill="#8884d8" paddingAngle={8} dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                      formatter={(value: number) => `${(value / 60).toFixed(1)} hrs`}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center text-slate-400">
                <Activity className="w-12 h-12 mb-4 opacity-20" />
                <p className="font-bold">No study activity yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Trends */}
        <Card className="rounded-[32px] border-2 border-white/60 bg-white/80 backdrop-blur-2xl shadow-xl overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center">
                <Activity className="w-6 h-6 text-emerald-500" />
              </div>
              <CardTitle className="text-lg font-black text-slate-800">Performance Trends</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="completion" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorComp)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Time Management Tile */}
        <Card className="lg:col-span-3 rounded-[32px] border-2 border-white/60 bg-white/80 backdrop-blur-2xl shadow-xl overflow-hidden flex flex-col justify-center p-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-16 h-16 rounded-3xl bg-indigo-500 flex items-center justify-center shadow-xl shadow-indigo-200">
              <Clock className="w-10 h-10 text-white" />
            </div>
            <div>
              <h4 className="text-3xl font-black text-slate-900">{actualHours} hrs</h4>
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Time Executed</p>
            </div>
          </div>
          <div className="space-y-4 max-w-2xl">
            <div className="flex justify-between items-end">
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Schedule Adherence</span>
              <span className="text-2xl font-black text-indigo-600">{timeCompletionPct}%</span>
            </div>
            <div className="h-5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-1000"
                style={{ width: `${timeCompletionPct}%` }}
              />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Targeted: {plannedHours} hrs this week</p>
          </div>
        </Card>
      </div>

      {/* Advanced Insights & History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Award className="w-6 h-6 text-indigo-500" />
              Quiz Performance
            </h3>
            <button className="text-xs font-black text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group">
              Full History <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
          <div className="bg-white/50 backdrop-blur-xl border-2 border-white/60 rounded-[32px] overflow-hidden shadow-xl">
            {quizHistory.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {quizHistory.slice(0, 4).map((attempt: any, i) => (
                  <div key={i} className="p-5 hover:bg-white transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg transition-transform group-hover:scale-110 ${Number(attempt.correct_answers / attempt.total_questions) >= 0.8 ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'
                        }`}>
                        {attempt.subject_name ? attempt.subject_name.charAt(0) : 'Q'}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800">{attempt.quiz_title || 'General Quiz'}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(attempt.attempt_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-slate-900">{Math.round((attempt.correct_answers / attempt.total_questions) * 100)}%</p>
                      <p className="text-[10px] font-black text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">ACCURACY</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 font-bold">No quizzes attempted yet</div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-rose-500" />
              Focus Disruptions
            </h3>
          </div>
          <div className="bg-white/50 backdrop-blur-xl border-2 border-white/60 rounded-[32px] overflow-hidden shadow-xl">
            {skippedSessions.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {skippedSessions.slice(0, 4).map((session: any, i) => (
                  <div key={i} className="p-5 flex items-center justify-between transition-colors hover:bg-white">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center">
                        <TrendingDown className="w-6 h-6 text-rose-500" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800">{session.topic_name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{session.subject_name} • {new Date(session.original_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest">
                      Skipped
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <p className="font-black text-emerald-600">Pure Focus! No skipped sessions.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xl font-black text-slate-900 tracking-tight px-2">Learning Anatomy</h3>
        <div className="bg-white/70 backdrop-blur-3xl border-2 border-white/60 rounded-[38px] p-8 shadow-2xl">
          <PsychometricResults profile={userProfile} />
        </div>
      </div>

    </div>
  );
};
