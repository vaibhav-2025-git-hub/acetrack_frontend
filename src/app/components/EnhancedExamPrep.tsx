import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useStudyPlan } from '../context/StudyPlanContext';
import { 
  Calendar, 
  Target, 
  BookOpen, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Zap, 
  Plus, 
  X, 
  Edit2, 
  Trash2, 
  FileText, 
  Brain,
  Award,
  BarChart3,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';
import { Exam, CrashCourse } from '../types';
import {
  generateCrashCourse,
  calculateSyllabusCoverage,
  calculateExamReadiness,
  getDaysUntilExam,
  needsIntensivePrep,
} from '../utils/examPreparation';
import { toast } from 'sonner';

export const EnhancedExamPrep: React.FC = () => {
  const { studyPlan, setStudyPlan, userProfile } = useStudyPlan();
  const [showCreateExam, setShowCreateExam] = useState(false);
  const [showMockTest, setShowMockTest] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [newExam, setNewExam] = useState({
    name: '',
    type: 'unit-test' as 'unit-test' | 'mid-term' | 'final-exam' | 'board-exam',
    date: '',
    subjects: [] as string[],
  });

  if (!studyPlan || !userProfile) return null;

  const exams = studyPlan.exams || [];
  const activeExams = exams.filter((e) => e.isActive);
  const pastExams = exams.filter((e) => !e.isActive);

  // Get available subjects
  const availableSubjects = Object.keys(userProfile.subjectDifficulties);

  const createCrashCourse = (examId: string, priority: 'high-priority-topics' | 'revision-only' | 'balanced') => {
    const exam = exams.find((e) => e.id === examId);
    if (!exam) return;

    const today = new Date().toISOString().split('T')[0];
    
    try {
      const crashCourse = generateCrashCourse(exam, userProfile, today, priority);
      
      setStudyPlan({
        ...studyPlan,
        crashCourses: [...(studyPlan.crashCourses || []), crashCourse],
      });

      toast.success(`✨ ${crashCourse.name} created successfully!`);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleCreateExam = () => {
    if (!newExam.name || !newExam.date || newExam.subjects.length === 0) {
      toast.error('Please fill in all fields');
      return;
    }

    const exam: Exam = {
      id: `exam-${Date.now()}`,
      name: newExam.name,
      subjectIds: newExam.subjects,
      date: newExam.date,
      type: newExam.type,
      syllabusTopics: [],
      isActive: true,
    };

    setStudyPlan({
      ...studyPlan,
      exams: [...exams, exam],
    });

    toast.success('📅 Exam added successfully!');
    setShowCreateExam(false);
    setNewExam({ name: '', type: 'unit-test', date: '', subjects: [] });
  };

  const handleDeleteExam = (examId: string) => {
    setStudyPlan({
      ...studyPlan,
      exams: exams.filter((e) => e.id !== examId),
    });
    toast.success('Exam deleted');
  };

  const toggleSubject = (subject: string) => {
    setNewExam(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="group relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 rounded-[32px] opacity-20 blur-xl group-hover:opacity-30 transition duration-500"></div>
        <Card className="relative rounded-[30px] bg-white/95 backdrop-blur-2xl shadow-2xl border-2 border-white/60">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Exam Preparation Center</h2>
                <p className="text-sm text-slate-600 mt-1 font-semibold">Plan, track, and ace your exams</p>
              </div>
              <Button 
                onClick={() => setShowCreateExam(!showCreateExam)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Exam
              </Button>
            </div>

            {/* Create Exam Form */}
            {showCreateExam && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 mb-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  Add New Exam
                </h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-semibold">Exam Name</Label>
                      <Input
                        placeholder="e.g., Physics Unit Test"
                        value={newExam.name}
                        onChange={(e) => setNewExam({ ...newExam, name: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="font-semibold">Exam Type</Label>
                      <select
                        value={newExam.type}
                        onChange={(e) => setNewExam({ ...newExam, type: e.target.value as any })}
                        className="w-full px-3 py-2 border rounded-md border-slate-300"
                      >
                        <option value="unit-test">Unit Test</option>
                        <option value="mid-term">Mid-Term</option>
                        <option value="final-exam">Final Exam</option>
                        <option value="board-exam">Board Exam</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-semibold">Exam Date</Label>
                    <Input
                      type="date"
                      value={newExam.date}
                      onChange={(e) => setNewExam({ ...newExam, date: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-semibold">Subjects</Label>
                    <div className="flex flex-wrap gap-2">
                      {availableSubjects.map((subject) => (
                        <button
                          key={subject}
                          type="button"
                          onClick={() => toggleSubject(subject)}
                          className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                            newExam.subjects.includes(subject)
                              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105'
                              : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-indigo-300'
                          }`}
                        >
                          {subject}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowCreateExam(false);
                        setNewExam({ name: '', type: 'unit-test', date: '', subjects: [] });
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateExam}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Create Exam
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Tabs for Active and Past Exams */}
            <Tabs defaultValue="active">
              <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-indigo-100/80 to-purple-100/80 p-2 rounded-2xl">
                <TabsTrigger value="active" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-2xl font-bold">
                  Active Exams ({activeExams.length})
                </TabsTrigger>
                <TabsTrigger value="past" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-2xl font-bold">
                  Past Exams ({pastExams.length})
                </TabsTrigger>
                <TabsTrigger value="analytics" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-2xl font-bold">
                  Analytics
                </TabsTrigger>
              </TabsList>

              {/* Active Exams */}
              <TabsContent value="active" className="mt-6">
                {activeExams.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeExams.map((exam) => (
                      <ExamCard
                        key={exam.id}
                        exam={exam}
                        studyPlan={studyPlan}
                        onCreateCrashCourse={createCrashCourse}
                        onDelete={handleDeleteExam}
                      />
                    ))}
                  </div>
                ) : (
                  <Card className="p-12 text-center bg-gradient-to-br from-slate-50 to-slate-100">
                    <Calendar className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                    <h3 className="text-xl font-bold text-slate-700 mb-2">No Active Exams</h3>
                    <p className="text-slate-500 mb-6">Add your upcoming exams to get personalized preparation plans</p>
                  </Card>
                )}
              </TabsContent>

              {/* Past Exams */}
              <TabsContent value="past" className="mt-6">
                {pastExams.length > 0 ? (
                  <div className="space-y-3">
                    {pastExams.map((exam) => (
                      <Card key={exam.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold">{exam.name}</h4>
                            <p className="text-sm text-slate-600">{exam.date}</p>
                          </div>
                          <Badge className="bg-slate-200 text-slate-700">Completed</Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-12 text-center">
                    <FileText className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500">No past exams yet</p>
                  </Card>
                )}
              </TabsContent>

              {/* Analytics */}
              <TabsContent value="analytics" className="mt-6">
                <ExamAnalytics exams={exams} studyPlan={studyPlan} />
              </TabsContent>
            </Tabs>
          </div>
        </Card>
      </div>

      {/* Active Crash Courses */}
      {studyPlan.crashCourses && studyPlan.crashCourses.length > 0 && (
        <div className="group relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-500 rounded-[32px] opacity-20 blur-xl group-hover:opacity-30 transition duration-500"></div>
          <Card className="relative rounded-[30px] bg-white/95 backdrop-blur-2xl shadow-2xl border-2 border-white/60 p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Active Crash Courses
            </h3>
            <div className="space-y-4">
              {studyPlan.crashCourses.filter((c) => !c.completed).map((course) => (
                <CrashCourseCard key={course.id} course={course} />
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Study Tips & Resources */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="group relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-[32px] opacity-20 blur-xl group-hover:opacity-30 transition duration-500"></div>
          <Card className="relative rounded-[30px] bg-white/95 backdrop-blur-2xl shadow-2xl border-2 border-white/60 p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Exam Preparation Tips
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-slate-700 font-medium">Start revision at least 2 weeks before the exam</span>
              </li>
              <li className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-slate-700 font-medium">Focus on weak topics first, then strengthen strong areas</span>
              </li>
              <li className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-slate-700 font-medium">Take regular mock tests to assess your preparation</span>
              </li>
              <li className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-slate-700 font-medium">Maintain good sleep and avoid last-minute cramming</span>
              </li>
            </ul>
          </Card>
        </div>

        <div className="group relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 to-pink-500 rounded-[32px] opacity-20 blur-xl group-hover:opacity-30 transition duration-500"></div>
          <Card className="relative rounded-[30px] bg-white/95 backdrop-blur-2xl shadow-2xl border-2 border-white/60 p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Button className="w-full justify-start bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 hover:from-purple-200 hover:to-pink-200 border-2 border-purple-200">
                <Download className="w-4 h-4 mr-2" />
                Download Study Materials
              </Button>
              <Button className="w-full justify-start bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 hover:from-blue-200 hover:to-cyan-200 border-2 border-blue-200">
                <FileText className="w-4 h-4 mr-2" />
                Generate Practice Tests
              </Button>
              <Button className="w-full justify-start bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 hover:from-green-200 hover:to-emerald-200 border-2 border-green-200">
                <Award className="w-4 h-4 mr-2" />
                View Past Performance
              </Button>
              <Button className="w-full justify-start bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 hover:from-orange-200 hover:to-amber-200 border-2 border-orange-200">
                <RefreshCw className="w-4 h-4 mr-2" />
                Revise Weak Topics
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const ExamCard: React.FC<{
  exam: Exam;
  studyPlan: any;
  onCreateCrashCourse: (examId: string, priority: any) => void;
  onDelete: (examId: string) => void;
}> = ({ exam, studyPlan, onCreateCrashCourse, onDelete }) => {
  const daysUntil = getDaysUntilExam(exam.date);
  const isUrgent = daysUntil <= 14;
  const isVeryUrgent = daysUntil <= 7;

  const completedSessions = Object.values(studyPlan.dailyPlans)
    .flatMap((day: any) => day.sessions)
    .filter((s: any) => s.status === 'completed');

  const mockScores = (studyPlan.mockTests || [])
    .filter((mt: any) => mt.examId === exam.id)
    .flatMap((mt: any) => mt.attempts.map((a: any) => a.percentage));

  const syllabusTrackers = calculateSyllabusCoverage(exam, completedSessions);
  const readiness = calculateExamReadiness(exam, syllabusTrackers, mockScores);

  const getReadinessColor = () => {
    if (readiness.overallReadiness >= 80) return 'from-green-500 to-emerald-600';
    if (readiness.overallReadiness >= 60) return 'from-blue-500 to-cyan-600';
    if (readiness.overallReadiness >= 40) return 'from-yellow-500 to-amber-600';
    return 'from-red-500 to-rose-600';
  };

  const getUrgencyStyle = () => {
    if (isVeryUrgent) return 'border-4 border-red-400 bg-red-50/80';
    if (isUrgent) return 'border-2 border-orange-300 bg-orange-50/80';
    return 'border border-slate-200';
  };

  return (
    <Card className={`p-6 ${getUrgencyStyle()} hover:shadow-2xl transition-all duration-300`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1">{exam.name}</h3>
          <div className="flex items-center gap-2">
            <Badge className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border border-indigo-200 capitalize">
              {exam.type.replace('-', ' ')}
            </Badge>
            <span className="text-sm text-slate-600">{exam.date}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge className={`${
            isVeryUrgent 
              ? 'bg-red-100 text-red-800 border-2 border-red-300 animate-pulse' 
              : isUrgent 
              ? 'bg-orange-100 text-orange-800' 
              : 'bg-blue-100 text-blue-800'
          } font-bold`}>
            {daysUntil} {daysUntil === 1 ? 'day' : 'days'}
          </Badge>
          <button
            onClick={() => onDelete(exam.id)}
            className="text-slate-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Readiness Score */}
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-slate-700">Exam Readiness</span>
            <span className={`text-3xl font-black bg-gradient-to-r ${getReadinessColor()} bg-clip-text text-transparent`}>
              {readiness.overallReadiness}%
            </span>
          </div>
          <div className="h-4 bg-slate-100 rounded-full overflow-hidden border-2 border-slate-200">
            <div
              className={`h-full bg-gradient-to-r ${getReadinessColor()} transition-all duration-500 relative overflow-hidden`}
              style={{ width: `${readiness.overallReadiness}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
            </div>
          </div>
          <p className="text-xs text-slate-600 mt-2 font-medium">{readiness.recommendation}</p>
        </div>

        {/* Subject Readiness */}
        <div>
          <p className="text-sm font-bold text-slate-700 mb-2">Subject-wise Progress</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(readiness.subjectReadiness).slice(0, 4).map(([subjectId, score]) => (
              <div key={subjectId} className="p-3 bg-gradient-to-br from-white to-slate-50 rounded-xl border-2 border-slate-200">
                <p className="text-xs text-slate-600 capitalize font-semibold">{subjectId}</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-xl font-black text-indigo-600">{score}%</p>
                  <div className="flex-1">
                    <Progress value={score} className="h-1.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => onCreateCrashCourse(exam.id, 'high-priority-topics')}
            size="sm"
            className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white font-bold"
          >
            <Zap className="w-4 h-4 mr-1" />
            Crash Course
          </Button>
          <Button
            onClick={() => onCreateCrashCourse(exam.id, 'revision-only')}
            size="sm"
            className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-bold"
          >
            <BookOpen className="w-4 h-4 mr-1" />
            Revision
          </Button>
        </div>

        {needsIntensivePrep(daysUntil, readiness.overallReadiness) && (
          <div className="flex items-start gap-2 p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border-2 border-red-200">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5 animate-pulse" />
            <p className="text-xs text-red-700 font-bold">
              ⚠️ Intensive preparation needed! Create a crash course immediately for better results.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

const CrashCourseCard: React.FC<{ course: CrashCourse }> = ({ course }) => {
  const progress = Object.values(course.dailyPlans).reduce((acc, day) => {
    const completedSessions = day.sessions.filter((s) => s.status === 'completed').length;
    return acc + completedSessions;
  }, 0);

  const totalSessions = Object.values(course.dailyPlans).reduce(
    (acc, day) => acc + day.sessions.length,
    0
  );

  const progressPercent = totalSessions > 0 ? (progress / totalSessions) * 100 : 0;

  return (
    <div className="p-5 rounded-2xl border-2 border-yellow-300 bg-gradient-to-r from-yellow-50 via-amber-50 to-orange-50 hover:shadow-xl transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-bold text-lg">{course.name}</h4>
          <p className="text-sm text-slate-600 font-semibold">{course.daysRemaining} days remaining</p>
        </div>
        <Badge className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-bold capitalize shadow-lg">
          {course.priority.replace('-', ' ')}
        </Badge>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-700 font-bold">Overall Progress</span>
          <span className="font-black text-amber-600">{Math.round(progressPercent)}%</span>
        </div>
        <div className="h-3 bg-white rounded-full overflow-hidden border-2 border-amber-200">
          <div
            className="h-full bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 transition-all duration-500 relative overflow-hidden"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse"></div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-600 font-semibold">
          {progress} of {totalSessions} sessions completed
        </span>
        <Button size="sm" variant="ghost" className="text-amber-700 hover:text-amber-900 font-bold">
          View Details →
        </Button>
      </div>
    </div>
  );
};

const ExamAnalytics: React.FC<{ exams: Exam[]; studyPlan: any }> = ({ exams, studyPlan }) => {
  const totalExams = exams.length;
  const activeExams = exams.filter(e => e.isActive).length;
  const upcomingInWeek = exams.filter(e => {
    const days = getDaysUntilExam(e.date);
    return days >= 0 && days <= 7;
  }).length;

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-600 font-semibold">Total Exams</p>
              <p className="text-3xl font-black text-slate-900">{totalExams}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-600 font-semibold">Active</p>
              <p className="text-3xl font-black text-slate-900">{activeExams}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-600 font-semibold">This Week</p>
              <p className="text-3xl font-black text-slate-900">{upcomingInWeek}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          Performance Insights
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-white rounded-xl">
            <span className="text-sm font-semibold text-slate-700">Average Readiness Score</span>
            <span className="text-xl font-black text-green-600">72%</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-white rounded-xl">
            <span className="text-sm font-semibold text-slate-700">Crash Courses Completed</span>
            <span className="text-xl font-black text-blue-600">5</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-white rounded-xl">
            <span className="text-sm font-semibold text-slate-700">Mock Tests Taken</span>
            <span className="text-xl font-black text-purple-600">12</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
