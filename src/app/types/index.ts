export type LearningSpeed = 'fast' | 'average' | 'slow';
export type Difficulty = 'easy' | 'medium' | 'tough';
export type Mood = 'excellent' | 'good' | 'neutral' | 'tired' | 'stressed';
export type SessionStatus = 'not-started' | 'in-progress' | 'completed' | 'skipped';

export interface ReferenceLink {
  title: string;
  url: string;
  type: 'video' | 'article' | 'practice' | 'notes' | 'interactive';
  platform?: string; // e.g., "YouTube", "Khan Academy", "NCERT"
}

export interface UserProfile {
  name: string;
  class: string;
  board: string;
  stream: string;
  selectedSubjects?: string[];
  studyHoursPerDay: number;
  learningSpeed: LearningSpeed;
  subjectDifficulties: Record<string, Difficulty>;
  startDate: string;
  totalDays: number;
}

export interface StudySession {
  id: string;
  topicId: string;
  topicName: string;
  chapterId: string;
  chapterName: string;
  subjectId: string;
  subjectName: string;
  date: string;
  startTime: string;
  duration: number; // in minutes
  status: SessionStatus;
  completionPercentage: number;
  notes?: string;
  completedAt?: string; // timestamp when completed
}

// REMOVED: Mood tracking types
// export interface MoodEntry { ... }

export interface DailyPlan {
  date: string;
  sessions: StudySession[];
  totalHours: number;
  completedHours: number;
  burnoutLevel: number; // 0-100
  isAdapted?: boolean; // Flag if plan was adapted
}

export interface WeeklySummary {
  weekNumber: number;
  startDate: string;
  endDate: string;
  totalPlannedHours: number;
  completedHours: number;
  weakSubjects: string[];
  strongSubjects: string[];
  streak: number;
}

export interface ProgressData {
  topicId: string;
  progress: number; // 0-100
  timeSpent: number; // in minutes
  lastStudied?: string;
  difficulty?: Difficulty;
}

export interface SubjectTracking {
  subjectId: string;
  subjectName: string;
  lastStudiedDate: string;
  daysSinceLastStudy: number;
  consecutiveSkips: number;
  totalSessionsCompleted: number;
  totalSessionsSkipped: number;
}

export interface ParentAlert {
  id: string;
  type: 'subject-neglect' | 'burnout' | 'streak-broken' | 'progress-issue';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  subjectId?: string;
  subjectName?: string;
  date: string;
  timestamp: string;
  acknowledged: boolean;
}

// ========= STUDY TOOLS TYPES =========
export interface Flashcard {
  id: string;
  topicId: string;
  subjectId: string;
  front: string;
  back: string;
  difficulty: 'easy' | 'medium' | 'hard';
  lastReviewed?: string;
  nextReview?: string;
  reviewCount: number;
  confidence: number; // 0-5 (spaced repetition)
  createdAt: string;
  tags?: string[];
}

export interface StudyNote {
  id: string;
  topicId: string;
  subjectId: string;
  chapterId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  isPinned?: boolean;
}

export interface QuizQuestion {
  id: string;
  topicId: string;
  subjectId: string;
  question: string;
  options: string[];
  correctAnswer: number; // Index of correct option
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags?: string[];
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  topicId: string;
  subjectId: string;
  questions: QuizQuestion[];
  answers: number[]; // User's answers
  score: number; // Percentage
  startedAt: string;
  completedAt?: string;
  timeSpent: number; // seconds
}

export interface MindMap {
  id: string;
  topicId: string;
  subjectId: string;
  title: string;
  nodes: MindMapNode[];
  createdAt: string;
  updatedAt: string;
}

export interface MindMapNode {
  id: string;
  text: string;
  x: number;
  y: number;
  color?: string;
  children?: string[]; // IDs of child nodes
}

// ========= EXAM PREPARATION TYPES =========
export interface Exam {
  id: string;
  name: string;
  subjectIds: string[];
  date: string;
  type: 'unit-test' | 'midterm' | 'final' | 'board-exam' | 'competitive';
  syllabusTopics: string[]; // Topic IDs
  totalMarks?: number;
  duration?: number; // minutes
  isActive: boolean;
}

export interface MockTest {
  id: string;
  examId: string;
  name: string;
  subjectId: string;
  questions: QuizQuestion[];
  duration: number; // minutes
  totalMarks: number;
  scheduledDate?: string;
  attempts: MockTestAttempt[];
}

export interface MockTestAttempt {
  id: string;
  mockTestId: string;
  startedAt: string;
  completedAt?: string;
  answers: number[];
  score: number;
  percentage: number;
  timeSpent: number;
  analysis: {
    topicWise: Record<string, { correct: number; total: number }>;
    difficultyWise: Record<string, { correct: number; total: number }>;
  };
}

export interface CrashCourse {
  id: string;
  examId: string;
  name: string;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  dailyPlans: Record<string, DailyPlan>;
  priority: 'high-priority-topics' | 'revision-only' | 'balanced';
  completed: boolean;
}

