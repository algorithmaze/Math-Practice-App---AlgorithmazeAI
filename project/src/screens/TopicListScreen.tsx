import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, BookOpen, AlertTriangle } from 'lucide-react';
import axios from 'axios'; // Now needed for API calls
// import syllabusData from '../data/syllabus.json'; // Will be replaced by API call

interface ApiTopic {
  _id: string; // MongoDB ObjectId
  name: string;
  description?: string;
  unit_id: string; // Reference to SyllabusUnit _id
  order?: number;
  // mastery_score, etc. can be added later
}

interface ApiSyllabusUnit { // For fetching unit name
  _id: string;
  name: string;
}


const TopicListScreen: React.FC = () => {
  const { unitId } = useParams<{ unitId: string }>();
  const navigate = useNavigate();
  const [topics, setTopics] = useState<ApiTopic[]>([]);
  const [unitName, setUnitName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (unitId) {
      fetchUnitDetailsAndTopics();
    } else {
      setError("No Unit ID provided.");
      setLoading(false);
    }
  }, [unitId]);

  const fetchUnitDetailsAndTopics = async () => {
    setLoading(true);
    setError(null);
    if (!unitId) return;

    try {
      const token = localStorage.getItem('token'); // Assuming routes might be protected
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      // Fetch Unit Name (Optional: could also pass from DashboardScreen via route state)
      // For now, assuming a direct API endpoint for a single unit, or adjust if not available
      // If /api/syllabus/units/:unitId exists and returns unit details:
      try {
        const unitResponse = await axios.get(`/api/syllabus/units/${unitId}`, config); // Placeholder: This endpoint for single unit detail doesn't exist yet.
                                                                                      // The current /api/syllabus/units returns all units.
                                                                                      // We'll filter from all units for now, or rely on topic API to return unit name if designed that way.
                                                                                      // For now, let's assume we fetch all units and find the name.
        const allUnitsResponse = await axios.get('/api/syllabus/units', config);
        const currentUnit = allUnitsResponse.data.find((u: ApiSyllabusUnit) => u._id === unitId);
        if (currentUnit) {
          setUnitName(currentUnit.name);
        } else {
          setUnitName('Unit details not found'); // Fallback if unit name can't be fetched
        }
      } catch (unitError) {
        console.error('Error fetching unit name:', unitError);
        setUnitName('Unit'); // Default name on error
      }


      // Fetch Topics for the unit
      const topicsResponse = await axios.get(`/api/syllabus/units/${unitId}/topics`, config);
      setTopics(topicsResponse.data);

    } catch (err: any) {
      console.error('Error fetching topics:', err);
      if (err.response && err.response.status === 401) {
        navigate('/login', {state: {message: "Session expired. Please login."}});
        return;
      }
       if (err.response && err.response.status === 404) {
        setError(`Topics not found for this unit or unit does not exist.`);
        setTopics([]); // Clear topics if unit not found
      } else {
        setError('Failed to load topics. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  // These functions can be simplified or removed if mastery is not shown yet
  const getProgressColor = (score?: number) => {
    if (score === undefined) return 'bg-gray-300';
    if (score >= 0.8) return 'bg-green-500';
    if (score >= 0.6) return 'bg-blue-500';
    if (score >= 0.4) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getMasteryText = (score?: number) => {
    if (score === undefined) return 'Not Started';
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
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{unitName || 'Topics'}</h1>
                <p className="text-sm text-gray-600">Choose a topic to practice</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Unit Overview - Temporarily simplified */}
        <div className="card p-6 mb-8">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{topics.length}</p>
            <p className="text-gray-600">Topics Available</p>
          </div>
        </div>

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

        {/* Topics List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Topics in {unitName || 'this unit'}</h2>
          {!loading && !error && topics.length === 0 && (
            <div className="text-center py-10 card">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No topics found</h3>
                <p className="mt-1 text-sm text-gray-500">There are no topics available for this unit yet.</p>
             </div>
          )}
          {topics.map((topic) => (
            <div key={topic._id} className="card p-6"> {/* Use topic._id from API */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {topic.name} {/* Use topic.name from API */}
                    </h3>
                    {/* Mastery text removed for now */}
                  </div>
                  {topic.description && (
                    <p className="text-sm text-gray-500 mb-3">{topic.description}</p>
                  )}
                  {/* Progress related elements removed for now */}
                </div>
                
                <Link
                  to={`/practice/${topic._id}`} // Use topic._id from API
                  className="ml-6 flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Play className="w-5 h-5" />
                  <span>Practice</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopicListScreen;