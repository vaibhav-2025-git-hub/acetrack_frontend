import type { UserProfile, StudyPlan, DailyPlan, StudySession, WeeklySummary } from '../types';
import type { Subject, Topic } from '../data/curriculum';
import { curriculumData } from '../data/curriculum';

// Add logging for debugging
const logPlanGeneration = (message: string, data?: any) => {
  console.log(`[Plan Generator] ${message}`, data || '');
};

export const generateStudyPlan = (profile: UserProfile): StudyPlan => {
  logPlanGeneration('Starting plan generation for', profile.name);
  
  const boardData = curriculumData.find((b) => b.id === profile.board);
  if (!boardData) throw new Error('Board not found');

  const streamData = boardData.classes[profile.class]?.find((s) => s.id === profile.stream);
  if (!streamData) throw new Error('Stream not found');

  const subjects = streamData.subjects;
  logPlanGeneration(`Found ${subjects.length} subjects in ${profile.stream} stream`);
  
  const dailyPlans: Record<string, DailyPlan> = {};
  const weeklySummaries: WeeklySummary[] = [];

  // Calculate revision days (15% of total days, minimum 7 days)
  const revisionDays = Math.max(Math.floor(profile.totalDays * 0.15), 7);
  const studyDays = profile.totalDays - revisionDays;

  logPlanGeneration(`Total days: ${profile.totalDays}, Study days: ${studyDays}, Revision days: ${revisionDays}`);

  // Collect all topics with their details
  let allTopics: Array<{
    subject: Subject;
    subjectId: string;
    subjectName: string;
    chapterId: string;
    chapterName: string;
    topicId: string;
    topicName: string;
    hours: number;
    difficulty: 'easy' | 'medium' | 'tough';
    priority: number;
  }> = [];

  subjects.forEach((subject) => {
    const difficulty = profile.subjectDifficulties[subject.id] || 'medium';
    let subjectTopicCount = 0;
    
    subject.chapters.forEach((chapter) => {
      chapter.topics.forEach((topic) => {
        // Adjust hours based on difficulty and learning speed
        let adjustedHours = topic.estimatedHours;

        // Difficulty multiplier
        if (difficulty === 'tough') adjustedHours *= 1.5;
        else if (difficulty === 'easy') adjustedHours *= 0.7;

        // Learning speed multiplier
        if (profile.learningSpeed === 'slow') adjustedHours *= 1.3;
        else if (profile.learningSpeed === 'fast') adjustedHours *= 0.8;

        // Calculate priority (tough subjects get studied earlier)
        let priority = 1;
        if (difficulty === 'tough') priority = 3;
        else if (difficulty === 'medium') priority = 2;

        allTopics.push({
          subject,
          subjectId: subject.id,
          subjectName: subject.name,
          chapterId: chapter.id,
          chapterName: chapter.name,
          topicId: topic.id,
          topicName: topic.name,
          hours: adjustedHours,
          difficulty,
          priority,
        });
        
        subjectTopicCount++;
      });
    });
    
    logPlanGeneration(`${subject.name}: ${subjectTopicCount} topics, ${subject.chapters.length} chapters`);
  });

  logPlanGeneration(`Total topics collected: ${allTopics.length}`);

  // Sort topics by priority (tough subjects first) and then by chapter order
  allTopics.sort((a, b) => {
    if (a.priority !== b.priority) return b.priority - a.priority;
    return 0;
  });

  // Calculate total hours needed
  const totalHoursNeeded = allTopics.reduce((sum, topic) => sum + topic.hours, 0);
  const totalAvailableHours = studyDays * profile.studyHoursPerDay;

  logPlanGeneration(`Total hours needed: ${totalHoursNeeded.toFixed(1)}, Available: ${totalAvailableHours.toFixed(1)}`);

  // If not enough time, prioritize and compress
  if (totalHoursNeeded > totalAvailableHours) {
    const compressionFactor = totalAvailableHours / totalHoursNeeded;
    logPlanGeneration(`Compressing plan by factor: ${compressionFactor.toFixed(2)}`);
    allTopics = allTopics.map((topic) => ({
      ...topic,
      hours: topic.hours * compressionFactor,
    }));
  }

  // Distribute topics evenly across study days
  const startDate = new Date(profile.startDate);
  let currentTopicIndex = 0;
  let remainingHoursInCurrentTopic = allTopics[0]?.hours || 0;

  // Generate study days (excluding revision days)
  for (let day = 0; day < studyDays && currentTopicIndex < allTopics.length; day++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + day);
    const dateStr = currentDate.toISOString().split('T')[0];

    const sessions: StudySession[] = [];
    let dailyHours = 0;

    // Fill the day with sessions (aim for balanced subject distribution per day)
    while (dailyHours < profile.studyHoursPerDay && currentTopicIndex < allTopics.length) {
      const topic = allTopics[currentTopicIndex];
      
      // Calculate session duration (max 2 hours per session for better focus)
      const maxSessionHours = Math.min(2, profile.studyHoursPerDay / 2);
      const availableHoursToday = profile.studyHoursPerDay - dailyHours;
      
      let sessionHours = Math.min(
        remainingHoursInCurrentTopic,
        availableHoursToday,
        maxSessionHours
      );

      // Minimum 0.5 hour (30 min) session
      if (sessionHours < 0.5 && remainingHoursInCurrentTopic >= 0.5) {
        break; // Move to next day
      }

      if (sessionHours >= 0.5) {
        const session: StudySession = {
          id: `session-${dateStr}-${sessions.length}`,
          topicId: topic.topicId,
          topicName: topic.topicName,
          chapterId: topic.chapterId,
          chapterName: topic.chapterName,
          subjectId: topic.subjectId,
          subjectName: topic.subjectName,
          date: dateStr,
          startTime: `${8 + Math.floor(dailyHours)}:${Math.round((dailyHours % 1) * 60)
            .toString()
            .padStart(2, '0')}`,
          duration: Math.round(sessionHours * 60), // Convert to minutes
          status: 'not-started',
          completed: false,
          completionPercentage: 0,
        };

        sessions.push(session);
        dailyHours += sessionHours;
        remainingHoursInCurrentTopic -= sessionHours;

        // Move to next topic if current is finished
        if (remainingHoursInCurrentTopic < 0.1) {
          currentTopicIndex++;
          if (currentTopicIndex < allTopics.length) {
            remainingHoursInCurrentTopic = allTopics[currentTopicIndex].hours;
          }
        }
      } else {
        break;
      }
    }

    // Only create daily plan if there are sessions
    if (sessions.length > 0) {
      dailyPlans[dateStr] = {
        date: dateStr,
        sessions,
        totalHours: dailyHours,
        completedHours: 0,
        burnoutLevel: 0,
      };
    }
  }

  logPlanGeneration(`Topics covered in study days: ${currentTopicIndex} out of ${allTopics.length}`);
  logPlanGeneration(`Actual study days created: ${Object.keys(dailyPlans).length}`);

  // Generate revision days
  const lastStudyDay = new Date(startDate);
  lastStudyDay.setDate(lastStudyDay.getDate() + studyDays - 1);

  for (let day = 0; day < revisionDays; day++) {
    const revisionDate = new Date(lastStudyDay);
    revisionDate.setDate(revisionDate.getDate() + day + 1);
    const dateStr = revisionDate.toISOString().split('T')[0];

    // Create revision sessions (review all subjects)
    const revisionSessions: StudySession[] = [];
    let dailyHours = 0;
    const hoursPerSubject = profile.studyHoursPerDay / subjects.length;

    subjects.forEach((subject, idx) => {
      const session: StudySession = {
        id: `revision-${dateStr}-${idx}`,
        topicId: `revision-${subject.id}`,
        topicName: `${subject.name} - Revision & Practice`,
        chapterId: 'revision',
        chapterName: 'Revision',
        subjectId: subject.id,
        subjectName: subject.name,
        date: dateStr,
        startTime: `${8 + Math.floor(dailyHours)}:${Math.round((dailyHours % 1) * 60)
          .toString()
          .padStart(2, '0')}`,
        duration: Math.round(hoursPerSubject * 60),
        status: 'not-started',
        completed: false,
        completionPercentage: 0,
      };

      revisionSessions.push(session);
      dailyHours += hoursPerSubject;
    });

    dailyPlans[dateStr] = {
      date: dateStr,
      sessions: revisionSessions,
      totalHours: dailyHours,
      completedHours: 0,
      burnoutLevel: 0,
    };
  }

  logPlanGeneration(`Revision days created: ${revisionDays}`);

  // Generate weekly summaries
  const totalWeeks = Math.ceil(profile.totalDays / 7);
  for (let week = 0; week < totalWeeks; week++) {
    const weekStart = new Date(startDate);
    weekStart.setDate(weekStart.getDate() + week * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    // Calculate planned hours for this week
    let weeklyPlannedHours = 0;
    for (let d = 0; d < 7; d++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + d);
      const dateStr = date.toISOString().split('T')[0];
      if (dailyPlans[dateStr]) {
        weeklyPlannedHours += dailyPlans[dateStr].totalHours;
      }
    }

    weeklySummaries.push({
      weekNumber: week + 1,
      startDate: weekStart.toISOString().split('T')[0],
      endDate: weekEnd.toISOString().split('T')[0],
      totalPlannedHours: weeklyPlannedHours,
      completedHours: 0,
      averageMood: 3,
      burnoutLevel: 0,
      weakSubjects: [],
      strongSubjects: [],
    });
  }

  logPlanGeneration(`Plan generation complete. ${Object.keys(dailyPlans).length} days planned with ${allTopics.length} topics`);

  return {
    dailyPlans,
    weeklySummaries,
    overallProgress: 0,
  };
};

