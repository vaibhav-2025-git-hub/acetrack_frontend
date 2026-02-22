import React from 'react';
import { Card } from './ui/card';
import { useStudyPlan } from '../context/StudyPlanContext';
import { Progress } from './ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { ChevronDown, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { curriculumData } from '../data/curriculum';

export const WeeklyView: React.FC = () => {
  const { studyPlan } = useStudyPlan();
  if (!studyPlan) return null;

  // Get current week
  const today = new Date();
  const currentWeekStart = new Date(today);
  currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());

  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + i);
    weekDays.push(date.toISOString().split('T')[0]);
  }

  return (
    <div className="relative max-w-4xl mx-auto py-12 px-4 sm:px-6">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />

      {/* The Central Path Line */}
      <div className="absolute left-1/2 top-4 bottom-4 w-1.5 -ml-[3px] bg-slate-200/50 rounded-full hidden md:block" />

      <div className="space-y-16 relative z-10">
        {weekDays.map((dateStr, index) => {
          const dailyPlan = studyPlan.dailyPlans?.[dateStr] || studyPlan.days?.find(d => d.date === dateStr);
          if (!dailyPlan || !dailyPlan.sessions) return null;

          const totalSessions = dailyPlan.sessions.length;
          const completedSessions = dailyPlan.sessions.filter(s => s.completed || s.status === 'completed').length;
          const completion = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
          const totalMinutes = dailyPlan.sessions.reduce((sum, s) => sum + s.duration, 0);
          const totalHours = (totalMinutes / 60).toFixed(1);

          const dayName = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
          const dateNum = new Date(dateStr).getDate();
          const isToday = dateStr === new Date().toISOString().split('T')[0];
          const isFullyCompleted = completion === 100;

          // Determine glowing node styles
          const nodeColor = isFullyCompleted
            ? 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-[0_0_30px_rgba(52,211,153,0.5)] border-emerald-300 ring-emerald-500/30'
            : isToday
              ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-[0_0_30px_rgba(99,102,241,0.5)] border-indigo-400 ring-indigo-500/30 animate-pulse'
              : completion > 0
                ? 'bg-gradient-to-br from-blue-400 to-cyan-500 shadow-[0_0_20px_rgba(56,189,248,0.3)] border-blue-300 ring-blue-500/20'
                : 'bg-white border-slate-300 shadow-md ring-slate-200';

          const textColor = (isFullyCompleted || isToday || completion > 0) ? 'text-white' : 'text-slate-500';

          // Position toggle (left vs right sides)
          const isEven = index % 2 === 0;

          return (
            <div key={dateStr} className={`relative flex items-center justify-between md:justify-normal ${isEven ? 'md:flex-row-reverse' : ''}`}>

              {/* Connector Line to Node (Hidden on mobile) */}
              <div className={`hidden md:block absolute top-1/2 w-1/2 h-1 ${isFullyCompleted ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-slate-200'} -translate-y-1/2 ${isEven ? 'right-1/2' : 'left-1/2'} z-0`}></div>

              {/* The Central Node */}
              <div className={`absolute left-1/2 -ml-8 w-16 h-16 rounded-full border-4 ring-8 z-20 hidden md:flex flex-col items-center justify-center transition-all duration-500 transform hover:scale-110 cursor-pointer ${nodeColor}`}>
                {isFullyCompleted ? (
                  <CheckCircle2 className="w-8 h-8 text-white drop-shadow-md" />
                ) : (
                  <>
                    <span className={`text-xs font-bold leading-none uppercase ${textColor}`}>{dayName}</span>
                    <span className={`text-xl font-black leading-none mt-1 ${textColor}`}>{dateNum}</span>
                  </>
                )}
              </div>

              {/* The Content Card */}
              <div className={`w-full md:w-5/12 ${isEven ? 'md:pl-12' : 'md:pr-12'} z-10 hover:z-30 transition-all duration-300`}>
                <div className="group relative">
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${isFullyCompleted ? 'from-emerald-400 to-teal-500' : isToday ? 'from-indigo-500 to-purple-600' : 'from-slate-200 to-slate-300'} rounded-[24px] opacity-50 blur group-hover:opacity-100 transition duration-500`}></div>

                  <Collapsible>
                    <Card className={`relative overflow-hidden rounded-[22px] bg-white/95 backdrop-blur-xl p-5 border-2 border-white transition-all duration-500 shadow-xl ${isToday ? 'scale-105' : 'group-hover:scale-[1.02]'}`}>

                      {/* Mobile Header (Hidden on Desktop) */}
                      <div className="md:hidden flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl border-2 flex flex-col items-center justify-center ${nodeColor.replace('rounded-full', '')}`}>
                            {isFullyCompleted ? (
                              <CheckCircle2 className={`w-6 h-6 ${textColor}`} />
                            ) : (
                              <>
                                <span className={`text-[10px] font-bold leading-none uppercase ${textColor}`}>{dayName}</span>
                                <span className={`text-lg font-black leading-none mt-0.5 ${textColor}`}>{dateNum}</span>
                              </>
                            )}
                          </div>
                          {isToday && <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-lg">TODAY</span>}
                        </div>
                      </div>

                      <CollapsibleTrigger className="w-full text-left focus:outline-none">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-black text-slate-900 text-lg mb-2 hidden md:block">
                              {dayName}, {dateNum} {isToday && <span className="ml-2 bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-lg align-middle">TODAY</span>}
                            </h4>
                            <div className="flex items-center gap-4">
                              <span className="text-sm font-bold text-slate-600 flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl">
                                <Calendar className="w-4 h-4 text-indigo-500" />
                                {totalSessions} Sessions
                              </span>
                              <span className="text-sm font-bold text-slate-600 flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl">
                                <Clock className="w-4 h-4 text-purple-500" />
                                {totalHours}h
                              </span>
                            </div>
                          </div>

                          <div className="text-right flex flex-col items-end">
                            <span className={`text-xl font-black ${isFullyCompleted ? 'text-emerald-500' : 'text-slate-900'}`}>
                              {completion.toFixed(0)}%
                            </span>
                            <span className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">Completed</span>
                          </div>
                        </div>

                        {/* Quick Progress Bar */}
                        <div className="mt-5 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${isFullyCompleted ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-indigo-500 to-purple-600'} transition-all duration-1000 ease-out`}
                            style={{ width: `${completion}%` }}
                          />
                        </div>

                        <div className="w-full flex justify-center mt-4 text-slate-300 group-hover:text-indigo-400 transition-colors">
                          <ChevronDown className="w-5 h-5" />
                        </div>
                      </CollapsibleTrigger>

                      <CollapsibleContent className="mt-2 pt-4 border-t border-slate-100 space-y-3">
                        {dailyPlan.sessions.map((session) => (
                          <div key={session.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group/item">
                            <div className={`w-2 h-2 rounded-full ${session.completed ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-300 group-hover/item:bg-indigo-400'}`} />
                            <div className="flex-1">
                              <p className={`text-sm font-bold ${session.completed ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                                {session.subjectName}
                              </p>
                              <p className="text-xs font-semibold text-slate-500 truncate mt-0.5">{session.chapterName}</p>
                            </div>
                            <span className="text-xs font-bold text-slate-400">{session.duration}m</span>
                          </div>
                        ))}
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};