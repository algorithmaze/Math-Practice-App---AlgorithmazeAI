import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Trophy, Target, User } from 'lucide-react';
// import axios from 'axios'; // Not needed for local syllabus data for now
import syllabusData from '../data/syllabus.json'; // Import local syllabus data

// Interface for syllabus unit from syllabus.json
interface SyllabusUnit {
  id: string;
  name: string;
  // mastery_score can be added later from user progress data
  // topics: Array<{ id: string; name: string; description: string; }>; // Not needed directly in Dashboard unit list
}

const DashboardScreen: React.FC = () => {
  const [units, setUnits] = useState<SyllabusUnit[]>([]);
  const [loading, setLoading] = useState(true);
  // User stats can be re-integrated later with backend calls
  // const [userPoints, setUserPoints] = useState(0);
  // const [currentLevel, setCurrentLevel] = useState(1);

  useEffect(() => {
    loadSyllabusUnits();
  }, []);

  const loadSyllabusUnits = () => {
    // For now, just map the ID and name. Mastery score will be 0 or fetched later.
    const formattedUnits = syllabusData.map(unit => ({
      id: unit.id,
      name: unit.name,
      // mastery_score: 0, // Default mastery score, or remove if not displaying yet
    }));
    setUnits(formattedUnits);
    setLoading(false);
    // setUserPoints(1250); // Mock data removed for now
    // setCurrentLevel(3); // Mock data removed for now
  };

  // These functions can be simplified or removed if mastery is not shown yet
  const getProgressColor = (score?: number) => {
    if (score === undefined) return 'bg-gray-300'; // Default for no score
    if (score >= 0.8) return 'bg-green-500';
    if (score >= 0.6) return 'bg-blue-500';
    if (score >= 0.4) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getMasteryText = (score?: number) => {
    if (score === undefined) return 'Not Started'; // Default for no score
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
        {/* Stats Cards - Temporarily simplified or commented out as userPoints/currentLevel are not fetched */}
        {/*
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6"> ... Total Points ... </div>
          <div className="card p-6"> ... Current Level ... </div>
          <div className="card p-6"> ... Units Mastered ... </div>
        </div>
        */}

        {/* Daily Challenge - Temporarily simplified or commented out */}
        {/*
        <div className="card p-6 mb-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          ... Daily Challenge content ...
        </div>
        */}

        {/* Units Grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Mathematics Units</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {units.map((unit) => (
              <Link
                key={unit.id} // Use unit.id from syllabusData
                to={`/topics/${unit.id}`} // Pass unit.id to TopicListScreen
                className="card p-6 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {unit.name} {/* Use unit.name from syllabusData */}
                  </h3>
                  {/* Mastery score display removed for now */}
                  {/*
                  <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getProgressColor(unit.mastery_score)}`}>
                    {getMasteryText(unit.mastery_score)}
                  </span>
                  */}
                </div>
                
                {/* Progress bar removed for now */}
                {/*
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
                */}
                
                <p className="text-sm text-gray-600">
                  Click to view topics in this unit.
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