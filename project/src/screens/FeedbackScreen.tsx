import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, ArrowRight, Home, Lightbulb } from 'lucide-react';
import { InlineMath, BlockMath } from 'react-katex';

interface FeedbackState {
  isCorrect: boolean;
  explanation: string;
  pointsEarned: number;
  correctOption: string;
  selectedOption: string;
  question: any;
  topicId: string;
}

const FeedbackScreen: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as FeedbackState;

  useEffect(() => {
    // Play audio feedback
    if (state?.isCorrect) {
      // In a real app, you would play a "Very Good!" robotic voice here
      console.log('🤖 Very Good!');
    }
  }, [state?.isCorrect]);

  if (!state) {
    navigate('/dashboard');
    return null;
  }

  const { isCorrect, explanation, pointsEarned, correctOption, selectedOption, question, topicId } = state;

  const handleNextQuestion = () => {
    navigate(`/practice/${topicId}`);
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const tips = [
    "Remember to read the question carefully before selecting an answer.",
    "For square roots, think: what number times itself gives the original number?",
    "Practice makes perfect! Keep solving questions daily.",
    "If you're stuck, try to eliminate obviously wrong answers first.",
    "Mathematical formulas are your friends - memorize the key ones!"
  ];

  const randomTip = tips[Math.floor(Math.random() * tips.length)];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Feedback Card */}
        <div className="card p-8 text-center">
          {/* Success/Error Icon and Message */}
          <div className="mb-6">
            {isCorrect ? (
              <div className="space-y-4">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-green-600 mb-2">Very Good! 🤖</h2>
                  <p className="text-gray-600">You got it right!</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <XCircle className="w-12 h-12 text-red-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-red-600 mb-2">Not Quite Right</h2>
                  <p className="text-gray-600">Let's learn from this!</p>
                </div>
              </div>
            )}
          </div>

          {/* Points Earned */}
          {pointsEarned > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 font-medium">
                +{pointsEarned} points earned!
              </p>
            </div>
          )}

          {/* Answer Summary */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-3">Answer Summary</h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-gray-600">Your answer:</span>{' '}
                <span className={`font-medium ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                  {selectedOption}
                </span>
              </p>
              <p>
                <span className="text-gray-600">Correct answer:</span>{' '}
                <span className="font-medium text-green-600">{correctOption}</span>
              </p>
            </div>
          </div>

          {/* Explanation */}
          <div className="bg-blue-50 rounded-lg p-6 mb-6 text-left">
            <h3 className="font-semibold text-blue-900 mb-3">Explanation</h3>
            <div className="text-blue-800 text-sm leading-relaxed">
              {explanation.includes('$') ? (
                <div dangerouslySetInnerHTML={{ 
                  __html: explanation.replace(/\$([^$]+)\$/g, '<span class="katex-inline">$1</span>') 
                }} />
              ) : (
                <p>{explanation}</p>
              )}
            </div>
          </div>

          {/* Pro Tip (only show on incorrect answers) */}
          {!isCorrect && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6 text-left">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Lightbulb className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-purple-900 mb-2">Pro Tip</h3>
                  <p className="text-purple-800 text-sm">{randomTip}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleNextQuestion}
              className="flex items-center justify-center space-x-2 btn-primary"
            >
              <span>Next Question</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={handleBackToDashboard}
              className="flex items-center justify-center space-x-2 btn-secondary"
            >
              <Home className="w-5 h-5" />
              <span>Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackScreen;