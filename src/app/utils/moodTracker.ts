import { StudyPlan, MoodEntry, Mood, UserProfile } from '../types';
import { curriculumData } from '../data/curriculum';

const logMood = (message: string, data?: any) => {
  console.log(`[Mood Tracker] ${message}`, data || '');
};

// Convert mood string to numeric score
export const moodToScore = (mood: Mood): number => {
  const moodMap: Record<Mood, number> = {
    'excellent': 5,
    'good': 4,
    'neutral': 3,
    'tired': 2,
    'stressed': 1,
  };
  return moodMap[mood] || 3;
};

// Convert score to mood string
export const scoreToMood = (score: number): Mood => {
  if (score >= 4.5) return 'excellent';
  if (score >= 3.5) return 'good';
  if (score >= 2.5) return 'neutral';
  if (score >= 1.5) return 'tired';
  return 'stressed';
};

// Record mood after a session
export const recordSessionMood = (
  plan: StudyPlan,
  sessionId: string,
  date: string,
  mood: Mood,
  notes?: string
): StudyPlan => {
  const updatedPlan = { ...plan };
  const dailyPlan = updatedPlan.dailyPlans[date];
  
  if (!dailyPlan) return plan;

  const session = dailyPlan.sessions.find(s => s.id === sessionId);
  if (!session) return plan;

  const moodScore = moodToScore(mood);

  // Update session mood
  session.mood = mood;
  session.moodScore = moodScore;
  session.completedAt = new Date().toISOString();

  // Add to mood history
  const moodEntry: MoodEntry = {
    sessionId,
    date,
    mood,
    moodScore,
    timestamp: new Date().toISOString(),
    subjectId: session.subjectId,
    notes,
  };
  
  updatedPlan.moodHistory = [...(updatedPlan.moodHistory || []), moodEntry];

  logMood(`Mood recorded: ${mood} (${moodScore}) for session ${sessionId}`);

  // Check if adaptation is needed
  const needsAdaptation = checkIfAdaptationNeeded(updatedPlan);
  if (needsAdaptation) {
    logMood('⚠️ Consistently low mood detected - triggering adaptation');
    return adaptPlanForLowMood(updatedPlan, date);
  }

  return updatedPlan;
};

// Check if mood is consistently low
export const checkIfAdaptationNeeded = (plan: StudyPlan): boolean => {
  const recentMoods = plan.moodHistory?.slice(-5) || []; // Last 5 sessions
  
  if (recentMoods.length < 3) return false; // Need at least 3 data points

  // Check if average of last 3-5 sessions is below 2.5 (tired/stressed)
  const recentScores = recentMoods.map(m => m.moodScore);
  const average = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;

  logMood(`Recent mood average: ${average.toFixed(2)} (${recentMoods.length} sessions)`);

  // Also check if 3+ of last 5 are low (1-2)
  const lowMoodCount = recentScores.filter(score => score <= 2).length;
  
  return average < 2.5 || lowMoodCount >= 3;
};

// Adapt plan when mood is consistently low
export const adaptPlanForLowMood = (
  plan: StudyPlan,
  currentDate: string
): StudyPlan => {
  const updatedPlan = { ...plan };
  const today = new Date(currentDate);
  
  logMood('🔧 Adapting study plan due to consistently low mood...');

  // Get all future dates
  const futureDates = Object.keys(updatedPlan.dailyPlans)
    .filter(date => new Date(date) > today)
    .sort();

  let adaptedDaysCount = 0;

  // Adapt next 7 days
  const daysToAdapt = futureDates.slice(0, 7);
  
  daysToAdapt.forEach(date => {
    const dailyPlan = updatedPlan.dailyPlans[date];
    if (!dailyPlan || dailyPlan.isAdapted) return; // Skip if already adapted

    // Strategy 1: Reduce session durations by 20%
    dailyPlan.sessions.forEach(session => {
      if (session.status === 'not-started') {
        const oldDuration = session.duration;
        session.duration = Math.max(30, Math.round(session.duration * 0.8));
        logMood(`  Reduced session duration: ${oldDuration} → ${session.duration} mins`);
      }
    });

    // Strategy 2: Increase breaks between sessions (recalculate start times)
    let currentTime = 8; // Start at 8 AM
    dailyPlan.sessions.forEach((session, idx) => {
      session.startTime = `${Math.floor(currentTime)}:${Math.round((currentTime % 1) * 60)
        .toString()
        .padStart(2, '0')}`;
      
      const sessionHours = session.duration / 60;
      currentTime += sessionHours;
      
      // Add 15-minute break between sessions
      if (idx < dailyPlan.sessions.length - 1) {
        currentTime += 0.25;
      }
    });

    // Strategy 3: Recalculate total hours
    const newTotalHours = dailyPlan.sessions.reduce((sum, s) => sum + s.duration / 60, 0);
    dailyPlan.totalHours = newTotalHours;

    // Strategy 4: Reduce burnout level
    dailyPlan.burnoutLevel = Math.max(0, dailyPlan.burnoutLevel - 15);

    // Mark as adapted
    dailyPlan.isAdapted = true;
    adaptedDaysCount++;
  });

  // Strategy 5: Add buffer days if burnout is severe
  const recentMoodAverage = (plan.moodHistory?.slice(-5) || [])
    .reduce((sum, m) => sum + m.moodScore, 0) / Math.max(1, (plan.moodHistory?.slice(-5) || []).length);

  if (recentMoodAverage < 2 && daysToAdapt.length >= 3) {
    // Insert a "light study day" by further reducing the 3rd day
    const lightDayDate = daysToAdapt[2];
    const lightDay = updatedPlan.dailyPlans[lightDayDate];
    
    if (lightDay) {
      lightDay.sessions.forEach(session => {
        session.duration = Math.max(30, Math.round(session.duration * 0.6));
      });
      
      const newTotal = lightDay.sessions.reduce((sum, s) => sum + s.duration / 60, 0);
      lightDay.totalHours = newTotal;
      
      logMood(`  ⭐ Created light study day on ${lightDayDate} (${newTotal.toFixed(1)}h)`);
    }
  }

  logMood(`✅ Adapted ${adaptedDaysCount} days. Reduced workload and added breaks.`);

  return updatedPlan;
};

