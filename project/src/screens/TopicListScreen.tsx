import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, BookOpen } from 'lucide-react';
// import axios from 'axios'; // Not needed for local syllabus data
import syllabusData from '../data/syllabus.json'; // Import local syllabus data

interface SyllabusTopic {
  id: string;
  name: string;
  description?: string; // from syllabus.json
  // mastery_score, questions_completed, total_questions can be added later
}

const TopicListScreen: React.FC = () => {
  const { unitId } = useParams<{ unitId: string }>();
  const navigate = useNavigate();
  const [topics, setTopics] = useState<SyllabusTopic[]>([]);
  const [unitName, setUnitName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTopicsForUnit();
  }, [unitId]);

  const loadTopicsForUnit = () => {
    setLoading(true);
    const currentUnit = syllabusData.find(unit => unit.id === unitId);

    if (currentUnit) {
      setUnitName(currentUnit.name);
      // Map topics to ensure they fit SyllabusTopic structure, though they already do.
      setTopics(currentUnit.topics.map(topic => ({
        id: topic.id,
        name: topic.name,
        description: topic.description
      })));
    } else {
      setUnitName('Unit not found');
      setTopics([]);
      // Optionally navigate back or show an error
      // navigate('/dashboard');
    }
    setLoading(false);
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
                <h1 className="text-2xl font-bold text-gray-900">{unitName}</h1>
                <p className="text-sm text-gray-600">Choose a topic to practice</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Unit Overview - Temporarily simplified as mastery_score etc. are not available */}
        <div className="card p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6"> {/* Simplified to one column */}
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{topics.length}</p>
              <p className="text-gray-600">Topics Available</p>
            </div>
            {/* Other stats removed for now */}
          </div>
        </div>

        {/* Topics List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Topics in {unitName}</h2>
          {topics.length === 0 && !loading && <p>No topics found for this unit.</p>}
          {topics.map((topic) => (
            <div key={topic.id} className="card p-6"> {/* Use topic.id */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {topic.name} {/* Use topic.name */}
                    </h3>
                    {/* Mastery text removed for now */}
                    {/*
                    <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getProgressColor(topic.mastery_score)}`}>
                      {getMasteryText(topic.mastery_score)}
                    </span>
                    */}
                  </div>
                  {topic.description && (
                    <p className="text-sm text-gray-500 mb-3">{topic.description}</p>
                  )}
                  
                  {/* Questions completed, mastery %, progress bar removed for now */}
                  {/*
                  <div className="flex items-center space-x-6 text-sm text-gray-600 mb-3"> ... </div>
                  <div className="w-full bg-gray-200 rounded-full h-2"> ... </div>
                  */}
                </div>
                
                <Link
                  to={`/practice/${topic.id}`} // Use topic.id
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