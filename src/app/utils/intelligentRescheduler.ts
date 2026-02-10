import { StudyPlan, DailyPlan, Session } from '../types';
import { getMoodInsights } from './moodTracker';

interface SkipPattern {
  subjectId: string;
  subjectName: string;
  skipCount: number;
  lastSkipped: string;
  consecutiveSkips: number;
  totalSessions: number;
  skipRate: number;
}

interface RescheduleSuggestion {
  date: string;
  sessionId: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  suggestedAction: string;
}

/**
 * Analyze session skipping patterns across the study plan
 */
export const analyzeSkipPatterns = (plan: StudyPlan, currentDate: string): SkipPattern[] => {
  const skipData: Record<string, SkipPattern> = {};
  const today = new Date(currentDate);
  
  // Look at past 14 days
  const dates = Object.keys(plan.dailyPlans)
    .filter(date => {
      const d = new Date(date);
      const daysDiff = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff >= 0 && daysDiff <= 14;
    })
    .sort();

  dates.forEach(date => {
    const dailyPlan = plan.dailyPlans[date];
    if (!dailyPlan) return;

    dailyPlan.sessions.forEach(session => {
      if (!skipData[session.subjectId]) {
        skipData[session.subjectId] = {
          subjectId: session.subjectId,
          subjectName: session.subjectName,
          skipCount: 0,
          lastSkipped: '',
          consecutiveSkips: 0,
          totalSessions: 0,
          skipRate: 0,
        };
      }

      skipData[session.subjectId].totalSessions++;

      if (session.status === 'skipped') {
        skipData[session.subjectId].skipCount++;
        skipData[session.subjectId].lastSkipped = date;
        
        // Check if this is a consecutive skip
        const prevDate = new Date(date);
        prevDate.setDate(prevDate.getDate() - 1);
        const prevDateStr = prevDate.toISOString().split('T')[0];
        
        if (skipData[session.subjectId].lastSkipped === prevDateStr) {
          skipData[session.subjectId].consecutiveSkips++;
        }
      }
    });
  });

  // Calculate skip rates
  Object.keys(skipData).forEach(subjectId => {
    const data = skipData[subjectId];
    data.skipRate = data.totalSessions > 0 ? data.skipCount / data.totalSessions : 0;
  });

  return Object.values(skipData).sort((a, b) => b.skipRate - a.skipRate);
};

/**
 * Analyze mood trends for better rescheduling decisions
 */
export const analyzeMoodTrends = (plan: StudyPlan): {
  needsImmedateIntervention: boolean;
  weeklyTrend: 'improving' | 'declining' | 'stable';
  problematicSubjects: string[];
  optimalStudyHours: number;
  recommendedBreaks: number;
} => {
  const insights = getMoodInsights(plan);
  const moodHistory = plan.moodHistory || [];
  
  // Immediate intervention needed if:
  // 1. Last 3 sessions all have mood <= 2
  // 2. Average mood in last 5 sessions < 2.2
  const last3 = moodHistory.slice(-3);
  const last5 = moodHistory.slice(-5);
  
  const needsImmedateIntervention = 
    (last3.length === 3 && last3.every(m => m.moodScore <= 2)) ||
    (last5.length >= 5 && (last5.reduce((sum, m) => sum + m.moodScore, 0) / last5.length) < 2.2);

  // Find subjects with consistently low mood
  const problematicSubjects: string[] = [];
  Object.entries(insights.subjectMoods || {}).forEach(([subjectId, data]) => {
    if (data.avgMood < 2.5 && data.count >= 3) {
      problematicSubjects.push(subjectId);
    }
  });

  // Calculate optimal study hours based on recent performance
  const recentAvg = last5.length > 0 
    ? last5.reduce((sum, m) => sum + m.moodScore, 0) / last5.length 
    : 3;
  
  let optimalStudyHours = 6; // Default
  if (recentAvg < 2.5) optimalStudyHours = 4;
  else if (recentAvg < 3.5) optimalStudyHours = 5;
  else if (recentAvg >= 4.5) optimalStudyHours = 7;

  // Recommend breaks based on mood
  const recommendedBreaks = recentAvg < 2.5 ? 20 : recentAvg < 3.5 ? 15 : 10;

  return {
    needsImmedateIntervention,
    weeklyTrend: insights.trend as 'improving' | 'declining' | 'stable',
    problematicSubjects,
    optimalStudyHours,
    recommendedBreaks,
  };
};

/**
 * Generate intelligent reschedule suggestions
 */
