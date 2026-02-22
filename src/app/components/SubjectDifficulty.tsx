import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Difficulty } from '../types';
import { Subject } from '../data/curriculum';
import { Sparkles, Brain } from 'lucide-react';

interface SubjectDifficultyProps {
  subjects: Subject[];
  onComplete: (difficulties: Record<string, Difficulty>) => void;
}

export const SubjectDifficulty: React.FC<SubjectDifficultyProps> = ({ subjects, onComplete }) => {
  const [difficulties, setDifficulties] = useState<Record<string, Difficulty>>({});

  const handleDifficultySelect = (subjectId: string, difficulty: Difficulty) => {
    setDifficulties((prev) => ({ ...prev, [subjectId]: difficulty }));
  };

  const handleSubmit = () => {
    if (Object.keys(difficulties).length !== subjects.length) {
      alert('Please rate difficulty for all subjects');
      return;
    }
    onComplete(difficulties);
  };

  const getDifficultyColor = (diff: Difficulty, isSelected: boolean) => {
    if (!isSelected) return 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200';

    switch (diff) {
      case 'easy': return 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm shadow-emerald-500/10 font-bold';
      case 'medium': return 'bg-amber-50 text-amber-700 border-amber-300 shadow-sm shadow-amber-500/10 font-bold';
      case 'tough': return 'bg-rose-50 text-rose-700 border-rose-300 shadow-sm shadow-rose-500/10 font-bold';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />

      <Card className="w-full max-w-3xl border-0 shadow-2xl shadow-indigo-900/5 backdrop-blur-xl bg-white/90 rounded-3xl relative z-10 transition-all">
        <CardHeader className="pb-6 pt-10 px-8 lg:px-12">
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="text-3xl font-black text-slate-900 flex items-center gap-4 text-center mx-auto">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                <Brain className="w-7 h-7 text-white" />
              </div>
              Rate Subject Difficulty
            </CardTitle>
          </div>
          <CardDescription className="text-base text-slate-600 font-medium text-center max-w-xl mx-auto">
            Help the AI understand your strengths and weaknesses to allocate study time dynamically.
          </CardDescription>

          <div className="mt-6 p-4 bg-indigo-50/70 rounded-2xl border border-indigo-100 flex items-center justify-center gap-2 max-w-sm mx-auto">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <p className="text-sm font-bold text-indigo-900">
              {Object.keys(difficulties).length} / {subjects.length} subjects rated
            </p>
          </div>
        </CardHeader>

        <CardContent className="px-8 lg:px-12 pb-10">
          <div className="space-y-4 mb-10">
            {subjects.map((subject) => (
              <div
                key={subject.id}
                className={`p-5 rounded-2xl border-2 transition-all duration-300 ${difficulties[subject.id] ? 'border-indigo-100 bg-white shadow-sm' : 'border-slate-100 bg-slate-50/50'
                  }`}
              >
                <h3 className="font-bold text-lg text-slate-900 mb-4">{subject.name}</h3>
                <div className="grid grid-cols-3 gap-3">
                  {(['easy', 'medium', 'tough'] as Difficulty[]).map((diff) => {
                    const isSelected = difficulties[subject.id] === diff;
                    return (
                      <Button
                        key={diff}
                        onClick={() => handleDifficultySelect(subject.id, diff)}
                        className={`h-12 border-2 transition-all ${getDifficultyColor(diff, isSelected)}`}
                        variant="outline"
                      >
                        {diff.charAt(0).toUpperCase() + diff.slice(1)}
                        {isSelected && <span className="ml-2 text-lg">✓</span>}
                      </Button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full h-14 text-lg bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-xl shadow-indigo-600/20 transition-all disabled:opacity-50 disabled:shadow-none"
            size="lg"
            disabled={Object.keys(difficulties).length !== subjects.length}
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Generate My Study Plan
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};