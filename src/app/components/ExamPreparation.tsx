import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useStudyPlan } from '../context/StudyPlanContext';
import { Calendar, Target, BookOpen, TrendingUp, AlertCircle, CheckCircle2, Clock, Zap, Plus, X, Edit2, Trash2, FileText, Brain, Award } from 'lucide-react';
import { Exam, CrashCourse } from '../types';
import {
  generateCrashCourse,
  calculateSyllabusCoverage,
  calculateExamReadiness,
  getDaysUntilExam,
  needsIntensivePrep,
} from '../utils/examPreparation';
import { toast } from 'sonner';

export const ExamPreparation: React.FC = () => {
  const { studyPlan, setStudyPlan, userProfile } = useStudyPlan();
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [showCreateExam, setShowCreateExam] = useState(false);

  if (!studyPlan || !userProfile) return null;

  const exams = studyPlan.exams || [];
  const activeExams = exams.filter((e) => e.isActive);

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

  return (
    <div className="space-y-6">
      {/* Active Exams Overview */}
      {activeExams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeExams.map((exam) => (
            <ExamCard
              key={exam.id}
              exam={exam}
              studyPlan={studyPlan}
              onCreateCrashCourse={createCrashCourse}
            />
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">No Active Exams</h3>
          <p className="text-gray-500 mb-6">Add your upcoming exams to get personalized preparation plans</p>
          <Button onClick={() => setShowCreateExam(true)}>
            <Calendar className="w-4 h-4 mr-2" />
            Add Exam
          </Button>
        </Card>
      )}

      {/* Create New Exam Modal would go here */}
      {showCreateExam && (
        <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
          <h3 className="text-lg font-bold mb-4">Quick Exam Setup</h3>
          <p className="text-sm text-gray-600 mb-4">
            Feature coming soon! For now, exams are auto-generated based on your curriculum.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowCreateExam(false)}>Close</Button>
            <Button onClick={() => {
              // Create sample exam
              const sampleExam: Exam = {
                id: `exam-${Date.now()}`,
                name: 'Unit Test - ' + userProfile.stream,
                subjectIds: ['physics', 'chemistry', 'mathematics'], // Sample
                date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
                type: 'unit-test',
                syllabusTopics: [],
                isActive: true,
              };

              setStudyPlan({
                ...studyPlan,
                exams: [...exams, sampleExam],
              });

              toast.success('Sample exam created!');
              setShowCreateExam(false);
            }}>
              Create Sample Exam
            </Button>
          </div>
        </Card>
      )}

      {/* Crash Courses */}
      {studyPlan.crashCourses && studyPlan.crashCourses.length > 0 && (
        <Card className="p-6">
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
      )}

      {/* Study Tips */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" />
          Exam Preparation Tips
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <span>Start revision at least 2 weeks before the exam</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <span>Focus on weak topics first, then strengthen strong areas</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <span>Take regular mock tests to assess your preparation</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <span>Maintain good sleep and avoid last-minute cramming</span>
          </li>
        </ul>
      </Card>
    </div>
  );
};

const ExamCard: React.FC<{
  exam: Exam;
  studyPlan: any;
  onCreateCrashCourse: (examId: string, priority: any) => void;
}> = ({ exam, studyPlan, onCreateCrashCourse }) => {
  const daysUntil = getDaysUntilExam(exam.date);
  const isUrgent = daysUntil <= 14;

  // Calculate syllabus coverage
  const completedSessions = Object.values(studyPlan.dailyPlans)
    .flatMap((day: any) => day.sessions)
    .filter((s: any) => s.status === 'completed');

  const mockScores = (studyPlan.mockTests || [])
    .filter((mt: any) => mt.examId === exam.id)
    .flatMap((mt: any) => mt.attempts.map((a: any) => a.percentage));

  const syllabusTrackers = calculateSyllabusCoverage(exam, completedSessions);
  const readiness = calculateExamReadiness(exam, syllabusTrackers, mockScores);

  const readinessColor =
    readiness.overallReadiness >= 80
      ? 'text-green-600'
      : readiness.overallReadiness >= 60
        ? 'text-blue-600'
        : readiness.overallReadiness >= 40
          ? 'text-yellow-600'
          : 'text-red-600';

  return (
    <Card className={`p-6 ${isUrgent ? 'border-2 border-orange-300 bg-orange-50' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-lg">{exam.name}</h3>
          <p className="text-sm text-gray-600 capitalize">{exam.type.replace('-', ' ')}</p>
        </div>
        <Badge className={isUrgent ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}>
          {daysUntil} days
        </Badge>
      </div>

      <div className="space-y-4">
        {/* Readiness Score */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">Exam Readiness</span>
            <span className={`text-2xl font-bold ${readinessColor}`}>
              {readiness.overallReadiness}%
            </span>
          </div>
          <Progress value={readiness.overallReadiness} className="h-2" />
          <p className="text-xs text-gray-600 mt-2">{readiness.recommendation}</p>
        </div>

        {/* Subject Readiness */}
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(readiness.subjectReadiness).slice(0, 4).map(([subjectId, score]) => {
            // Capitalize subject name (convert "physics" to "Physics")
            const subjectName = subjectId.charAt(0).toUpperCase() + subjectId.slice(1);
            return (
              <div key={subjectId} className="p-2 bg-white rounded border border-gray-200">
                <p className="text-xs text-gray-600 font-medium">{subjectName}</p>
                <p className="text-lg font-bold text-indigo-600">{score}%</p>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={() => onCreateCrashCourse(exam.id, 'high-priority-topics')}
            size="sm"
            variant="outline"
            className="flex-1"
          >
            <Zap className="w-4 h-4 mr-1" />
            Crash Course
          </Button>
          <Button
            onClick={() => onCreateCrashCourse(exam.id, 'revision-only')}
            size="sm"
            variant="outline"
            className="flex-1"
          >
            <BookOpen className="w-4 h-4 mr-1" />
            Revision Plan
          </Button>
        </div>

        {needsIntensivePrep(daysUntil, readiness.overallReadiness) && (
          <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-700">
              Intensive preparation needed! Consider creating a crash course immediately.
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
    <div className="p-4 rounded-lg border-2 border-yellow-300 bg-gradient-to-r from-yellow-50 to-amber-50">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-bold">{course.name}</h4>
          <p className="text-sm text-gray-600">{course.daysRemaining} days remaining</p>
        </div>
        <Badge className="bg-yellow-100 text-yellow-800 capitalize">
          {course.priority.replace('-', ' ')}
        </Badge>
      </div>

      <div className="mb-2">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Progress</span>
          <span className="font-semibold">{Math.round(progressPercent)}%</span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      <p className="text-xs text-gray-600">
        {progress} of {totalSessions} sessions completed
      </p>
    </div>
  );
};