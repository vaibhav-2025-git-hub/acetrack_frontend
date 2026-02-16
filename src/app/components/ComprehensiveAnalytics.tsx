import React from 'react';
import { useStudyPlan } from '../context/StudyPlanContext';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Clock, CheckCircle2, Target, Award, Zap, BookOpen, Calendar } from 'lucide-react';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#f97316'];

export const ComprehensiveAnalytics: React.FC = () => {
  const { studyPlan, userProfile } = useStudyPlan();

  if (!studyPlan || !userProfile) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>Loading analytics...</p>
      </div>
    );
  }

  // Get days data from both possible sources
  const daysData = studyPlan.days && studyPlan.days.length > 0
    ? studyPlan.days
    : studyPlan.dailyPlans
      ? Object.values(studyPlan.dailyPlans).map(day => ({
        date: day.date,
        sessions: day.sessions.map(s => ({
          id: s.id,
          topicId: s.topicId,
          topicName: s.topicName,
          chapterId: s.chapterId,
          chapterName: s.chapterName || s.chapterId,
          subjectId: s.subjectId,
          subjectName: s.subjectName || s.subjectId,
          duration: s.duration,
          completed: s.completed || s.status === 'completed'
        }))
      }))
      : [];

  if (daysData.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>No study data available yet. Complete some sessions to see analytics!</p>
      </div>
    );
  }

  // Calculate comprehensive statistics
  const calculateStats = () => {
    const subjectStats = new Map<string, {
      name: string;
      total: number;
      completed: number;
      totalMinutes: number;
      completedMinutes: number;
      topics: Set<string>;
    }>();

    let totalSessions = 0;
    let completedSessions = 0;
    let totalMinutes = 0;
    let completedMinutes = 0;
    const dailyProgress: { date: string; completed: number; total: number; percentage: number }[] = [];
    const weeklyData: { week: string; sessions: number; hours: number }[] = [];

    daysData.forEach((day, index) => {
      let dayCompleted = 0;
      let dayTotal = day.sessions.length;

      day.sessions.forEach(session => {
        totalSessions++;
        totalMinutes += session.duration;

        // Track subject stats
        const subjectKey = session.subjectId;
        if (!subjectStats.has(subjectKey)) {
          subjectStats.set(subjectKey, {
            name: session.subjectName || session.subjectId,
            total: 0,
            completed: 0,
            totalMinutes: 0,
            completedMinutes: 0,
            topics: new Set()
          });
        }
        const subjectData = subjectStats.get(subjectKey)!;
        subjectData.total++;
        subjectData.totalMinutes += session.duration;
        if (session.topicId) {
          subjectData.topics.add(session.topicId);
        }

        if (session.completed) {
          completedSessions++;
          completedMinutes += session.duration;
          dayCompleted++;
          subjectData.completed++;
          subjectData.completedMinutes += session.duration;
        }
      });

      dailyProgress.push({
        date: day.date,
        completed: dayCompleted,
        total: dayTotal,
        percentage: dayTotal > 0 ? Math.round((dayCompleted / dayTotal) * 100) : 0
      });

      // Calculate weekly data
      const weekNum = Math.floor(index / 7);
      if (!weeklyData[weekNum]) {
        weeklyData[weekNum] = { week: `Week ${weekNum + 1}`, sessions: 0, hours: 0 };
      }
      weeklyData[weekNum].sessions += dayCompleted;
      weeklyData[weekNum].hours += Math.round((day.sessions.filter(s => s.completed).reduce((sum, s) => sum + s.duration, 0)) / 60 * 10) / 10;
    });

    const subjects = Array.from(subjectStats.entries()).map(([id, stats]) => ({
      id,
      name: stats.name,
      progress: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
      completed: stats.completed,
      total: stats.total,
      hours: Math.round(stats.completedMinutes / 60 * 10) / 10,
      totalHours: Math.round(stats.totalMinutes / 60 * 10) / 10,
      topicsCount: stats.topics.size
    })).sort((a, b) => b.progress - a.progress);

    return {
      totalSessions,
      completedSessions,
      totalHours: Math.round(totalMinutes / 60 * 10) / 10,
      completedHours: Math.round(completedMinutes / 60 * 10) / 10,
      overallProgress: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0,
      avgSessionDuration: totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0,
      subjects,
      dailyProgress: dailyProgress.slice(-14), // Last 14 days
      weeklyData: weeklyData.filter(w => w.sessions > 0).slice(0, 8),
      daysActive: dailyProgress.filter(d => d.completed > 0).length,
      currentStreak: calculateStreak()
    };
  };

  const calculateStreak = () => {
    let streak = 0;
    for (let i = daysData.length - 1; i >= 0; i--) {
      const day = daysData[i];
      const dayDate = new Date(day.date);
      if (dayDate > new Date()) break;
      if (day.sessions.some(s => s.completed)) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const stats = calculateStats();

  // Calculate trends
  const recentWeeks = stats.weeklyData.slice(-2);
  const weeklyTrend = recentWeeks.length === 2
    ? recentWeeks[1].sessions > recentWeeks[0].sessions
      ? 'up'
      : recentWeeks[1].sessions < recentWeeks[0].sessions
        ? 'down'
        : 'stable'
    : 'stable';

  return (
    <div className="space-y-8">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Overall Progress */}
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 rounded-2xl opacity-75 group-hover:opacity-100 blur transition duration-300"></div>
          <div className="relative bg-white rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              {weeklyTrend === 'up' && <TrendingUp className="w-5 h-5 text-green-500" />}
              {weeklyTrend === 'down' && <TrendingDown className="w-5 h-5 text-red-500" />}
            </div>
            <p className="text-3xl font-black text-slate-900">{stats.overallProgress}%</p>
            <p className="text-sm text-slate-600 font-semibold mt-1">Overall Progress</p>
            <p className="text-xs text-slate-500 mt-2">{stats.completedSessions} / {stats.totalSessions} sessions</p>
          </div>
        </div>

        {/* Study Hours */}
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 via-cyan-500 to-teal-500 rounded-2xl opacity-75 group-hover:opacity-100 blur transition duration-300"></div>
          <div className="relative bg-white rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900">{stats.completedHours}h</p>
            <p className="text-sm text-slate-600 font-semibold mt-1">Study Time</p>
            <p className="text-xs text-slate-500 mt-2">Of {stats.totalHours}h Total Planned</p>
          </div>
        </div>

        {/* Current Streak */}
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-500 rounded-2xl opacity-75 group-hover:opacity-100 blur transition duration-300"></div>
          <div className="relative bg-white rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900">{stats.currentStreak}</p>
            <p className="text-sm text-slate-600 font-semibold mt-1">Day Streak</p>
            <p className="text-xs text-slate-500 mt-2">Keep it going! 🔥</p>
          </div>
        </div>

        {/* Days Active */}
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-400 via-teal-500 to-green-500 rounded-2xl opacity-75 group-hover:opacity-100 blur transition duration-300"></div>
          <div className="relative bg-white rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900">{stats.daysActive}</p>
            <p className="text-sm text-slate-600 font-semibold mt-1">Active Days</p>
            <p className="text-xs text-slate-500 mt-2">Of {daysData.length} Total Days</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Daily Progress Trend */}
        <div className="group relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 rounded-[32px] opacity-20 blur-xl group-hover:opacity-30 transition duration-500"></div>
          <div className="relative rounded-[30px] bg-white/95 backdrop-blur-2xl shadow-2xl border-2 border-white/60 overflow-hidden">
            <div className="border-b-2 bg-gradient-to-r from-indigo-50/80 via-purple-50/80 to-pink-50/80 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Daily Progress</h3>
                  <p className="text-xs text-slate-600">Last 14 days completion rate</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={stats.dailyProgress}>
                  <defs>
                    <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).getDate().toString()}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '2px solid #8b5cf6',
                      borderRadius: '12px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="percentage"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorProgress)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Weekly Sessions */}
        <div className="group relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 via-cyan-500 to-teal-500 rounded-[32px] opacity-20 blur-xl group-hover:opacity-30 transition duration-500"></div>
          <div className="relative rounded-[30px] bg-white/95 backdrop-blur-2xl shadow-2xl border-2 border-white/60 overflow-hidden">
            <div className="border-b-2 bg-gradient-to-r from-blue-50/80 via-cyan-50/80 to-teal-50/80 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Weekly Activity</h3>
                  <p className="text-xs text-slate-600">Sessions completed per week</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stats.weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '2px solid #06b6d4',
                      borderRadius: '12px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Bar dataKey="sessions" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Subject Distribution */}
        <div className="group relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-rose-400 via-pink-500 to-fuchsia-500 rounded-[32px] opacity-20 blur-xl group-hover:opacity-30 transition duration-500"></div>
          <div className="relative rounded-[30px] bg-white/95 backdrop-blur-2xl shadow-2xl border-2 border-white/60 overflow-hidden">
            <div className="border-b-2 bg-gradient-to-r from-rose-50/80 via-pink-50/80 to-fuchsia-50/80 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Subject Distribution</h3>
                  <p className="text-xs text-slate-600">Time spent per subject</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={stats.subjects}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="hours"
                  >
                    {stats.subjects.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '2px solid #ec4899',
                      borderRadius: '12px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Subject Performance Table */}
        <div className="group relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-green-500 rounded-[32px] opacity-20 blur-xl group-hover:opacity-30 transition duration-500"></div>
          <div className="relative rounded-[30px] bg-white/95 backdrop-blur-2xl shadow-2xl border-2 border-white/60 overflow-hidden">
            <div className="border-b-2 bg-gradient-to-r from-emerald-50/80 via-teal-50/80 to-green-50/80 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Subject Performance</h3>
                  <p className="text-xs text-slate-600">Completion rates by subject</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4 max-h-[250px] overflow-y-auto">
                {stats.subjects.map((subject, idx) => (
                  <div key={subject.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                        ></div>
                        <span className="text-sm font-bold text-slate-700">{subject.name}</span>
                      </div>
                      <span className="text-sm font-black text-slate-900">{subject.progress}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-500"
                        style={{
                          width: `${subject.progress}%`,
                          backgroundColor: COLORS[idx % COLORS.length]
                        }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{subject.completed}/{subject.total} sessions</span>
                      <span>{subject.hours}h completed</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Study Insights */}
      <div className="group relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-violet-400 via-purple-500 to-fuchsia-500 rounded-[32px] opacity-20 blur-xl group-hover:opacity-30 transition duration-500"></div>
        <div className="relative rounded-[30px] bg-white/95 backdrop-blur-2xl shadow-2xl border-2 border-white/60 overflow-hidden">
          <div className="border-b-2 bg-gradient-to-r from-violet-50/80 via-purple-50/80 to-fuchsia-50/80 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Study Insights</h3>
                <p className="text-xs text-slate-600">Key performance indicators</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                <p className="text-xs text-slate-600 font-semibold mb-1">Avg Session Duration</p>
                <p className="text-2xl font-black text-indigo-700">{stats.avgSessionDuration} min</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                <p className="text-xs text-slate-600 font-semibold mb-1">Best Subject</p>
                <p className="text-2xl font-black text-blue-700">{stats.subjects[0]?.name || 'N/A'}</p>
                <p className="text-xs text-slate-500 mt-1">{stats.subjects[0]?.progress || 0}% complete</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                <p className="text-xs text-slate-600 font-semibold mb-1">Total Topics</p>
                <p className="text-2xl font-black text-emerald-700">
                  {stats.subjects.reduce((sum, s) => sum + s.topicsCount, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};