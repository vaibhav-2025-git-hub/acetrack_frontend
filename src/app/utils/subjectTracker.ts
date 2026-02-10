import { StudyPlan, SubjectTracking, ParentAlert, StudySession } from '../types';

const MAX_DAYS_WITHOUT_SUBJECT = 2;

// Calculate days between two dates
const daysBetween = (date1: string, date2: string): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  // Reset time to midnight for accurate day calculation
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  const diffTime = d2.getTime() - d1.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.abs(diffDays);
};

// Initialize subject tracking for a subject
export const initializeSubjectTracking = (
  subjectId: string,
  subjectName: string,
  startDate: string
): SubjectTracking => {
  return {
    subjectId,
    subjectName,
    lastStudiedDate: startDate,
    daysSinceLastStudy: 0,
    consecutiveSkips: 0,
    totalSessionsCompleted: 0,
    totalSessionsSkipped: 0,
  };
};

// Update subject tracking when a session is completed or skipped
export const updateSubjectTracking = (
  studyPlan: StudyPlan,
  session: StudySession
): StudyPlan => {
  const { subjectId, subjectName, date, status } = session;
  
  // Initialize tracking if it doesn't exist
  if (!studyPlan.subjectTracking) {
    studyPlan.subjectTracking = {};
  }

  if (!studyPlan.subjectTracking[subjectId]) {
    studyPlan.subjectTracking[subjectId] = initializeSubjectTracking(
      subjectId,
      subjectName,
      date
    );
  }

  const tracking = studyPlan.subjectTracking[subjectId];

  if (status === 'completed') {
    tracking.lastStudiedDate = date;
    tracking.daysSinceLastStudy = 0;
    tracking.consecutiveSkips = 0;
    tracking.totalSessionsCompleted += 1;
  } else if (status === 'skipped') {
    tracking.consecutiveSkips += 1;
    tracking.totalSessionsSkipped += 1;
    tracking.daysSinceLastStudy = daysBetween(tracking.lastStudiedDate, date);
  }

  return studyPlan;
};

// Check if a subject can be skipped (now always allowed, but sends alerts)
export const canSkipSubject = (
  studyPlan: StudyPlan,
  subjectId: string,
  currentDate: string
): { allowed: boolean; reason?: string; daysSinceLastStudy?: number; shouldAlert?: boolean } => {
  if (!studyPlan.subjectTracking || !studyPlan.subjectTracking[subjectId]) {
    return { allowed: true };
  }

  const tracking = studyPlan.subjectTracking[subjectId];
  const daysSince = daysBetween(tracking.lastStudiedDate, currentDate);

  // Always allow skip, but flag for alert if needed
  if (daysSince >= MAX_DAYS_WITHOUT_SUBJECT) {
    return {
      allowed: true, // Changed from false - now always allowed
      shouldAlert: true, // Flag to send alerts
      reason: `⚠️ Warning: You haven't studied ${tracking.subjectName} in ${daysSince} days. Parents will be notified.`,
      daysSinceLastStudy: daysSince,
    };
  }

  return { allowed: true };
};

// Check all subjects for neglect and create parent alerts
export const checkSubjectNeglect = (
  studyPlan: StudyPlan,
  currentDate: string
): StudyPlan => {
  if (!studyPlan.subjectTracking) {
    return studyPlan;
  }

  if (!studyPlan.parentAlerts) {
    studyPlan.parentAlerts = [];
  }

  Object.values(studyPlan.subjectTracking).forEach((tracking) => {
    const daysSince = daysBetween(tracking.lastStudiedDate, currentDate);

    // Alert if subject hasn't been studied for 2+ days
    if (daysSince >= MAX_DAYS_WITHOUT_SUBJECT) {
      const existingAlert = studyPlan.parentAlerts.find(
        (alert) =>
          alert.type === 'subject-neglect' &&
          alert.subjectId === tracking.subjectId &&
          !alert.acknowledged
      );

      if (!existingAlert) {
        const alert: ParentAlert = {
          id: `alert-${Date.now()}-${tracking.subjectId}`,
          type: 'subject-neglect',
          severity: daysSince >= 3 ? 'critical' : 'high',
          title: `${tracking.subjectName} Neglected`,
          message: `Your child hasn't studied ${tracking.subjectName} for ${daysSince} days. Consecutive skips: ${tracking.consecutiveSkips}. They are now required to complete this subject.`,
          subjectId: tracking.subjectId,
          subjectName: tracking.subjectName,
          date: currentDate,
          timestamp: new Date().toISOString(),
          acknowledged: false,
        };

        studyPlan.parentAlerts.push(alert);
      }
    }
  });

  return studyPlan;
};

// Get neglected subjects (need parent alerts)
export const getNeglectedSubjects = (
  studyPlan: StudyPlan,
  currentDate: string
): SubjectTracking[] => {
  if (!studyPlan.subjectTracking) {
    return [];
  }

  return Object.values(studyPlan.subjectTracking).filter((tracking) => {
    const daysSince = daysBetween(tracking.lastStudiedDate, currentDate);
    return daysSince >= MAX_DAYS_WITHOUT_SUBJECT;
  }).map(tracking => ({
    ...tracking,
    daysSinceLastStudy: daysBetween(tracking.lastStudiedDate, currentDate)
  }));
};

// Keep old name for backward compatibility
export const getBlockedSubjects = getNeglectedSubjects;

// Get subjects that are at risk (1 day away from being blocked)
export const getAtRiskSubjects = (
  studyPlan: StudyPlan,
  currentDate: string
): SubjectTracking[] => {
  if (!studyPlan.subjectTracking) {
    return [];
  }

  return Object.values(studyPlan.subjectTracking).filter((tracking) => {
    const daysSince = daysBetween(tracking.lastStudiedDate, currentDate);
    return daysSince === MAX_DAYS_WITHOUT_SUBJECT - 1;
  });
};

// Clear alerts for a subject when it's studied
export const clearSubjectAlerts = (
  studyPlan: StudyPlan,
  subjectId: string
): StudyPlan => {
  if (!studyPlan.parentAlerts) {
    return studyPlan;
  }

  studyPlan.parentAlerts = studyPlan.parentAlerts.filter(
    (alert) => !(alert.type === 'subject-neglect' && alert.subjectId === subjectId)
  );

  return studyPlan;
};

// Get unacknowledged parent alerts count
export const getUnacknowledgedAlertsCount = (studyPlan: StudyPlan): number => {
  if (!studyPlan.parentAlerts) {
    return 0;
  }

  return studyPlan.parentAlerts.filter((alert) => !alert.acknowledged).length;
};

// Acknowledge an alert
export const acknowledgeAlert = (
  studyPlan: StudyPlan,
  alertId: string
): StudyPlan => {
  if (!studyPlan.parentAlerts) {
    return studyPlan;
  }

  const alert = studyPlan.parentAlerts.find((a) => a.id === alertId);
  if (alert) {
    alert.acknowledged = true;
  }

  return studyPlan;
};