export interface SyllabusTracker {
  examId: string;
  subjectId: string;
  totalTopics: number;
  completedTopics: number;
  inProgressTopics: number;
  notStartedTopics: number;
  coveragePercentage: number;
  topicStatus: Record<string, 'completed' | 'in-progress' | 'not-started'>;
}

// ========= SOCIAL & COLLABORATIVE TYPES =========
export interface StudyCircle {
  id: string;
  name: string;
  description: string;
  memberIds: string[];
  adminIds: string[];
  subjects: string[];
  createdAt: string;
  isPrivate: boolean;
  inviteCode?: string;
  chatMessages?: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
  type: 'text' | 'resource' | 'achievement';
  attachments?: ResourceAttachment[];
}

export interface ResourceAttachment {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'link' | 'note';
  url: string;
  uploadedAt: string;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  avatar?: string;
  rank: number;
  studyHours: number;
  streak: number;
}

export interface StudyBuddy {
  userId: string;
  name: string;
  class: string;
  stream: string;
  subjects: string[];
  studyHours: string; // e.g., "Morning (6-9 AM)"
  learningStyle: string;
  compatibility: number; // 0-100
}

// ========= ENHANCED RESOURCE MANAGEMENT =========
export interface ResourceItem {
  id: string;
  name: string;
  type: 'pdf' | 'video' | 'link' | 'image' | 'note' | 'flashcard-deck';
  subjectId: string;
  topicId?: string;
  chapterId?: string;
  url?: string;
  content?: string;
  uploadedAt: string;
  lastAccessed?: string;
  tags: string[];
  isFavorite: boolean;
  annotations?: PDFAnnotation[];
}

export interface PDFAnnotation {
  id: string;
  page: number;
  type: 'highlight' | 'note' | 'underline';
  text?: string;
  color?: string;
  position: { x: number; y: number; width: number; height: number };
  createdAt: string;
}

export interface ResourceLibrary {
  userId: string;
  resources: ResourceItem[];
  folders: ResourceFolder[];
  recentlyAccessed: string[]; // Resource IDs
  favorites: string[]; // Resource IDs
}

export interface ResourceFolder {
  id: string;
  name: string;
  parentId?: string;
  resourceIds: string[];
  createdAt: string;
  color?: string;
  icon?: string;
}

// ========= AI-POWERED ENHANCEMENTS =========
export interface AIInsight {
  id: string;
  type: 'study-tip' | 'topic-recommendation' | 'difficulty-adjustment' | 'performance-insight';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
  action?: {
    type: 'adjust-plan' | 'review-topic' | 'take-break' | 'focus-subject';
    data: any;
  };
  createdAt: string;
  dismissed: boolean;
}

export interface LearningPattern {
  userId: string;
  peakProductivityHours: number[]; // Hours of day (0-23)
  averageSessionDuration: number; // minutes
  preferredSubjectOrder: string[];
  difficultyTrend: Record<string, 'improving' | 'stable' | 'declining'>;
  strongTopics: string[];
  weakTopics: string[];
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading-writing' | 'mixed';
  retentionRate: number; // 0-100
}

export interface SmartRecommendation {
  id: string;
  type: 'topic' | 'resource' | 'study-time' | 'break';
  title: string;
  description: string;
  confidence: number; // 0-100
  reasoning: string;
  data: any;
  createdAt: string;
  accepted?: boolean;
}

export interface ScheduleChange {
  id: string;
  timestamp: string;
  type: 'manual' | 'adaptation' | 'rescheduling';
  title: string;
  description: string;
  details?: Record<string, any>;
}

export interface StudyPlan {
  dailyPlans: Record<string, DailyPlan>;
  days: Array<{
    date: string;
    sessions: Array<{
      id: string;
      topicId: string;
      topicName: string;
      chapterId: string;
      chapterName: string;
      subjectId: string;
      duration: number;
      completed: boolean;
    }>;
  }>;
  weeklySummaries: WeeklySummary[];
  overallProgress: number;
  currentStreak: number;
  longestStreak: number;
  subjectTracking: Record<string, SubjectTracking>; // Track each subject
  parentAlerts: ParentAlert[]; // Alerts for parents
  scheduleChanges?: ScheduleChange[]; // Track all schedule modifications
  
  // Study tools
  flashcards?: Flashcard[];
  notes?: StudyNote[];
  quizzes?: QuizAttempt[];
  mindMaps?: MindMap[];
  exams?: Exam[];
  mockTests?: MockTest[];
  crashCourses?: CrashCourse[][];
  syllabusTrackers?: Record<string, SyllabusTracker>;
  studyCircles?: string[]; // Circle IDs user is part of
  resourceLibrary?: ResourceLibrary;
  learningPattern?: LearningPattern;
  smartRecommendations?: SmartRecommendation[];
}