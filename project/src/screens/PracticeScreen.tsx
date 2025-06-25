import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Target, AlertCircle, Image as ImageIcon } from 'lucide-react';
// QuestionDisplay and OptionButton might need adjustments or can be used if compatible
import QuestionDisplay from '../components/QuestionDisplay'; // Assuming it can handle simple text
import OptionButton from '../components/OptionButton';
// import axios from 'axios'; // Not needed for local data

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
  // const [textInputValue, setTextInputValue] = useState<string>(''); // For TEXT_INPUT

  // Session stats can be simplified for now
  const [sessionStats, setSessionStats] = useState({
    questionsAnswered: 0,
    correctAnswers: 0,
    currentStreak: 0
  });

  useEffect(() => {
    loadQuestionAndTopicInfo();
  }, [topicId]);

  const loadQuestionAndTopicInfo = () => {
    setLoading(true);

    // Find topic name
    let foundTopicName = "Practice"; // Default
    for (const unit of syllabusData) {
      const foundTopic = unit.topics.find(t => t.id === topicId);
      if (foundTopic) {
        foundTopicName = `${unit.name} - ${foundTopic.name}`;
        break;
      }
    }
    setTopicName(foundTopicName);

    // Filter questions for the current topic and EASY difficulty (for now)
    const easyQuestionsForTopic = sampleQuestionsData.filter(
      q => q.topic_id === topicId && q.difficulty_level === "EASY"
    ) as PracticeQuestion[]; // Cast to PracticeQuestion[]

    if (easyQuestionsForTopic.length > 0) {
      // For now, just pick the first easy question
      // Later, implement logic to pick based on user progress, avoid repetition etc.
      setCurrentQuestion(easyQuestionsForTopic[0]);
    } else {
      setCurrentQuestion(null); // No easy questions found for this topic
    }
    setSelectedOptionIndex(null);
    // setTextInputValue('');
    setLoading(false);
  };

  const handleOptionSelect = (index: number) => {
    setSelectedOptionIndex(index);
  };

  const handleSubmitAnswer = () => {
    if (!currentQuestion) return;
    if (currentQuestion.question_type === "MCQ" && selectedOptionIndex === null) return;
    // Add similar check for TEXT_INPUT if textInputValue is empty

    // For now, just log and reload/go to next (simplified)
    console.log("Selected option index:", selectedOptionIndex);
    // console.log("Text input value:", textInputValue);

    // --- Answer Checking Logic ---
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
      // Placeholder for TEXT_INPUT - assuming textInputValue state exists and is populated
      // userAnswerText = textInputValue;
      // isCorrect = textInputValue.toLowerCase() === currentQuestion.answer?.correct_answer_text?.toLowerCase();
      // correctAnswerText = currentQuestion.answer?.correct_answer_text || "N/A";
      userAnswerText = "[Text input not fully implemented]";
      correctAnswerText = currentQuestion.answer?.correct_answer_text || "[Correct text not available]";
      isCorrect = false; // Default for now
    }
    // Add similar logic for ASSERTION_REASONING if options-based, or other types

    // --- End Answer Checking Logic ---

    setSessionStats(prev => ({
      questionsAnswered: prev.questionsAnswered + 1,
      correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
      currentStreak: isCorrect ? prev.currentStreak + 1 : 0
    }));

    navigate('/feedback', {
      state: {
        isCorrect,
        explanation: currentQuestion.answer?.explanation || "No explanation available.",
        questionText: currentQuestion.question_text, // Pass question text directly
        userAnswer: userAnswerText,
        correctAnswer: correctAnswerText,
        questionType: currentQuestion.question_type,
        options: currentQuestion.options, // For MCQs, to show choices again if needed
        selectedOptionIndex: selectedOptionIndex, // For MCQs
        topicId
      }
    });

    // For this step, we are not implementing "next question" logic yet.
    // Reloading the same question by calling loadQuestionAndTopicInfo() after feedback
    // would be one way, or FeedbackScreen can navigate back.
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
              disabled={currentQuestion.question_type === "MCQ" && selectedOptionIndex === null}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed min-w-[180px] py-2.5 px-6 text-base"
            >
              Submit Answer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeScreen;