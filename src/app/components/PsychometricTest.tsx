import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Brain, Clock, Eye, Headphones, Users, Target, Zap, BookOpen, Lightbulb, CheckCircle2, Calculator, MessageSquare, Grid3x3, Puzzle } from 'lucide-react';
import { LearningSpeed } from '../types';

interface PsychometricTestProps {
  onComplete: (learningSpeed: LearningSpeed, learningStyle: string) => void;
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
  const [testStartTime] = useState<number>(Date.now());

  const allQuestions = currentSection === 'aptitude' ? aptitudeQuestions : styleQuestions;
  const currentQuestion = allQuestions[currentQuestionIndex];
  const totalQuestions = currentSection === 'aptitude' ? aptitudeQuestions.length : styleQuestions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  // Timer for aptitude questions
  useEffect(() => {
    if (currentSection === 'aptitude' && currentQuestion) {
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
    const correct = answerIndex === currentQuestion.correctAnswer;

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
      learningSpeed = 'medium';
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
    
    // Store results for display
    (window as any).testResults = {
      learningSpeed,
      learningStyle,
      accuracy,
      avgTime: avgTimePerQuestion,
      scores: {
        numerical: numericalScore,
        verbal: verbalScore,
        logical: logicalScore,
        spatial: spatialScore,
      },
    };

    setTimeout(() => {
      onComplete(learningSpeed, learningStyle);
    }, 3000);
  };

  const getTimeColor = () => {
    if (!currentQuestion?.timeLimit) return 'text-slate-700';
    const percentage = (timeRemaining / currentQuestion.timeLimit) * 100;
    if (percentage > 50) return 'text-green-600';
    if (percentage > 25) return 'text-orange-600';
    return 'text-red-600';
  };

  if (currentSection === 'intro') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-3xl shadow-2xl backdrop-blur-xl bg-white/90 border-2 border-white/60">
          <CardHeader className="pb-4">
            <CardTitle className="text-3xl font-black text-slate-900 flex items-center gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Brain className="w-8 h-8 text-white" />
              </div>
              Psychometric & Aptitude Assessment
            </CardTitle>
            <CardDescription className="text-base text-slate-700 font-semibold mt-3">
              This comprehensive test will measure your learning speed and style
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border-2 border-purple-200">
              <h3 className="text-xl font-black text-slate-900 mb-4">📋 Test Overview</h3>
              
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl border-2 border-purple-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Calculator className="w-6 h-6 text-blue-600" />
                    <h4 className="font-bold text-slate-900">Numerical Reasoning</h4>
                  </div>
                  <p className="text-sm text-slate-700 font-semibold">Math problems, sequences, calculations</p>
                </div>

                <div className="bg-white p-4 rounded-xl border-2 border-purple-200">
                  <div className="flex items-center gap-3 mb-2">
                    <MessageSquare className="w-6 h-6 text-green-600" />
                    <h4 className="font-bold text-slate-900">Verbal Reasoning</h4>
                  </div>
                  <p className="text-sm text-slate-700 font-semibold">Vocabulary, analogies, comprehension</p>
                </div>

                <div className="bg-white p-4 rounded-xl border-2 border-purple-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Puzzle className="w-6 h-6 text-orange-600" />
                    <h4 className="font-bold text-slate-900">Logical Reasoning</h4>
                  </div>
                  <p className="text-sm text-slate-700 font-semibold">Patterns, deduction, problem-solving</p>
                </div>

                <div className="bg-white p-4 rounded-xl border-2 border-purple-200">
                  <div className="flex items-center gap-3 mb-2">
                    <Grid3x3 className="w-6 h-6 text-purple-600" />
                    <h4 className="font-bold text-slate-900">Spatial Reasoning</h4>
                  </div>
                  <p className="text-sm text-slate-700 font-semibold">Shapes, rotation, visualization</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border-2 border-purple-200 mb-4">
                <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-600" />
                  Important Instructions:
                </h4>
                <ul className="space-y-2 text-sm text-slate-700 font-semibold">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">✓</span>
                    Each aptitude question is timed (30-60 seconds)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">✓</span>
                    Answer as quickly and accurately as possible
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">✓</span>
                    Questions will auto-submit when time runs out
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">✓</span>
                    Total test time: ~10-15 minutes
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">✓</span>
                    Your speed AND accuracy determine your learning pace
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-xl border-2 border-purple-300">
                <p className="text-sm font-bold text-purple-900 text-center">
                  🎯 Total Questions: {aptitudeQuestions.length + styleQuestions.length} 
                  <span className="mx-2">|</span>
                  ⚡ Aptitude: {aptitudeQuestions.length} 
                  <span className="mx-2">|</span>
                  🎨 Learning Style: {styleQuestions.length}
                </p>
              </div>
            </div>

            <Button 
              onClick={handleStartTest} 
              className="w-full py-6 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 font-black"
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
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-3xl shadow-2xl backdrop-blur-xl bg-white/90 border-2 border-white/60">
          <CardHeader>
            <CardTitle className="text-2xl font-black text-slate-900 text-center">
              Assessment Complete!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-8">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <CheckCircle2 className="w-14 h-14 text-white" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-3">
                Analyzing Your Results...
              </h3>
              
              {results.accuracy && (
                <div className="max-w-md mx-auto space-y-4 mt-8">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border-2 border-blue-200">
                    <p className="text-sm font-bold text-slate-700 mb-1">Accuracy</p>
                    <p className="text-3xl font-black text-blue-600">{Math.round(results.accuracy)}%</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border-2 border-purple-200">
                    <p className="text-sm font-bold text-slate-700 mb-1">Learning Speed</p>
                    <p className="text-2xl font-black text-purple-600 capitalize">{results.learningSpeed}</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border-2 border-green-200">
                    <p className="text-sm font-bold text-slate-700 mb-1">Learning Style</p>
                    <p className="text-xl font-black text-green-600">{results.learningStyle}</p>
                  </div>
                </div>
              )}
              
              <p className="text-lg text-slate-700 font-semibold mt-6">
                Creating your personalized learning profile...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Question display
  const QuestionIcon = currentQuestion?.icon || Brain;
  const isAptitude = currentSection === 'aptitude';

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl shadow-2xl backdrop-blur-xl bg-white/90 border-2 border-white/60">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-2">
            <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-3">
              <div className={`w-12 h-12 bg-gradient-to-br ${isAptitude ? 'from-blue-500 to-cyan-500' : 'from-purple-500 to-pink-500'} rounded-xl flex items-center justify-center`}>
                <QuestionIcon className="w-7 h-7 text-white" />
              </div>
              {isAptitude ? 'Aptitude Test' : 'Learning Style'}
            </CardTitle>
            <div className="text-right">
              <div className="text-sm font-bold text-slate-700">
                Question {currentQuestionIndex + 1} / {totalQuestions}
              </div>
              {isAptitude && (
                <div className={`text-2xl font-black ${getTimeColor()} flex items-center justify-end gap-1`}>
                  <Clock className="w-5 h-5" />
                  {timeRemaining}s
                </div>
              )}
            </div>
          </div>
          <CardDescription className="text-base text-slate-700 font-semibold">
            {isAptitude 
              ? `${currentQuestion?.category.charAt(0).toUpperCase()}${currentQuestion?.category.slice(1)} Reasoning` 
              : 'Select your preference'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Progress Bar */}
          <div className="mb-8">
            <Progress value={progress} className="h-3" />
            <p className="text-sm text-slate-700 mt-2 font-semibold">
              {Math.round(progress)}% Complete
            </p>
          </div>

          {/* Question */}
          <div className={`mb-8 bg-gradient-to-br ${isAptitude ? 'from-blue-50 to-cyan-50 border-blue-200' : 'from-purple-50 to-pink-50 border-purple-200'} p-6 rounded-2xl border-2`}>
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                <QuestionIcon className={`w-7 h-7 ${isAptitude ? 'text-blue-600' : 'text-purple-600'}`} />
              </div>
              <div>
                <p className={`text-xs font-bold ${isAptitude ? 'text-blue-600' : 'text-purple-600'} uppercase tracking-wide mb-2`}>
                  Question {currentQuestionIndex + 1}
                </p>
                <h3 className="text-xl font-bold text-slate-900 leading-relaxed">
                  {currentQuestion?.question}
                </h3>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {currentQuestion?.options.map((option, index) => {
              const optionText = typeof option === 'string' ? option : option.text;
              return (
                <button
                  key={index}
                  onClick={() => isAptitude ? handleAptitudeAnswer(index) : handleStyleAnswer(option)}
                  className={`w-full p-5 rounded-xl border-2 text-left transition-all duration-200 ${
                    isAptitude 
                      ? 'border-blue-200 bg-white hover:border-blue-500 hover:bg-blue-50 hover:scale-[1.01]'
                      : 'border-purple-200 bg-white hover:border-purple-500 hover:bg-purple-50 hover:scale-[1.01]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 font-bold ${
                      isAptitude ? 'border-blue-400 text-blue-600' : 'border-purple-400 text-purple-600'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="font-semibold text-slate-900 text-base">{optionText}</span>
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