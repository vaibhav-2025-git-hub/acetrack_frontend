import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Brain, Clock, Eye, Headphones, Users, Target, Zap, BookOpen, Lightbulb, CheckCircle2, Calculator, MessageSquare, Grid3x3, Puzzle, Sparkles } from 'lucide-react';
import type { LearningSpeed, PsychometricDetails } from '../types';

interface PsychometricTestProps {
  onComplete: (learningSpeed: LearningSpeed, learningStyle: string, details: PsychometricDetails) => void;
}

// Aptitude test questions
const aptitudeQuestions = [
  // NUMERICAL REASONING
  {
    id: 'num1',
    category: 'numerical',
    type: 'aptitude',
    question: 'If a train travels 240 km in 3 hours, what is its average speed in km/h?',
    options: ['60 km/h', '70 km/h', '80 km/h', '90 km/h'],
    correctAnswer: 2,
    timeLimit: 45,
    icon: Calculator,
  },
  {
    id: 'num2',
    category: 'numerical',
    type: 'aptitude',
    question: 'A shirt originally costs ₹800. After a 25% discount, what is the sale price?',
    options: ['₹600', '₹625', '₹650', '₹700'],
    correctAnswer: 0,
    timeLimit: 45,
    icon: Calculator,
  },
  {
    id: 'num3',
    category: 'numerical',
    type: 'aptitude',
    question: 'What is the next number in the sequence: 2, 6, 12, 20, 30, ?',
    options: ['38', '40', '42', '44'],
    correctAnswer: 2,
    timeLimit: 50,
    icon: Calculator,
  },
  // VERBAL REASONING
  {
    id: 'verb1',
    category: 'verbal',
    type: 'aptitude',
    question: 'Choose the word most similar in meaning to "METICULOUS":',
    options: ['Careless', 'Detailed', 'Quick', 'Average'],
    correctAnswer: 1,
    timeLimit: 35,
    icon: MessageSquare,
  },
  {
    id: 'verb2',
    category: 'verbal',
    type: 'aptitude',
    question: 'If "PLANT" is to "GROW" as "SEED" is to:',
    options: ['Soil', 'Water', 'Germinate', 'Tree'],
    correctAnswer: 2,
    timeLimit: 40,
    icon: MessageSquare,
  },
  {
    id: 'verb3',
    category: 'verbal',
    type: 'aptitude',
    question: 'All roses are flowers. Some flowers fade quickly. Therefore:',
    options: [
      'All roses fade quickly',
      'Some roses may fade quickly',
      'No roses fade quickly',
      'Cannot be determined'
    ],
    correctAnswer: 1,
    timeLimit: 50,
    icon: MessageSquare,
  },
  // LOGICAL REASONING
  {
    id: 'log1',
    category: 'logical',
    type: 'aptitude',
    question: 'If all A are B, and all B are C, then:',
    options: [
      'All A are C',
      'All C are A',
      'Some A are not C',
      'No relationship exists'
    ],
    correctAnswer: 0,
    timeLimit: 45,
    icon: Puzzle,
  },
  {
    id: 'log2',
    category: 'logical',
    type: 'aptitude',
    question: 'In a certain code, if "CAT" = 24, "DOG" = 26, what does "RAT" equal?',
    options: ['30', '33', '36', '39'],
    correctAnswer: 1,
    timeLimit: 60,
    icon: Puzzle,
  },
  {
    id: 'log3',
    category: 'logical',
    type: 'aptitude',
    question: 'Find the odd one out: Triangle, Square, Circle, Rectangle, Sphere',
    options: ['Triangle', 'Square', 'Circle', 'Sphere'],
    correctAnswer: 3,
    timeLimit: 40,
    icon: Puzzle,
  },
  // SPATIAL REASONING
  {
    id: 'spat1',
    category: 'spatial',
    type: 'aptitude',
    question: 'A cube has how many edges?',
    options: ['6', '8', '10', '12'],
    correctAnswer: 3,
    timeLimit: 30,
    icon: Grid3x3,
  },
  {
    id: 'spat2',
    category: 'spatial',
    type: 'aptitude',
    question: 'If you rotate "b" 180 degrees, what letter does it resemble?',
    options: ['q', 'd', 'p', 'g'],
    correctAnswer: 0,
    timeLimit: 35,
    icon: Grid3x3,
  },
  {
    id: 'spat3',
    category: 'spatial',
    type: 'aptitude',
    question: 'How many faces does a rectangular prism (cuboid) have?',
    options: ['4', '5', '6', '8'],
    correctAnswer: 2,
    timeLimit: 30,
    icon: Grid3x3,
  },
];

