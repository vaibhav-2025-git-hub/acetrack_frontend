import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useStudyPlan } from '../context/StudyPlanContext';
import { Progress } from './ui/progress';
import { TrendingUp, TrendingDown, AlertTriangle, Award, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';

export const ParentDashboard: React.FC = () => {
  const { userProfile, studyPlan } = useStudyPlan();

  // If no student is linked, show the Link Account form
  if (!userProfile) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <Card className="max-w-md w-full border-blue-200 bg-blue-50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center gap-2">
              <Users className="w-6 h-6" />
              Link Your Child's Account
            </CardTitle>
            <div className="text-sm text-blue-700 mt-2">
              Enter your child's unique AceTrack ID (e.g., ACE-123456) to view their progress.
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const studentCode = (e.currentTarget.elements.namedItem('studentCode') as HTMLInputElement).value;
              const relationship = (e.currentTarget.elements.namedItem('relationship') as HTMLSelectElement).value;

              try {
                const { parentAPI } = await import('../services/api');
                const res = await parentAPI.linkStudent({ studentCode, relationship });
                if (res.success) {
                  import('sonner').then(({ toast }) => toast.success("Student linked successfully! Re-loading..."));
                  setTimeout(() => window.location.reload(), 1500);
                }
              } catch (err: any) {
                import('sonner').then(({ toast }) => toast.error(err.message || "Failed to link student"));
              }
            }} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-800">Student's AceTrack ID</label>
                <input
                  name="studentCode"
                  type="text"
                  required
                  placeholder="ACE-XXXXXX"
                  className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-800">Relationship</label>
                <select
                  name="relationship"
                  className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Guardian">Guardian</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-semibold shadow-sm"
              >
                Link Account
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Real data processing
  const activePlan = studyPlan || { dailyPlans: {}, currentStreak: 0, longestStreak: 0 };

  // Calculate overall stats
  const dailyPlansArray = Object.values(activePlan.dailyPlans || {});
  const totalDays = dailyPlansArray.length;

  const completedDays = dailyPlansArray.filter(
    (day: any) => (day.completedHours || 0) >= (day.totalHours || 0) * 0.8
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

  // Average burnout
  const avgBurnout = totalDays > 0 ?
    dailyPlansArray.reduce((sum: number, day: any) => sum + (day.burnoutLevel || 0), 0) /
    totalDays : 0;

  // Recent performance (last 7 days up to today)
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today

  const recentDays = dailyPlansArray
    .filter((day: any) => new Date(day.date) <= today) // Filter out future dates
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7)
    .reverse();

  const performanceData = recentDays.map((day: any) => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    completion: day.totalHours > 0 ? (day.completedHours / day.totalHours) * 100 : 0,
    burnout: day.burnoutLevel || 0,
  }));

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

  // Heatmap Data (Last 90 Days)
  const heatmapData = [];
  const todayDate = new Date();
  for (let i = 89; i >= 0; i--) {
    const d = new Date(todayDate);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    // Find plan for this day
    const dayPlan = dailyPlansArray.find((dp: any) => dp.date === dateStr);
    const hours = dayPlan ? (dayPlan.completedHours || 0) : 0;

    let intensity = 0;
    if (hours > 0) intensity = 1;
    if (hours > 2) intensity = 2;
    if (hours > 4) intensity = 3;
    if (hours > 6) intensity = 4;

    heatmapData.push({ date: dateStr, intensity, hours });
  }

  const getIntensityColor = (intensity: number) => {
    switch (intensity) {
      case 0: return 'bg-gray-100';
      case 1: return 'bg-green-200';
      case 2: return 'bg-green-400';
      case 3: return 'bg-green-600';
      case 4: return 'bg-green-800';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overall Progress</p>
                <p className="text-3xl font-bold mt-1">{completionRate.toFixed(0)}%</p>
              </div>
              <Award className="w-10 h-10 text-blue-500" />
            </div>
            <Progress value={completionRate} className="mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Days Completed</p>
                <p className="text-3xl font-bold mt-1">
                  {completedDays}/{totalDays}
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {totalDays > 0 ? ((completedDays / totalDays) * 100).toFixed(0) : 0}% of planned days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Streak</p>
                <p className="text-3xl font-bold mt-1">{activePlan.currentStreak || 0}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-purple-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Longest: {activePlan.longestStreak || 0} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Burnout</p>
                <p className="text-3xl font-bold mt-1">{avgBurnout.toFixed(0)}%</p>
              </div>
              {avgBurnout > 70 ? (
                <AlertTriangle className="w-10 h-10 text-red-500" />
              ) : (
                <TrendingDown className="w-10 h-10 text-green-500" />
              )}
            </div>
            {avgBurnout > 70 && (
              <p className="text-xs text-red-600 mt-2">High burnout level detected</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Visual Analytics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Heatmap */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Study Consistency (Last 90 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {heatmapData.map((day) => (
                <div
                  key={day.date}
                  className={`w-3 h-3 rounded-sm ${getIntensityColor(day.intensity)}`}
                  title={`${day.date}: ${day.hours.toFixed(1)} hours`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 mt-4 text-xs text-gray-500 justify-end">
              <span>Less</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 bg-gray-100 rounded-sm"></div>
                <div className="w-3 h-3 bg-green-200 rounded-sm"></div>
                <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
                <div className="w-3 h-3 bg-green-600 rounded-sm"></div>
                <div className="w-3 h-3 bg-green-800 rounded-sm"></div>
              </div>
              <span>More</span>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Subject Distribution (Actual Study Time)</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${(value / 60).toFixed(1)} hrs`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-400">
                No study data available yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Performance (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            {performanceData.length > 0 ? (
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="completion"
                  stroke="#10b981"
                  name="Completion %"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="burnout"
                  stroke="#ef4444"
                  name="Burnout %"
                  strokeWidth={2}
                />
              </LineChart>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                No performance data available yet
              </div>
            )}
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900">Student Profile</h4>
            <div className="grid grid-cols-2 gap-3 mt-2 text-sm">
              <div>
                <span className="text-gray-600">Name:</span>
                <span className="ml-2 font-medium">{userProfile.name}</span>
              </div>
              <div>
                <span className="text-gray-600">Class:</span>
                <span className="ml-2 font-medium">{userProfile.class}</span>
              </div>
              <div>
                <span className="text-gray-600">Board:</span>
                <span className="ml-2 font-medium">{userProfile.board?.toUpperCase()}</span>
              </div>
              <div>
                <span className="text-gray-600">ID:</span>
                <span className="ml-2 font-medium text-blue-700">{userProfile.studentCode || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900">Achievements</h4>
            <ul className="mt-2 space-y-1 text-sm">
              <li className="flex items-center gap-2">
                ✓ Completed {completedSessions} study sessions
              </li>
              <li className="flex items-center gap-2">
                ✓ Maintained {activePlan.currentStreak || 0} day streak
              </li>
              <li className="flex items-center gap-2">
                ✓ {completionRate.toFixed(0)}% overall completion rate
              </li>
            </ul>
          </div>

          {avgBurnout > 70 && (
            <div className="p-4 bg-red-50 rounded-lg">
              <h4 className="font-medium text-red-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Recommendations
              </h4>
              <ul className="mt-2 space-y-1 text-sm text-red-800">
                <li>• Consider reducing daily study hours</li>
                <li>• Encourage more breaks and recreational activities</li>
                <li>• Monitor stress levels closely</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
