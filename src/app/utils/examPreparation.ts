import { Exam, CrashCourse, SyllabusTracker, DailyPlan, StudySession, MockTest, UserProfile } from '../types';
import { curriculumData } from '../data/curriculum';

// Generate crash course for upcoming exam
export const generateCrashCourse = (
  exam: Exam,
  userProfile: UserProfile,
  currentDate: string,
  priority: 'high-priority-topics' | 'revision-only' | 'balanced'
): CrashCourse => {
  const today = new Date(currentDate);
  const examDate = new Date(exam.date);
  const daysRemaining = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (daysRemaining <= 0) {
    throw new Error('Exam date has passed or is today');
  }

  const dailyPlans: Record<string, DailyPlan> = {};
  
  // Get curriculum data for exam subjects
  const boardData = curriculumData.find((b) => b.id === userProfile.board);
  if (!boardData) throw new Error('Board not found');

  const streamData = boardData.classes[userProfile.class]?.find((s) => s.id === userProfile.stream);
  if (!streamData) throw new Error('Stream not found');

  const examSubjects = streamData.subjects.filter((s) => exam.subjectIds.includes(s.id));
  
  // Distribute topics across remaining days
  const hoursPerDay = Math.min(userProfile.studyHoursPerDay * 1.2, 8); // Can extend slightly for exam prep
  
  if (priority === 'revision-only') {
    // Pure revision - rotate through subjects
    for (let day = 0; day < daysRemaining; day++) {
      const date = new Date(today);
      date.setDate(date.getDate() + day);
      const dateStr = date.toISOString().split('T')[0];

      const sessions: StudySession[] = [];
      const hoursPerSubject = hoursPerDay / examSubjects.length;
      let currentTime = 8;

      examSubjects.forEach((subject, idx) => {
        sessions.push({
          id: `crash-${dateStr}-${idx}`,
          topicId: `revision-${subject.id}`,
          topicName: `${subject.name} - Full Revision`,
          chapterId: 'revision',
          chapterName: 'Exam Revision',
          subjectId: subject.id,
          subjectName: subject.name,
          date: dateStr,
          startTime: `${Math.floor(currentTime)}:${Math.round((currentTime % 1) * 60).toString().padStart(2, '0')}`,
          duration: Math.round(hoursPerSubject * 60),
          status: 'not-started',
          completed: false,
          completionPercentage: 0,
        });
        currentTime += hoursPerSubject;
      });

      dailyPlans[dateStr] = {
        date: dateStr,
        sessions,
        totalHours: hoursPerDay,
        completedHours: 0,
        burnoutLevel: 0,
      };
    }
  } else if (priority === 'high-priority-topics') {
    // Focus on important/difficult topics
    const priorityTopics: Array<{
      subject: any;
      topic: any;
      chapter: any;
      priority: number;
    }> = [];

    examSubjects.forEach((subject) => {
      const difficulty = userProfile.subjectDifficulties[subject.id] || 'medium';
      const priorityMultiplier = difficulty === 'tough' ? 3 : difficulty === 'medium' ? 2 : 1;

      subject.chapters.forEach((chapter) => {
        chapter.topics.slice(0, 3).forEach((topic) => { // Top 3 topics per chapter
          priorityTopics.push({
            subject,
            topic,
            chapter,
            priority: priorityMultiplier,
          });
        });
      });
    });

    // Sort by priority
    priorityTopics.sort((a, b) => b.priority - a.priority);

    // Distribute across days
    let topicIndex = 0;
    for (let day = 0; day < daysRemaining && topicIndex < priorityTopics.length; day++) {
      const date = new Date(today);
      date.setDate(date.getDate() + day);
      const dateStr = date.toISOString().split('T')[0];

      const sessions: StudySession[] = [];
      let dailyHours = 0;
      let currentTime = 8;

      while (dailyHours < hoursPerDay && topicIndex < priorityTopics.length) {
        const item = priorityTopics[topicIndex];
        const sessionDuration = Math.min(1.5, hoursPerDay - dailyHours); // Max 1.5 hours per session

        sessions.push({
          id: `crash-${dateStr}-${sessions.length}`,
          topicId: item.topic.id,
          topicName: item.topic.name,
          chapterId: item.chapter.id,
          chapterName: item.chapter.name,
          subjectId: item.subject.id,
          subjectName: item.subject.name,
          date: dateStr,
          startTime: `${Math.floor(currentTime)}:${Math.round((currentTime % 1) * 60).toString().padStart(2, '0')}`,
          duration: Math.round(sessionDuration * 60),
          status: 'not-started',
          completed: false,
          completionPercentage: 0,
        });

        dailyHours += sessionDuration;
        currentTime += sessionDuration;
        topicIndex++;
      }

      dailyPlans[dateStr] = {
        date: dateStr,
        sessions,
        totalHours: dailyHours,
        completedHours: 0,
        burnoutLevel: 0,
      };
    }
  } else {
    // Balanced approach
    const allTopics: Array<{ subject: any; topic: any; chapter: any }> = [];

    examSubjects.forEach((subject) => {
      subject.chapters.forEach((chapter) => {
        chapter.topics.forEach((topic) => {
          allTopics.push({ subject, topic, chapter });
        });
      });
    });

    // Distribute evenly
    const topicsPerDay = Math.ceil(allTopics.length / daysRemaining);
    
    for (let day = 0; day < daysRemaining; day++) {
      const date = new Date(today);
      date.setDate(date.getDate() + day);
      const dateStr = date.toISOString().split('T')[0];

      const startIdx = day * topicsPerDay;
      const endIdx = Math.min((day + 1) * topicsPerDay, allTopics.length);
      const todayTopics = allTopics.slice(startIdx, endIdx);

      const sessions: StudySession[] = [];
      const hoursPerTopic = hoursPerDay / todayTopics.length;
      let currentTime = 8;

      todayTopics.forEach((item, idx) => {
        sessions.push({
          id: `crash-${dateStr}-${idx}`,
          topicId: item.topic.id,
          topicName: item.topic.name,
          chapterId: item.chapter.id,
          chapterName: item.chapter.name,
          subjectId: item.subject.id,
          subjectName: item.subject.name,
          date: dateStr,
          startTime: `${Math.floor(currentTime)}:${Math.round((currentTime % 1) * 60).toString().padStart(2, '0')}`,
          duration: Math.round(hoursPerTopic * 60),
          status: 'not-started',
          completed: false,
          completionPercentage: 0,
        });
        currentTime += hoursPerTopic;
      });

      dailyPlans[dateStr] = {
        date: dateStr,
        sessions,
        totalHours: hoursPerDay,
        completedHours: 0,
        burnoutLevel: 0,
      };
    }
  }

  return {
    id: `crash-${exam.id}-${Date.now()}`,
    examId: exam.id,
    name: `${exam.name} - ${daysRemaining} Day Crash Course`,
    startDate: currentDate,
    endDate: exam.date,
    daysRemaining,
    dailyPlans,
    priority,
    completed: false,
  };
};

