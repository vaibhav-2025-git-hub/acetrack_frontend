import React from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { useStudyPlan } from '../context/StudyPlanContext';
import { getMoodInsights, needsBreakDay } from '../utils/moodTracker';
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';

export const MoodInsightsDashboard: React.FC = () => {
  const { studyPlan } = useStudyPlan();

  if (!studyPlan || !studyPlan.moodHistory || studyPlan.moodHistory.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-2">Mood Insights</h3>
        <p className="text-sm text-gray-600">
          Complete some study sessions to see your mood trends and insights.
        </p>
      </Card>
    );
  }

  const insights = getMoodInsights(studyPlan);
  const needsBreak = needsBreakDay(studyPlan);

  const getTrendIcon = () => {
    if (insights.trend === 'improving') return <TrendingUp className="w-5 h-5 text-green-600" />;
    if (insights.trend === 'declining') return <TrendingDown className="w-5 h-5 text-red-600" />;
    return <Minus className="w-5 h-5 text-gray-600" />;
  };

  const getTrendColor = () => {
    if (insights.trend === 'improving') return 'text-green-600';
    if (insights.trend === 'declining') return 'text-red-600';
    return 'text-gray-600';
  };

  const getMoodEmoji = (score: number) => {
    if (score >= 4.5) return '😊';
    if (score >= 3.5) return '🙂';
    if (score >= 2.5) return '😐';
    if (score >= 1.5) return '😔';
    return '😫';
  };

  return (
    <div className="rounded-3xl bg-white/90 backdrop-blur-xl shadow-2xl shadow-purple-500/10 border-2 border-purple-100/50 overflow-hidden">
      <div className="border-b border-purple-100 bg-gradient-to-r from-pink-50 via-purple-50 to-indigo-50 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center shadow-lg">
            <span className="text-2xl">💡</span>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Mood Analytics</h3>
            <p className="text-sm text-slate-600 mt-0.5">Track your emotional well-being</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Overall Mood */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 p-6 shadow-xl shadow-purple-500/30 border-2 border-white/20">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-black/5 rounded-full -ml-10 -mb-10"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-100 font-semibold uppercase tracking-wide">Overall Average</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-5xl">{getMoodEmoji(insights.averageMood)}</span>
                <div>
                  <span className="text-4xl font-bold text-white">{insights.averageMood.toFixed(1)}</span>
                  <span className="text-purple-100 text-xl">/5</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/20 backdrop-blur-sm">
              {getTrendIcon()}
              <span className="text-sm font-semibold text-white">
                {insights.trend === 'improving' ? 'Improving' : insights.trend === 'declining' ? 'Declining' : 'Stable'}
              </span>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="group rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-4 border border-blue-100 hover:shadow-lg hover:shadow-blue-500/10 transition-all">
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <span className="text-white font-bold">{insights.totalSessions}</span>
              </div>
              <p className="text-xs text-slate-600 font-medium">Sessions</p>
            </div>
          </div>
          <div className="group rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 p-4 border border-emerald-100 hover:shadow-lg hover:shadow-emerald-500/10 transition-all">
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <span className="text-white font-bold">{insights.highMoodDays}</span>
              </div>
              <p className="text-xs text-slate-600 font-medium">High Mood</p>
            </div>
          </div>
          <div className="group rounded-xl bg-gradient-to-br from-red-50 to-pink-50 p-4 border border-red-100 hover:shadow-lg hover:shadow-red-500/10 transition-all">
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <span className="text-white font-bold">{insights.lowMoodDays}</span>
              </div>
              <p className="text-xs text-slate-600 font-medium">Low Mood</p>
            </div>
          </div>
        </div>

        {/* Subject-wise Mood */}
        <div>
          <h4 className="font-semibold text-sm text-slate-700 mb-3">Performance by Subject</h4>
          <div className="space-y-2">
            {Object.entries(insights.subjectMoods)
              .sort((a, b) => b[1].avgMood - a[1].avgMood)
              .slice(0, 5)
              .map(([subjectId, data]) => (
                <div key={subjectId} className="group flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-100 hover:shadow-md hover:scale-[1.02] transition-all">
                  <span className="text-sm font-medium text-slate-700">{subjectId}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl group-hover:scale-110 transition-transform">{getMoodEmoji(data.avgMood)}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-lg font-bold text-slate-900">{data.avgMood.toFixed(1)}</span>
                      <span className="text-xs text-slate-400">({data.count})</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Alerts */}
        {needsBreak && (
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-red-500 to-pink-600 p-5 shadow-lg shadow-red-500/20">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-white">Break Day Recommended</h4>
                <p className="text-sm text-red-50 mt-1.5 leading-relaxed">
                  Your mood has been consistently low. Consider taking a break day to recharge and return stronger.
                </p>
              </div>
            </div>
          </div>
        )}

        {insights.trend === 'declining' && !needsBreak && (
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 p-5 shadow-lg shadow-orange-500/20">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-white">Mood Declining</h4>
                <p className="text-sm text-orange-50 mt-1.5 leading-relaxed">
                  We've adapted your upcoming sessions to reduce workload. Take it easy and focus on quality over quantity.
                </p>
              </div>
            </div>
          </div>
        )}

        {insights.trend === 'improving' && (
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-5 shadow-lg shadow-emerald-500/20">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 text-2xl">
                🎉
              </div>
              <div>
                <h4 className="font-bold text-white">Great Progress!</h4>
                <p className="text-sm text-emerald-50 mt-1.5 leading-relaxed">
                  Your mood is improving! Keep up the excellent work and maintain this positive momentum.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};