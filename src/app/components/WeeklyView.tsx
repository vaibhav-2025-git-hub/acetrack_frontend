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
    <div className="space-y-4">
      {weekDays.map((dateStr) => {
        // Try to get daily plan from both possible structures
        const dailyPlan = studyPlan.dailyPlans?.[dateStr] || studyPlan.days?.find(d => d.date === dateStr);
        if (!dailyPlan || !dailyPlan.sessions) return null;

        const totalSessions = dailyPlan.sessions.length;
        const completedSessions = dailyPlan.sessions.filter(s => s.completed || s.status === 'completed').length;
        const completion = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

        const totalMinutes = dailyPlan.sessions.reduce((sum, s) => sum + s.duration, 0);
        const totalHours = (totalMinutes / 60).toFixed(1);

        const dayName = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
        const isToday = dateStr === new Date().toISOString().split('T')[0];

        return (
          <Collapsible key={dateStr}>
            <Card className={`p-5 ${isToday ? 'ring-2 ring-indigo-500 shadow-lg' : ''}`}>
              <CollapsibleTrigger className="w-full">
                <div className="flex justify-between items-center">
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900">{dayName}</h4>
                      {isToday && <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-semibold">Today</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-sm text-slate-600 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {totalSessions} Sessions
                      </p>
                      <p className="text-sm text-slate-600 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {totalHours}h
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-slate-600 mb-1">{completedSessions} / {totalSessions} Completed</p>
                      <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
                          style={{ width: `${completion}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-slate-900">{completion.toFixed(0)}%</span>
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4 pt-4 border-t space-y-2">
                {dailyPlan.sessions.map((session) => (
                  <div key={session.id} className="flex justify-between items-center py-3 px-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {session.completed && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                        {(() => {
                          let displayTopicName = session.topicName;
                          const isGeneric = !displayTopicName ||
                            displayTopicName === 'Study Session' ||
                            displayTopicName === 'Topic' ||
                            displayTopicName === 'General' ||
                            displayTopicName === 'Unassigned';

                          if (isGeneric) {
                            if (session.topicId) {
                              let foundTopic = null;

                              // Brute force lookup since we don't have userProfile valid here easily without context complexity
                              for (const board of curriculumData) {
                                for (const classKey in board.classes) {
                                  for (const stream of board.classes[classKey]) {
                                    for (const sub of stream.subjects) {
                                      for (const ch of sub.chapters) {
                                        const t = ch.topics.find(top => top.id === session.topicId);
                                        if (t) { foundTopic = t; break; }
                                      }
                                      if (foundTopic) break;
                                    }
                                    if (foundTopic) break;
                                  }
                                  if (foundTopic) break;
                                }
                                if (foundTopic) break;
                              }

                              if (foundTopic) {
                                displayTopicName = foundTopic.name;
                              } else {
                                if (session.topicId.startsWith('revision-')) {
                                  displayTopicName = "Revision";
                                } else {
                                  displayTopicName = session.topicId
                                    .split('-')
                                    .filter(p => p !== 'topic' && p.length > 0)
                                    .map(p => p.charAt(0).toUpperCase() + p.slice(1))
                                    .join(' ');
                                }
                              }
                            } else {
                              displayTopicName = session.subjectName || "Subject Review";
                            }
                          }

                          return <span className="font-semibold text-slate-900">{displayTopicName || 'Session'}</span>;
                        })()}
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{session.subjectName} • {session.chapterName}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-600">{session.duration} min</span>
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold ${session.completed ? 'bg-green-100 text-green-700' :
                        'bg-blue-100 text-blue-700'
                        }`}>
                        {session.completed ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </CollapsibleContent>
            </Card>
          </Collapsible>
        );
      })}
    </div>
  );
};