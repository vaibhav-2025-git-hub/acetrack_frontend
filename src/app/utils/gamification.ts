import { GamificationProfile, Badge, Achievement, Challenge, StudyPlan, StudySession } from '../types';

// XP Rewards
const XP_REWARDS = {
  SESSION_COMPLETE: 50,
  TOUGH_SUBJECT: 75,
  EARLY_STUDY: 25, // Before 8 AM
  STREAK_DAY: 30,
  PERFECT_DAY: 100, // All sessions completed
  MOOD_EXCELLENT: 20,
  FIRST_SESSION: 10,
};

// Level calculation
export const calculateLevel = (totalXP: number): number => {
  return Math.floor(Math.sqrt(totalXP / 100)) + 1;
};

export const calculateXPForNextLevel = (currentLevel: number): number => {
  return (currentLevel * currentLevel * 100);
};

// Initialize gamification profile
export const initializeGamification = (userId: string): GamificationProfile => {
  return {
    userId,
    level: 1,
    currentXP: 0,
    xpToNextLevel: 100,
    totalXP: 0,
    badges: [],
    achievements: getAllAchievements(),
    activeChallenges: generateDailyChallenges(),
    completedChallenges: [],
    streakFreezes: 2, // Start with 2 streak freezes
  };
};

// Award XP for completing a session
export const awardSessionXP = (
  profile: GamificationProfile,
  session: StudySession,
  isPerfectDay: boolean = false
): GamificationProfile => {
  let xpEarned = XP_REWARDS.SESSION_COMPLETE;

  // Bonus for tough subjects
  if (session.subjectName.includes('tough') || session.duration > 90) {
    xpEarned += XP_REWARDS.TOUGH_SUBJECT;
  }

  // Bonus for early study
  const sessionHour = parseInt(session.startTime.split(':')[0]);
  if (sessionHour < 8) {
    xpEarned += XP_REWARDS.EARLY_STUDY;
  }

  // Bonus for excellent mood
  if (session.moodScore === 5) {
    xpEarned += XP_REWARDS.MOOD_EXCELLENT;
  }

  // Bonus for perfect day
  if (isPerfectDay) {
    xpEarned += XP_REWARDS.PERFECT_DAY;
  }

  const newTotalXP = profile.totalXP + xpEarned;
  const newLevel = calculateLevel(newTotalXP);
  const leveledUp = newLevel > profile.level;

  return {
    ...profile,
    currentXP: leveledUp ? newTotalXP % calculateXPForNextLevel(newLevel) : profile.currentXP + xpEarned,
    totalXP: newTotalXP,
    level: newLevel,
    xpToNextLevel: calculateXPForNextLevel(newLevel),
  };
};

// Define all achievements
export const getAllAchievements = (): Achievement[] => {
  return [
    // Streak achievements
    {
      id: 'streak-3',
      title: 'Getting Started',
      description: 'Maintain a 3-day study streak',
      xpReward: 100,
      icon: '🔥',
      category: 'streak',
      condition: { type: 'streak', value: 3 },
      unlocked: false,
    },
    {
      id: 'streak-7',
      title: 'Week Warrior',
      description: 'Maintain a 7-day study streak',
      xpReward: 250,
      icon: '⚡',
      category: 'streak',
      condition: { type: 'streak', value: 7 },
      unlocked: false,
    },
    {
      id: 'streak-30',
      title: 'Monthly Master',
      description: 'Maintain a 30-day study streak',
      xpReward: 1000,
      icon: '👑',
      category: 'streak',
      condition: { type: 'streak', value: 30 },
      unlocked: false,
    },
    {
      id: 'streak-100',
      title: 'Century Champion',
      description: 'Maintain a 100-day study streak',
      xpReward: 5000,
      icon: '💎',
      category: 'streak',
      condition: { type: 'streak', value: 100 },
      unlocked: false,
    },
    
    // Study time achievements
    {
      id: 'hours-10',
      title: 'Study Beginner',
      description: 'Complete 10 hours of study',
      xpReward: 150,
      icon: '📚',
      category: 'study-time',
      condition: { type: 'total-hours', value: 10 },
      unlocked: false,
    },
    {
      id: 'hours-50',
      title: 'Dedicated Learner',
      description: 'Complete 50 hours of study',
      xpReward: 500,
      icon: '📖',
      category: 'study-time',
      condition: { type: 'total-hours', value: 50 },
      unlocked: false,
    },
    {
      id: 'hours-100',
      title: 'Study Marathon',
      description: 'Complete 100 hours of study',
      xpReward: 1500,
      icon: '🎓',
      category: 'study-time',
      condition: { type: 'total-hours', value: 100 },
      unlocked: false,
    },
    
    // Subject mastery
    {
      id: 'perfect-week',
      title: 'Perfect Week',
      description: 'Complete all sessions for a week',
      xpReward: 500,
      icon: '⭐',
      category: 'subject-mastery',
      condition: { type: 'perfect-week', value: 1 },
      unlocked: false,
    },
    {
      id: 'early-bird',
      title: 'Early Bird',
      description: 'Complete 10 sessions before 8 AM',
      xpReward: 300,
      icon: '🌅',
      category: 'special',
      condition: { type: 'early-sessions', value: 10 },
      unlocked: false,
    },
    {
      id: 'night-owl',
      title: 'Night Owl',
      description: 'Complete 10 sessions after 8 PM',
      xpReward: 300,
      icon: '🦉',
      category: 'special',
      condition: { type: 'late-sessions', value: 10 },
      unlocked: false,
    },
    
    // Mood achievements
    {
      id: 'happy-learner',
      title: 'Happy Learner',
      description: 'Maintain excellent mood for 5 sessions',
      xpReward: 200,
      icon: '😊',
      category: 'mood',
      condition: { type: 'excellent-mood', value: 5 },
      unlocked: false,
    },
  ];
};

