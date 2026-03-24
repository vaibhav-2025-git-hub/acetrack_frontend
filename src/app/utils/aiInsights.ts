import type { AIInsight, SmartRecommendation, LearningPattern, StudyPlan, StudySession } from '../types';

// Generate AI insights based on study patterns
export const generateAIInsights = (
  studyPlan: StudyPlan,
  learningPattern?: LearningPattern
): AIInsight[] => {
  const insights: AIInsight[] = [];
  const now = new Date();

  const recentMoods = (studyPlan.moodHistory || []).slice(-10);
  if (recentMoods.length >= 5) {
    const avgMood = recentMoods.reduce((sum, m) => sum + m.moodScore, 0) / recentMoods.length;
    
    if (avgMood < 2.5) {
      insights.push({
        id: `insight-${now.getTime()}-mood`,
        type: 'study-tip',
        title: 'Low Mood Alert',
        message: 'Your recent mood scores are low. Consider taking a longer break, practicing relaxation techniques, or adjusting your study schedule.',
        priority: 'high',
        actionable: true,
        action: {
          type: 'take-break',
          data: { duration: 30 },
        },
        createdAt: now.toISOString(),
        dismissed: false,
      });
    }
  }

  // Identify weak subjects
  const subjectPerformance: Record<string, { completed: number; skipped: number; avgMood: number }> = {};
  
  Object.values(studyPlan.dailyPlans).forEach((day) => {
    day.sessions.forEach((session) => {
      if (!subjectPerformance[session.subjectId]) {
        subjectPerformance[session.subjectId] = { completed: 0, skipped: 0, avgMood: 0 };
      }
      
      if (session.status === 'completed') {
        subjectPerformance[session.subjectId].completed++;
        if (session.moodScore) {
          subjectPerformance[session.subjectId].avgMood += session.moodScore;
        }
      } else if (session.status === 'skipped') {
        subjectPerformance[session.subjectId].skipped++;
      }
    });
  });

  // Analyze each subject
  Object.entries(subjectPerformance).forEach(([subjectId, perf]) => {
    const avgMood = perf.completed > 0 ? perf.avgMood / perf.completed : 0;
    const skipRate = (perf.skipped / (perf.completed + perf.skipped)) * 100;

    if (avgMood < 2.5 && perf.completed >= 3) {
      insights.push({
        id: `insight-${now.getTime()}-subject-${subjectId}`,
        type: 'difficulty-adjustment',
        title: 'Subject Difficulty Detected',
        message: `You seem to be struggling with this subject (avg mood: ${avgMood.toFixed(1)}). Consider breaking sessions into smaller chunks or seeking additional help.`,
        priority: 'medium',
        actionable: true,
        action: {
          type: 'adjust-plan',
          data: { subjectId, action: 'reduce-duration' },
        },
        createdAt: now.toISOString(),
        dismissed: false,
      });
    }

    if (skipRate > 30) {
      insights.push({
        id: `insight-${now.getTime()}-skip-${subjectId}`,
        type: 'performance-insight',
        title: 'High Skip Rate',
        message: `You're skipping this subject frequently (${skipRate.toFixed(0)}%). Try to identify why and address the underlying issue.`,
        priority: 'medium',
        actionable: false,
        createdAt: now.toISOString(),
        dismissed: false,
      });
    }
  });

  // Peak productivity insights
  if (learningPattern && learningPattern.peakProductivityHours.length > 0) {
    const peakHours = learningPattern.peakProductivityHours.join(', ');
    insights.push({
      id: `insight-${now.getTime()}-peak`,
      type: 'study-tip',
      title: 'Optimize Your Schedule',
      message: `Your peak productivity hours are: ${peakHours}:00. Try scheduling tough subjects during these times.`,
      priority: 'low',
      actionable: true,
      action: {
        type: 'adjust-plan',
        data: { peakHours: learningPattern.peakProductivityHours },
      },
      createdAt: now.toISOString(),
      dismissed: false,
    });
  }


  return insights;
};

