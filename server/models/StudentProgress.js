const mongoose = require('mongoose');

const AttemptSchema = new mongoose.Schema({
  question_id: { // This would ideally be mongoose.Schema.Types.ObjectId and ref: 'Question'
    type: String, // Using String for now as Question model/data might not be in DB yet
    required: true,
  },
  answered_correctly: {
    type: Boolean,
    required: true,
  },
  difficulty_when_answered: {
    type: String,
    enum: ['EASY', 'MEDIUM', 'HARD'],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const StudentProgressSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  topic_id: { // This would ideally be mongoose.Schema.Types.ObjectId and ref: 'Topic'
    type: String, // Using String for now as Topic model/data might not be in DB yet
    required: true,
  },
  current_difficulty_level: {
    type: String,
    enum: ['EASY', 'MEDIUM', 'HARD'],
    default: 'EASY',
  },
  consecutive_wrong_answers: { // at current_difficulty_level
    type: Number,
    default: 0,
  },
  correct_in_a_row_current_difficulty: { // at current_difficulty_level
    type: Number,
    default: 0,
  },
  total_questions_attempted_on_topic: {
    type: Number,
    default: 0,
  },
  total_correct_on_topic: {
    type: Number,
    default: 0,
  },
  topic_mastery_score: { // Could be a calculated field later, e.g., percentage correct
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  history: [AttemptSchema], // Array of past attempts for this topic
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create a compound index for user_id and topic_id for efficient querying
StudentProgressSchema.index({ user_id: 1, topic_id: 1 }, { unique: true });

// Middleware to update `updatedAt` field before saving
StudentProgressSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

StudentProgressSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

const StudentProgress = mongoose.model('StudentProgress', StudentProgressSchema);

module.exports = StudentProgress;
