// Helper utilities for the application

// Debounce function for performance optimization
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: any | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Format duration in a human-readable way
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

// Format relative time (e.g., "2 days ago")
export function formatRelativeTime(date: string): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  return past.toLocaleDateString();
}

// Format date in a consistent way
export function formatDate(date: string | Date, format: 'short' | 'long' | 'full' = 'long'): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  switch (format) {
    case 'short':
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    case 'long':
      return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    case 'full':
      return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    default:
      return d.toLocaleDateString();
  }
}

// Format time (e.g., "9:30 AM")
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// Calculate percentage
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

// Truncate text with ellipsis
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

// Get color for score (for consistent color coding)
export function getScoreColor(score: number): string {
  if (score >= 90) return 'text-emerald-600';
  if (score >= 75) return 'text-green-600';
  if (score >= 60) return 'text-blue-600';
  if (score >= 50) return 'text-amber-600';
  return 'text-red-600';
}

// Get background color for score
export function getScoreBgColor(score: number): string {
  if (score >= 90) return 'bg-emerald-50 border-emerald-200';
  if (score >= 75) return 'bg-green-50 border-green-200';
  if (score >= 60) return 'bg-blue-50 border-blue-200';
  if (score >= 50) return 'bg-amber-50 border-amber-200';
  return 'bg-red-50 border-red-200';
}

// Get mood emoji
export function getMoodEmoji(mood: number): string {
  const emojis = ['😫', '😔', '😐', '🙂', '😊'];
  return emojis[mood - 1] || '😐';
}

// Copy to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  }
}

// Download as JSON
export function downloadJSON(data: any, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Local storage helpers with error handling
export const storage = {
  get(key: string, defaultValue: any): any {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage: ${key}`, error);
      return defaultValue;
    }
  },
  set(key: string, value: any): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage: ${key}`, error);
      return false;
    }
  },
  remove(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing from localStorage: ${key}`, error);
      return false;
    }
  },
};

// Generate unique ID
export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Class name helper (similar to classnames library)
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Check if date is today
export function isToday(date: string): boolean {
  return toISODate(date) === toISODate(new Date());
}

// Normalize any date Input to YYYY-MM-DD
export function toISODate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0];
  return d.toISOString().split('T')[0];
}

// Check if date is in the past
export function isPast(date: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  return date < today;
}

// Check if date is in the future
export function isFuture(date: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  return date > today;
}

// Get day of week
export function getDayOfWeek(date: string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { weekday: 'long' });
}

// Format score with grade
export function formatScoreWithGrade(score: number): string {
  let grade = 'F';
  if (score >= 90) grade = 'A+';
  else if (score >= 80) grade = 'A';
  else if (score >= 70) grade = 'B';
  else if (score >= 60) grade = 'C';
  else if (score >= 50) grade = 'D';

  return `${score}% (${grade})`;
}

// Validate email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone number (Indian format)
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Smooth scroll to element
export function smoothScrollTo(elementId: string): void {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}


// Map backend study plan to frontend format
export const mapBackendPlanToFrontend = (backendPlan: any) => {
  if (!backendPlan) return null;

  const mappedDailyPlans: Record<string, any> = {};
  const days: any[] = [];

  if (backendPlan.daily_plans) {
    backendPlan.daily_plans.forEach((dp: any) => {
      const dateKey = toISODate(dp.date);
      const mappedSessions = (dp.sessions || []).map((s: any) => ({
        id: s.id?.toString() || Math.random().toString(),
        topicId: s.topic_id || 'unassigned',
        topicName: s.topic_name || 'Study Session',
        chapterId: s.chapter_id || 'unassigned',
        chapterName: s.chapter_name || 'General',
        subjectId: s.subject_id || 'unassigned',
        subjectName: s.subject_name || 'Subject',
        date: dateKey,
        startTime: s.start_time || '09:00',
        duration: s.duration || 60,
        status: s.status || (s.completed ? 'completed' : 'not-started'),
        completed: s.completed || s.status === 'completed',
        isRevision: s.is_revision || false,
        completionPercentage: s.completion_percentage || 0,
        notes: s.notes,
        completedAt: s.completed_at,
        is_rescheduled: s.is_rescheduled || false,
        rescheduled_from_date: s.rescheduled_from_date
      }));

      mappedDailyPlans[dateKey] = {
        date: dateKey,
        sessions: mappedSessions,
        totalHours: (dp.sessions || []).reduce((acc: number, s: any) => acc + (s.duration || 60), 0) / 60,
        completedHours: (dp.sessions || []).filter((s: any) => s.status === 'completed' || s.completed).reduce((acc: number, s: any) => acc + (s.duration || 60), 0) / 60,
        burnoutLevel: dp.burnout_level || 0
      };

      days.push({
        date: dateKey,
        sessions: mappedSessions
      });
    });
  }

  return {
    dailyPlans: mappedDailyPlans,
    days: days,
    overallProgress: backendPlan.overall_progress || 0,
    subjectTracking: {},
    parentAlerts: []
  };
};

// Calculate Ace Score (Study Health Gauge 0-100)
// Weighting: 50% Completion Rate, 30% Quiz Accuracy, 20% Recent Engagement
export const calculateAceScore = (studyPlan: any): number => {
  if (!studyPlan || !studyPlan.days || studyPlan.days.length === 0) return 0;

  // 1. Completion Rate (50%)
  let totalSessions = 0;
  let completedSessions = 0;
  
  // 2. Recent Engagement (20%) - Last 7 days
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  let recentTotalDays = 0;
  let recentActiveDays = 0;

  studyPlan.days.forEach((day: any) => {
    // For Completion Rate (only count past and present days, not future)
    const dayDate = new Date(day.date);
    if (dayDate <= today) {
        day.sessions.forEach((session: any) => {
            totalSessions++;
            if (session.completed) completedSessions++;
        });
    }

    // For Recent Engagement
    if (dayDate >= sevenDaysAgo && dayDate <= today) {
        recentTotalDays++;
        const hasCompletedSession = day.sessions.some((s: any) => s.completed);
        if (hasCompletedSession) recentActiveDays++;
    }
  });

  const completionScore = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 100; // Default to 100 if no sessions past yet
  const engagementScore = recentTotalDays > 0 ? (recentActiveDays / recentTotalDays) * 100 : 100;

  // 3. Quiz Accuracy (30%)
  // If no quizzes taken, assume 100% to not penalize new students
  const quizzes = studyPlan.quizzes || [];
  const accuracyScore = quizzes.length > 0 
    ? quizzes.reduce((sum: number, q: any) => sum + q.score, 0) / quizzes.length 
    : 100;

  // Final Weighted Score
  const finalScore = (completionScore * 0.5) + (accuracyScore * 0.3) + (engagementScore * 0.2);
  
  return Math.round(finalScore);
};