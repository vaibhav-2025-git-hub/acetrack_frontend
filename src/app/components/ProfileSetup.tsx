import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { curriculumData } from '../data/curriculum';
import { UserProfile } from '../types';
import { CheckCircle2, Circle, Settings, Sparkles } from 'lucide-react';

interface ProfileSetupProps {
  onComplete: (profile: Omit<UserProfile, 'learningSpeed' | 'subjectDifficulties'>) => void;
}

export const ProfileSetup: React.FC<ProfileSetupProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [selectedBoard] = useState('cbse'); // Hardcoded to CBSE
  const [selectedClass] = useState('12'); // Hardcoded to 12th
  const [selectedStream, setSelectedStream] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [studyHours, setStudyHours] = useState(4);
  const [totalDays, setTotalDays] = useState(180);

  const selectedBoardData = curriculumData.find((b) => b.id === selectedBoard);
  const availableClasses = selectedBoardData ? Object.keys(selectedBoardData.classes) : [];
  const availableStreams =
    selectedBoardData && selectedClass ? selectedBoardData.classes[selectedClass] || [] : [];

  // Filter to only show the 3 science streams
  const scienceStreams = availableStreams.filter(s =>
    s.id === 'pcmb' || s.id === 'pcm-cs' || s.id === 'pcb-cs'
  );

  const availableSubjects = selectedStream
    ? scienceStreams.find(s => s.id === selectedStream)?.subjects || []
    : [];

  const toggleSubject = (subjectId: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !selectedBoard || !selectedClass || !selectedStream) {
      alert('Please fill all fields');
      return;
    }

    if (selectedSubjects.length === 0) {
      alert('Please select at least one subject');
      return;
    }

    onComplete({
      name,
      class: selectedClass,
      board: selectedBoard,
      stream: selectedStream,
      selectedSubjects,
      studyHoursPerDay: studyHours,
      startDate: new Date().toISOString().split('T')[0],
      totalDays,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />

      <Card className="w-full max-w-2xl border-0 shadow-2xl shadow-indigo-900/5 backdrop-blur-xl bg-white/90 rounded-3xl relative z-10">
        <CardHeader className="space-y-2 pb-6 pt-10 px-8 lg:px-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 mb-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-900">Step 1 of 2</span>
          </div>
          <CardTitle className="text-3xl font-black text-slate-900 flex items-center gap-3">
            Create Your Profile
          </CardTitle>
          <CardDescription className="text-base text-slate-600">
            Set up your personalized study journey for Class 12 CBSE
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 lg:px-12 pb-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-slate-700">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-11 border-slate-200 bg-slate-50/50 focus:bg-white rounded-xl focus-visible:ring-indigo-600 focus:border-indigo-600"
              />
            </div>

            {/* Class & Board - Fixed Display */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Class & Board</Label>
              <div className="px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 font-medium">
                Class 12th - CBSE Board
              </div>
            </div>

            {/* Stream Selection */}
            <div className="space-y-2">
              <Label htmlFor="stream" className="text-sm font-semibold text-slate-700">Science Stream</Label>
              <Select
                value={selectedStream}
                onValueChange={(value) => {
                  setSelectedStream(value);
                  setSelectedSubjects([]);
                }}
              >
                <SelectTrigger id="stream" className="h-11 border-slate-200 bg-slate-50/50 focus:bg-white rounded-xl focus:ring-indigo-600 focus:border-indigo-600 text-slate-700 font-medium">
                  <SelectValue placeholder="Select your science stream" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200">
                  {scienceStreams.map((stream) => (
                    <SelectItem key={stream.id} value={stream.id} className="focus:bg-indigo-50 focus:text-indigo-900 py-2.5 cursor-pointer">
                      <div className="flex flex-col items-start gap-1">
                        <span className="font-semibold text-slate-900">{stream.name}</span>
                        <span className="text-xs text-slate-500 font-medium">{stream.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subject Selection */}
            {availableSubjects.length > 0 && (
              <div className="space-y-3 pt-2">
                <Label className="text-sm font-semibold text-slate-700">
                  Select Subjects
                </Label>
                <p className="text-xs text-slate-500">
                  Choose subjects to include in your study schedule
                </p>
                <div className="grid grid-cols-1 gap-3 max-h-72 overflow-y-auto p-4 bg-slate-50 rounded-2xl border border-slate-200 shadow-inner">
                  {availableSubjects.map((subject) => (
                    <button
                      key={subject.id}
                      type="button"
                      onClick={() => toggleSubject(subject.id)}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${selectedSubjects.includes(subject.id)
                          ? 'border-indigo-500 bg-indigo-50/50 shadow-sm'
                          : 'border-white bg-white shadow-sm hover:border-indigo-200 hover:shadow-md'
                        }`}
                    >
                      {selectedSubjects.includes(subject.id) ? (
                        <CheckCircle2 className="w-6 h-6 text-indigo-600 flex-shrink-0" />
                      ) : (
                        <Circle className="w-6 h-6 text-slate-300 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-bold text-slate-900 text-base">{subject.name}</p>
                        <p className="text-xs font-semibold text-indigo-600/70 mt-0.5">
                          {subject.chapters.length} chapters
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
                <p className="text-xs font-medium text-slate-500 text-right">
                  Selected: {selectedSubjects.length} of {availableSubjects.length} subjects
                </p>
              </div>
            )}

            {/* Study Hours & Total Days Cards */}
            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              {/* Study Hours */}
              <div className="space-y-3 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between">
                  <Label htmlFor="studyHours" className="text-sm font-semibold text-slate-700">Daily Study Hours</Label>
                  <span className="text-indigo-600 font-black bg-indigo-50 px-2 py-1 rounded-md text-sm">{studyHours}h</span>
                </div>
                <input
                  type="range"
                  id="studyHours"
                  min="2"
                  max="12"
                  value={studyHours}
                  onChange={(e) => setStudyHours(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <p className="text-xs font-medium text-slate-500">Recommended: 6-8 hours</p>
              </div>

              {/* Total Days */}
              <div className="space-y-3 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between">
                  <Label htmlFor="totalDays" className="text-sm font-semibold text-slate-700">Plan Duration</Label>
                  <span className="text-indigo-600 font-black bg-indigo-50 px-2 py-1 rounded-md text-sm">{totalDays} days</span>
                </div>
                <input
                  type="range"
                  id="totalDays"
                  min="30"
                  max="365"
                  value={totalDays}
                  onChange={(e) => setTotalDays(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <p className="text-xs font-medium text-slate-500">Maximum: 1 year (365d)</p>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 text-base"
            >
              Continue to Assessment
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
