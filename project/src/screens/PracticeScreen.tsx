import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Target, AlertCircle, Image as ImageIcon } from 'lucide-react';
// QuestionDisplay and OptionButton might need adjustments or can be used if compatible
import QuestionDisplay from '../components/QuestionDisplay'; // Assuming it can handle simple text
import OptionButton from '../components/OptionButton';
import axios from 'axios'; // Needed for API calls

import 'katex/dist/katex.min.css'; // Import KaTeX CSS
import { InlineMath, BlockMath } from 'react-katex'; // Import KaTeX components

import sampleQuestionsData from '../data/sampleQuestions.json';
import syllabusData from '../data/syllabus.json';

interface QuestionOption {
  text: string;
  is_correct?: boolean; // Optional because we don't show this to the user initially
}

interface PracticeQuestion {
  id: string;
  topic_id: string;
  question_text: string;
  question_type: "MCQ" | "ASSERTION_REASONING" | "CASE_STUDY" | "IMAGE_BASED" | "TEXT_INPUT";
  options?: QuestionOption[]; // Optional for non-MCQ
  answer?: {
    correct_answer_text?: string;
    explanation: string;
  };
  difficulty_level: "EASY" | "MEDIUM" | "HARD";
  image_url?: string;
  image_prompt?: string;
  case_study_text?: string; // For CASE_STUDY type
  tags?: string[];
}

