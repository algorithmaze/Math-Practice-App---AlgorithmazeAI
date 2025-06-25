import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Target } from 'lucide-react';
import QuestionDisplay from '../components/QuestionDisplay';
import OptionButton from '../components/OptionButton';
import axios from 'axios';

interface Question {
  question_id: number;
  question_text: string;
  options: { label: string; text: string }[];
  difficulty_level: string;
  question_type: string;
}

const PracticeScreen: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    questionsAnswered: 0,
    correctAnswers: 0,
    currentStreak: 0
  });

  useEffect(() => {
    fetchNextQuestion();
  }, [topicId]);

  const fetchNextQuestion = async () => {
    try {
      setLoading(true);
      const userId = 1; // Mock user ID
      const response = await axios.get(`/api/questions/next?user_id=${userId}&topic_id=${topicId}`);
      setQuestion(response.data);
      setSelectedOption('');
    } catch (error) {
      console.error('Error fetching question:', error);
      // Mock question for development
      setQuestion({
        question_id: 1,
        question_text: "What is the value of $\\sqrt{16}$?",
        options: [
          { label: 'A', text: '2' },
          { label: 'B', text: '4' },
          { label: 'C', text: '8' },
          { label: 'D', text: '16' }
        ],
        difficulty_level: 'Easy',
        question_type: 'Direct'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (optionLabel: string) => {
    setSelectedOption(optionLabel);
  };

  const handleSubmitAnswer = async () => {
    if (!selectedOption || !question) return;

    setSubmitting(true);
    try {
      const userId = 1; // Mock user ID
      const response = await axios.post('/api/answers/submit', {
        user_id: userId,
        question_id: question.question_id,
        selected_option: selectedOption
      });

      // Update session stats
      setSessionStats(prev => ({
        questionsAnswered: prev.questionsAnswered + 1,
        correctAnswers: prev.correctAnswers + (response.data.is_correct ? 1 : 0),
        currentStreak: response.data.is_correct ? prev.currentStreak + 1 : 0
      }));

      // Navigate to feedback screen with results
      navigate('/feedback', {
        state: {
          isCorrect: response.data.is_correct,
          explanation: response.data.explanation,
          pointsEarned: response.data.points_earned,
          correctOption: response.data.correct_option,
          selectedOption,
          question: question,
          topicId
        }
      });
    } catch (error) {
      console.error('Error submitting answer:', error);
      // Mock response for development
      const isCorrect = selectedOption === 'B'; // Assuming B is correct for the mock question
      navigate('/feedback', {
        state: {
          isCorrect,
          explanation: isCorrect ? 
            "Correct! $\\sqrt{16} = 4$ because $4^2 = 16$." :
            "Incorrect. $\\sqrt{16} = 4$ because $4^2 = 16$. The square root asks: what number multiplied by itself gives 16?",
          pointsEarned: isCorrect ? 10 : 0,
          correctOption: 'B',
          selectedOption,
          question: question,
          topicId
        }
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No more questions available</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Practice Session</h1>
                <p className="text-sm text-gray-600">
                  {question.difficulty_level} • {question.question_type}
                </p>
              </div>
            </div>
            
            {/* Session Stats */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">
                  {sessionStats.correctAnswers}/{sessionStats.questionsAnswered}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700">
                  Streak: {sessionStats.currentStreak}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="card p-8">
          {/* Question */}
          <div className="mb-8">
            <QuestionDisplay question={question} />
          </div>

          {/* Options */}
          <div className="space-y-4 mb-8">
            {question.options.map((option) => (
              <OptionButton
                key={option.label}
                option={option}
                isSelected={selectedOption === option.label}
                onSelect={handleOptionSelect}
              />
            ))}
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              onClick={handleSubmitAnswer}
              disabled={!selectedOption || submitting}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]"
            >
              {submitting ? 'Submitting...' : 'Submit Answer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeScreen;