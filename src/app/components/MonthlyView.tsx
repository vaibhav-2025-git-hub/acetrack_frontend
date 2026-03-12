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
    <div className="relative max-w-4xl mx-auto py-8">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8 px-2">
          <h3 className="font-black text-2xl bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            {firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="flex items-center gap-4 text-sm font-bold">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div><span className="text-slate-600">Perfect</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]"></div><span className="text-slate-600">Partial</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-200"></div><span className="text-slate-600">Pending</span></div>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-3 sm:gap-4 lg:gap-5">
          {/* Day Headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-xs sm:text-sm font-black text-slate-400 uppercase tracking-widest py-2">
              {day}
            </div>
          ))}

          {/* Padding Cells */}
          {[...Array(startPadding)].map((_, i) => (
            <div key={`padding-${i}`} className="aspect-square rounded-[20px] bg-slate-50/50 border border-slate-100/50" />
          ))}

          {/* Actual Days */}
          {days.map((date) => {
            const dateStr = date.toISOString().split('T')[0];
            const dailyPlan = (studyPlan.days || []).find(d => d.date === dateStr);

            const totalSessions = dailyPlan?.sessions.length || 0;
            const completedSessions = dailyPlan?.sessions.filter(s => s.completed).length || 0;
            const completion = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

            const isToday = dateStr === new Date().toISOString().split('T')[0];
            const isPerfect = completion === 100 && totalSessions > 0;
            const isPartial = completion > 0 && completion < 100;

            let cellClass = "aspect-square rounded-[20px] transition-all duration-300 relative overflow-hidden group ";
            let textClass = "text-sm sm:text-base font-black z-10 relative ";
            let badgeClass = "text-[10px] font-bold z-10 relative mt-0.5 ";

            if (isToday) {
              cellClass += "bg-gradient-to-br from-indigo-500 to-purple-600 shadow-[0_0_20px_rgba(99,102,241,0.4)] border-2 border-indigo-300 transform scale-105 z-20 ";
              textClass += "text-white ";
              badgeClass += "text-indigo-100 ";
            } else if (isPerfect) {
              cellClass += "bg-gradient-to-br from-emerald-400 to-teal-500 shadow-[0_4px_15px_rgba(52,211,153,0.3)] border border-emerald-300 hover:scale-105 cursor-pointer ";
              textClass += "text-white ";
              badgeClass += "text-emerald-50 ";
            } else if (isPartial) {
              cellClass += "bg-gradient-to-br from-yellow-100 to-amber-100 border border-yellow-300 hover:shadow-md hover:scale-105 cursor-pointer ";
              textClass += "text-amber-700 ";
              badgeClass += "text-amber-600/70 ";
            } else if (dailyPlan && totalSessions > 0) {
              cellClass += "bg-white border-2 border-slate-200 hover:border-indigo-300 hover:shadow-lg hover:scale-105 cursor-pointer ";
              textClass += "text-slate-700 ";
              badgeClass += "text-slate-400 ";
            } else {
              cellClass += "bg-slate-50/80 border border-slate-100 hover:bg-slate-100 transition-colors ";
              textClass += "text-slate-400 ";
            }

            return (
              <div key={dateStr} className={cellClass}>
                {/* Hover effect overlay */}
                {(dailyPlan && totalSessions > 0 && !isToday) && (
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>
                )}

                <div className="flex flex-col h-full p-2 sm:p-3 relative z-10">
                  <div className="flex justify-between items-start">
                    <span className={textClass}>{date.getDate()}</span>
                    {isToday && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shadow-[0_0_5px_white]"></div>}
                  </div>

                  {dailyPlan && totalSessions > 0 && (
                    <div className="mt-auto flex flex-col gap-1.5">
                      <span className={badgeClass}>{completedSessions}/{totalSessions} Done</span>
                      <div className={`h-1.5 w-full rounded-full overflow-hidden ${isToday || isPerfect ? 'bg-black/20' : 'bg-slate-200'}`}>
                        <div
                          className={`h-full ${isToday || isPerfect ? 'bg-white' : 'bg-gradient-to-r from-indigo-500 to-purple-500'} transition-all duration-1000 ease-out`}
                          style={{ width: `${completion}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};