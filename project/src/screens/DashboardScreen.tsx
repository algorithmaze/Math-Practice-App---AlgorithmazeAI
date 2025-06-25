import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Trophy, Target, User, AlertTriangle } from 'lucide-react';
import axios from 'axios'; // Now needed for API calls
// import syllabusData from '../data/syllabus.json'; // Will be replaced by API call

// Interface for syllabus unit from API (matches Mongoose model)
interface ApiSyllabusUnit {
  _id: string; // MongoDB ObjectId
  name: string;
  description?: string;
  order?: number;
  // mastery_score can be added later from user progress data
}

const DashboardScreen: React.FC = () => {
  const [units, setUnits] = useState<ApiSyllabusUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  // User stats can be re-integrated later with backend calls
  // const [userPoints, setUserPoints] = useState(0);
  // const [currentLevel, setCurrentLevel] = useState(1);

  useEffect(() => {
    fetchSyllabusUnits();
  }, []);

  const fetchSyllabusUnits = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token'); // Assuming syllabus might be protected
      // If syllabus is public, headers can be omitted.
      // For now, let's assume it might need auth, adjust if API is public.
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const response = await axios.get('/api/syllabus/units', config);
      setUnits(response.data);
    } catch (err: any) {
      console.error('Error fetching syllabus units:', err);
      if (err.response && err.response.status === 401) {
        navigate('/login', {state: {message: "Session expired. Please login."}});
        return;
      }
      setError('Failed to load syllabus units. Please try again later.');
    } finally {
      setLoading(false);
    }
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
        {/* Stats Cards - Temporarily simplified or commented out */}
        {/* ... existing commented out stats cards ... */}

        {/* Daily Challenge - Temporarily simplified or commented out */}
        {/* ... existing commented out daily challenge ... */}

        {/* Units Grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Mathematics Units</h2>
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
              <div className="flex">
                <div className="py-1"><AlertTriangle className="h-6 w-6 text-red-500 mr-3" /></div>
                <div>
                  <p className="font-bold">Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}
          {!loading && !error && units.length === 0 && (
             <div className="text-center py-10 card">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No syllabus units found</h3>
                <p className="mt-1 text-sm text-gray-500">Syllabus data might be unavailable or empty. Please try again later.</p>
             </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {units.map((unit) => (
              <Link
                key={unit._id} // Use unit._id from API
                to={`/topics/${unit._id}`} // Pass unit._id to TopicListScreen
                className="card p-6 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {unit.name} {/* Use unit.name from API */}
                  </h3>
                  {/* Mastery score display removed for now */}
                </div>
                
                {/* Progress bar removed for now */}
                
                <p className="text-sm text-gray-600">
                  {unit.description || 'Click to view topics in this unit.'}
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