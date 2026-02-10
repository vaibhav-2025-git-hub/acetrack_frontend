import { QuizQuestion, QuizAttempt } from '../types';

// Generate quiz questions for a topic (AI-powered mock)
export const generateQuizForTopic = (
  topicId: string,
  topicName: string,
  subjectId: string,
  subjectName: string,
  difficulty: 'easy' | 'medium' | 'hard',
  questionCount: number = 5
): QuizQuestion[] => {
  const questions: QuizQuestion[] = [];
  
  for (let i = 0; i < questionCount; i++) {
    questions.push(generateQuestion(topicId, topicName, subjectId, subjectName, difficulty, i));
  }
  
  return questions;
};

const generateQuestion = (
  topicId: string,
  topicName: string,
  subjectId: string,
  subjectName: string,
  difficulty: 'easy' | 'medium' | 'hard',
  index: number
): QuizQuestion => {
  const subject = subjectName.toLowerCase();
  
  if (subject.includes('physics')) {
    return {
      id: `quiz-${topicId}-${Date.now()}-${index}`,
      topicId,
      subjectId,
      question: `Which of the following best describes ${topicName}?`,
      options: [
        'Option A: Correct answer related to the concept',
        'Option B: Common misconception',
        'Option C: Partially correct answer',
        'Option D: Unrelated answer',
      ],
      correctAnswer: 0,
      explanation: `The correct answer is A because ${topicName} is defined as... [Detailed explanation]`,
      difficulty,
      tags: [topicName],
    };
  } else if (subject.includes('chemistry')) {
    return {
      id: `quiz-${topicId}-${Date.now()}-${index}`,
      topicId,
      subjectId,
      question: `What is the chemical reaction in ${topicName}?`,
      options: [
        'A + B → AB',
        'AB → A + B',
        'A + B → C + D',
        'None of the above',
      ],
      correctAnswer: 0,
      explanation: `The reaction follows the pattern where... [Chemical explanation]`,
      difficulty,
      tags: [topicName],
    };
  } else if (subject.includes('math')) {
    return {
      id: `quiz-${topicId}-${Date.now()}-${index}`,
      topicId,
      subjectId,
      question: `Solve the problem related to ${topicName}`,
      options: [
        'Answer: 42',
        'Answer: 24',
        'Answer: 84',
        'Answer: 48',
      ],
      correctAnswer: 0,
      explanation: `Step-by-step solution: [Mathematical derivation]`,
      difficulty,
      tags: [topicName],
    };
  } else if (subject.includes('biology')) {
    return {
      id: `quiz-${topicId}-${Date.now()}-${index}`,
      topicId,
      subjectId,
      question: `What is the main function of ${topicName}?`,
      options: [
        'Function A (Correct)',
        'Function B',
        'Function C',
        'Function D',
      ],
      correctAnswer: 0,
      explanation: `The primary function is... [Biological explanation]`,
      difficulty,
      tags: [topicName],
    };
  }
  
  // Default question template
  return {
    id: `quiz-${topicId}-${Date.now()}-${index}`,
    topicId,
    subjectId,
    question: `Question ${index + 1}: Concept related to ${topicName}`,
    options: [
      'Correct answer',
      'Incorrect option 1',
      'Incorrect option 2',
      'Incorrect option 3',
    ],
    correctAnswer: 0,
    explanation: `Detailed explanation for ${topicName}`,
    difficulty,
    tags: [topicName],
  };
};

// Calculate quiz score
export const calculateQuizScore = (
  questions: QuizQuestion[],
  answers: number[]
): number => {
  let correct = 0;
  
  questions.forEach((question, index) => {
    if (answers[index] === question.correctAnswer) {
      correct++;
    }
  });
  
  return Math.round((correct / questions.length) * 100);
};

// Analyze quiz performance
export const analyzeQuizPerformance = (
  questions: QuizQuestion[],
  answers: number[]
) => {
  const topicWise: Record<string, { correct: number; total: number }> = {};
  const difficultyWise: Record<string, { correct: number; total: number }> = {};
  
  questions.forEach((question, index) => {
    const isCorrect = answers[index] === question.correctAnswer;
    
    // Topic-wise analysis
    const topicId = question.topicId;
    if (!topicWise[topicId]) {
      topicWise[topicId] = { correct: 0, total: 0 };
    }
    topicWise[topicId].total++;
    if (isCorrect) topicWise[topicId].correct++;
    
    // Difficulty-wise analysis
    const difficulty = question.difficulty;
    if (!difficultyWise[difficulty]) {
      difficultyWise[difficulty] = { correct: 0, total: 0 };
    }
    difficultyWise[difficulty].total++;
    if (isCorrect) difficultyWise[difficulty].correct++;
  });
  
  return { topicWise, difficultyWise };
};

// Get recommended difficulty for next quiz
export const getRecommendedDifficulty = (
  recentAttempts: QuizAttempt[]
): 'easy' | 'medium' | 'hard' => {
  if (recentAttempts.length === 0) return 'medium';
  
  const lastThree = recentAttempts.slice(-3);
  const avgScore = lastThree.reduce((sum, attempt) => sum + attempt.score, 0) / lastThree.length;
  
  if (avgScore >= 80) return 'hard';
  if (avgScore >= 60) return 'medium';
  return 'easy';
};

// Generate mixed quiz from multiple topics
export const generateMixedQuiz = (
  topics: Array<{ topicId: string; topicName: string; subjectId: string; subjectName: string }>,
  questionsPerTopic: number = 2
): QuizQuestion[] => {
  const allQuestions: QuizQuestion[] = [];
  
  topics.forEach((topic) => {
    const questions = generateQuizForTopic(
      topic.topicId,
      topic.topicName,
      topic.subjectId,
      topic.subjectName,
      'medium',
      questionsPerTopic
    );
    allQuestions.push(...questions);
  });
  
  // Shuffle questions
  return shuffleArray(allQuestions);
};

// Shuffle array helper
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Get quiz statistics for a subject
export const getQuizStatsBySubject = (
  attempts: QuizAttempt[],
  subjectId: string
) => {
  const subjectAttempts = attempts.filter((a) => a.subjectId === subjectId);
  
  if (subjectAttempts.length === 0) {
    return {
      totalAttempts: 0,
      averageScore: 0,
      highestScore: 0,
      lowestScore: 0,
      improvementTrend: 0,
    };
  }
  
  const scores = subjectAttempts.map((a) => a.score);
  const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const highestScore = Math.max(...scores);
  const lowestScore = Math.min(...scores);
  
  // Calculate improvement trend (last 3 vs first 3)
  let improvementTrend = 0;
  if (subjectAttempts.length >= 6) {
    const firstThree = scores.slice(0, 3);
    const lastThree = scores.slice(-3);
    const firstAvg = firstThree.reduce((a, b) => a + b, 0) / 3;
    const lastAvg = lastThree.reduce((a, b) => a + b, 0) / 3;
    improvementTrend = lastAvg - firstAvg;
  }
  
  return {
    totalAttempts: subjectAttempts.length,
    averageScore: Math.round(averageScore),
    highestScore,
    lowestScore,
    improvementTrend: Math.round(improvementTrend),
  };
};
