import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Trophy, Target, User } from 'lucide-react';
import axios from 'axios';

interface Unit {
  unit_id: number;
  unit_name: string;
  mastery_score: number;
}

const DashboardScreen: React.FC = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPoints, setUserPoints] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Mock user ID for now - in real app this would come from authentication
      const userId = 1;
      const response = await axios.get(`/api/dashboard/${userId}`);
      setUnits(response.data.units || []);
      setUserPoints(response.data.points || 0);
      setCurrentLevel(response.data.level || 1);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Mock data for development
      setUnits([
        { unit_id: 1, unit_name: 'Number Systems', mastery_score: 0.75 },
        { unit_id: 2, unit_name: 'Algebra', mastery_score: 0.60 },
        { unit_id: 3, unit_name: 'Coordinate Geometry', mastery_score: 0.45 },
        { unit_id: 4, unit_name: 'Geometry', mastery_score: 0.30 },
        { unit_id: 5, unit_name: 'Trigonometry', mastery_score: 0.20 },
        { unit_id: 6, unit_name: 'Mensuration', mastery_score: 0.10 },
        { unit_id: 7, unit_name: 'Statistics and Probability', mastery_score: 0.05 }
      ]);
      setUserPoints(1250);
      setCurrentLevel(3);
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-500';
    if (score >= 0.6) return 'bg-blue-500';
    if (score >= 0.4) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getMasteryText = (score: number) => {
    if (score >= 0.8) return 'Mastered';
    if (score >= 0.6) return 'Good';
    if (score >= 0.4) return 'Learning';
    return 'Beginner';
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">MathMaster</h1>
                <p className="text-sm text-gray-600">CBSE Class 10 Practice</p>
              </div>
            </div>
            <Link to="/profile" className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
              <User className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700">Profile</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Points</p>
                <p className="text-2xl font-bold text-gray-900">{userPoints.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Level</p>
                <p className="text-2xl font-bold text-gray-900">{currentLevel}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Units Mastered</p>
                <p className="text-2xl font-bold text-gray-900">{units.filter(u => u.mastery_score >= 0.8).length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Challenge */}
        <div className="card p-6 mb-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">Daily Challenge</h3>
              <p className="text-purple-100">Complete 10 questions from any topic to earn bonus points!</p>
            </div>
            <button className="bg-white text-purple-600 px-6 py-3 rounded-lg font-medium hover:bg-purple-50 transition-colors">
              Start Challenge
            </button>
          </div>
        </div>

        {/* Units Grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Mathematics Units</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {units.map((unit) => (
              <Link
                key={unit.unit_id}
                to={`/topics/${unit.unit_id}`}
                className="card p-6 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {unit.unit_name}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getProgressColor(unit.mastery_score)}`}>
                    {getMasteryText(unit.mastery_score)}
                  </span>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>{Math.round(unit.mastery_score * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full progress-bar ${getProgressColor(unit.mastery_score)}`}
                      style={{ width: `${unit.mastery_score * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600">
                  Click to practice topics in this unit
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;