// Track syllabus coverage for an exam
export const calculateSyllabusCoverage = (
  exam: Exam,
  completedSessions: StudySession[]
): Record<string, SyllabusTracker> => {
  const trackers: Record<string, SyllabusTracker> = {};

  exam.subjectIds.forEach((subjectId) => {
    const subjectSessions = completedSessions.filter((s) => s.subjectId === subjectId);
    const completedTopics = new Set(
      subjectSessions.filter((s) => s.status === 'completed').map((s) => s.topicId)
    );
    const inProgressTopics = new Set(
      subjectSessions.filter((s) => s.status === 'in-progress').map((s) => s.topicId)
    );

    // Get total topics from exam syllabus
    const totalTopics = exam.syllabusTopics.filter((topicId) => 
      // Check if topic belongs to this subject
      topicId.includes(subjectId)
    ).length;

    const topicStatus: Record<string, 'completed' | 'in-progress' | 'not-started'> = {};
    exam.syllabusTopics.forEach((topicId) => {
      if (topicId.includes(subjectId)) {
        if (completedTopics.has(topicId)) {
          topicStatus[topicId] = 'completed';
        } else if (inProgressTopics.has(topicId)) {
          topicStatus[topicId] = 'in-progress';
        } else {
          topicStatus[topicId] = 'not-started';
        }
      }
    });

    trackers[subjectId] = {
      examId: exam.id,
      subjectId,
      totalTopics,
      completedTopics: completedTopics.size,
      inProgressTopics: inProgressTopics.size,
      notStartedTopics: totalTopics - completedTopics.size - inProgressTopics.size,
      coveragePercentage: totalTopics > 0 ? Math.round((completedTopics.size / totalTopics) * 100) : 0,
      topicStatus,
    };
  });

  return trackers;
};