// Generate smart recommendations
export const generateSmartRecommendations = (
  studyPlan: StudyPlan,
  currentDate: string,
  learningPattern?: LearningPattern
): SmartRecommendation[] => {
  const recommendations: SmartRecommendation[] = [];
  const now = new Date();

  // Recommend topics to review based on time since last study
  const topicLastStudied: Record<string, { date: string; name: string; subjectId: string }> = {};
  
  Object.values(studyPlan.dailyPlans).forEach((day) => {
    day.sessions.forEach((session) => {
      if (session.status === 'completed') {
        if (!topicLastStudied[session.topicId] || session.date > topicLastStudied[session.topicId].date) {
          topicLastStudied[session.topicId] = {
            date: session.date,
            name: session.topicName,
            subjectId: session.subjectId,
          };
        }
      }
    });
  });

  // Find topics not studied in 7+ days
  const today = new Date(currentDate);
  Object.entries(topicLastStudied).forEach(([topicId, info]) => {
    const lastStudy = new Date(info.date);
    const daysSince = Math.floor((today.getTime() - lastStudy.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSince >= 7) {
      recommendations.push({
        id: `rec-${now.getTime()}-review-${topicId}`,
        type: 'topic',
        title: 'Review Recommended',
        description: `Consider reviewing "${info.name}" - it's been ${daysSince} days since you last studied it.`,
        confidence: 85,
        reasoning: 'Spaced repetition suggests reviewing topics after 7 days for better retention.',
        data: { topicId, subjectId: info.subjectId, daysSince },
        createdAt: now.toISOString(),
      });
    }
  });

  // Recommend study time adjustments
  if (learningPattern) {
    const currentHour = new Date().getHours();
    const isPeakTime = learningPattern.peakProductivityHours.includes(currentHour);
    
    if (!isPeakTime && learningPattern.peakProductivityHours.length > 0) {
      const nextPeakHour = learningPattern.peakProductivityHours.find(h => h > currentHour) || 
                          learningPattern.peakProductivityHours[0];
      
      recommendations.push({
        id: `rec-${now.getTime()}-timing`,
        type: 'study-time',
        title: 'Optimal Study Time',
        description: `Based on your patterns, ${nextPeakHour}:00 would be a better time for studying.`,
        confidence: 75,
        reasoning: 'Your productivity data shows higher performance during these hours.',
        data: { recommendedHour: nextPeakHour },
        createdAt: now.toISOString(),
      });
    }
  }

  // Recommend breaks if burnout is high
  const todayPlan = studyPlan.dailyPlans[currentDate];
  if (todayPlan && todayPlan.burnoutLevel > 60) {
    recommendations.push({
      id: `rec-${now.getTime()}-break`,
      type: 'break',
      title: 'Take a Break',
      description: 'Your burnout level is high. Consider taking a 15-20 minute break before continuing.',
      confidence: 90,
      reasoning: `Current burnout level: ${todayPlan.burnoutLevel}/100`,
      data: { burnoutLevel: todayPlan.burnoutLevel },
      createdAt: now.toISOString(),
    });
  }

  return recommendations;
};

// Analyze and create learning pattern
export const analyzeLearningPattern = (
  studyPlan: StudyPlan,
  userId: string
): LearningPattern => {
  const productivityByHour: Record<number, { count: number; totalMood: number }> = {};
  const sessionDurations: number[] = [];
  const subjectMoods: Record<string, number[]> = {};

  // Analyze all completed sessions
  Object.values(studyPlan.dailyPlans).forEach((day) => {
    day.sessions.forEach((session) => {
      if (session.status === 'completed') {
        // Track productivity by hour
        const hour = parseInt(session.startTime.split(':')[0]);
        if (!productivityByHour[hour]) {
          productivityByHour[hour] = { count: 0, totalMood: 0 };
        }
        productivityByHour[hour].count++;
        if (session.moodScore) {
          productivityByHour[hour].totalMood += session.moodScore;
        }

        // Track session durations
        sessionDurations.push(session.duration);

        // Track mood by subject
        if (session.moodScore) {
          if (!subjectMoods[session.subjectId]) {
            subjectMoods[session.subjectId] = [];
          }
          subjectMoods[session.subjectId].push(session.moodScore);
        }
      }
    });
  });

  // Calculate peak productivity hours (top 3 hours with best mood)
  const hourlyAverages = Object.entries(productivityByHour)
    .map(([hour, data]) => ({
      hour: parseInt(hour),
      avgMood: data.totalMood / data.count,
      count: data.count,
    }))
    .filter((h) => h.count >= 2) // At least 2 sessions
    .sort((a, b) => b.avgMood - a.avgMood)
    .slice(0, 3)
    .map((h) => h.hour);

  // Calculate average session duration
  const avgSessionDuration = sessionDurations.length > 0
    ? Math.round(sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length)
    : 60;

  // Identify strong and weak topics
  const topicPerformance: Record<string, { avgMood: number; count: number }> = {};
  
  Object.values(studyPlan.dailyPlans).forEach((day) => {
    day.sessions.forEach((session) => {
      if (session.status === 'completed' && session.moodScore) {
        if (!topicPerformance[session.topicId]) {
          topicPerformance[session.topicId] = { avgMood: 0, count: 0 };
        }
        topicPerformance[session.topicId].avgMood += session.moodScore;
        topicPerformance[session.topicId].count++;
      }
    });
  });

  const topicAverages = Object.entries(topicPerformance).map(([topicId, data]) => ({
    topicId,
    avgMood: data.avgMood / data.count,
  }));

  const strongTopics = topicAverages
    .filter((t) => t.avgMood >= 4)
    .map((t) => t.topicId);

  const weakTopics = topicAverages
    .filter((t) => t.avgMood < 3)
    .map((t) => t.topicId);

  // Calculate retention rate (simplified - based on quiz performance if available)
  let retentionRate = 70; // Default
  if (studyPlan.quizzes && studyPlan.quizzes.length > 0) {
    const avgQuizScore = studyPlan.quizzes.reduce((sum, quiz) => sum + quiz.score, 0) / studyPlan.quizzes.length;
    retentionRate = Math.round(avgQuizScore);
  }

  return {
    userId,
    peakProductivityHours: hourlyAverages,
    averageSessionDuration: avgSessionDuration,
    preferredSubjectOrder: [], // Could be calculated based on sequence patterns
    difficultyTrend: {}, // Would need historical comparison
    strongTopics,
    weakTopics,
    learningStyle: 'mixed', // Default - could be determined through quiz
    retentionRate,
  };
};

// Auto-adjust difficulty based on performance
export const autoAdjustDifficulty = (
  studyPlan: StudyPlan,
  subjectId: string
): 'easy' | 'medium' | 'tough' => {
  const subjectSessions = Object.values(studyPlan.dailyPlans)
    .flatMap((day) => day.sessions)
    .filter((session) => session.subjectId === subjectId && session.status === 'completed');

  if (subjectSessions.length < 3) {
    return 'medium'; // Not enough data
  }

  const recentSessions = subjectSessions.slice(-5);
  const avgMood = recentSessions
    .filter((s) => s.moodScore)
    .reduce((sum, s) => sum + (s.moodScore || 0), 0) / recentSessions.length;

  if (avgMood >= 4) return 'easy';
  if (avgMood >= 2.5) return 'medium';
  return 'tough';
};