// Learning style questions (simplified)
const styleQuestions = [
  {
    id: 'style1',
    category: 'style',
    type: 'preference',
    question: 'How do you prefer to learn new information?',
    options: [
      { text: 'Reading textbooks and taking notes', value: 'visual-reading', style: 'Visual (Reading/Writing)' },
      { text: 'Watching videos and presentations', value: 'visual-watching', style: 'Visual (Watching)' },
      { text: 'Listening to explanations', value: 'auditory', style: 'Auditory' },
      { text: 'Hands-on practice and experiments', value: 'kinesthetic', style: 'Kinesthetic' },
    ],
    icon: Eye,
  },
  {
    id: 'style2',
    category: 'style',
    type: 'preference',
    question: 'When studying for exams, what helps you most?',
    options: [
      { text: 'Making written summaries', value: 'visual-reading', style: 'Visual (Reading/Writing)' },
      { text: 'Creating mind maps and diagrams', value: 'visual-watching', style: 'Visual (Watching)' },
      { text: 'Discussing topics with others', value: 'auditory', style: 'Auditory' },
      { text: 'Solving practice problems', value: 'kinesthetic', style: 'Kinesthetic' },
    ],
    icon: BookOpen,
  },
  {
    id: 'style3',
    category: 'style',
    type: 'preference',
    question: 'What type of study material do you find most helpful?',
    options: [
      { text: 'Detailed text explanations', value: 'visual-reading', style: 'Visual (Reading/Writing)' },
      { text: 'Infographics and charts', value: 'visual-watching', style: 'Visual (Watching)' },
      { text: 'Audio lectures or podcasts', value: 'auditory', style: 'Auditory' },
      { text: 'Interactive simulations', value: 'kinesthetic', style: 'Kinesthetic' },
    ],
    icon: Headphones,
  },
];