// Get exam readiness score
export const calculateExamReadiness = (
  exam: Exam,
  syllabusTrackers: Record<string, SyllabusTracker>,
  mockTestScores: number[]
): {
  overallReadiness: number;
  subjectReadiness: Record<string, number>;
  recommendation: string;
} => {
  const subjectReadiness: Record<string, number> = {};

  exam.subjectIds.forEach((subjectId) => {
    const tracker = syllabusTrackers[subjectId];
    if (tracker) {
      // 70% weight on syllabus coverage, 30% on mock test performance
      const syllabusScore = tracker.coveragePercentage;
      const mockScore = mockTestScores.length > 0
        ? mockTestScores.reduce((a, b) => a + b, 0) / mockTestScores.length
        : 0;
      
      subjectReadiness[subjectId] = Math.round(syllabusScore * 0.7 + mockScore * 0.3);
    }
  });

  const overallReadiness = Object.values(subjectReadiness).reduce((a, b) => a + b, 0) / exam.subjectIds.length;

  let recommendation = '';
  if (overallReadiness >= 85) {
    recommendation = 'Excellent! You\'re well-prepared. Focus on revision and mock tests.';
  } else if (overallReadiness >= 70) {
    recommendation = 'Good progress! Focus on completing remaining topics and practice tests.';
  } else if (overallReadiness >= 50) {
    recommendation = 'Moderate preparation. Increase study hours and focus on weak areas.';
  } else {
    recommendation = 'Critical! You need intensive preparation. Consider a crash course.';
  }

  return {
    overallReadiness: Math.round(overallReadiness),
    subjectReadiness,
    recommendation,
  };
};

// Generate revision priority list
export const generateRevisionPriority = (
  exam: Exam,
  syllabusTrackers: Record<string, SyllabusTracker>,
  recentMoodData: Record<string, number> // topicId -> avgMood
): Array<{
  topicId: string;
  subjectId: string;
  priority: number;
  reason: string;
}> => {
  const priorities: Array<{
    topicId: string;
    subjectId: string;
    priority: number;
    reason: string;
  }> = [];

  exam.subjectIds.forEach((subjectId) => {
    const tracker = syllabusTrackers[subjectId];
    if (!tracker) return;

    Object.entries(tracker.topicStatus).forEach(([topicId, status]) => {
      let priority = 0;
      let reason = '';

      if (status === 'not-started') {
        priority = 100;
        reason = 'Not yet started - critical priority';
      } else if (status === 'in-progress') {
        priority = 80;
        reason = 'In progress - needs completion';
      } else {
        // Completed - check if needs revision based on mood
        const avgMood = recentMoodData[topicId] || 3;
        if (avgMood < 3) {
          priority = 70;
          reason = 'Needs revision - low confidence';
        } else if (avgMood >= 4) {
          priority = 20;
          reason = 'Strong topic - light revision';
        } else {
          priority = 40;
          reason = 'Moderate revision needed';
        }
      }

      priorities.push({
        topicId,
        subjectId,
        priority,
        reason,
      });
    });
  });

  return priorities.sort((a, b) => b.priority - a.priority);
};

// Calculate days until exam
export const getDaysUntilExam = (examDate: string): number => {
  const today = new Date();
  const exam = new Date(examDate);
  today.setHours(0, 0, 0, 0);
  exam.setHours(0, 0, 0, 0);
  return Math.ceil((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

// Check if intensive preparation needed
export const needsIntensivePrep = (
  daysUntilExam: number,
  coveragePercentage: number
): boolean => {
  if (daysUntilExam <= 7 && coveragePercentage < 70) return true;
  if (daysUntilExam <= 14 && coveragePercentage < 50) return true;
  if (daysUntilExam <= 30 && coveragePercentage < 30) return true;
  return false;
};