export const generateRescheduleSuggestions = (
  plan: StudyPlan,
  currentDate: string
): RescheduleSuggestion[] => {
  const suggestions: RescheduleSuggestion[] = [];
  const skipPatterns = analyzeSkipPatterns(plan, currentDate);
  const moodTrends = analyzeMoodTrends(plan);
  const today = new Date(currentDate);

  // Get future dates (next 7 days)
  const futureDates = Object.keys(plan.dailyPlans)
    .filter(date => {
      const d = new Date(date);
      const daysDiff = Math.floor((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff > 0 && daysDiff <= 7;
    })
    .sort();

  // SUGGESTION 1: Prioritize frequently skipped subjects
  const highSkipSubjects = skipPatterns.filter(p => p.skipRate > 0.3 || p.consecutiveSkips >= 2);
  
  highSkipSubjects.forEach(pattern => {
    futureDates.forEach(date => {
      const dailyPlan = plan.dailyPlans[date];
      if (!dailyPlan) return;

      const session = dailyPlan.sessions.find(s => s.subjectId === pattern.subjectId);
      if (session && session.status === 'not-started') {
        suggestions.push({
          date,
          sessionId: session.id,
          reason: `${pattern.subjectName} has been skipped ${pattern.skipCount} times (${Math.round(pattern.skipRate * 100)}% skip rate)`,
          priority: pattern.skipRate > 0.5 ? 'high' : 'medium',
          suggestedAction: 'Move to morning slot for better completion rate',
        });
      }
    });
  });

  // SUGGESTION 2: Reduce load on subjects with low mood
  moodTrends.problematicSubjects.forEach(subjectId => {
    futureDates.slice(0, 3).forEach(date => {
      const dailyPlan = plan.dailyPlans[date];
      if (!dailyPlan) return;

      const session = dailyPlan.sessions.find(s => s.subjectId === subjectId);
      if (session && session.status === 'not-started') {
        suggestions.push({
          date,
          sessionId: session.id,
          reason: 'This subject consistently causes low mood/stress',
          priority: 'medium',
          suggestedAction: `Reduce session duration from ${session.duration} to ${Math.round(session.duration * 0.75)} minutes`,
        });
      }
    });
  });

  // SUGGESTION 3: Immediate intervention for declining mood
  if (moodTrends.needsImmedateIntervention) {
    const nextDate = futureDates[0];
    if (nextDate) {
      const dailyPlan = plan.dailyPlans[nextDate];
      if (dailyPlan) {
        dailyPlan.sessions.forEach(session => {
          if (session.status === 'not-started') {
            suggestions.push({
              date: nextDate,
              sessionId: session.id,
              reason: 'Recent mood trend shows high stress - immediate workload reduction needed',
              priority: 'high',
              suggestedAction: `Reduce to ${Math.round(session.duration * 0.6)} minutes and add wellness break`,
            });
          }
        });
      }
    }
  }

  return suggestions.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
};

/**
 * Apply intelligent rescheduling based on mood and skip patterns
 */
export const applyIntelligentRescheduling = (
  plan: StudyPlan,
  currentDate: string
): { updatedPlan: StudyPlan; changes: string[] } => {
  const updatedPlan = { ...plan };
  const changes: string[] = [];
  const today = new Date(currentDate);
  
  const skipPatterns = analyzeSkipPatterns(updatedPlan, currentDate);
  const moodTrends = analyzeMoodTrends(updatedPlan);

  // Get future dates (next 7 days)
  const futureDates = Object.keys(updatedPlan.dailyPlans)
    .filter(date => {
      const d = new Date(date);
      const daysDiff = Math.floor((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff > 0 && daysDiff <= 7;
    })
    .sort();

  console.log('[Intelligent Rescheduler] Starting analysis...');
  console.log('Skip Patterns:', skipPatterns);
  console.log('Mood Trends:', moodTrends);

  // STEP 1: Immediate intervention for severe mood decline
  if (moodTrends.needsImmedateIntervention) {
    futureDates.slice(0, 3).forEach(date => {
      const dailyPlan = updatedPlan.dailyPlans[date];
      if (!dailyPlan) return;

      const oldTotal = dailyPlan.totalHours;
      
      dailyPlan.sessions.forEach(session => {
        if (session.status === 'not-started') {
          const oldDuration = session.duration;
          session.duration = Math.max(30, Math.round(session.duration * 0.65));
          
          if (oldDuration !== session.duration) {
            changes.push(
              `Reduced ${session.subjectName} from ${oldDuration} to ${session.duration} mins on ${date} (mood intervention)`
            );
          }
        }
      });

      // Recalculate total hours
      dailyPlan.totalHours = dailyPlan.sessions.reduce((sum, s) => sum + s.duration / 60, 0);
      dailyPlan.burnoutLevel = Math.max(0, dailyPlan.burnoutLevel - 20);

      changes.push(
        `Reduced daily workload on ${date} from ${oldTotal.toFixed(1)}h to ${dailyPlan.totalHours.toFixed(1)}h`
      );
    });
  }

  // STEP 2: Prioritize frequently skipped subjects (move to morning/early slots)
  const highSkipSubjects = skipPatterns.filter(
    p => p.skipRate > 0.3 || p.consecutiveSkips >= 2
  );

  futureDates.forEach(date => {
    const dailyPlan = updatedPlan.dailyPlans[date];
    if (!dailyPlan) return;

    highSkipSubjects.forEach(pattern => {
      const sessionIndex = dailyPlan.sessions.findIndex(
        s => s.subjectId === pattern.subjectId && s.status === 'not-started'
      );

      if (sessionIndex > 1) {
        // Move to first or second slot
        const session = dailyPlan.sessions.splice(sessionIndex, 1)[0];
        dailyPlan.sessions.unshift(session);

        changes.push(
          `Moved ${pattern.subjectName} to first slot on ${date} (frequently skipped: ${Math.round(pattern.skipRate * 100)}%)`
        );
      }
    });

    // Recalculate start times
    let currentTime = 8; // 8 AM
    dailyPlan.sessions.forEach((session, idx) => {
      session.startTime = `${Math.floor(currentTime)}:${Math.round((currentTime % 1) * 60)
        .toString()
        .padStart(2, '0')}`;
      
      currentTime += session.duration / 60;
      
      // Add breaks
      if (idx < dailyPlan.sessions.length - 1) {
        currentTime += moodTrends.recommendedBreaks / 60;
      }
    });
  });

  // STEP 3: Reduce duration for problematic subjects (low mood subjects)
  moodTrends.problematicSubjects.forEach(subjectId => {
    futureDates.slice(0, 5).forEach(date => {
      const dailyPlan = updatedPlan.dailyPlans[date];
      if (!dailyPlan) return;

      dailyPlan.sessions.forEach(session => {
        if (session.subjectId === subjectId && session.status === 'not-started') {
          const oldDuration = session.duration;
          session.duration = Math.max(30, Math.round(session.duration * 0.8));
          
          if (oldDuration !== session.duration) {
            const subjectPattern = skipPatterns.find(p => p.subjectId === subjectId);
            changes.push(
              `Reduced ${session.subjectName} from ${oldDuration} to ${session.duration} mins on ${date} (low mood subject)`
            );
          }
        }
      });

      // Recalculate total hours
      dailyPlan.totalHours = dailyPlan.sessions.reduce((sum, s) => sum + s.duration / 60, 0);
    });
  });

  // STEP 4: Balance daily workload based on optimal study hours
  futureDates.forEach(date => {
    const dailyPlan = updatedPlan.dailyPlans[date];
    if (!dailyPlan) return;

    if (dailyPlan.totalHours > moodTrends.optimalStudyHours + 1) {
      const reductionFactor = moodTrends.optimalStudyHours / dailyPlan.totalHours;
      
      dailyPlan.sessions.forEach(session => {
        if (session.status === 'not-started') {
          const oldDuration = session.duration;
          session.duration = Math.max(30, Math.round(session.duration * reductionFactor));
          
          if (oldDuration !== session.duration) {
            changes.push(
              `Adjusted ${session.subjectName} to ${session.duration} mins on ${date} (balancing workload to ${moodTrends.optimalStudyHours}h/day)`
            );
          }
        }
      });

      dailyPlan.totalHours = dailyPlan.sessions.reduce((sum, s) => sum + s.duration / 60, 0);
    }
  });

  // STEP 5: Add wellness breaks for declining mood trend
  if (moodTrends.weeklyTrend === 'declining') {
    futureDates.forEach(date => {
      const dailyPlan = updatedPlan.dailyPlans[date];
      if (dailyPlan) {
        dailyPlan.burnoutLevel = Math.max(0, dailyPlan.burnoutLevel - 10);
      }
    });
    
    changes.push(
      `Added ${moodTrends.recommendedBreaks}-minute breaks between sessions (mood trend: declining)`
    );
  }

  console.log('[Intelligent Rescheduler] Applied changes:', changes);

  // Add schedule change tracking
  if (changes.length > 0) {
    if (!updatedPlan.scheduleChanges) {
      updatedPlan.scheduleChanges = [];
    }

    updatedPlan.scheduleChanges.push({
      id: `reschedule-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'adaptation',
      title: 'Intelligent Rescheduling Applied',
      description: `Automatically optimized your schedule based on mood trends and session completion patterns`,
      details: {
        reason: [
          moodTrends.needsImmedateIntervention ? 'Immediate mood intervention needed' : '',
          moodTrends.weeklyTrend === 'declining' ? 'Declining mood trend detected' : '',
          highSkipSubjects.length > 0 ? `${highSkipSubjects.length} subjects frequently skipped` : '',
          moodTrends.problematicSubjects.length > 0 ? `${moodTrends.problematicSubjects.length} subjects causing stress` : '',
        ].filter(Boolean).join(', '),
        changes: changes.slice(0, 5).join('; ') + (changes.length > 5 ? `... and ${changes.length - 5} more changes` : ''),
        skipPatternsSummary: highSkipSubjects.map(p => 
          `${p.subjectName}: ${Math.round(p.skipRate * 100)}% skip rate`
        ).join(', ') || 'None',
        moodTrend: moodTrends.weeklyTrend,
        optimalDailyHours: `${moodTrends.optimalStudyHours}h`,
      }
    });
  }

  return { updatedPlan, changes };
};

/**
 * Check if rescheduling is needed and trigger if necessary
 */
export const checkAndTriggerRescheduling = (
  plan: StudyPlan,
  currentDate: string
): { shouldReschedule: boolean; reason: string; updatedPlan?: StudyPlan; changes?: string[] } => {
  const skipPatterns = analyzeSkipPatterns(plan, currentDate);
  const moodTrends = analyzeMoodTrends(plan);

  // Trigger rescheduling if:
  // 1. Immediate intervention needed (severe mood decline)
  // 2. Any subject has skip rate > 40%
  // 3. 2+ subjects in problematic category (low mood)
  // 4. Declining trend for 5+ consecutive sessions

  const shouldReschedule =
    moodTrends.needsImmedateIntervention ||
    skipPatterns.some(p => p.skipRate > 0.4) ||
    moodTrends.problematicSubjects.length >= 2 ||
    moodTrends.weeklyTrend === 'declining';

  if (!shouldReschedule) {
    return { shouldReschedule: false, reason: 'No rescheduling needed' };
  }

  const reasons: string[] = [];
  if (moodTrends.needsImmedateIntervention) {
    reasons.push('Severe stress detected - immediate workload reduction needed');
  }
  if (skipPatterns.some(p => p.skipRate > 0.4)) {
    const highSkip = skipPatterns.find(p => p.skipRate > 0.4)!;
    reasons.push(`${highSkip.subjectName} is being skipped frequently (${Math.round(highSkip.skipRate * 100)}%)`);
  }
  if (moodTrends.problematicSubjects.length >= 2) {
    reasons.push(`${moodTrends.problematicSubjects.length} subjects consistently causing low mood`);
  }
  if (moodTrends.weeklyTrend === 'declining') {
    reasons.push('Mood trend is declining over the past week');
  }

  const { updatedPlan, changes } = applyIntelligentRescheduling(plan, currentDate);

  return {
    shouldReschedule: true,
    reason: reasons.join('; '),
    updatedPlan,
    changes,
  };
};

/**
 * Get actionable insights from study performance data
 */
export const getPerformanceInsights = (plan: StudyPlan): {
  totalSessions: number;
  completedSessions: number;
  completionRate: number;
  trend: 'improving' | 'declining' | 'stable';
  needsAttention: boolean;
} => {
  if (!plan.days || plan.days.length === 0) {
    return {
      totalSessions: 0,
      completedSessions: 0,
      completionRate: 0,
      trend: 'stable',
      needsAttention: false
    };
  }

  let totalSessions = 0;
  let completedSessions = 0;
  
  plan.days.forEach(day => {
    day.sessions.forEach(session => {
      totalSessions++;
      if (session.completed) {
        completedSessions++;
      }
    });
  });

  const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
  
  // Calculate trend based on recent week vs previous week
  const recentWeek = plan.days.slice(-7);
  const previousWeek = plan.days.slice(-14, -7);
  
  const recentCompletion = calculateWeekCompletion(recentWeek);
  const previousCompletion = calculateWeekCompletion(previousWeek);
  
  let trend: 'improving' | 'declining' | 'stable' = 'stable';
  if (recentCompletion > previousCompletion + 10) trend = 'improving';
  else if (recentCompletion < previousCompletion - 10) trend = 'declining';
  
  const needsAttention = completionRate < 50 || trend === 'declining';

  return {
    totalSessions,
    completedSessions,
    completionRate,
    trend,
    needsAttention
  };
};

const calculateWeekCompletion = (days: any[]): number => {
  if (days.length === 0) return 0;
  let total = 0;
  let completed = 0;
  days.forEach(day => {
    day.sessions.forEach((session: any) => {
      total++;
      if (session.completed) completed++;
    });
  });
  return total > 0 ? (completed / total) * 100 : 0;
};