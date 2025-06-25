const Question = require('../models/Question');
const Topic = require('../models/Topic'); // To validate topicId

// @desc    Get questions by topic, optionally filtered by difficulty
// @route   GET /api/questions/topic/:topicId?difficulty=EASY
// @access  Public (or Private, TBD)
const getQuestionsByTopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    const { difficulty } = req.query;

    if (!topicId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid Topic ID format.' });
    }

    const topicExists = await Topic.findById(topicId);
    if (!topicExists) {
      return res.status(404).json({ message: 'Topic not found.' });
    }

    const query = { topic_id: topicId };
    if (difficulty) {
      const upperDifficulty = difficulty.toUpperCase();
      if (['EASY', 'MEDIUM', 'HARD'].includes(upperDifficulty)) {
        query.difficulty_level = upperDifficulty;
      } else {
        return res.status(400).json({ message: 'Invalid difficulty level specified.' });
      }
    }

    // For now, fetch all matching questions.
    // Future enhancements: pagination, limit, exclude previously answered by user.
    const questions = await Question.find(query);

    if (questions.length === 0) {
      // It's often better to return an empty array than a 404 if the topic is valid but has no questions (or no matching ones)
      return res.status(200).json([]);
    }

    res.status(200).json(questions);
  } catch (error) {
    console.error('Error fetching questions by topic:', error);
    res.status(500).json({ message: 'Server error while fetching questions.' });
  }
};

// @desc    Create a new question (primarily for seeding/admin)
// @route   POST /api/questions
// @access  Private (e.g., Admin only - needs 'protect' and role middleware)
const createQuestion = async (req, res) => {
  try {
    // Basic validation (more can be added based on question_type)
    const {
        question_text,
        question_type,
        options,
        answer,
        difficulty_level,
        topic_id
        // ... other fields like image_url, tags etc.
    } = req.body;

    if (!question_text || !question_type || !answer || !difficulty_level || !topic_id) {
      return res.status(400).json({ message: 'Missing required fields for question creation.' });
    }

    if (!topic_id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: 'Invalid Topic ID format for topic_id.' });
    }
    const topicExists = await Topic.findById(topic_id);
    if (!topicExists) {
        return res.status(400).json({ message: `Topic with ID ${topic_id} not found.` });
    }

    if (question_type === 'MCQ' && (!options || options.length === 0 || options.filter(opt => opt.is_correct).length !==1) ) {
        // return res.status(400).json({ message: 'MCQ questions must have options and exactly one correct option.' });
        // Temporarily relaxing for ASSERTION_REASONING which also uses options array from sample data
         if (question_type === 'MCQ' && (!options || options.length === 0)) {
            return res.status(400).json({ message: 'MCQ questions must have options.' });
         }
    }


    const newQuestion = new Question(req.body);
    const savedQuestion = await newQuestion.save();
    res.status(201).json(savedQuestion);
  } catch (error) {
    console.error('Error creating question:', error);
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ message: messages });
    }
    res.status(500).json({ message: 'Server error while creating question.' });
  }
};

module.exports = {
  getQuestionsByTopic,
  createQuestion,
};
