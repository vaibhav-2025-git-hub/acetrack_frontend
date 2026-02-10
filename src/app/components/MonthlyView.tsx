import React from 'react';
import { useStudyPlan } from '../context/StudyPlanContext';

export const MonthlyView: React.FC = () => {
  const { studyPlan } = useStudyPlan();
  if (!studyPlan || !studyPlan.days) return null;

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  
  const days = [];
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(currentYear, currentMonth, i);
    days.push(date);
  }

  const startPadding = firstDay.getDay();

  return (
    <div>
      <h3 className="text-center font-bold text-xl text-slate-900 mb-6">
        {firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
      </h3>
      <div className="grid grid-cols-7 gap-3">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-sm font-bold text-slate-700 py-2">
            {day}
          </div>
        ))}
        {[...Array(startPadding)].map((_, i) => (
          <div key={`padding-${i}`} />
        ))}
        {days.map((date) => {
          const dateStr = date.toISOString().split('T')[0];
          const dailyPlan = studyPlan.days.find(d => d.date === dateStr);
          
          const totalSessions = dailyPlan?.sessions.length || 0;
          const completedSessions = dailyPlan?.sessions.filter(s => s.completed).length || 0;
          const completion = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
          
          const isToday = dateStr === new Date().toISOString().split('T')[0];

          return (
            <div
              key={dateStr}
              className={`aspect-square p-3 border-2 rounded-xl transition-all ${
                dailyPlan ? 'cursor-pointer hover:shadow-lg hover:scale-105' : 'bg-slate-50 border-slate-200'
              } ${
                isToday ? 'ring-2 ring-indigo-500' : ''
              } ${
                completion === 100 ? 'bg-green-100 border-green-400' :
                completion > 0 ? 'bg-yellow-100 border-yellow-400' :
                dailyPlan ? 'bg-white border-slate-300' : ''
              }`}
            >
              <div className="flex flex-col h-full">
                <div className="text-sm font-bold text-slate-900">{date.getDate()}</div>
                {dailyPlan && (
                  <div className="mt-auto">
                    <div className="text-xs text-slate-600 mb-1">
                      {completedSessions}/{totalSessions}
                    </div>
                    <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
                        style={{ width: `${completion}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};