import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { useStudyPlan } from '../context/StudyPlanContext';
import { Trophy, Star, Zap, Award, TrendingUp, Target, Crown, Flame, Shield } from 'lucide-react';
import { GamificationProfile, Challenge, Achievement as AchievementType } from '../types';

export const GamificationDashboard: React.FC = () => {
  const { studyPlan } = useStudyPlan();
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'challenges'>('overview');

  if (!studyPlan || !studyPlan.gamification) {
    return null;
  }

  const profile = studyPlan.gamification;
  const xpProgress = (profile.currentXP / profile.xpToNextLevel) * 100;

  const rarityColors = {
    common: 'bg-gray-100 text-gray-800 border-gray-300',
    rare: 'bg-blue-100 text-blue-800 border-blue-300',
    epic: 'bg-purple-100 text-purple-800 border-purple-300',
    legendary: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Level Card */}
        <Card className="p-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Level</p>
              <p className="text-4xl font-bold">{profile.level}</p>
            </div>
            <Crown className="w-12 h-12 opacity-80" />
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1">
              <span>{profile.currentXP} XP</span>
              <span>{profile.xpToNextLevel} XP</span>
            </div>
            <Progress value={xpProgress} className="h-2 bg-white/20" />
          </div>
        </Card>

        {/* Total XP */}
        <Card className="p-6 bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total XP</p>
              <p className="text-4xl font-bold">{profile.totalXP.toLocaleString()}</p>
            </div>
            <Zap className="w-12 h-12 opacity-80" />
          </div>
        </Card>

        {/* Badges */}
        <Card className="p-6 bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Badges</p>
              <p className="text-4xl font-bold">{profile.badges.length}</p>
            </div>
            <Award className="w-12 h-12 opacity-80" />
          </div>
        </Card>

        {/* Streak Freezes */}
        <Card className="p-6 bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Streak Freezes</p>
              <p className="text-4xl font-bold">{profile.streakFreezes}</p>
            </div>
            <Shield className="w-12 h-12 opacity-80" />
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <Button
          variant={activeTab === 'overview' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('overview')}
          className="rounded-b-none"
        >
          <Trophy className="w-4 h-4 mr-2" />
          Overview
        </Button>
        <Button
          variant={activeTab === 'achievements' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('achievements')}
          className="rounded-b-none"
        >
          <Star className="w-4 h-4 mr-2" />
          Achievements
        </Button>
        <Button
          variant={activeTab === 'challenges' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('challenges')}
          className="rounded-b-none"
        >
          <Target className="w-4 h-4 mr-2" />
          Challenges
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Recent Badges */}
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-500" />
              Recent Badges
            </h3>
            {profile.badges.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No badges earned yet. Keep studying to unlock your first badge!</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {profile.badges.slice(-8).reverse().map((badge) => (
                  <div
                    key={badge.id}
                    className={`p-4 rounded-lg border-2 text-center ${rarityColors[badge.rarity]}`}
                  >
                    <div className="text-4xl mb-2">{badge.icon}</div>
                    <p className="font-semibold text-sm">{badge.name}</p>
                    <p className="text-xs opacity-75 mt-1">{badge.description}</p>
                    {badge.unlockedAt && (
                      <p className="text-xs mt-2 opacity-60">
                        {new Date(badge.unlockedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Active Challenges */}
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              Active Challenges
            </h3>
            {profile.activeChallenges.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No active challenges. New challenges will appear daily!</p>
            ) : (
              <div className="space-y-4">
                {profile.activeChallenges.map((challenge) => (
                  <ChallengeCard key={challenge.id} challenge={challenge} />
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="space-y-4">
          {['streak', 'study-time', 'subject-mastery', 'mood', 'special'].map((category) => {
            const categoryAchievements = profile.achievements.filter((a) => a.category === category);
            if (categoryAchievements.length === 0) return null;

            return (
              <Card key={category} className="p-6">
                <h3 className="text-lg font-bold mb-4 capitalize">{category.replace('-', ' ')} Achievements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categoryAchievements.map((achievement) => (
                    <AchievementCard key={achievement.id} achievement={achievement} />
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {activeTab === 'challenges' && (
        <div className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">Active Challenges</h3>
            <div className="space-y-4">
              {profile.activeChallenges.map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} detailed />
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">Completed Challenges</h3>
            {profile.completedChallenges.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No completed challenges yet.</p>
            ) : (
              <div className="space-y-4">
                {profile.completedChallenges.slice(-10).reverse().map((challenge) => (
                  <ChallengeCard key={challenge.id} challenge={challenge} completed />
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

const ChallengeCard: React.FC<{
  challenge: Challenge;
  detailed?: boolean;
  completed?: boolean;
}> = ({ challenge, detailed = false, completed = false }) => {
  const typeColors = {
    daily: 'bg-blue-100 text-blue-800',
    weekly: 'bg-purple-100 text-purple-800',
    special: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <div className={`p-4 rounded-lg border ${completed ? 'bg-green-50 border-green-300' : 'bg-white border-gray-200'}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge className={typeColors[challenge.type]}>{challenge.type}</Badge>
            {completed && <Badge className="bg-green-100 text-green-800">✓ Completed</Badge>}
          </div>
          <h4 className="font-bold">{challenge.title}</h4>
          <p className="text-sm text-gray-600">{challenge.description}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-indigo-600">+{challenge.xpReward} XP</p>
        </div>
      </div>

      {!completed && (
        <>
          <div className="mt-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">
                {challenge.requirement.current} / {challenge.requirement.target}
              </span>
              <span className="font-semibold">{Math.round(challenge.progress)}%</span>
            </div>
            <Progress value={challenge.progress} className="h-2" />
          </div>

          {detailed && (
            <div className="mt-2 text-xs text-gray-500">
              Ends: {new Date(challenge.endDate).toLocaleString()}
            </div>
          )}
        </>
      )}

      {completed && challenge.completedAt && (
        <p className="text-xs text-green-600 mt-2">
          Completed on {new Date(challenge.completedAt).toLocaleDateString()}
        </p>
      )}
    </div>
  );
};

const AchievementCard: React.FC<{ achievement: AchievementType }> = ({ achievement }) => {
  return (
    <div
      className={`p-4 rounded-lg border-2 ${
        achievement.unlocked
          ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-300'
          : 'bg-gray-50 border-gray-200 opacity-60'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="text-4xl">{achievement.unlocked ? achievement.icon : '🔒'}</div>
        <div className="flex-1">
          <h4 className="font-bold">{achievement.title}</h4>
          <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
          <div className="flex items-center justify-between">
            <Badge className="bg-indigo-100 text-indigo-800">+{achievement.xpReward} XP</Badge>
            {achievement.unlocked && achievement.unlockedAt && (
              <p className="text-xs text-gray-500">
                {new Date(achievement.unlockedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};