import React, { useMemo } from 'react';
import { Card } from './ui/card';
import { useStudyPlan } from '../context/StudyPlanContext';
import { Tooltip } from './ui/tooltip';

export const PerformanceHeatmap: React.FC = () => {
  const { studyPlan } = useStudyPlan();

  const heatmapData = useMemo(() => {
    if (!studyPlan) return [];

    const data: Array<{
      date: string;
      completionRate: number;
      mood: number;
      hours: number;
      level: number;
    }> = [];

    const sortedDates = Object.keys(studyPlan.dailyPlans).sort();

    sortedDates.forEach((date) => {
      const day = studyPlan.dailyPlans[date];
      const completedSessions = day.sessions.filter((s) => s.status === 'completed').length;
      const totalSessions = day.sessions.length;
      const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

      // Calculate average mood for the day
      const moodScores = day.sessions
        .filter((s) => s.moodScore)
        .map((s) => s.moodScore || 0);
      const avgMood = moodScores.length > 0
        ? moodScores.reduce((a, b) => a + b, 0) / moodScores.length
        : 3;

      // Determine heat level (0-5)
      let level = 0;
      if (completionRate >= 80 && avgMood >= 4) level = 5; // Excellent
      else if (completionRate >= 60 && avgMood >= 3) level = 4; // Good
      else if (completionRate >= 40) level = 3; // Moderate
      else if (completionRate >= 20) level = 2; // Low
      else if (completionRate > 0) level = 1; // Very low
      // else level = 0 (no activity)

      data.push({
        date,
        completionRate,
        mood: avgMood,
        hours: day.completedHours,
        level,
      });
    });

    return data;
  }, [studyPlan]);

  if (!studyPlan || heatmapData.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-500">No data available yet. Start studying to see your heatmap!</p>
      </Card>
    );
  }

  // Group by weeks
  const weeks: Array<typeof heatmapData> = [];
  for (let i = 0; i < heatmapData.length; i += 7) {
    weeks.push(heatmapData.slice(i, i + 7));
  }

  const getColorClass = (level: number): string => {
    switch (level) {
      case 0: return 'bg-gray-100 border-gray-200';
      case 1: return 'bg-red-100 border-red-300';
      case 2: return 'bg-orange-100 border-orange-300';
      case 3: return 'bg-yellow-100 border-yellow-300';
      case 4: return 'bg-green-100 border-green-300';
      case 5: return 'bg-emerald-200 border-emerald-400';
      default: return 'bg-gray-100 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold">Study Activity Heatmap</h3>
            <p className="text-sm text-gray-600">Darker colors indicate better performance</p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-600">Less</span>
            <div className="w-4 h-4 rounded border bg-gray-100 border-gray-200" />
            <div className="w-4 h-4 rounded border bg-red-100 border-red-300" />
            <div className="w-4 h-4 rounded border bg-yellow-100 border-yellow-300" />
            <div className="w-4 h-4 rounded border bg-green-100 border-green-300" />
            <div className="w-4 h-4 rounded border bg-emerald-200 border-emerald-400" />
            <span className="text-gray-600">More</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto">
          <div className="space-y-2">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex gap-2">
                <div className="w-12 text-xs text-gray-500 flex items-center">
                  Week {weekIndex + 1}
                </div>
                <div className="flex gap-2">
                  {week.map((day) => (
                    <HeatmapCell key={day.date} data={day} getColorClass={getColorClass} />
                  ))}
                  {/* Fill remaining days in incomplete weeks */}
                  {week.length < 7 && Array.from({ length: 7 - week.length }).map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="w-12 h-12 rounded border border-dashed border-gray-200"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Monthly Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">Best Day</p>
          <p className="text-2xl font-bold text-green-600">
            {heatmapData.reduce((max, day) =>
              day.completionRate > max.completionRate ? day : max
            , heatmapData[0])?.date && 
              new Date(heatmapData.reduce((max, day) =>
                day.completionRate > max.completionRate ? day : max
              , heatmapData[0]).date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            }
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {Math.round(heatmapData.reduce((max, day) =>
              day.completionRate > max.completionRate ? day : max
            , heatmapData[0]).completionRate)}% completion
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">Avg Completion</p>
          <p className="text-2xl font-bold text-indigo-600">
            {Math.round(
              heatmapData.reduce((sum, day) => sum + day.completionRate, 0) / heatmapData.length
            )}%
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">Total Study Hours</p>
          <p className="text-2xl font-bold text-purple-600">
            {Math.round(heatmapData.reduce((sum, day) => sum + day.hours, 0))}h
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">Avg Daily Mood</p>
          <p className="text-2xl font-bold text-yellow-600">
            {(heatmapData.reduce((sum, day) => sum + day.mood, 0) / heatmapData.length).toFixed(1)}
            /5
          </p>
        </Card>
      </div>

      {/* Subject-wise Performance */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">Subject Performance Trends</h3>
        <SubjectPerformance studyPlan={studyPlan} />
      </Card>
    </div>
  );
};

const HeatmapCell: React.FC<{
  data: {
    date: string;
    completionRate: number;
    mood: number;
    hours: number;
    level: number;
  };
  getColorClass: (level: number) => string;
}> = ({ data, getColorClass }) => {
  const [showTooltip, setShowTooltip] = React.useState(false);

  return (
    <div className="relative">
      <div
        className={`w-12 h-12 rounded border-2 cursor-pointer transition-all hover:scale-110 ${getColorClass(data.level)}`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      />
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-10">
          <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg whitespace-nowrap">
            <p className="font-semibold mb-1">
              {new Date(data.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
            <p>Completion: {Math.round(data.completionRate)}%</p>
            <p>Hours: {data.hours.toFixed(1)}h</p>
            <p>Mood: {data.mood.toFixed(1)}/5</p>
          </div>
        </div>
      )}
    </div>
  );
};

const SubjectPerformance: React.FC<{ studyPlan: any }> = ({ studyPlan }) => {
  const subjectData = useMemo(() => {
    const data: Record<string, { completed: number; total: number; avgMood: number; moodCount: number }> = {};

    Object.values(studyPlan.dailyPlans).forEach((day: any) => {
      day.sessions.forEach((session: any) => {
        if (!data[session.subjectName]) {
          data[session.subjectName] = { completed: 0, total: 0, avgMood: 0, moodCount: 0 };
        }

        data[session.subjectName].total++;
        if (session.status === 'completed') {
          data[session.subjectName].completed++;
          if (session.moodScore) {
            data[session.subjectName].avgMood += session.moodScore;
            data[session.subjectName].moodCount++;
          }
        }
      });
    });

    return Object.entries(data).map(([subject, stats]) => ({
      subject,
      completionRate: (stats.completed / stats.total) * 100,
      avgMood: stats.moodCount > 0 ? stats.avgMood / stats.moodCount : 0,
    }));
  }, [studyPlan]);

  return (
    <div className="space-y-4">
      {subjectData.map(({ subject, completionRate, avgMood }) => (
        <div key={subject}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">{subject}</span>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-600">{Math.round(completionRate)}%</span>
              <span className="text-gray-600">
                {avgMood > 0 ? `${avgMood.toFixed(1)}/5 😊` : 'No data'}
              </span>
            </div>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                completionRate >= 80
                  ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                  : completionRate >= 60
                  ? 'bg-gradient-to-r from-blue-400 to-indigo-500'
                  : completionRate >= 40
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                  : 'bg-gradient-to-r from-red-400 to-rose-500'
              }`}
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
