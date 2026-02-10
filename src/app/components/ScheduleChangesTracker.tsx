import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Calendar, 
  TrendingUp,
  Shuffle,
  ZapOff,
  Activity,
  ArrowRight
} from 'lucide-react';
import { useStudyPlan } from '../context/StudyPlanContext';

interface ScheduleChange {
  id: string;
  timestamp: string;
  type: 'reschedule' | 'adaptation' | 'mood_based' | 'burnout' | 'completion' | 'difficulty_adjustment';
  title: string;
  description: string;
  details?: {
    from?: string;
    to?: string;
    subject?: string;
    reason?: string;
  };
}

export const ScheduleChangesTracker: React.FC = () => {
  const { scheduleChanges = [] } = useStudyPlan();

  const getChangeIcon = (type: string) => {
    switch (type) {
      case 'reschedule':
        return <Calendar className="w-4 h-4" />;
      case 'adaptation':
        return <TrendingUp className="w-4 h-4" />;
      case 'mood_based':
        return <Activity className="w-4 h-4" />;
      case 'burnout':
        return <ZapOff className="w-4 h-4" />;
      case 'completion':
        return <CheckCircle className="w-4 h-4" />;
      case 'difficulty_adjustment':
        return <Shuffle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getChangeColor = (type: string) => {
    switch (type) {
      case 'reschedule':
        return 'from-blue-500 to-cyan-500';
      case 'adaptation':
        return 'from-purple-500 to-pink-500';
      case 'mood_based':
        return 'from-orange-500 to-amber-500';
      case 'burnout':
        return 'from-red-500 to-rose-500';
      case 'completion':
        return 'from-green-500 to-emerald-500';
      case 'difficulty_adjustment':
        return 'from-indigo-500 to-violet-500';
      default:
        return 'from-slate-500 to-gray-500';
    }
  };

  const getBadgeVariant = (type: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (type) {
      case 'burnout':
        return 'destructive';
      case 'completion':
        return 'default';
      case 'mood_based':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Show latest 10 changes
  const recentChanges = [...scheduleChanges].reverse().slice(0, 10);

  if (scheduleChanges.length === 0) {
    return (
      <Card className="bg-white/95 backdrop-blur-sm border-2 border-white/60 shadow-xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
              <Clock className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-black text-slate-900">Schedule Changes</CardTitle>
              <CardDescription className="text-sm text-slate-700 font-semibold">
                Track all adaptations and updates
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-base font-bold text-slate-900 mb-2">No Changes Yet</p>
            <p className="text-sm text-slate-700 font-semibold">
              Schedule adaptations will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-2 border-white/60 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl opacity-50 blur animate-pulse"></div>
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <CardTitle className="text-lg font-black text-slate-900">Schedule Changes</CardTitle>
              <CardDescription className="text-sm text-slate-700 font-semibold">
                {scheduleChanges.length} total adaptation{scheduleChanges.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
          </div>
          <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold">
            {recentChanges.length} Recent
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
          {recentChanges.map((change) => (
            <div
              key={change.id}
              className="group relative p-4 rounded-xl border-2 border-slate-200 bg-white hover:border-blue-300 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getChangeColor(change.type)} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                  {getChangeIcon(change.type)}
                  <span className="absolute inset-0 flex items-center justify-center text-white">
                    {getChangeIcon(change.type)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-bold text-slate-900 text-base leading-tight">
                      {change.title}
                    </h4>
                    <Badge variant={getBadgeVariant(change.type)} className="text-xs font-bold whitespace-nowrap">
                      {change.type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-700 font-semibold mb-2">
                    {change.description}
                  </p>
                  
                  {change.details && (
                    <div className="space-y-2 mt-3">
                      {change.details.subject && (
                        <div className="flex items-center gap-2 text-xs">
                          <Badge variant="outline" className="font-bold">
                            📚 {change.details.subject}
                          </Badge>
                        </div>
                      )}
                      {change.details.from && change.details.to && (
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-50 rounded-lg p-2">
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded">{change.details.from}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded">{change.details.to}</span>
                        </div>
                      )}
                      {change.details.reason && (
                        <div className="flex items-start gap-2 text-xs text-slate-600 bg-blue-50 rounded-lg p-2">
                          <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0 text-blue-500" />
                          <span className="font-semibold">{change.details.reason}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 mt-3 text-xs text-slate-500 font-semibold">
                    <Clock className="w-3 h-3" />
                    {formatTimestamp(change.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
