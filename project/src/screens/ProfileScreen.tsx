import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, Target, Calendar, Award, Star } from 'lucide-react';
import axios from 'axios';

interface UserStats {
  totalPoints: number;
  currentLevel: number;
  questionsAnswered: number;
  accuracy: number;
  currentStreak: number;
  longestStreak: number;
}

interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
}

const ProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<UserStats>({
    totalPoints: 1250,
    currentLevel: 3,
    questionsAnswered: 127,
    accuracy: 78,
    currentStreak: 5,
    longestStreak: 12
  });
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const userId = 1; // Mock user ID
      const response = await axios.get(`/api/profile/${userId}`);
      setStats(response.data.stats);
      setBadges(response.data.badges);
    } catch (error) {
      console.error('Error fetching profile data:', error);
      // Mock badges for development
      setBadges([
        {
          id: 1,
          name: 'First Steps',
          description: 'Answered your first question',
          icon: '🎯',
          earned: true,
          earnedDate: '2024-01-15'
        },
        {
          id: 2,
          name: 'Week Warrior',
          description: 'Practiced for 7 consecutive days',
          icon: '🔥',
          earned: true,
          earnedDate: '2024-01-20'
        },
        {
          id: 3,
          name: 'Number Master',
          description: 'Mastered the Number Systems unit',
          icon: '🔢',
          earned: true,
          earnedDate: '2024-01-25'
        },
        {
          id: 4,
          name: 'Algebra Ace',
          description: 'Score 90%+ accuracy in Algebra',
          icon: '📐',
          earned: false
        },
        {
          id: 5,
          name: 'Geometry Genius',
          description: 'Complete all Geometry topics',
          icon: '📏',
          earned: false
        },
        {
          id: 6,
          name: 'Streak Master',
          description: 'Achieve a 30-day practice streak',
          icon: '⚡',
          earned: false
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getLevelProgress = () => {
    const pointsForCurrentLevel = stats.currentLevel * 500;
    const pointsForNextLevel = (stats.currentLevel + 1) * 500;
    const progress = ((stats.totalPoints - pointsForCurrentLevel) / (pointsForNextLevel - pointsForCurrentLevel)) * 100;
    return Math.max(0, Math.min(100, progress));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
              <p className="text-sm text-gray-600">Track your progress and achievements</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Level and Points */}
        <div className="card p-8 mb-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">Level {stats.currentLevel}</h2>
              <p className="text-blue-100">{stats.totalPoints.toLocaleString()} total points</p>
            </div>
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Star className="w-10 h-10 text-yellow-300" />
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Progress to Level {stats.currentLevel + 1}</span>
              <span>{Math.round(getLevelProgress())}%</span>
            </div>
            <div className="w-full bg-white bg-opacity-20 rounded-full h-3">
              <div
                className="bg-yellow-300 h-3 rounded-full transition-all duration-500"
                style={{ width: `${getLevelProgress()}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.questionsAnswered}</p>
            <p className="text-sm text-gray-600">Questions Answered</p>
          </div>

          <div className="card p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Trophy className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.accuracy}%</p>
            <p className="text-sm text-gray-600">Accuracy</p>
          </div>

          <div className="card p-6 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.currentStreak}</p>
            <p className="text-sm text-gray-600">Current Streak</p>
          </div>

          <div className="card p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.longestStreak}</p>
            <p className="text-sm text-gray-600">Longest Streak</p>
          </div>
        </div>

        {/* Achievements */}
        <div className="card p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Achievements</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`p-6 rounded-lg border-2 transition-all ${
                  badge.earned
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 bg-gray-50 opacity-60'
                }`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">{badge.icon}</div>
                  <h4 className={`font-semibold mb-2 ${
                    badge.earned ? 'text-green-800' : 'text-gray-600'
                  }`}>
                    {badge.name}
                  </h4>
                  <p className={`text-sm mb-3 ${
                    badge.earned ? 'text-green-700' : 'text-gray-500'
                  }`}>
                    {badge.description}
                  </p>
                  {badge.earned && badge.earnedDate && (
                    <p className="text-xs text-green-600">
                      Earned on {new Date(badge.earnedDate).toLocaleDateString()}
                    </p>
                  )}
                  {!badge.earned && (
                    <p className="text-xs text-gray-500">Not earned yet</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;