export const adjustPlanForMood = (
  plan: StudyPlan,
  date: string,
  mood: number // 1-5
): StudyPlan => {
  const updatedPlan = { ...plan };
  const dailyPlan = updatedPlan.dailyPlans[date];

  if (!dailyPlan) return plan;

  // If mood is low (1-2), reduce workload by marking some sessions as optional
  if (mood <= 2) {
    const keepCount = Math.ceil(dailyPlan.sessions.length * 0.6); // Keep 60% of sessions
    dailyPlan.sessions = dailyPlan.sessions.map((session, idx) => {
      if (idx >= keepCount) {
        return { ...session, status: 'skipped' as const };
      }
      return session;
    });
  }

  return updatedPlan;
};

export const calculateBurnoutLevel = (recentMoods: number[]): number => {
  if (recentMoods.length === 0) return 0;
  
  const avgMood = recentMoods.reduce((sum, m) => sum + m, 0) / recentMoods.length;
  
  // Convert mood (1-5) to burnout (100-0)
  // Lower mood = higher burnout
  return Math.round((5 - avgMood) * 25);
};

export const identifyWeakSubjects = (
  dailyPlans: Record<string, DailyPlan>
): string[] => {
  const subjectPerformance: Record<string, { total: number; completed: number }> = {};

  Object.values(dailyPlans).forEach((day) => {
    day.sessions.forEach((session) => {
      if (!subjectPerformance[session.subjectName]) {
        subjectPerformance[session.subjectName] = { total: 0, completed: 0 };
      }
      subjectPerformance[session.subjectName].total++;
      if (session.status === 'completed') {
        subjectPerformance[session.subjectName].completed++;
      }
    });
  });

  // Subjects with completion rate < 70% are weak
  return Object.entries(subjectPerformance)
    .filter(([_, perf]) => {
      const rate = perf.total > 0 ? perf.completed / perf.total : 1;
      return rate < 0.7;
    })
    .map(([subject]) => subject);
};