export const PsychometricTest: React.FC<PsychometricTestProps> = ({ onComplete }) => {
  const [currentSection, setCurrentSection] = useState<'intro' | 'aptitude' | 'style' | 'results'>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [aptitudeAnswers, setAptitudeAnswers] = useState<Record<string, { answer: number; timeSpent: number; correct: boolean }>>({});
  const [styleAnswers, setStyleAnswers] = useState<Record<string, any>>({});
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  const allQuestions = currentSection === 'aptitude' ? aptitudeQuestions : styleQuestions;
  const currentQuestion = allQuestions[currentQuestionIndex];
  const totalQuestions = currentSection === 'aptitude' ? aptitudeQuestions.length : styleQuestions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  // Timer for aptitude questions
  useEffect(() => {
    if (currentSection === 'aptitude' && 'timeLimit' in currentQuestion) {
      setQuestionStartTime(Date.now());
      setTimeRemaining(currentQuestion.timeLimit || 60);

      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Auto-submit on timeout
            handleAptitudeAnswer(-1); // -1 indicates timeout/no answer
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentQuestionIndex, currentSection]);

  const handleStartTest = () => {
    setCurrentSection('aptitude');
    setCurrentQuestionIndex(0);
  };

  const handleAptitudeAnswer = (answerIndex: number) => {
    if (!currentQuestion) return;

    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    const correct = 'correctAnswer' in currentQuestion ? answerIndex === currentQuestion.correctAnswer : false;

    setAptitudeAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        answer: answerIndex,
        timeSpent,
        correct,
      },
    }));

    if (currentQuestionIndex < aptitudeQuestions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }, 300);
    } else {
      // Move to style questions
      setTimeout(() => {
        setCurrentSection('style');
        setCurrentQuestionIndex(0);
      }, 500);
    }
  };

  const handleStyleAnswer = (option: any) => {
    if (!currentQuestion) return;

    setStyleAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: option,
    }));

    if (currentQuestionIndex < styleQuestions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }, 300);
    } else {
      // Calculate results
      setTimeout(() => {
        calculateResults();
      }, 300);
    }
  };

  const calculateResults = () => {
    // Calculate learning speed based on aptitude performance
    const totalCorrect = Object.values(aptitudeAnswers).filter((a) => a.correct).length;
    const totalTime = Object.values(aptitudeAnswers).reduce((sum, a) => sum + a.timeSpent, 0);
    const avgTimePerQuestion = totalTime / aptitudeQuestions.length;
    const accuracy = (totalCorrect / aptitudeQuestions.length) * 100;

    // Calculate by reasoning type
    const numericalScore = aptitudeQuestions
      .filter(q => q.category === 'numerical')
      .reduce((score, q) => score + (aptitudeAnswers[q.id]?.correct ? 1 : 0), 0) / 3;

    const verbalScore = aptitudeQuestions
      .filter(q => q.category === 'verbal')
      .reduce((score, q) => score + (aptitudeAnswers[q.id]?.correct ? 1 : 0), 0) / 3;

    const logicalScore = aptitudeQuestions
      .filter(q => q.category === 'logical')
      .reduce((score, q) => score + (aptitudeAnswers[q.id]?.correct ? 1 : 0), 0) / 3;

    const spatialScore = aptitudeQuestions
      .filter(q => q.category === 'spatial')
      .reduce((score, q) => score + (aptitudeAnswers[q.id]?.correct ? 1 : 0), 0) / 3;

    // Speed component: faster = better (but accuracy weighted more)
    let speedScore = 0;
    if (avgTimePerQuestion < 30) speedScore = 3;
    else if (avgTimePerQuestion < 45) speedScore = 2;
    else speedScore = 1;

    // Composite score (70% accuracy, 30% speed)
    const compositeScore = (accuracy * 0.7) + (speedScore * 10);

    let learningSpeed: LearningSpeed;
    if (compositeScore >= 70 && accuracy >= 70) {
      learningSpeed = 'fast';
    } else if (compositeScore >= 45 && accuracy >= 50) {
      learningSpeed = 'average';
    } else {
      learningSpeed = 'slow';
    }

    // Calculate learning style
    const styleCounts: Record<string, number> = {};
    Object.values(styleAnswers).forEach((ans) => {
      if (ans?.style) {
        styleCounts[ans.style] = (styleCounts[ans.style] || 0) + 1;
      }
    });

    const learningStyle = Object.entries(styleCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'Visual (Reading/Writing)';

    setCurrentSection('results');

    const details: PsychometricDetails = {
      accuracy,
      totalQuestions: aptitudeQuestions.length,
      correctAnswers: totalCorrect,
      avgTimePerQuestion,
      categoryScores: {
        numerical: numericalScore,
        verbal: verbalScore,
        logical: logicalScore,
        spatial: spatialScore,
      },
    };

    // Store results for display
    (window as any).testResults = {
      learningSpeed,
      learningStyle,
      ...details,
      scores: details.categoryScores, // for backward compatibility if any
    };

    setTimeout(() => {
      onComplete(learningSpeed, learningStyle, details);
    }, 3000);
  };

  const getTimeColor = () => {
    if (currentSection !== 'aptitude' || !('timeLimit' in currentQuestion)) return 'text-slate-700';
    const percentage = (timeRemaining / currentQuestion.timeLimit) * 100;
    if (percentage > 50) return 'text-indigo-600';
    if (percentage > 25) return 'text-purple-600';
    return 'text-red-500 font-black animate-pulse';
  };

  const renderBackgroundGradients = () => (
    <>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />
    </>
  );

  if (currentSection === 'intro') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-slate-50 font-sans">
        {renderBackgroundGradients()}
        <Card className="w-full max-w-3xl border-0 shadow-2xl shadow-indigo-900/5 backdrop-blur-xl bg-white/90 rounded-3xl relative z-10">
          <CardHeader className="pb-4 pt-10 px-8 lg:px-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 mb-4 w-fit">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-medium text-indigo-900">Step 2 of 2</span>
            </div>
            <CardTitle className="text-3xl font-black text-slate-900 flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                <Brain className="w-8 h-8 text-white" />
              </div>
              Psychometric Assessment
            </CardTitle>
            <CardDescription className="text-base text-slate-600 font-medium mt-3">
              This short AI-driven test precisely analyzes your cognitive footprint and learning speed to tailor your master study plan.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 px-8 lg:px-12 pb-10">
            <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4">📋 Core Modules</h3>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                      <Calculator className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h4 className="font-bold text-slate-900">Numerical</h4>
                  </div>
                  <p className="text-sm text-slate-500 font-medium">Math problems, sequences, logic</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-purple-200 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <MessageSquare className="w-5 h-5 text-purple-600" />
                    </div>
                    <h4 className="font-bold text-slate-900">Verbal</h4>
                  </div>
                  <p className="text-sm text-slate-500 font-medium">Vocabulary, analogies, intent</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-fuchsia-200 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-fuchsia-50 rounded-lg">
                      <Puzzle className="w-5 h-5 text-fuchsia-600" />
                    </div>
                    <h4 className="font-bold text-slate-900">Logical</h4>
                  </div>
                  <p className="text-sm text-slate-500 font-medium">Pattern recognition, deduction</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-200 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Grid3x3 className="w-5 h-5 text-blue-600" />
                    </div>
                    <h4 className="font-bold text-slate-900">Spatial</h4>
                  </div>
                  <p className="text-sm text-slate-500 font-medium">Shapes, rotations, visualization</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 mb-6 shadow-sm">
                <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-600" />
                  Test Rules & Automation:
                </h4>
                <ul className="space-y-3 text-sm text-slate-600 font-medium">
                  <li className="flex items-start gap-3">
                    <span className="text-indigo-600 text-lg mt-0.5">•</span>
                    Each aptitude question is strictly timed (30-60 seconds)
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-indigo-600 text-lg mt-0.5">•</span>
                    Answer intuitively and quickly. Time limits affect your learning speed classification.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-indigo-600 text-lg mt-0.5">•</span>
                    Total test length is optimized to approx. 12 minutes.
                  </li>
                </ul>
              </div>

              <div className="bg-indigo-50/50 py-3 px-5 rounded-xl border border-indigo-100 flex items-center justify-between">
                <p className="text-sm font-bold text-indigo-900">
                  ⚡ Aptitude Q's: {aptitudeQuestions.length}
                </p>
                <div className="h-4 w-px bg-indigo-200"></div>
                <p className="text-sm font-bold text-purple-900">
                  🎨 Style Q's: {styleQuestions.length}
                </p>
              </div>
            </div>

            <Button
              onClick={handleStartTest}
              className="w-full h-14 text-lg bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-xl shadow-indigo-600/20"
              size="lg"
            >
              <Zap className="w-5 h-5 mr-2" />
              Start Assessment
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentSection === 'results') {
    const results = (window as any).testResults || {};

    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-slate-50 font-sans">
        {renderBackgroundGradients()}
        <Card className="w-full max-w-2xl border-0 shadow-2xl shadow-indigo-900/5 backdrop-blur-xl bg-white/90 rounded-3xl relative z-10">
          <CardHeader className="pt-10">
            <CardTitle className="text-3xl font-black text-slate-900 text-center">
              Assessment Complete!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pb-12">
            <div className="text-center py-8">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse shadow-xl shadow-indigo-600/20">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-8">
                Analyzing cognitive parameters...
              </h3>

              {results.accuracy && (
                <div className="w-full max-w-lg mx-auto grid grid-cols-2 gap-4">
                  <div className="col-span-2 bg-gradient-to-br from-indigo-50 to-white p-6 rounded-2xl border border-indigo-100 shadow-sm text-left flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-500 mb-1 uppercase tracking-wider">Learning Speed</p>
                      <p className="text-3xl font-black text-indigo-600 capitalize">{results.learningSpeed}</p>
                    </div>
                    <Zap className="w-12 h-12 text-indigo-100" />
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-left">
                    <p className="text-sm font-bold text-slate-500 mb-1 uppercase tracking-wider">Accuracy</p>
                    <p className="text-2xl font-black text-slate-900">{Math.round(results.accuracy)}%</p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-left">
                    <p className="text-sm font-bold text-slate-500 mb-1 uppercase tracking-wider">Primary Style</p>
                    <p className="text-lg font-bold text-slate-900 leading-tight">
                      {results.learningStyle.split(' ')[0]}
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-12 flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-sm text-slate-500 font-semibold uppercase tracking-widest">
                  Generating dynamic syllabus...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Question display
  const QuestionIcon = currentQuestion?.icon || Brain;
  const isAptitude = currentSection === 'aptitude';
  const colorScheme = isAptitude ? 'indigo' : 'purple';

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-slate-50 font-sans">
      {renderBackgroundGradients()}
      <Card className="w-full max-w-3xl border-0 shadow-2xl shadow-indigo-900/5 backdrop-blur-xl bg-white/90 rounded-3xl relative z-10 transition-all">
        <CardHeader className="pb-6 pt-10 px-8 lg:px-12">
          <div className="flex items-center justify-between mb-2">
            <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-3">
              <div className={`w-12 h-12 bg-${colorScheme}-50 rounded-xl flex items-center justify-center border border-${colorScheme}-100`}>
                <QuestionIcon className={`w-6 h-6 text-${colorScheme}-600`} />
              </div>
              {isAptitude ? 'Aptitude Test' : 'Learning Style'}
            </CardTitle>
            <div className="text-right">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </div>
              {isAptitude && (
                <div className={`text-2xl font-black ${getTimeColor()} flex items-center justify-end gap-1.5 tabular-nums`}>
                  <Clock className="w-5 h-5" />
                  0:{timeRemaining.toString().padStart(2, '0')}
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-8 lg:px-12 pb-10">
          {/* Progress Bar */}
          <div className="mb-10">
            <Progress value={progress} className={`h-2 [&>div]:bg-${colorScheme}-600 bg-slate-100`} />
          </div>

          {/* Question */}
          <div className="mb-10 min-h-[100px]">
            <p className={`text-sm font-bold text-${colorScheme}-600 uppercase tracking-widest mb-3 flex items-center gap-2`}>
              <Sparkles className="w-4 h-4" />
              {isAptitude
                ? `${currentQuestion?.category} Reasoning`
                : 'Preference'}
            </p>
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 leading-snug">
              {currentQuestion?.question}
            </h3>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 gap-3">
            {currentQuestion?.options.map((option, index) => {
              const optionText = typeof option === 'string' ? option : option.text;
              return (
                <button
                  key={index}
                  onClick={() => isAptitude ? handleAptitudeAnswer(index) : handleStyleAnswer(option)}
                  className={`w-full p-5 rounded-2xl border-2 text-left transition-all duration-200 
                  border-slate-100 bg-white shadow-sm hover:border-${colorScheme}-400 hover:bg-${colorScheme}-50 hover:shadow-md active:scale-[0.99] group`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center flex-shrink-0 font-bold text-slate-500 group-hover:bg-white group-hover:border-${colorScheme}-200 group-hover:text-${colorScheme}-600 transition-colors`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="font-semibold text-slate-700 text-lg group-hover:text-slate-900 transition-colors">{optionText}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};