// Generate daily challenges
export const generateDailyChallenges = (): Challenge[] => {
  const today = new Date();
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  return [
    {
      id: `daily-${today.toISOString().split('T')[0]}-sessions`,
      title: 'Daily Grind',
      description: 'Complete 3 study sessions today',
      type: 'daily',
      xpReward: 100,
      endDate: endOfDay.toISOString(),
      progress: 0,
      completed: false,
      requirement: {
        type: 'complete-sessions',
        target: 3,
        current: 0,
      },
    },
    {
      id: `daily-${today.toISOString().split('T')[0]}-hours`,
      title: 'Time Master',
      description: 'Study for 2 hours today',
      type: 'daily',
      xpReward: 75,
      endDate: endOfDay.toISOString(),
      progress: 0,
      completed: false,
      requirement: {
        type: 'study-hours',
        target: 2,
        current: 0,
      },
    },
  ];
};

// Generate weekly challenges
export const generateWeeklyChallenges = (): Challenge[] => {
  const today = new Date();
  const endOfWeek = new Date(today);
  endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
  endOfWeek.setHours(23, 59, 59, 999);

  return [
    {
      id: `weekly-${today.toISOString().split('T')[0]}-perfect`,
      title: 'Perfect Week',
      description: 'Complete all sessions for 7 days',
      type: 'weekly',
      xpReward: 500,
      endDate: endOfWeek.toISOString(),
      progress: 0,
      completed: false,
      requirement: {
        type: 'complete-sessions',
        target: 21, // Assuming ~3 sessions per day
        current: 0,
      },
    },
    {
      id: `weekly-${today.toISOString().split('T')[0]}-tough`,
      title: 'Challenge Yourself',
      description: 'Complete 5 tough subject sessions',
      type: 'weekly',
      xpReward: 300,
      endDate: endOfWeek.toISOString(),
      progress: 0,
      completed: false,
      requirement: {
        type: 'tough-subjects',
        target: 5,
        current: 0,
      },
    },
  ];
};

// Update challenge progress
export const updateChallengeProgress = (
  profile: GamificationProfile,
  session: StudySession,
  totalHoursToday: number
): GamificationProfile => {
  const updatedChallenges = profile.activeChallenges.map((challenge) => {
    if (challenge.completed) return challenge;

    let updatedChallenge = { ...challenge };

    switch (challenge.requirement.type) {
      case 'complete-sessions':
        updatedChallenge.requirement.current += 1;
        break;
      case 'study-hours':
        updatedChallenge.requirement.current = totalHoursToday;
        break;
      case 'tough-subjects':
        if (session.duration > 90 || session.subjectName.toLowerCase().includes('tough')) {
          updatedChallenge.requirement.current += 1;
        }
        break;
      case 'early-study':
        const hour = parseInt(session.startTime.split(':')[0]);
        if (hour < 8) {
          updatedChallenge.requirement.current += 1;
        }
        break;
    }

    updatedChallenge.progress = Math.min(
      100,
      (updatedChallenge.requirement.current / updatedChallenge.requirement.target) * 100
    );

    if (updatedChallenge.requirement.current >= updatedChallenge.requirement.target) {
      updatedChallenge.completed = true;
      updatedChallenge.completedAt = new Date().toISOString();
    }

    return updatedChallenge;
  });

  // Award XP for completed challenges
  let xpBonus = 0;
  const completedChallenges: Challenge[] = [];
  const activeChallenges: Challenge[] = [];

  updatedChallenges.forEach((challenge) => {
    if (challenge.completed && !profile.completedChallenges.find(c => c.id === challenge.id)) {
      xpBonus += challenge.xpReward;
      completedChallenges.push(challenge);
    } else if (!challenge.completed) {
      activeChallenges.push(challenge);
    }
  });

  const newTotalXP = profile.totalXP + xpBonus;
  const newLevel = calculateLevel(newTotalXP);

  return {
    ...profile,
    activeChallenges,
    completedChallenges: [...profile.completedChallenges, ...completedChallenges],
    totalXP: newTotalXP,
    level: newLevel,
    currentXP: newTotalXP % calculateXPForNextLevel(newLevel),
    xpToNextLevel: calculateXPForNextLevel(newLevel),
  };
};

