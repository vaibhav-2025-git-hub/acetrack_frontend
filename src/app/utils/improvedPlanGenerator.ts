import type { UserProfile, StudyPlan, DailyPlan, StudySession, WeeklySummary, MoodEntry, Mood } from '../types';
import type { Subject, Topic } from '../data/curriculum';
import { curriculumData } from '../data/curriculum';

// Logging for debugging
const logPlanGeneration = (message: string, data?: any) => {
  console.log(`[Improved Plan Generator] ${message}`, data || '');
};

interface TopicWithMeta {
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
}

export const generateImprovedStudyPlan = (profile: UserProfile): StudyPlan => {
  logPlanGeneration('Starting improved plan generation', { name: profile.name, days: profile.totalDays });

  const boardData = curriculumData.find((b) => b.id === profile.board);
  if (!boardData) throw new Error('Board not found');

  const streamData = boardData.classes[profile.class]?.find((s) => s.id === profile.stream);
  if (!streamData) throw new Error('Stream not found');

  // Filter subjects based on user selection
  let subjects = streamData.subjects;
  if (profile.selectedSubjects && profile.selectedSubjects.length > 0) {
    subjects = subjects.filter(subject => profile.selectedSubjects?.includes(subject.id));
  }

  logPlanGeneration(`Found ${subjects.length} subjects (selected by user)`);

  const dailyPlans: Record<string, DailyPlan> = {};
  const weeklySummaries: WeeklySummary[] = [];

  // Calculate revision days (15% of total days, minimum 7 days)
  const revisionDays = Math.max(Math.floor(profile.totalDays * 0.15), 7);
  const studyDays = profile.totalDays - revisionDays;

  logPlanGeneration(`Study days: ${studyDays}, Revision days: ${revisionDays}`);

  // Group topics by subject
  const topicsBySubject: Record<string, TopicWithMeta[]> = {};

  subjects.forEach((subject) => {
    const difficulty = profile.subjectDifficulties[subject.id] || 'medium';
    const subjectTopics: TopicWithMeta[] = [];

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

        // Priority (tough subjects first)
        let priority = 1;
        if (difficulty === 'tough') priority = 3;
        else if (difficulty === 'medium') priority = 2;

        subjectTopics.push({
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
      });
    });

    topicsBySubject[subject.id] = subjectTopics;
    logPlanGeneration(`${subject.name}: ${subjectTopics.length} topics`);
  });

  // Calculate total hours needed per subject
  const totalHoursBySubject: Record<string, number> = {};
  let totalHoursNeeded = 0;

  Object.entries(topicsBySubject).forEach(([subjectId, topics]) => {
    const hours = topics.reduce((sum, t) => sum + t.hours, 0);
    totalHoursBySubject[subjectId] = hours;
    totalHoursNeeded += hours;
  });

  const totalAvailableHours = studyDays * profile.studyHoursPerDay;
  logPlanGeneration(`Total hours needed: ${totalHoursNeeded.toFixed(1)}, Available: ${totalAvailableHours.toFixed(1)}`);

  // WORKLOAD BALANCING: Calculate target hours per day to spread evenly
  // But don't exceed the user's requested maximum
  const targetDailyHours = Math.min(
    profile.studyHoursPerDay,
    Math.max(2, totalHoursNeeded / studyDays) // Minimum 2 hours if curriculum is very light
  );
  logPlanGeneration(`Target daily hours for balancing: ${targetDailyHours.toFixed(1)}`);

  // Compress if needed
  let compressionFactor = 1;
  if (totalHoursNeeded > totalAvailableHours) {
    compressionFactor = totalAvailableHours / totalHoursNeeded;
    logPlanGeneration(`Applying compression factor: ${compressionFactor.toFixed(2)}`);

    Object.keys(topicsBySubject).forEach((subjectId) => {
      topicsBySubject[subjectId] = topicsBySubject[subjectId].map((topic) => ({
        ...topic,
        hours: topic.hours * compressionFactor,
      }));
      totalHoursBySubject[subjectId] *= compressionFactor;
    });
  }

  // IMPROVED DISTRIBUTION ALGORITHM - SIMPLIFIED
  // Collect all topics and flatten them into a single queue
  const allTopicsQueue: TopicWithMeta[] = [];

  subjects.forEach((subject) => {
    const subjectTopics = topicsBySubject[subject.id];
    allTopicsQueue.push(...subjectTopics);
  });

  // Sort by priority (tough subjects first) but keep subject variety
  // Group by subject, then interleave
  const topicsBySubjectArray = subjects.map(subject => ({
    subjectId: subject.id,
    topics: [...topicsBySubject[subject.id]]
  }));

  // Round-robin through subjects to create mixed daily plans
  const distributedTopics: TopicWithMeta[] = [];
  let maxTopicsInAnySubject = Math.max(...topicsBySubjectArray.map(s => s.topics.length));

  for (let i = 0; i < maxTopicsInAnySubject; i++) {
    topicsBySubjectArray.forEach(subjectGroup => {
      if (subjectGroup.topics[i]) {
        distributedTopics.push(subjectGroup.topics[i]);
      }
    });
  }

  logPlanGeneration(`Total topics to distribute: ${distributedTopics.length}`);

  // Track current topic and remaining hours in that topic
  // Track current topic and remaining hours in that topic
  const startDate = profile.startDate ? new Date(profile.startDate) : new Date();
  if (isNaN(startDate.getTime())) {
    logPlanGeneration('Invalid startDate, defaulting to today');
  }
  const validStartDate = isNaN(startDate.getTime()) ? new Date() : startDate;
  let currentTopicIndex = 0;
  let remainingHoursInCurrentTopic = 0;
  let lastStudyDayIndex = 0; // Track the actual last day we created

  for (let day = 0; day < studyDays; day++) {
    const currentDate = new Date(validStartDate);
    currentDate.setDate(currentDate.getDate() + day);
    const dateStr = currentDate.toISOString().split('T')[0];

    const sessions: StudySession[] = [];
    let dailyHoursUsed = 0;

    // Fill the day up to targetDailyHours
    while (dailyHoursUsed < targetDailyHours && currentTopicIndex < distributedTopics.length) {
      // Get current topic
      const topic = distributedTopics[currentTopicIndex];

      // If starting new topic, set its hours
      if (remainingHoursInCurrentTopic === 0) {
        remainingHoursInCurrentTopic = topic.hours;
      }

      // Calculate session duration (max 2 hours per session, or what's left in day)
      const remainingHoursToday = targetDailyHours - dailyHoursUsed;
      const sessionHours = Math.min(
        remainingHoursInCurrentTopic,
        remainingHoursToday,
        2 // Max 2 hours per session
      );

      // Only create session if it's at least 30 minutes OR it's the last bit of the topic
      if (sessionHours >= 0.5 || remainingHoursInCurrentTopic < 1) {
        const actualSessionHours = Math.max(0.5, Math.min(sessionHours, remainingHoursInCurrentTopic));

        const session: StudySession = {
          id: `session-${dateStr}-${sessions.length}`,
          topicId: topic.topicId,
          topicName: topic.topicName,
          chapterId: topic.chapterId,
          chapterName: topic.chapterName,
          subjectId: topic.subjectId,
          subjectName: topic.subjectName,
          date: dateStr,
          startTime: `${8 + Math.floor(dailyHoursUsed)}:${Math.round((dailyHoursUsed % 1) * 60)
            .toString()
            .padStart(2, '0')}`,
          duration: Math.round(actualSessionHours * 60),
          status: 'not-started',
          completed: false,
          completionPercentage: 0,
        };

        sessions.push(session);
        dailyHoursUsed += actualSessionHours;
        remainingHoursInCurrentTopic -= actualSessionHours;

        // Move to next topic if current is finished
        if (remainingHoursInCurrentTopic < 0.1) {
          currentTopicIndex++;
          remainingHoursInCurrentTopic = 0;
        }
      } else {
        // Not enough time today for this topic, move to next day
        break;
      }

      // Safety check - don't overfill the day
      if (dailyHoursUsed >= profile.studyHoursPerDay * 0.95) {
        break;
      }
    }

    // Create daily plan if we have sessions
    if (sessions.length > 0) {
      dailyPlans[dateStr] = {
        date: dateStr,
        sessions,
        totalHours: dailyHoursUsed,
        completedHours: 0,
        burnoutLevel: 0,
      };
      lastStudyDayIndex = day; // Update last study day
    }

    // Stop if we've distributed all topics
    if (currentTopicIndex >= distributedTopics.length) {
      logPlanGeneration(`All topics distributed by day ${day + 1}`);
      break;
    }
  }

  logPlanGeneration(`Created ${Object.keys(dailyPlans).length} study days`);

  // Generate revision days
  const lastStudyDay = new Date(validStartDate);
  lastStudyDay.setDate(lastStudyDay.getDate() + lastStudyDayIndex);

  for (let day = 0; day < revisionDays; day++) {
    const revisionDate = new Date(lastStudyDay);
    revisionDate.setDate(revisionDate.getDate() + day + 1);
    const dateStr = revisionDate.toISOString().split('T')[0];

    const revisionSessions: StudySession[] = [];
    let dailyHours = 0;
    const hoursPerSubject = targetDailyHours / subjects.length;

    subjects.forEach((subject, idx) => {
      const session: StudySession = {
        id: `revision-${dateStr}-${idx}`,
        topicId: `revision-${subject.id}`,
        topicName: `${subject.name} - Comprehensive Revision`,
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

  // Generate weekly summaries
  const totalWeeks = Math.ceil(profile.totalDays / 7);
  for (let week = 0; week < totalWeeks; week++) {
    const weekStart = new Date(startDate);
    weekStart.setDate(weekStart.getDate() + week * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

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
      weakSubjects: [],
      strongSubjects: [],
    });
  }

  logPlanGeneration('Plan generation complete');

  // Convert dailyPlans to days array for new component structure
  const days = Object.values(dailyPlans).map(day => ({
    date: day.date,
    sessions: day.sessions.map(session => ({
      ...session
    }))
  }));

  return {
    dailyPlans,
    days,
    weeklySummaries,
    overallProgress: 0,
    subjectTracking: {},
    parentAlerts: [],
  };
};

// Dynamic adaptation based on mood after each session
export const adaptPlanAfterSession = (
  plan: StudyPlan,
  sessionId: string,
  mood: number, // 1-5
  date: string
): StudyPlan => {
  const updatedPlan = { ...plan };
  const dailyPlan = updatedPlan.dailyPlans[date];

  if (!dailyPlan) return plan;

  const sessionIndex = dailyPlan.sessions.findIndex(s => s.id === sessionId);
  if (sessionIndex === -1) return plan;

  // If mood is very low (1-2), adjust upcoming sessions
  if (mood <= 2) {
    logPlanGeneration(`Low mood detected (${mood}). Adapting plan...`);

    // Reduce duration of remaining sessions today
    for (let i = sessionIndex + 1; i < dailyPlan.sessions.length; i++) {
      const session = dailyPlan.sessions[i];
      if (session.status === 'not-started') {
        // Reduce by 25%
        session.duration = Math.round(session.duration * 0.75);
        logPlanGeneration(`Reduced session ${session.id} duration to ${session.duration} mins`);
      }
    }

    // Update burnout level
    dailyPlan.burnoutLevel = Math.min(100, dailyPlan.burnoutLevel + 20);
  } else if (mood >= 4) {
    // High mood - student is doing well, maintain or slightly increase
    dailyPlan.burnoutLevel = Math.max(0, dailyPlan.burnoutLevel - 5);
  }

  return updatedPlan;
};

// Allow users to customize/reorder sessions
export const reorderSession = (
  plan: StudyPlan,
  date: string,
  fromIndex: number,
  toIndex: number
): StudyPlan => {
  const updatedPlan = { ...plan };
  const dailyPlan = updatedPlan.dailyPlans[date];

  if (!dailyPlan) return plan;

  const sessions = [...dailyPlan.sessions];
  const [removed] = sessions.splice(fromIndex, 1);
  sessions.splice(toIndex, 0, removed);

  // Recalculate start times
  let currentHour = 8;
  sessions.forEach((session) => {
    const hours = session.duration / 60;
    session.startTime = `${Math.floor(currentHour)}:${Math.round((currentHour % 1) * 60)
      .toString()
      .padStart(2, '0')}`;
    currentHour += hours;
  });

  dailyPlan.sessions = sessions;
  return updatedPlan;
};

// Change subject for a session
export const changeSessionSubject = (
  plan: StudyPlan,
  profile: UserProfile,
  date: string,
  sessionId: string,
  newSubjectId: string
): StudyPlan => {
  const updatedPlan = { ...plan };
  const dailyPlan = updatedPlan.dailyPlans[date];

  if (!dailyPlan) return plan;

  const sessionIndex = dailyPlan.sessions.findIndex(s => s.id === sessionId);
  if (sessionIndex === -1) return plan;

  // Get curriculum data
  const boardData = curriculumData.find((b) => b.id === profile.board);
  if (!boardData) return plan;

  const streamData = boardData.classes[profile.class]?.find((s) => s.id === profile.stream);
  if (!streamData) return plan;

  const newSubject = streamData.subjects.find(s => s.id === newSubjectId);
  if (!newSubject || newSubject.chapters.length === 0) return plan;

  // Pick a random topic from the subject (or first available)
  const firstChapter = newSubject.chapters[0];
  const firstTopic = firstChapter.topics[0];

  dailyPlan.sessions[sessionIndex] = {
    ...dailyPlan.sessions[sessionIndex],
    topicId: firstTopic.id,
    topicName: firstTopic.name,
    chapterId: firstChapter.id,
    chapterName: firstChapter.name,
    subjectId: newSubject.id,
    subjectName: newSubject.name,
  };

  return updatedPlan;
};