import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useStudyPlan } from '../context/StudyPlanContext';
import { Progress } from './ui/progress';
import { TrendingUp, TrendingDown, AlertTriangle, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export const ParentDashboard: React.FC = () => {
  const { userProfile, studyPlan } = useStudyPlan();

  if (!userProfile || !studyPlan) return null;

  // Calculate overall stats
  const totalDays = Object.keys(studyPlan.dailyPlans).length;
  const completedDays = Object.values(studyPlan.dailyPlans).filter(
    (day) => day.completedHours >= day.totalHours * 0.8
  ).length;

  const totalSessions = Object.values(studyPlan.dailyPlans).reduce(
    (sum, day) => sum + day.sessions.length,
    0
  );
  const completedSessions = Object.values(studyPlan.dailyPlans).reduce(
    (sum, day) => sum + day.sessions.filter((s) => s.status === 'completed').length,
    0
  );

  const completionRate = (completedSessions / totalSessions) * 100;

  // Average burnout
  const avgBurnout =
    Object.values(studyPlan.dailyPlans).reduce((sum, day) => sum + (day.burnoutLevel || 0), 0) /
    totalDays;

  // Recent performance (last 7 days)
  const recentDays = Object.values(studyPlan.dailyPlans)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7)
    .reverse();

  const performanceData = recentDays.map((day) => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    completion: (day.completedHours / day.totalHours) * 100,
    burnout: day.burnoutLevel || 0,
  }));

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
              {((completedDays / totalDays) * 100).toFixed(0)}% of planned days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Streak</p>
                <p className="text-3xl font-bold mt-1">{studyPlan.currentStreak}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-purple-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Longest: {studyPlan.longestStreak} days
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

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Performance (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
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
                <span className="ml-2 font-medium">{userProfile.board.toUpperCase()}</span>
              </div>
              <div>
                <span className="text-gray-600">Stream:</span>
                <span className="ml-2 font-medium">{userProfile.stream}</span>
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
                ✓ Maintained {studyPlan.currentStreak} day streak
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