const PracticeScreen: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();

  const [currentQuestion, setCurrentQuestion] = useState<PracticeQuestion | null>(null);
  const [topicName, setTopicName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null); // Store index for MCQ
  const [currentDifficultyForTopic, setCurrentDifficultyForTopic] = useState<"EASY" | "MEDIUM" | "HARD">("EASY");
  // const [textInputValue, setTextInputValue] = useState<string>(''); // For TEXT_INPUT
  const [isSubmitting, setIsSubmitting] = useState(false); // For submit button loading state


  // Session stats can be simplified for now
  const [sessionStats, setSessionStats] = useState({
    questionsAnswered: 0,
    correctAnswers: 0,
    currentStreak: 0
  });

  useEffect(() => {
    loadQuestionAndTopicInfo();
  }, [topicId, currentDifficultyForTopic]); // Add currentDifficultyForTopic to re-fetch if it changes externally

  const loadQuestionAndTopicInfo = async () => {
    setLoading(true);
    setSelectedOptionIndex(null);
    // setTextInputValue('');

    try {
      // 1. Fetch User Progress for the topic (to get current difficulty)
      // Ensure token is available (e.g., from localStorage, assuming it's set at login)
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login', { state: { message: "Session expired. Please login again." } });
        return;
      }

      let difficultyToFetch = currentDifficultyForTopic; // Use state as default

      // Only fetch progress if not already fetched or if topicId changes.
      // For simplicity, we fetch it each time for now, or rely on currentDifficultyForTopic state.
      // A more optimized way would be to fetch it once per topic entry, or if difficulty changes.
      try {
        const progressResponse = await axios.get(`/api/progress/topic/${topicId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (progressResponse.data && progressResponse.data.current_difficulty_level) {
          difficultyToFetch = progressResponse.data.current_difficulty_level;
          if (currentDifficultyForTopic !== difficultyToFetch) { // Only update if different to avoid loop if already correct
            setCurrentDifficultyForTopic(difficultyToFetch);
            // This will cause a re-render. useEffect will then call loadQuestionAndTopicInfo again.
            // The current execution of loadQuestionAndTopicInfo might proceed with the old 'difficultyToFetch'
            // if setCurrentDifficultyForTopic is async. Or we can return early and let the re-render handle it.
            // For simplicity now, let it proceed, the re-render will fix it if it was stale.
          }
        }
      } catch (progressError: any) {
        if (progressError.response && progressError.response.status === 401) {
            navigate('/login', { state: { message: "Session expired. Please login." } });
            return;
        }
        console.warn('Could not fetch topic progress, defaulting to current state difficulty:', progressError);
        // Keep difficultyToFetch as currentDifficultyForTopic from state
      }


      // 2. Find topic name (client-side from syllabusData)
      let foundTopicName = "Practice";
      for (const unit of syllabusData) {
        const foundTopic = unit.topics.find(t => t.id === topicId);
        if (foundTopic) {
          foundTopicName = `${unit.name} - ${foundTopic.name}`;
          break;
        }
      }
      setTopicName(foundTopicName);

      // 3. Filter questions from local JSON based on fetched/current difficulty
      // TODO: This part will change when questions are fetched from backend API
      const questionsForDifficulty = sampleQuestionsData.filter(
        q => q.topic_id === topicId && q.difficulty_level === difficultyToFetch.toUpperCase()
      ) as PracticeQuestion[];

      if (questionsForDifficulty.length > 0) {
        // For now, pick the first question.
        // Later, add logic to pick a question not recently attempted, or randomly.
        setCurrentQuestion(questionsForDifficulty[0]);
      } else {
        // No questions for this difficulty. Try to find for ANY difficulty for this topic.
        const anyQuestionsForTopic = sampleQuestionsData.filter(
            q => q.topic_id === topicId
        ) as PracticeQuestion[];
        if (anyQuestionsForTopic.length > 0) {
            setCurrentQuestion(anyQuestionsForTopic[0]); // Fallback to first available
            // Optionally set a message that desired difficulty wasn't available
        } else {
            setCurrentQuestion(null); // No questions found for this topic at all
        }
      }
    } catch (error: any) {
      console.error('Error loading question and topic info:', error);
      if (error.response && error.response.status === 401) {
        navigate('/login', { state: { message: "Session expired. Please login." } });
        return;
      }
      setCurrentQuestion(null); // Ensure no stale question is shown
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (index: number) => {
    setSelectedOptionIndex(index);
  };

  const handleSubmitAnswer = async () => {
    if (!currentQuestion) return;
    if (currentQuestion.question_type === "MCQ" && selectedOptionIndex === null) return;
    // Add similar check for TEXT_INPUT if textInputValue is empty (when implemented)

    setIsSubmitting(true);

    // --- Determine correctness (still client-side for now) ---
    let isCorrect = false;
    let userAnswerText = "";
    let correctAnswerText = "";

    if (currentQuestion.question_type === "MCQ" && currentQuestion.options && selectedOptionIndex !== null) {
      const selectedOpt = currentQuestion.options[selectedOptionIndex];
      userAnswerText = selectedOpt.text;
      isCorrect = selectedOpt.is_correct === true;
      const correctOpt = currentQuestion.options.find(opt => opt.is_correct === true);
      correctAnswerText = correctOpt ? correctOpt.text : "N/A";
    } else if (currentQuestion.question_type === "TEXT_INPUT") {
      userAnswerText = "[Text input not fully implemented]"; // Placeholder
      correctAnswerText = currentQuestion.answer?.correct_answer_text || "[Correct text not available]";
      isCorrect = false; // Placeholder
    }
    // TODO: Add logic for other question types if necessary

    // --- API Call to submit answer and update progress ---
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login', { state: { message: "Session expired. Please login again." } });
        setIsSubmitting(false);
        return;
      }

      const response = await axios.post('/api/progress/submit-answer', {
        topicId: currentQuestion.topic_id, // ensure topicId from currentQuestion is used
        questionId: currentQuestion.id,
        isCorrect: isCorrect,
        difficultyLevelAttempted: currentQuestion.difficulty_level,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.next_difficulty_level) {
        const nextDifficulty = response.data.next_difficulty_level.toUpperCase() as "EASY" | "MEDIUM" | "HARD";
        if (currentDifficultyForTopic !== nextDifficulty) {
          setCurrentDifficultyForTopic(nextDifficulty);
          // This will trigger useEffect to call loadQuestionAndTopicInfo,
          // which will then fetch a new question based on the new difficulty.
        }
      }

      // Update session stats (could also come from backend if more complex)
      setSessionStats(prev => ({
        questionsAnswered: prev.questionsAnswered + 1,
        correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
        currentStreak: isCorrect ? prev.currentStreak + 1 : 0 // Basic streak logic
      }));

      navigate('/feedback', {
        state: {
          isCorrect,
          explanation: currentQuestion.answer?.explanation || "No explanation available.",
          questionText: currentQuestion.question_text,
          userAnswer: userAnswerText,
          correctAnswer: correctAnswerText,
          questionType: currentQuestion.question_type,
          options: currentQuestion.options,
          selectedOptionIndex: selectedOptionIndex,
          topicId: currentQuestion.topic_id
        }
      });

    } catch (error: any) {
      console.error('Error submitting answer:', error);
      if (error.response && error.response.status === 401) {
        navigate('/login', { state: { message: "Session expired. Please login." } });
      } else {
        // Show a generic error to the user on the practice screen itself, or navigate to feedback with error
        alert("Failed to submit answer. Please try again. " + (error.response?.data?.message || error.message));
      }
    } finally {
      setIsSubmitting(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card text-center p-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No Questions Available</h2>
          <p className="text-gray-600 mb-6">
            There are no '{currentQuestion?.difficulty_level || "EASY"}' questions available for the topic "{topicName}" at the moment. Please try another topic or difficulty.
          </p>
          <button
            onClick={() => navigate(-1)} // Go back to topic list
            className="btn-primary"
          >
            Back to Topics
          </button>
        </div>
      </div>
    );
  }

  const difficultyColor = {
    EASY: 'bg-green-100 text-green-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    HARD: 'bg-red-100 text-red-800',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(-1)} // Navigate back to TopicListScreen
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 truncate" title={topicName}>{topicName}</h1>
                <div className="flex items-center space-x-2 text-xs">
                  <span className={`px-2 py-0.5 rounded-full ${difficultyColor[currentQuestion.difficulty_level] || 'bg-gray-100 text-gray-800'}`}>
                    {currentQuestion.difficulty_level}
                  </span>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded-full">
                    {currentQuestion.question_type}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Session Stats (simplified for now) */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Target className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-medium text-gray-700">
                  {sessionStats.correctAnswers}/{sessionStats.questionsAnswered}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4 text-green-600" />
                <span className="text-xs font-medium text-gray-700">
                  Streak: {sessionStats.currentStreak}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8"> {/* Adjusted max-width for question content area */}
        <div className="card p-6 sm:p-8">
          {/* Question Text */}
          <div className="mb-6 text-lg leading-relaxed text-gray-900">
            <BlockMath math={currentQuestion.question_text} />
          </div>

          {/* Image for IMAGE_BASED questions */}
          {currentQuestion.question_type === "IMAGE_BASED" && (
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
              {currentQuestion.image_url && currentQuestion.image_url !== "placeholder_circle_tangents.png" ? (
                <img src={currentQuestion.image_url} alt="Question illustration" className="max-w-full h-auto mx-auto rounded" />
              ) : (
                <div className="text-center py-8">
                  <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Image placeholder</p>
                  {currentQuestion.image_prompt && (
                    <p className="text-xs text-gray-400 mt-1">Prompt: <em>{currentQuestion.image_prompt}</em></p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Case Study Text for CASE_STUDY questions - to be implemented if needed */}
          {/* {currentQuestion.question_type === "CASE_STUDY" && currentQuestion.case_study_text && ( ... )} */}

          {/* Options for MCQ */}
          {currentQuestion.question_type === "MCQ" && currentQuestion.options && (
            <div className="space-y-3 mb-8">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleOptionSelect(index)}
                  className={`w-full p-3 text-left rounded-lg border-2 transition-all hover:shadow-md flex items-center space-x-3
                    ${selectedOptionIndex === index
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-medium text-sm ${
                    selectedOptionIndex === index
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {String.fromCharCode(65 + index)} {/* A, B, C... */}
                  </div>
                  <div className="flex-1 text-gray-900 text-md">
                    <InlineMath math={option.text} />
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Input for TEXT_INPUT - to be implemented */}
          {/* {currentQuestion.question_type === "TEXT_INPUT" && ( ... text input field ... ) } */}

          {/* Assertion/Reasoning might not need specific input if options are provided like MCQ */}

          {/* Submit Button */}
          <div className="flex justify-center mt-6">
            <button
              onClick={handleSubmitAnswer}
              disabled={(currentQuestion.question_type === "MCQ" && selectedOptionIndex === null) || isSubmitting}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed min-w-[180px] py-2.5 px-6 text-base"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Answer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeScreen;