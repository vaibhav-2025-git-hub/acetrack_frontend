import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { useStudyPlan } from '../context/StudyPlanContext';
import { Brain, Clock, CheckCircle2, XCircle, Award, TrendingUp, Play } from 'lucide-react';
import { QuizQuestion, QuizAttempt } from '../types';
import { generateQuizForTopic, calculateQuizScore, analyzeQuizPerformance } from '../utils/quizGenerator';
import { curriculumData } from '../data/curriculum';
import { quizzesAPI } from '../services/api';
import { toast } from 'sonner';

interface QuizInterfaceProps {
  topicId?: string | null;
  subjectId?: string | null;
  chapterId?: string | null;
  subjectName?: string;
  chapterName?: string;
  topicName?: string;
  quizId?: string | null;
  onComplete?: (score: number, timeSpent: number) => void;
}

export const QuizInterface: React.FC<QuizInterfaceProps> = ({
  topicId,
  subjectId,
  chapterId,
  subjectName,
  chapterName,
  topicName,
  quizId,
  onComplete
}) => {
  const { studyPlan, setStudyPlan, userProfile, addScheduleChange } = useStudyPlan();
  const [quizState, setQuizState] = useState<'setup' | 'in-progress' | 'completed'>('setup');
  const [currentQuestions, setCurrentQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>(subjectId || '');
  const [selectedChapter, setSelectedChapter] = useState<string>(chapterId || '');
  const [selectedTopic, setSelectedTopic] = useState<string>(topicId || '');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questionCount, setQuestionCount] = useState(5);
  const [facultyQuizzes, setFacultyQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false); // Added loading state
  const [quiz, setQuiz] = useState<any>(null); // Added quiz state for faculty quizzes
  const [timeLeft, setTimeLeft] = useState<number | null>(null); // Added timeLeft state

  useEffect(() => {
    if (quizId) { // Only fetch if quizId is provided
      const fetchQuiz = async () => {
        try {
          setLoading(true);
          // Use the new start endpoint to get randomized questions
          const response = await quizzesAPI.start(quizId);

          if (response.success) {
            const fetchedQuiz = response.data;
            setQuiz(fetchedQuiz);
            const questions: QuizQuestion[] = fetchedQuiz.questions.map((q: any) => ({
              id: q.id.toString(),
              subjectId: fetchedQuiz.subject,
              difficulty: q.difficulty,
              question: q.question,
              options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
              correctAnswer: q.correct_answer,
              explanation: q.explanation
            }));
            setCurrentQuestions(questions);
            setAnswers(new Array(questions.length).fill(-1));
            setCurrentQuestionIndex(0);
            setStartTime(new Date());
            setQuizState('in-progress');
            setTimeLeft(fetchedQuiz.time_limit ? fetchedQuiz.time_limit * 60 : 30 * 60); // Default 30 mins if not set
          } else {
            toast.error('Failed to load quiz');
            onComplete?.(0, 0); // Exit
          }
        } catch (error) {
          console.error('Error fetching quiz:', error);
          toast.error('Error loading quiz');
          onComplete?.(0, 0);
        } finally {
          setLoading(false);
        }
      };

      fetchQuiz();
    } else { // Original logic for loading faculty quizzes if no specific quizId is provided
      const loadFacultyQuizzes = async () => {
        try {
          const res = await quizzesAPI.getAll();
          if (res.success) setFacultyQuizzes(res.data);
        } catch (e) {
          console.error("Failed to load faculty quizzes");
        }
      };
      loadFacultyQuizzes();
    }
  }, [quizId, onComplete]); // Added quizId and onComplete to dependencies

  const startFacultyQuiz = (quiz: any) => {
    if (!quiz.questions || quiz.questions.length === 0) {
      toast.error("This quiz has no questions yet.");
      return;
    }

    const questions: QuizQuestion[] = quiz.questions.map((q: any) => ({
      id: q.id.toString(),
      subjectId: quiz.subject,
      difficulty: q.difficulty,
      question: q.question,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
      correctAnswer: q.correct_answer,
      explanation: q.explanation
    }));

    setCurrentQuestions(questions);
    setAnswers(new Array(questions.length).fill(-1));
    setCurrentQuestionIndex(0);
    setStartTime(new Date());
    setQuizState('in-progress');
  };

  if (!studyPlan || !userProfile) return null;

  // Get curriculum data
  const boardData = curriculumData.find((b) => b.id === userProfile.board);
  const streamData = boardData?.classes[userProfile.class]?.find((s) => s.id === userProfile.stream);
  const subjects = streamData?.subjects || [];

  const recentAttempts = studyPlan.quizzes || [];

  const startQuiz = () => {
    if (!selectedTopic) {
      toast.error('Please select a topic first');
      return;
    }

    const questions = generateQuizForTopic(
      selectedTopic,
      selectedTopic,
      selectedSubject,
      selectedSubject,
      difficulty,
      questionCount
    );

    setCurrentQuestions(questions);
    setAnswers(new Array(questions.length).fill(-1));
    setCurrentQuestionIndex(0);
    setStartTime(new Date());
    setQuizState('in-progress');
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const submitQuiz = () => {
    if (answers.includes(-1)) {
      toast.error('Please answer all questions before submitting');
      return;
    }

    const endTime = new Date();
    const timeSpent = startTime ? Math.floor((endTime.getTime() - startTime.getTime()) / 1000) : 0;
    const score = calculateQuizScore(currentQuestions, answers);
    const analysis = analyzeQuizPerformance(currentQuestions, answers);

    const attempt: QuizAttempt = {
      id: `quiz-${Date.now()}`,
      quizId: `quiz-${selectedTopic}`,
      topicId: selectedTopic,
      subjectId: currentQuestions[0].subjectId,
      questions: currentQuestions,
      answers,
      score,
      startedAt: startTime?.toISOString() || new Date().toISOString(),
      completedAt: endTime.toISOString(),
      timeSpent,
    };

    setStudyPlan({
      ...studyPlan,
      quizzes: [...recentAttempts, attempt],
    });

    // Save to backend
    saveQuizAttemptToBackend(attempt);

    setQuizState('completed');

    // Handle rescheduling based on score
    if (score < 50) {
      // Compulsory reschedule
      toast.warning(`Quiz Score: ${score}% - Topic will be rescheduled for revision!`, {
        duration: 5000,
      });
      scheduleRevision(selectedTopic, selectedSubject, 'compulsory', score);
    } else if (score >= 50 && score <= 65) {
      // Ask student if they want to reschedule
      toast.warning(`Quiz Score: ${score}% - Would you like to reschedule this topic for more practice?`, {
        duration: 8000,
        action: {
          label: 'Yes, Reschedule',
          onClick: () => scheduleRevision(selectedTopic, selectedSubject, 'optional', score),
        },
      });
    } else {
      toast.success(`Quiz completed! Excellent score: ${score}%`);
    }
  };

  const scheduleRevision = (topicId: string, subjectId: string, type: 'compulsory' | 'optional', score: number) => {
    // Find the topic details
    const subject = subjects.find(s => s.id === subjectId);
    const chapter = subject?.chapters.find(c => c.topics.some(t => t.id === topicId));
    const topic = chapter?.topics.find(t => t.id === topicId);

    if (!topic || !subject) {
      toast.error('Could not reschedule topic');
      return;
    }

    // Find next available day (3-5 days from now for better retention)
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + (type === 'compulsory' ? 2 : 4)); // Sooner for compulsory
    const targetDateStr = targetDate.toISOString().split('T')[0];

    // Create or update the daily plan for that date
    const updatedPlan = { ...studyPlan };

    if (!updatedPlan.dailyPlans[targetDateStr]) {
      updatedPlan.dailyPlans[targetDateStr] = {
        date: targetDateStr,
        sessions: [],
        totalHours: 0,
        completedHours: 0,
        burnoutLevel: 0,
      };
    }

    const dailyPlan = updatedPlan.dailyPlans[targetDateStr];

    // Add revision session
    const revisionSession = {
      id: `revision-${Date.now()}`,
      topicId: topic.id,
      topicName: topic.name,
      chapterId: chapter?.id || '',
      chapterName: chapter?.name || '',
      subjectId: subject.id,
      subjectName: subject.name,
      duration: 45, // 45 minutes for revision
      status: 'not-started' as const,
      isRevision: true,
      notes: `Revision due to quiz score: ${score}%`,
      date: targetDateStr,
      startTime: '09:00',
      completed: false,
      completionPercentage: 0,
    };

    dailyPlan.sessions.push(revisionSession);
    dailyPlan.totalHours = dailyPlan.sessions.reduce((sum, s) => sum + s.duration / 60, 0);

    setStudyPlan(updatedPlan);

    // Track in schedule changes using the context function
    addScheduleChange({
      type: 'adaptation',
      title: type === 'compulsory' ? 'Topic Rescheduled - Low Quiz Score' : 'Topic Rescheduled - Practice Needed',
      description: `Added revision session for "${topic.name}" based on quiz performance`,
      details: {
        subject: subject.name,
        reason: `${topic.name}: Quiz score ${score}% - ${type === 'compulsory' ? 'Automatic rescheduling' : 'Student requested practice'}`,
      }
    });

    toast.success(`✅ Revision session scheduled for ${targetDate.toLocaleDateString()}`, {
      duration: 4000,
    });
  };

  const saveQuizAttemptToBackend = async (attempt: QuizAttempt) => {
    try {
      await quizzesAPI.submit({
        subjectId: attempt.subjectId,
        topicId: attempt.topicId,
        totalQuestions: attempt.questions.length,
        correctAnswers: attempt.answers.filter((a, i) => a === attempt.questions[i].correctAnswer).length,
        score: attempt.score,
        timeTaken: attempt.timeSpent,
        quizData: { questions: attempt.questions, answers: attempt.answers }
      });
      // toast.success("Result saved to server"); // Optional, maybe too noisy
    } catch (e) {
      console.error("Failed to save quiz attempt", e);
    }
  };

  // Trigger save when quiz completes
  useEffect(() => {
    if (quizState === 'completed' && recentAttempts.length > 0) {
      const lastAttempt = recentAttempts[recentAttempts.length - 1];
      // Ensure we haven't already saved it (simple check: if it's the very last one added)
      // Better: submitQuiz calls this directly.
    }
  }, [quizState, recentAttempts]);

  // Better approach: Call it in submitQuiz directly


  const resetQuiz = () => {
    setQuizState('setup');
    setCurrentQuestions([]);
    setAnswers([]);
    setCurrentQuestionIndex(0);
    setStartTime(null);
  };

  if (quizState === 'setup') {
    return (
      <div className="space-y-6">
        {/* Assigned Quizzes */}
        <div className="group relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 via-fuchsia-500 to-pink-500 rounded-[24px] opacity-20 group-hover:opacity-40 blur transition duration-500"></div>
          <Card className="relative p-6 rounded-[22px] bg-white/90 backdrop-blur-xl border-2 border-purple-100 shadow-xl overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
            <h3 className="text-xl font-black mb-6 flex items-center gap-3 tracking-tight text-slate-900">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-xl">
                <Award className="w-5 h-5" />
              </div>
              Assigned Quizzes from Faculty
            </h3>
            {facultyQuizzes.length === 0 ? (
              <div className="text-center p-8 bg-slate-50/50 rounded-xl border border-slate-100/50 border-dashed">
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No active assignments</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {facultyQuizzes.map((quiz) => (
                  <div key={quiz.id} className="p-5 rounded-[18px] border-2 border-purple-50 bg-gradient-to-br from-white to-purple-50/50 hover:border-purple-200 hover:shadow-lg transition-all flex justify-between items-center group/card cursor-pointer">
                    <div>
                      <h4 className="font-black text-slate-800 group-hover/card:text-purple-700 transition-colors">{quiz.title}</h4>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="bg-white border-purple-100 text-purple-600 font-bold text-[10px] uppercase tracking-wider">{quiz.subject}</Badge>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest"><Clock className="w-3 h-3 inline mr-1" />{quiz.questions?.length || 0} Qs</span>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => startFacultyQuiz(quiz)} className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md shadow-purple-200 transition-all hover:scale-105">
                      Start <Play className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Recent Attempts */}
        {recentAttempts.length > 0 && (
          <div className="group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 rounded-[24px] opacity-20 group-hover:opacity-40 blur transition duration-500"></div>
            <Card className="relative p-6 rounded-[22px] bg-white/90 backdrop-blur-xl border-2 border-indigo-50 shadow-xl overflow-hidden">
              <h3 className="text-xl font-black mb-6 flex items-center gap-3 tracking-tight text-slate-900">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                  <TrendingUp className="w-5 h-5" />
                </div>
                Recent Quiz Scores
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {recentAttempts.slice(-8).reverse().map((attempt) => (
                  <div key={attempt.id} className="p-5 rounded-[18px] bg-gradient-to-br from-indigo-50/50 to-blue-50/50 border-2 border-indigo-100/50 hover:border-indigo-200 transition-colors flex flex-col items-center justify-center relative overflow-hidden group/score">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-white/40 rounded-full blur-xl -mr-8 -mt-8 group-hover/score:scale-150 transition-transform"></div>
                    <p className="text-3xl font-black text-indigo-600 drop-shadow-sm">{attempt.score}%</p>
                    <p className="text-[10px] font-bold text-indigo-400 mt-2 uppercase tracking-widest bg-white/80 px-2 py-0.5 rounded-full">
                      {new Date(attempt.completedAt || '').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Setup Quiz */}
        <div className="group relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 rounded-[28px] opacity-20 group-hover:opacity-40 blur transition duration-500"></div>
          <Card className="relative p-8 rounded-[26px] bg-white/95 backdrop-blur-2xl border-2 border-teal-100/50 shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl -ml-32 -mt-32 pointer-events-none"></div>

            <h2 className="text-2xl font-black mb-8 flex items-center gap-3 tracking-tight text-slate-900">
              <div className="p-2.5 bg-gradient-to-br from-emerald-400 to-teal-500 text-white rounded-xl shadow-lg shadow-teal-500/30">
                <Brain className="w-6 h-6" />
              </div>
              Create Custom Quiz
            </h2>

            <div className="space-y-8 relative z-10">
              <div className="grid md:grid-cols-3 gap-6">
                {/* Subject Selection */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Subject</label>
                  <select
                    className="w-full p-4 border-2 border-slate-100 rounded-xl focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 font-bold text-slate-700 bg-slate-50/50 transition-all outline-none appearance-none"
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                  >
                    <option value="">-- Select Subject --</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>{subject.name}</option>
                    ))}
                  </select>
                </div>

                {/* Chapter Selection */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Chapter</label>
                  <select
                    className="w-full p-4 border-2 border-slate-100 rounded-xl focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 font-bold text-slate-700 bg-slate-50/50 transition-all outline-none appearance-none disabled:opacity-50"
                    value={selectedChapter}
                    onChange={(e) => setSelectedChapter(e.target.value)}
                    disabled={!selectedSubject}
                  >
                    <option value="">-- Select Chapter --</option>
                    {subjects.find((s) => s.id === selectedSubject)?.chapters.map((chapter) => (
                      <option key={chapter.id} value={chapter.id}>{chapter.name}</option>
                    ))}
                  </select>
                </div>

                {/* Topic Selection */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Topic</label>
                  <select
                    className="w-full p-4 border-2 border-slate-100 rounded-xl focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 font-bold text-slate-700 bg-slate-50/50 transition-all outline-none appearance-none disabled:opacity-50"
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    disabled={!selectedChapter}
                  >
                    <option value="">-- Select Topic --</option>
                    {subjects.find((s) => s.id === selectedSubject)?.chapters.find((c) => c.id === selectedChapter)?.topics.map((topic) => (
                      <option key={topic.id} value={topic.id}>{topic.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Difficulty */}
              <div className="bg-slate-50/50 p-6 rounded-2xl border-2 border-slate-100/50">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-3 block">Target Difficulty</label>
                <div className="flex gap-4">
                  <Button
                    variant={difficulty === 'easy' ? 'default' : 'outline'}
                    onClick={() => setDifficulty('easy')}
                    className={`flex-1 flex flex-col items-center justify-center gap-1 h-20 rounded-xl border-2 transition-all ${difficulty === 'easy' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-lg shadow-emerald-500/20 scale-105' : 'border-slate-200 text-slate-500 hover:border-emerald-200 hover:bg-emerald-50/30'}`}
                  >
                    <span className="text-xl">😊</span>
                    <span className="font-black text-xs uppercase tracking-wider">Easy</span>
                  </Button>
                  <Button
                    variant={difficulty === 'medium' ? 'default' : 'outline'}
                    onClick={() => setDifficulty('medium')}
                    className={`flex-1 flex flex-col items-center justify-center gap-1 h-20 rounded-xl border-2 transition-all ${difficulty === 'medium' ? 'bg-amber-50 border-amber-500 text-amber-700 shadow-lg shadow-amber-500/20 scale-105' : 'border-slate-200 text-slate-500 hover:border-amber-200 hover:bg-amber-50/30'}`}
                  >
                    <span className="text-xl">🤔</span>
                    <span className="font-black text-xs uppercase tracking-wider">Medium</span>
                  </Button>
                  <Button
                    variant={difficulty === 'hard' ? 'default' : 'outline'}
                    onClick={() => setDifficulty('hard')}
                    className={`flex-1 flex flex-col items-center justify-center gap-1 h-20 rounded-xl border-2 transition-all ${difficulty === 'hard' ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-lg shadow-rose-500/20 scale-105' : 'border-slate-200 text-slate-500 hover:border-rose-200 hover:bg-rose-50/30'}`}
                  >
                    <span className="text-xl">🥵</span>
                    <span className="font-black text-xs uppercase tracking-wider">Hard</span>
                  </Button>
                </div>
              </div>

              {/* Number of Questions */}
              <div className="bg-slate-50/50 p-6 rounded-2xl border-2 border-slate-100/50">
                <div className="flex justify-between items-center mb-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Length</label>
                  <Badge variant="outline" className="font-black bg-white border-teal-200 text-teal-700">{questionCount} Questions</Badge>
                </div>
                <input
                  type="range"
                  min="5"
                  max="20"
                  step="5"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                  className="w-full accent-teal-500 cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none focus:outline-none"
                />
                <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 mt-2 px-1">
                  <span>Snack</span>
                  <span>Standard</span>
                  <span>Deep dive</span>
                  <span>Exam</span>
                </div>
              </div>

              <Button
                onClick={startQuiz}
                className="w-full h-14 rounded-xl text-lg font-black bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 shadow-xl shadow-teal-500/30 transition-all hover:scale-[1.02] border-none"
              >
                Launch Intelligence Test <Play className="w-5 h-5 ml-2 fill-white" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (quizState === 'in-progress') {
    const currentQuestion = currentQuestions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / currentQuestions.length) * 100;

    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Progress Header */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 rounded-2xl opacity-20 blur transition duration-500 animate-pulse"></div>
          <Card className="relative p-5 rounded-[20px] bg-white/90 backdrop-blur-xl border-2 border-indigo-50 shadow-xl overflow-hidden flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 border-2 border-indigo-200 flex items-center justify-center font-black text-indigo-700 shadow-inner">
                {currentQuestionIndex + 1}
              </div>
              <div>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Question {currentQuestionIndex + 1} of {currentQuestions.length}</span>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="bg-indigo-50 border-indigo-200 text-indigo-700 font-bold text-[10px] uppercase tracking-wider hidden sm:flex">
                    {currentQuestion.difficulty}
                  </Badge>
                  <span className="text-sm font-bold text-slate-700">{Math.round(progress)}% Complete</span>
                </div>
              </div>
            </div>

            <div className="w-1/3 max-w-[200px]">
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 rounded-full relative transition-all duration-700 ease-out"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Question Card */}
        <div className="group relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-slate-200 via-purple-200 to-slate-200 rounded-[32px] opacity-50 blur-lg transition duration-500"></div>
          <Card className="relative p-8 md:p-12 rounded-[30px] bg-white/95 backdrop-blur-2xl border-2 border-white/60 shadow-2xl">
            <h3 className="text-2xl md:text-3xl font-black mb-10 text-slate-900 leading-tight tracking-tight">
              {currentQuestion.question}
            </h3>

            <div className="space-y-4">
              {currentQuestion.options.map((option, index) => {
                const isSelected = answers[currentQuestionIndex] === index;
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full p-5 text-left rounded-[20px] border-2 transition-all duration-300 relative overflow-hidden group/btn ${isSelected
                      ? 'bg-indigo-50 border-indigo-500 shadow-lg shadow-indigo-500/20 scale-[1.02]'
                      : 'bg-white border-slate-100 hover:border-indigo-300 hover:bg-slate-50 hover:shadow-md hover:scale-[1.01]'
                      }`}
                  >
                    {isSelected && <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>}
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected
                          ? 'border-indigo-500 bg-indigo-500 text-white'
                          : 'border-slate-300 text-slate-400 group-hover/btn:border-indigo-300'
                          }`}
                      >
                        {isSelected ? <CheckCircle2 className="w-5 h-5" /> : <span className="text-xs font-bold">{String.fromCharCode(65 + index)}</span>}
                      </div>
                      <span className={`text-lg transition-colors font-medium ${isSelected ? 'text-indigo-900 font-bold' : 'text-slate-700'}`}>
                        {option}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between bg-white/50 backdrop-blur block p-4 rounded-[24px] border border-slate-200 shadow-sm">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            variant="outline"
            className="rounded-xl h-12 px-6 font-bold border-2 hover:bg-slate-100 transition-all text-slate-600"
          >
            Previous
          </Button>

          {/* Dots Indicator hidden on mobile for space */}
          <div className="hidden md:flex gap-2.5 bg-slate-100/50 p-2.5 rounded-full border border-slate-200/50">
            {currentQuestions.map((_, index) => (
              <div
                key={index}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${answers[index] !== -1
                  ? 'bg-indigo-500 scale-110 shadow-[0_0_8px_rgba(99,102,241,0.6)]'
                  : index === currentQuestionIndex
                    ? 'bg-purple-300 scale-125 ring-2 ring-purple-200 ring-offset-1'
                    : 'bg-slate-200'
                  }`}
              />
            ))}
          </div>

          {currentQuestionIndex === currentQuestions.length - 1 ? (
            <Button
              onClick={submitQuiz}
              className="rounded-xl h-12 px-6 font-black bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-lg shadow-emerald-500/30 gap-2 transition-all hover:scale-105 border-none"
            >
              <Award className="w-5 h-5" />
              Submit Quiz
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="rounded-xl h-12 px-8 font-black bg-slate-900 hover:bg-indigo-600 text-white shadow-md gap-2 transition-all hover:scale-105"
            >
              Next <Play className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Completed state
  const lastAttempt = recentAttempts[recentAttempts.length - 1];
  if (!lastAttempt) return null;

  const correctCount = lastAttempt.answers.filter(
    (answer, index) => answer === lastAttempt.questions[index].correctAnswer
  ).length;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Results Hero Card */}
      <div className="group relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 rounded-[32px] opacity-30 group-hover:opacity-50 blur-xl transition duration-700 animate-pulse"></div>
        <Card className="relative p-12 text-center rounded-[30px] bg-white/95 backdrop-blur-2xl border-2 border-teal-100/50 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none"></div>

          <div className="relative z-10 space-y-6">
            <div className="inline-flex p-4 bg-gradient-to-br from-emerald-100 to-teal-100 text-teal-600 rounded-3xl shadow-inner mb-2">
              <Award className="w-16 h-16" />
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Quiz Completed!</h2>

            <div className="py-8">
              <div className="inline-block relative">
                <div className="absolute inset-0 bg-teal-400 blur-2xl opacity-20 rounded-full"></div>
                <p className="relative text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-500 to-teal-600 drop-shadow-sm">
                  {lastAttempt.score}%
                </p>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4 text-slate-600 font-bold max-w-lg mx-auto">
              <div className="bg-slate-50/80 backdrop-blur px-6 py-3 rounded-2xl border border-slate-100 w-full sm:w-auto flex-1">
                <span className="block text-2xl text-emerald-600 mb-1">{correctCount}</span>
                <span className="text-[10px] uppercase tracking-widest text-slate-400">Correct Answers</span>
              </div>
              <div className="bg-slate-50/80 backdrop-blur px-6 py-3 rounded-2xl border border-slate-100 w-full sm:w-auto flex-1">
                <span className="block text-2xl text-slate-700 mb-1">{lastAttempt.questions.length}</span>
                <span className="text-[10px] uppercase tracking-widest text-slate-400">Total Questions</span>
              </div>
              <div className="bg-slate-50/80 backdrop-blur px-6 py-3 rounded-2xl border border-slate-100 w-full sm:w-auto flex-1">
                <span className="block text-2xl text-cyan-600 mb-1">{Math.floor(lastAttempt.timeSpent / 60)}m {lastAttempt.timeSpent % 60}s</span>
                <span className="text-[10px] uppercase tracking-widest text-slate-400">Time Taken</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Answers Review */}
      <div className="space-y-4 relative z-10">
        <h3 className="text-xl font-black text-slate-800 ml-2 flex items-center gap-2">
          <Brain className="w-5 h-5 text-indigo-500" />
          Review Answers
        </h3>
        <div className="grid gap-4">
          {lastAttempt.questions.map((question, index) => {
            const isCorrect = lastAttempt.answers[index] === question.correctAnswer;
            return (
              <Card
                key={question.id}
                className={`p-6 rounded-[24px] border-2 transition-all ${isCorrect
                  ? 'bg-gradient-to-br from-emerald-50/50 to-white border-emerald-100 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-500/10'
                  : 'bg-gradient-to-br from-rose-50/50 to-white border-rose-100 hover:border-rose-300 hover:shadow-lg hover:shadow-rose-500/10'
                  }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`mt-1 p-2 rounded-xl shrink-0 ${isCorrect ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                    {isCorrect ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <XCircle className="w-6 h-6" />
                    )}
                  </div>
                  <div className="flex-1 space-y-4">
                    <p className="font-bold text-slate-800 text-lg leading-snug">
                      <span className="text-slate-400 mr-2">{index + 1}.</span>
                      {question.question}
                    </p>

                    <div className="space-y-2 bg-white/50 p-4 rounded-xl border border-slate-100/50">
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1 shrink-0 w-24">Your Answer</span>
                        <p className={`font-semibold ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {question.options[lastAttempt.answers[index]]}
                        </p>
                      </div>

                      {!isCorrect && (
                        <div className="flex items-start gap-2 pt-2 border-t border-slate-100">
                          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mt-1 shrink-0 w-24">Correct</span>
                          <p className="font-bold text-emerald-700">
                            {question.options[question.correctAnswer]}
                          </p>
                        </div>
                      )}
                    </div>

                    {question.explanation && (
                      <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50">
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 block mb-1">Explanation</span>
                        <p className="text-sm font-medium text-indigo-900 leading-relaxed">{question.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="pt-6 relative z-10 pb-12">
        <Button
          onClick={resetQuiz}
          className="w-full h-16 rounded-2xl text-xl font-black bg-slate-900 hover:bg-slate-800 text-white shadow-xl hover:scale-[1.02] transition-all border-none"
        >
          Take Another Quiz
        </Button>
      </div>
    </div>
  );
};