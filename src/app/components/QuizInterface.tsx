import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { useStudyPlan } from '../context/StudyPlanContext';
import { Brain, Clock, CheckCircle2, XCircle, Award, TrendingUp, Play } from 'lucide-react';
import { QuizQuestion, QuizAttempt } from '../types';
import { generateQuizForTopic, calculateQuizScore, analyzeQuizPerformance } from '../utils/quizGenerator';
import { curriculumData } from '../data/curriculum';
import { toast } from 'sonner';

interface QuizInterfaceProps {
  topicId?: string | null;
  subjectId?: string | null;
  chapterId?: string | null;
  subjectName?: string;
  chapterName?: string;
  topicName?: string;
}

export const QuizInterface: React.FC<QuizInterfaceProps> = ({ 
  topicId, 
  subjectId, 
  chapterId,
  subjectName,
  chapterName,
  topicName 
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
        topic: topic.name,
        reason: `Quiz score: ${score}% - ${type === 'compulsory' ? 'Automatic rescheduling' : 'Student requested practice'}`,
        date: targetDateStr,
        sessionType: 'Revision Session'
      }
    });

    toast.success(`✅ Revision session scheduled for ${targetDate.toLocaleDateString()}`, {
      duration: 4000,
    });
  };

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
        {/* Recent Attempts */}
        {recentAttempts.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              Recent Quiz Scores
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recentAttempts.slice(-8).reverse().map((attempt) => (
                <div key={attempt.id} className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-indigo-200">
                  <p className="text-3xl font-bold text-indigo-600">{attempt.score}%</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {new Date(attempt.completedAt || '').toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Setup Quiz */}
        <Card className="p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-500" />
            Attempt a Quiz
          </h2>

          <div className="space-y-6">
            {/* Subject Selection */}
            <div>
              <label className="block text-sm font-semibold mb-2">Select Subject</label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="">-- Select a subject --</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Chapter Selection */}
            <div>
              <label className="block text-sm font-semibold mb-2">Select Chapter</label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                value={selectedChapter}
                onChange={(e) => setSelectedChapter(e.target.value)}
              >
                <option value="">-- Select a chapter --</option>
                {subjects.find((s) => s.id === selectedSubject)?.chapters.map((chapter) => (
                  <option key={chapter.id} value={chapter.id}>
                    {chapter.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Topic Selection */}
            <div>
              <label className="block text-sm font-semibold mb-2">Select Topic</label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
              >
                <option value="">-- Select a topic --</option>
                {subjects.find((s) => s.id === selectedSubject)?.chapters.find((c) => c.id === selectedChapter)?.topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-semibold mb-2">Difficulty</label>
              <div className="flex gap-3">
                <Button
                  variant={difficulty === 'easy' ? 'default' : 'outline'}
                  onClick={() => setDifficulty('easy')}
                  className="flex-1"
                >
                  😊 Easy
                </Button>
                <Button
                  variant={difficulty === 'medium' ? 'default' : 'outline'}
                  onClick={() => setDifficulty('medium')}
                  className="flex-1"
                >
                  😐 Medium
                </Button>
                <Button
                  variant={difficulty === 'hard' ? 'default' : 'outline'}
                  onClick={() => setDifficulty('hard')}
                  className="flex-1"
                >
                  😰 Hard
                </Button>
              </div>
            </div>

            {/* Number of Questions */}
            <div>
              <label className="block text-sm font-semibold mb-2">Number of Questions: {questionCount}</label>
              <input
                type="range"
                min="5"
                max="20"
                step="5"
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>5</span>
                <span>10</span>
                <span>15</span>
                <span>20</span>
              </div>
            </div>

            <Button onClick={startQuiz} className="w-full gap-2" size="lg">
              <Play className="w-5 h-5" />
              Start Quiz
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (quizState === 'in-progress') {
    const currentQuestion = currentQuestions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / currentQuestions.length) * 100;

    return (
      <div className="space-y-6">
        {/* Progress */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">
              Question {currentQuestionIndex + 1} of {currentQuestions.length}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </Card>

        {/* Question Card */}
        <Card className="p-8">
          <Badge className="mb-4 bg-purple-100 text-purple-800">
            {currentQuestion.difficulty.toUpperCase()}
          </Badge>

          <h3 className="text-xl font-bold mb-6">{currentQuestion.question}</h3>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                  answers[currentQuestionIndex] === index
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      answers[currentQuestionIndex] === index
                        ? 'border-indigo-500 bg-indigo-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {answers[currentQuestionIndex] === index && (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            variant="outline"
          >
            Previous
          </Button>

          <div className="flex gap-2">
            {currentQuestions.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  answers[index] !== -1
                    ? 'bg-indigo-500'
                    : index === currentQuestionIndex
                    ? 'bg-gray-400'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {currentQuestionIndex === currentQuestions.length - 1 ? (
            <Button onClick={submitQuiz} className="gap-2">
              <Award className="w-4 h-4" />
              Submit Quiz
            </Button>
          ) : (
            <Button onClick={handleNext}>Next</Button>
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
    <div className="space-y-6">
      {/* Results */}
      <Card className="p-8 text-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <Award className="w-16 h-16 mx-auto text-indigo-500 mb-4" />
        <h2 className="text-3xl font-bold mb-2">Quiz Completed!</h2>
        <p className="text-6xl font-bold text-indigo-600 my-6">{lastAttempt.score}%</p>
        <p className="text-gray-600 mb-4">
          You answered {correctCount} out of {lastAttempt.questions.length} questions correctly
        </p>
        <p className="text-sm text-gray-500">
          Time taken: {Math.floor(lastAttempt.timeSpent / 60)}m {lastAttempt.timeSpent % 60}s
        </p>
      </Card>

      {/* Answers Review */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">Review Answers</h3>
        <div className="space-y-4">
          {lastAttempt.questions.map((question, index) => {
            const isCorrect = lastAttempt.answers[index] === question.correctAnswer;
            return (
              <div
                key={question.id}
                className={`p-4 rounded-lg border-2 ${
                  isCorrect ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
                }`}
              >
                <div className="flex items-start gap-3 mb-2">
                  {isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold mb-2">{question.question}</p>
                    <p className="text-sm text-gray-700 mb-1">
                      Your answer: {question.options[lastAttempt.answers[index]]}
                    </p>
                    {!isCorrect && (
                      <p className="text-sm text-green-700 font-semibold">
                        Correct answer: {question.options[question.correctAnswer]}
                      </p>
                    )}
                    {question.explanation && (
                      <p className="text-sm text-gray-600 mt-2 italic">{question.explanation}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Button onClick={resetQuiz} className="w-full" size="lg">
        Take Another Quiz
      </Button>
    </div>
  );
};