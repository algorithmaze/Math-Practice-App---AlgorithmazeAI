import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, ArrowRight, Home, Lightbulb } from 'lucide-react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css'; // Ensure KaTeX CSS is imported

// Matches the state sent from PracticeScreen
interface FeedbackNavigationState {
  isCorrect: boolean;
  explanation: string;
  questionText: string;
  userAnswer: string; // Text of the user's answer
  correctAnswer: string; // Text of the correct answer
  questionType: "MCQ" | "ASSERTION_REASONING" | "CASE_STUDY" | "IMAGE_BASED" | "TEXT_INPUT";
  options?: Array<{ text: string, is_correct?: boolean }>; // For displaying MCQ options again
  selectedOptionIndex?: number; // For highlighting user's MCQ choice
  topicId: string;
  // pointsEarned can be added later
}

const FeedbackScreen: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as FeedbackNavigationState | null; // Allow null initially

  useEffect(() => {
    if (state?.isCorrect) {
      console.log('🤖 Very Good!');
      // Future: Play sound "Very Good!"
    } else if (state) { // only log if state exists but is incorrect
      console.log('🤖 Better luck next time!');
      // Future: Play sound "Try again" or similar
    }
  }, [state]);

  if (!state) {
    // If state is missing, redirect to dashboard or show an error
    useEffect(() => {
      navigate('/dashboard', { replace: true });
    }, [navigate]);
    return null;
  }

  const {
    isCorrect,
    explanation,
    questionText,
    userAnswer,
    correctAnswer,
    // questionType, // Can be used for conditional rendering if needed
    // options,
    // selectedOptionIndex,
    topicId
  } = state;
  // const pointsEarned = 0; // Placeholder

  const handleNextQuestion = () => {
    // This will currently reload the same first easy question for the topic
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

          {/* Points Earned - Placeholder for now */}
          {/* {pointsEarned > 0 && ( ... ) } */}

          {/* Question Display */}
          <div className="bg-gray-100 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-700 mb-2">Question:</h3>
            <div className="text-gray-800 text-md">
              <BlockMath math={questionText} />
            </div>
          </div>

          {/* Answer Summary */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-3">Your Attempt</h3>
            <div className="space-y-2 text-md">
              <div className="flex items-start">
                <span className="text-gray-600 w-32 shrink-0">Your answer:</span>
                <span className={`font-medium ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                  <InlineMath math={userAnswer} />
                </span>
              </div>
              {!isCorrect && (
                <div className="flex items-start">
                  <span className="text-gray-600 w-32 shrink-0">Correct answer:</span>
                  <span className="font-medium text-green-700">
                     <InlineMath math={correctAnswer} />
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Explanation */}
          <div className="bg-blue-50 rounded-lg p-6 mb-6 text-left">
            <h3 className="font-semibold text-blue-900 mb-3">Explanation</h3>
            <div className="text-blue-800 text-md leading-relaxed prose prose-sm max-w-none">
              {/* Assuming explanation is already KaTeX formatted or plain text */}
              <BlockMath math={explanation} errorColor={'#cc0000'} />
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