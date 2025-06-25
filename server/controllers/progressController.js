const StudentProgress = require('../models/StudentProgress');
const User = require('../models/User'); // To ensure user exists, though 'protect' middleware handles this
// const Topic = require('../models/Topic'); // Would be used if topics were in DB

const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD'];
const CORRECT_ANSWERS_TO_LEVEL_UP = 5; // Number of correct answers at current difficulty to level up
const WRONG_ANSWERS_TO_LEVEL_DOWN = 2; // Number of consecutive wrong answers to level down

// @desc    Get student progress for a specific topic
// @route   GET /api/progress/topic/:topicId
// @access  Private
const getTopicProgress = async (req, res) => {
  try {
    const userId = req.user.id; // From 'protect' middleware
    const { topicId } = req.params;

    if (!topicId) {
      return res.status(400).json({ message: 'Topic ID is required.' });
    }

    let progress = await StudentProgress.findOne({ user_id: userId, topic_id: topicId });

    if (!progress) {
      // If no progress exists, create a default one (or return default state)
      // For now, we'll just return a default-like structure, actual creation on first submit.
      return res.status(200).json({
        user_id: userId,
        topic_id: topicId,
        current_difficulty_level: 'EASY',
        consecutive_wrong_answers: 0,
        correct_in_a_row_current_difficulty: 0,
        history: [],
        isNew: true // Flag to indicate this is default, not from DB
      });
    }

    res.status(200).json(progress);
  } catch (error) {
    console.error('Error fetching topic progress:', error);
    res.status(500).json({ message: 'Server error while fetching topic progress.' });
  }
};

// @desc    Submit an answer and update progress
// @route   POST /api/progress/submit-answer
// @access  Private
const submitAnswerAndUpdateProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { topicId, questionId, isCorrect, difficultyLevelAttempted } = req.body;

    if (!topicId || !questionId || typeof isCorrect !== 'boolean' || !difficultyLevelAttempted) {
      return res.status(400).json({ message: 'Missing required fields: topicId, questionId, isCorrect, difficultyLevelAttempted.' });
    }

    if (!DIFFICULTIES.includes(difficultyLevelAttempted.toUpperCase())) {
        return res.status(400).json({ message: 'Invalid difficultyLevelAttempted.' });
    }

    let progress = await StudentProgress.findOne({ user_id: userId, topic_id: topicId });

    if (!progress) {
      // First attempt for this topic by this user, create a new progress document
      progress = new StudentProgress({
        user_id: userId,
        topic_id: topicId,
        current_difficulty_level: difficultyLevelAttempted.toUpperCase(), // Start at the difficulty of the first question attempted
        history: [],
      });
    }

    // Ensure current_difficulty_level in progress doc matches the difficulty of question being answered
    // This is important if the user somehow jumps difficulties without formal change
    // Or if this is the first question and progress.current_difficulty_level is still default 'EASY'
    // but they attempted a 'MEDIUM' question (e.g. if default question loading changes)
    progress.current_difficulty_level = difficultyLevelAttempted.toUpperCase();


    // Add to history
    progress.history.push({
      question_id: questionId,
      answered_correctly: isCorrect,
      difficulty_when_answered: difficultyLevelAttempted.toUpperCase(),
      timestamp: new Date(),
    });

    progress.total_questions_attempted_on_topic += 1;
    if (isCorrect) {
      progress.total_correct_on_topic += 1;
    }
    // Update topic_mastery_score (simple percentage for now)
    if (progress.total_questions_attempted_on_topic > 0) {
        progress.topic_mastery_score = Math.round((progress.total_correct_on_topic / progress.total_questions_attempted_on_topic) * 100);
    }


    let nextDifficultyLevel = progress.current_difficulty_level;

    if (isCorrect) {
      progress.correct_in_a_row_current_difficulty += 1;
      progress.consecutive_wrong_answers = 0; // Reset wrong streak

      if (progress.correct_in_a_row_current_difficulty >= CORRECT_ANSWERS_TO_LEVEL_UP) {
        const currentIndex = DIFFICULTIES.indexOf(progress.current_difficulty_level);
        if (currentIndex < DIFFICULTIES.length - 1) {
          nextDifficultyLevel = DIFFICULTIES[currentIndex + 1];
          progress.correct_in_a_row_current_difficulty = 0; // Reset for new difficulty
        }
      }
    } else { // Incorrect answer
      progress.consecutive_wrong_answers += 1;
      progress.correct_in_a_row_current_difficulty = 0; // Reset correct streak

      if (progress.consecutive_wrong_answers >= WRONG_ANSWERS_TO_LEVEL_DOWN) {
        const currentIndex = DIFFICULTIES.indexOf(progress.current_difficulty_level);
        if (currentIndex > 0) {
          nextDifficultyLevel = DIFFICULTIES[currentIndex - 1];
          progress.consecutive_wrong_answers = 0; // Reset for new difficulty
        }
      }
    }

    progress.current_difficulty_level = nextDifficultyLevel;
    await progress.save();

    res.status(200).json({
      message: 'Progress updated successfully.',
      progress: progress, // Send back the updated progress document
      next_difficulty_level: progress.current_difficulty_level // Explicitly send next difficulty
    });

  } catch (error) {
    console.error('Error submitting answer and updating progress:', error);
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ message: messages });
    }
    res.status(500).json({ message: 'Server error while updating progress.' });
  }
};


module.exports = {
  getTopicProgress,
  submitAnswerAndUpdateProgress,
};
