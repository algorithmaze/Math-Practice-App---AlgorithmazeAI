import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, BookOpen } from 'lucide-react';
import axios from 'axios';

interface Topic {
  topic_id: number;
  topic_name: string;
  mastery_score: number;
  questions_completed: number;
  total_questions: number;
}

const TopicListScreen: React.FC = () => {
  const { unitId } = useParams<{ unitId: string }>();
  const navigate = useNavigate();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [unitName, setUnitName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopics();
  }, [unitId]);

  const fetchTopics = async () => {
    try {
      const response = await axios.get(`/api/topics/${unitId}`);
      setTopics(response.data.topics);
      setUnitName(response.data.unit_name);
    } catch (error) {
      console.error('Error fetching topics:', error);
      // Mock data for development
      const mockTopics = getTopicsForUnit(parseInt(unitId || '1'));
      setTopics(mockTopics);
      setUnitName(getUnitName(parseInt(unitId || '1')));
    } finally {
      setLoading(false);
    }
  };

  const getUnitName = (unitId: number) => {
    const units = [
      'Number Systems',
      'Algebra', 
      'Coordinate Geometry',
      'Geometry',
      'Trigonometry',
      'Mensuration',
      'Statistics and Probability'
    ];
    return units[unitId - 1] || 'Unknown Unit';
  };

  const getTopicsForUnit = (unitId: number): Topic[] => {
    const topicsByUnit: { [key: number]: Topic[] } = {
      1: [
        { topic_id: 1, topic_name: 'Real Numbers', mastery_score: 0.8, questions_completed: 24, total_questions: 30 },
        { topic_id: 2, topic_name: 'Irrational Numbers', mastery_score: 0.6, questions_completed: 18, total_questions: 30 },
        { topic_id: 3, topic_name: 'Rational Numbers', mastery_score: 0.9, questions_completed: 27, total_questions: 30 }
      ],
      2: [
        { topic_id: 4, topic_name: 'Polynomials', mastery_score: 0.7, questions_completed: 21, total_questions: 30 },
        { topic_id: 5, topic_name: 'Linear Equations in Two Variables', mastery_score: 0.5, questions_completed: 15, total_questions: 30 },
        { topic_id: 6, topic_name: 'Quadratic Equations', mastery_score: 0.4, questions_completed: 12, total_questions: 30 },
        { topic_id: 7, topic_name: 'Arithmetic Progressions', mastery_score: 0.6, questions_completed: 18, total_questions: 30 }
      ],
      3: [
        { topic_id: 8, topic_name: 'Lines (In two-dimensions)', mastery_score: 0.3, questions_completed: 9, total_questions: 30 },
        { topic_id: 9, topic_name: 'Distance Formula', mastery_score: 0.5, questions_completed: 15, total_questions: 30 },
        { topic_id: 10, topic_name: 'Section Formula', mastery_score: 0.4, questions_completed: 12, total_questions: 30 }
      ],
      4: [
        { topic_id: 11, topic_name: 'Triangles', mastery_score: 0.2, questions_completed: 6, total_questions: 30 },
        { topic_id: 12, topic_name: 'Circles', mastery_score: 0.3, questions_completed: 9, total_questions: 30 },
        { topic_id: 13, topic_name: 'Constructions', mastery_score: 0.4, questions_completed: 12, total_questions: 30 }
      ],
      5: [
        { topic_id: 14, topic_name: 'Introduction to Trigonometry', mastery_score: 0.1, questions_completed: 3, total_questions: 30 },
        { topic_id: 15, topic_name: 'Trigonometric Identities', mastery_score: 0.2, questions_completed: 6, total_questions: 30 },
        { topic_id: 16, topic_name: 'Heights and Distances', mastery_score: 0.3, questions_completed: 9, total_questions: 30 }
      ],
      6: [
        { topic_id: 17, topic_name: 'Areas Related to Circles', mastery_score: 0.1, questions_completed: 3, total_questions: 30 },
        { topic_id: 18, topic_name: 'Surface Areas and Volumes', mastery_score: 0.1, questions_completed: 3, total_questions: 30 }
      ],
      7: [
        { topic_id: 19, topic_name: 'Statistics', mastery_score: 0.05, questions_completed: 1, total_questions: 30 },
        { topic_id: 20, topic_name: 'Probability', mastery_score: 0.05, questions_completed: 1, total_questions: 30 }
      ]
    };
    return topicsByUnit[unitId] || [];
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
        {/* Unit Overview */}
        <div className="card p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{topics.length}</p>
              <p className="text-gray-600">Topics</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">
                {topics.filter(t => t.mastery_score >= 0.8).length}
              </p>
              <p className="text-gray-600">Mastered</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-600">
                {Math.round((topics.reduce((sum, t) => sum + t.mastery_score, 0) / topics.length) * 100)}%
              </p>
              <p className="text-gray-600">Overall Progress</p>
            </div>
          </div>
        </div>

        {/* Topics List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Topics</h2>
          {topics.map((topic) => (
            <div key={topic.topic_id} className="card p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {topic.topic_name}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getProgressColor(topic.mastery_score)}`}>
                      {getMasteryText(topic.mastery_score)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-600 mb-3">
                    <span>{topic.questions_completed}/{topic.total_questions} questions completed</span>
                    <span>{Math.round(topic.mastery_score * 100)}% mastery</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full progress-bar ${getProgressColor(topic.mastery_score)}`}
                      style={{ width: `${topic.mastery_score * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <Link
                  to={`/practice/${topic.topic_id}`}
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