// Check and unlock achievements
export const checkAchievements = (
  profile: GamificationProfile,
  studyPlan: StudyPlan
): GamificationProfile => {
  const updatedAchievements = profile.achievements.map((achievement) => {
    if (achievement.unlocked) return achievement;

    let shouldUnlock = false;

    switch (achievement.condition.type) {
      case 'streak':
        shouldUnlock = studyPlan.currentStreak >= achievement.condition.value;
        break;
      case 'total-hours':
        const totalHours = Object.values(studyPlan.dailyPlans).reduce(
          (sum, day) => sum + day.completedHours,
          0
        );
        shouldUnlock = totalHours >= achievement.condition.value;
        break;
      case 'perfect-week':
        // Check if last 7 days had all sessions completed
        const last7Days = Object.keys(studyPlan.dailyPlans)
          .sort()
          .slice(-7);
        const allCompleted = last7Days.every((date) => {
          const day = studyPlan.dailyPlans[date];
          return day.sessions.every((s) => s.status === 'completed');
        });
        shouldUnlock = allCompleted;
        break;
    }

    if (shouldUnlock) {
      return {
        ...achievement,
        unlocked: true,
        unlockedAt: new Date().toISOString(),
      };
    }

    return achievement;
  });

  // Award XP for newly unlocked achievements
  let xpBonus = 0;
  updatedAchievements.forEach((achievement, index) => {
    if (achievement.unlocked && !profile.achievements[index].unlocked) {
      xpBonus += achievement.xpReward;
    }
  });

  const newTotalXP = profile.totalXP + xpBonus;
  const newLevel = calculateLevel(newTotalXP);

  return {
    ...profile,
    achievements: updatedAchievements,
    totalXP: newTotalXP,
    level: newLevel,
    currentXP: newTotalXP % calculateXPForNextLevel(newLevel),
    xpToNextLevel: calculateXPForNextLevel(newLevel),
  };
};

// Award badges based on milestones
export const checkAndAwardBadges = (
  profile: GamificationProfile,
  studyPlan: StudyPlan
): GamificationProfile => {
  const newBadges: Badge[] = [];

  // Level milestones
  if (profile.level >= 10 && !profile.badges.find(b => b.id === 'level-10')) {
    newBadges.push({
      id: 'level-10',
      name: 'Rising Star',
      description: 'Reached level 10',
      icon: '⭐',
      rarity: 'rare',
      unlockedAt: new Date().toISOString(),
    });
  }

  if (profile.level >= 25 && !profile.badges.find(b => b.id === 'level-25')) {
    newBadges.push({
      id: 'level-25',
      name: 'Elite Scholar',
      description: 'Reached level 25',
      icon: '🏆',
      rarity: 'epic',
      unlockedAt: new Date().toISOString(),
    });
  }

  if (profile.level >= 50 && !profile.badges.find(b => b.id === 'level-50')) {
    newBadges.push({
      id: 'level-50',
      name: 'Study Legend',
      description: 'Reached level 50',
      icon: '👑',
      rarity: 'legendary',
      unlockedAt: new Date().toISOString(),
    });
  }

  // Streak badges
  if (studyPlan.longestStreak >= 30 && !profile.badges.find(b => b.id === 'streak-30')) {
    newBadges.push({
      id: 'streak-30',
      name: 'Consistency King',
      description: '30-day streak achieved',
      icon: '🔥',
      rarity: 'epic',
      unlockedAt: new Date().toISOString(),
    });
  }

  return {
    ...profile,
    badges: [...profile.badges, ...newBadges],
  };
};

// Get leaderboard data (mock for now)
export const getLeaderboardData = (currentUserId: string) => {
  // In production, this would fetch from backend
  return [
    { userId: '1', userName: 'Rahul S.', avatar: '👨‍🎓', rank: 1, xp: 15420, level: 35, studyHours: 245, streak: 45, badges: 12 },
    { userId: '2', userName: 'Priya M.', avatar: '👩‍🎓', rank: 2, xp: 14280, level: 33, studyHours: 232, streak: 38, badges: 11 },
    { userId: currentUserId, userName: 'You', avatar: '🎯', rank: 3, xp: 12500, level: 30, studyHours: 198, streak: 28, badges: 9 },
    { userId: '4', userName: 'Arjun K.', avatar: '👨‍🎓', rank: 4, xp: 11200, level: 28, studyHours: 185, streak: 25, badges: 8 },
    { userId: '5', userName: 'Sneha P.', avatar: '👩‍🎓', rank: 5, xp: 9800, level: 26, studyHours: 167, streak: 20, badges: 7 },
  ];
};