// Get mood insights for analytics
export const getMoodInsights = (plan: StudyPlan) => {
  const moodHistory = plan.moodHistory || [];
  
  if (moodHistory.length === 0) {
    return {
      averageMood: 3,
      trend: 'neutral',
      lowMoodDays: 0,
      highMoodDays: 0,
      subjectMoods: {},
    };
  }

  const scores = moodHistory.map(m => m.moodScore);
  const averageMood = scores.reduce((a, b) => a + b, 0) / scores.length;

  // Calculate trend (last 5 vs previous 5)
  const recent = scores.slice(-5);
  const previous = scores.slice(-10, -5);
  
  let trend: 'improving' | 'declining' | 'stable' = 'stable';
  if (recent.length >= 3 && previous.length >= 3) {
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const previousAvg = previous.reduce((a, b) => a + b, 0) / previous.length;
    
    if (recentAvg > previousAvg + 0.5) trend = 'improving';
    else if (recentAvg < previousAvg - 0.5) trend = 'declining';
  }

  const lowMoodDays = scores.filter(s => s <= 2).length;
  const highMoodDays = scores.filter(s => s >= 4).length;

  // Subject-wise mood analysis
  const subjectMoods: Record<string, { avgMood: number; count: number }> = {};
  
  moodHistory.forEach(entry => {
    if (!subjectMoods[entry.subjectId]) {
      subjectMoods[entry.subjectId] = { avgMood: 0, count: 0 };
    }
    subjectMoods[entry.subjectId].avgMood += entry.moodScore;
    subjectMoods[entry.subjectId].count += 1;
  });

  // Calculate averages
  Object.keys(subjectMoods).forEach(subjectId => {
    subjectMoods[subjectId].avgMood = 
      subjectMoods[subjectId].avgMood / subjectMoods[subjectId].count;
  });

  return {
    averageMood,
    trend,
    lowMoodDays,
    highMoodDays,
    subjectMoods,
    totalSessions: moodHistory.length,
  };
};

// Check if student needs a break day
export const needsBreakDay = (plan: StudyPlan): boolean => {
  const recentMoods = plan.moodHistory?.slice(-7) || []; // Last 7 sessions
  
  if (recentMoods.length < 5) return false;

  // If 5+ of last 7 sessions have mood <= 2
  const lowCount = recentMoods.filter(m => m.moodScore <= 2).length;
  
  // Or if average mood in last week is below 2
  const avgMood = recentMoods.reduce((sum, m) => sum + m.moodScore, 0) / recentMoods.length;

  return lowCount >= 5 || avgMood < 2;
};

// Suggest optimal study time based on mood patterns
export const suggestOptimalStudyTime = (plan: StudyPlan): string => {
  // Analyze mood history to find patterns
  const moodHistory = plan.moodHistory || [];
  
  if (moodHistory.length < 10) {
    return 'morning'; // Default suggestion
  }

  // Group by time of day (rough estimation based on timestamp)
  const morningMoods: number[] = [];
  const afternoonMoods: number[] = [];
  const eveningMoods: number[] = [];

  moodHistory.forEach(entry => {
    const hour = new Date(entry.timestamp).getHours();
    
    if (hour >= 6 && hour < 12) morningMoods.push(entry.moodScore);
    else if (hour >= 12 && hour < 17) afternoonMoods.push(entry.moodScore);
    else if (hour >= 17 && hour < 23) eveningMoods.push(entry.moodScore);
  });

  const avgMorning = morningMoods.length > 0 
    ? morningMoods.reduce((a, b) => a + b, 0) / morningMoods.length 
    : 0;
  const avgAfternoon = afternoonMoods.length > 0 
    ? afternoonMoods.reduce((a, b) => a + b, 0) / afternoonMoods.length 
    : 0;
  const avgEvening = eveningMoods.length > 0 
    ? eveningMoods.reduce((a, b) => a + b, 0) / eveningMoods.length 
    : 0;

  const best = Math.max(avgMorning, avgAfternoon, avgEvening);
  
  if (best === avgMorning) return 'morning';
  if (best === avgAfternoon) return 'afternoon';
  return 'evening';
};
