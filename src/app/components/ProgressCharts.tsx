import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useStudyPlan } from '../context/StudyPlanContext';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#10b981'];

export const ProgressCharts: React.FC = () => {
  const { studyPlan, userProfile } = useStudyPlan();

  if (!studyPlan || !userProfile || !studyPlan.days) return null;

  // Calculate weekly progress data from daily data
  const weeklyData = (() => {
    const weeks: Record<number, { completed: number; planned: number }> = {};
    
    const days = studyPlan.days || [];
    days.forEach((day, index) => {
      const weekNumber = Math.floor(index / 7) + 1;
      if (!weeks[weekNumber]) {
        weeks[weekNumber] = { completed: 0, planned: 0 };
      }
      
      day.sessions.forEach(session => {
        weeks[weekNumber].planned += session.duration / 60; // Convert to hours
        if (session.completed) {
          weeks[weekNumber].completed += session.duration / 60; // Convert to hours
        }
      });
    });
    
    return Object.entries(weeks).slice(0, 8).map(([weekNum, data]) => ({
      week: `Week ${weekNum}`,
      completed: parseFloat(data.completed.toFixed(1)),
      planned: parseFloat(data.planned.toFixed(1)),
    }));
  })();

  // Subject progress based on completed sessions
  const subjectProgress = (() => {
    const subjects: Record<string, number> = {};
    
    const days = studyPlan.days || [];
    days.forEach(day => {
      day.sessions.forEach(session => {
        if (session.completed) {
          subjects[session.subjectId] = (subjects[session.subjectId] || 0) + 1;
        }
      });
    });
    
    return subjects;
  })();

  const subjectData = Object.entries(subjectProgress).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="rounded-3xl bg-white/90 backdrop-blur-xl shadow-2xl shadow-emerald-500/10 border-2 border-emerald-100/50 overflow-hidden">
        <div className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Weekly Progress</h3>
              <p className="text-sm text-slate-600 mt-0.5">Completed vs Planned Hours</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyData}>
              <defs>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.9}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.6}/>
                </linearGradient>
                <linearGradient id="colorPlanned" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.9}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.6}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="week" stroke="#64748b" style={{ fontSize: '12px' }} />
              <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }} 
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="completed" fill="url(#colorCompleted)" name="Completed Hours" radius={[8, 8, 0, 0]} />
              <Bar dataKey="planned" fill="url(#colorPlanned)" name="Planned Hours" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-3xl bg-white/90 backdrop-blur-xl shadow-2xl shadow-violet-500/10 border-2 border-violet-100/50 overflow-hidden">
        <div className="border-b border-violet-100 bg-gradient-to-r from-violet-50 via-purple-50 to-fuchsia-50 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center shadow-lg">
              <span className="text-2xl">🎯</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Subject Distribution</h3>
              <p className="text-sm text-slate-600 mt-0.5">Completed Sessions by Subject</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          {subjectData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={subjectData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {subjectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-slate-500">
              <div className="text-center">
                <p className="font-semibold">No completed sessions yet</p>
                <p className="text-sm mt-2">Complete some sessions to see subject distribution</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};