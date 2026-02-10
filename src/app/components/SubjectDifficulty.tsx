import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Difficulty } from '../types';
import { Subject } from '../data/curriculum';

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

  const difficultyColors = {
    easy: 'bg-green-500 hover:bg-green-600',
    medium: 'bg-yellow-500 hover:bg-yellow-600',
    tough: 'bg-red-500 hover:bg-red-600',
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl shadow-xl bg-white">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Rate Subject Difficulty</CardTitle>
          <CardDescription className="text-center">
            Rate how difficult you find each of your selected subjects. This helps us allocate study time effectively.
          </CardDescription>
          <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <p className="text-sm font-medium text-indigo-900">
              📚 Rating {subjects.length} selected subject{subjects.length !== 1 ? 's' : ''}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {subjects.map((subject) => (
              <div key={subject.id} className="p-4 border rounded-lg">
                <h3 className="font-semibold text-lg mb-3">{subject.name}</h3>
                <div className="flex gap-3">
                  {(['easy', 'medium', 'tough'] as Difficulty[]).map((diff) => (
                    <Button
                      key={diff}
                      onClick={() => handleDifficultySelect(subject.id, diff)}
                      className={`flex-1 ${
                        difficulties[subject.id] === diff
                          ? difficultyColors[diff]
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      }`}
                      variant={difficulties[subject.id] === diff ? 'default' : 'outline'}
                    >
                      {diff.charAt(0).toUpperCase() + diff.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            ))}

            <Button onClick={handleSubmit} className="w-full" size="lg" disabled={Object.keys(difficulties).length !== subjects.length}>
              Generate My Study Plan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};