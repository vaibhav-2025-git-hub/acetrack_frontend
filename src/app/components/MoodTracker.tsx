import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { useStudyPlan } from '../context/StudyPlanContext';
import type { Mood } from '../types';
import { Smile, Meh, Frown, TrendingUp } from 'lucide-react';

const moodOptions: { value: Mood; label: string; emoji: string; color: string }[] = [
  { value: 'excellent', label: 'Excellent', emoji: '😄', color: 'bg-green-500' },
  { value: 'good', label: 'Good', emoji: '🙂', color: 'bg-blue-500' },
  { value: 'neutral', label: 'Neutral', emoji: '😐', color: 'bg-yellow-500' },
  { value: 'tired', label: 'Tired', emoji: '😴', color: 'bg-orange-500' },
  { value: 'stressed', label: 'Stressed', emoji: '😰', color: 'bg-red-500' },
];

export const MoodTracker: React.FC<{ currentDate: string }> = ({ currentDate }) => {
  const { studyPlan, setStudyPlan } = useStudyPlan();
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);

  if (!studyPlan) return null;

  const dailyPlan = studyPlan.dailyPlans[currentDate];

  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood);
    
    if (dailyPlan) {
      const updatedPlan = {
        ...studyPlan,
        dailyPlans: {
          ...studyPlan.dailyPlans,
          [currentDate]: {
            ...dailyPlan,
            mood,
            burnoutLevel: mood === 'stressed' ? 80 : mood === 'tired' ? 60 : mood === 'neutral' ? 40 : 20,
          },
        },
      };
      setStudyPlan(updatedPlan);
    }
  };

  return (
    <div className="group relative">
      <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 rounded-[28px] opacity-20 blur-xl group-hover:opacity-30 transition duration-500"></div>
      <div className="relative rounded-[26px] bg-white/95 backdrop-blur-2xl shadow-2xl border-2 border-white/60 overflow-hidden">
        <div className="border-b-2 border-amber-100 bg-gradient-to-r from-amber-50/80 via-orange-50/80 to-rose-50/80 backdrop-blur px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl opacity-50 blur"></div>
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 flex items-center justify-center shadow-2xl">
                <Smile className="w-7 h-7 text-white" />
              </div>
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-xl tracking-tight">Quick Mood Check</h3>
              <p className="text-sm text-slate-600 mt-1 font-semibold">How are you feeling today? 💭</p>
            </div>
          </div>
        </div>
        <div className="p-8 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            {moodOptions.map((mood) => {
              const isSelected = selectedMood === mood.value || dailyPlan?.mood === mood.value;
              return (
                <button
                  key={mood.value}
                  onClick={() => handleMoodSelect(mood.value)}
                  className={`group/mood relative overflow-hidden p-5 rounded-2xl border-2 transition-all duration-300 ${
                    isSelected
                      ? 'bg-gradient-to-br from-amber-100 to-orange-100 border-amber-300 shadow-2xl shadow-amber-500/30 scale-105'
                      : 'bg-white border-slate-200 hover:border-amber-200 hover:bg-gradient-to-br hover:from-amber-50 hover:to-orange-50 shadow-lg hover:shadow-xl hover:scale-105'
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br from-amber-400/10 to-orange-400/10 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover/mood:opacity-100'} transition-opacity`}></div>
                  <div className="relative text-center">
                    <div className={`text-4xl mb-2 transform ${isSelected ? 'scale-110' : 'group-hover/mood:scale-110'} transition-transform duration-300`}>
                      {mood.emoji}
                    </div>
                    <div className={`text-sm font-bold ${isSelected ? 'text-amber-900' : 'text-slate-700'}`}>
                      {mood.label}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          
          {dailyPlan?.mood && (
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-[18px] opacity-20 blur"></div>
              <div className="relative p-4 bg-gradient-to-br from-emerald-50/90 to-teal-50/90 backdrop-blur rounded-[16px] border-2 border-emerald-200/50 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-emerald-900">
                      Mood tracked successfully! 
                    </p>
                    <p className="text-xs text-emerald-700 mt-0.5 font-semibold">
                      Your study plan will adapt to your energy levels ✨
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};