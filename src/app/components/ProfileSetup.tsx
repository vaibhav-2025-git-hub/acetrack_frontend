import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { curriculumData } from '../data/curriculum';
import { UserProfile } from '../types';
import { CheckCircle2, Circle } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl border-0 shadow-sm">
        <CardHeader className="space-y-2 pb-6">
          <CardTitle className="text-2xl font-semibold text-gray-900">Create Your Profile</CardTitle>
          <CardDescription className="text-sm text-gray-600">
            Set up your personalized study journey for Class 12 CBSE
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="border-gray-200 focus:border-teal-500 focus:ring-teal-500"
              />
            </div>

            {/* Class & Board - Fixed Display */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Class & Board</Label>
              <div className="px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-900">
                Class 12th - CBSE Board
              </div>
            </div>

            {/* Stream Selection */}
            <div className="space-y-2">
              <Label htmlFor="stream" className="text-sm font-medium text-gray-700">Science Stream</Label>
              <Select
                value={selectedStream}
                onValueChange={(value) => {
                  setSelectedStream(value);
                  setSelectedSubjects([]);
                }}
              >
                <SelectTrigger id="stream" className="border-gray-200 focus:border-teal-500 focus:ring-teal-500">
                  <SelectValue placeholder="Select your science stream" />
                </SelectTrigger>
                <SelectContent>
                  {scienceStreams.map((stream) => (
                    <SelectItem key={stream.id} value={stream.id}>
                      <div className="flex flex-col items-start">
                        <span className="font-medium text-gray-900">{stream.name}</span>
                        <span className="text-xs text-gray-600">{stream.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subject Selection */}
            {availableSubjects.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">
                  Select Subjects
                </Label>
                <p className="text-xs text-gray-600">
                  Choose subjects to include in your study schedule
                </p>
                <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto p-3 bg-gray-50 rounded-lg border border-gray-200">
                  {availableSubjects.map((subject) => (
                    <button
                      key={subject.id}
                      type="button"
                      onClick={() => toggleSubject(subject.id)}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                        selectedSubjects.includes(subject.id)
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-200 bg-white hover:border-teal-300'
                      }`}
                    >
                      {selectedSubjects.includes(subject.id) ? (
                        <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{subject.name}</p>
                        <p className="text-xs text-gray-600">
                          {subject.chapters.length} chapters
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-600">
                  Selected: {selectedSubjects.length} of {availableSubjects.length} subjects
                </p>
              </div>
            )}

            {/* Study Hours */}
            <div className="space-y-2">
              <Label htmlFor="studyHours" className="text-sm font-medium text-gray-700">
                Daily Study Hours: <span className="text-teal-600 font-semibold">{studyHours}h</span>
              </Label>
              <input
                type="range"
                id="studyHours"
                min="2"
                max="12"
                value={studyHours}
                onChange={(e) => setStudyHours(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
              <p className="text-xs text-gray-600">Recommended: 6-8 hours for Class 12</p>
            </div>

            {/* Total Days */}
            <div className="space-y-2">
              <Label htmlFor="totalDays" className="text-sm font-medium text-gray-700">
                Plan Duration: <span className="text-teal-600 font-semibold">{totalDays} days</span>
              </Label>
              <input
                type="range"
                id="totalDays"
                min="30"
                max="365"
                value={totalDays}
                onChange={(e) => setTotalDays(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
              <p className="text-xs text-gray-600">
                Set your timeline (e.g., 180 days for semester, 365 for full year)
              </p>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium shadow-sm"
              size="lg"
            >
              Continue to Assessment
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
