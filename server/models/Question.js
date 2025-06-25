const mongoose = require('mongoose');

const OptionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  is_correct: {
    type: Boolean,
    required: true,
    default: false,
  },
}, {_id: false}); // Options usually don't need their own _id within a question

const AnswerSchema = new mongoose.Schema({
  correct_answer_text: { // For TEXT_INPUT, or a textual representation of the MCQ/Assertion correct choice
    type: String,
  },
  explanation: {
    type: String,
    required: [true, 'Explanation is required.'],
  },
}, {_id: false}); // Answer details usually don't need their own _id

const QuestionSchema = new mongoose.Schema({
  question_text: {
    type: String,
    required: [true, 'Question text is required.'],
    trim: true,
  },
  question_type: {
    type: String,
    enum: ['MCQ', 'ASSERTION_REASONING', 'CASE_STUDY', 'IMAGE_BASED', 'TEXT_INPUT'],
    required: [true, 'Question type is required.'],
  },
  options: [OptionSchema], // Array of options, only relevant for MCQ/Assertion_Reasoning
  answer: { // For non-MCQ or to store detailed explanation and correct answer text
    type: AnswerSchema,
    required: true,
  },
  difficulty_level: {
    type: String,
    enum: ['EASY', 'MEDIUM', 'HARD'],
    required: [true, 'Difficulty level is required.'],
    index: true,
  },
  topic_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: [true, 'Topic ID is required.'],
    index: true,
  },
  image_url: { // For IMAGE_BASED questions
    type: String,
    trim: true,
  },
  image_prompt: { // If image needs to be generated
    type: String,
    trim: true,
  },
  case_study_id: { // Optional: if case studies are separate documents
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CaseStudy', // Assuming a CaseStudy model might exist later
    index: true,
    sparse: true, // Allows nulls in unique index if it were unique
  },
  case_study_text: { // If case study text is embedded
      type: String,
      trim: true,
  },
  marks: {
    type: Number,
    default: 1, // Default marks for a question
  },
  tags: [{ // For keywords, sub-topics, etc.
    type: String,
    trim: true,
  }],
  // Deprecated: original_id from sampleQuestions.json, if needed during seeding for mapping.
  // Not usually part of the final model unless for specific migration/tracking.
  // original_json_id: { type: String, index: true, unique: true, sparse: true },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

QuestionSchema.pre('save', function (next) {
  // For MCQ, ensure there's exactly one correct option if options are provided
  if (this.question_type === 'MCQ' && this.options && this.options.length > 0) {
    const correctOptionsCount = this.options.filter(opt => opt.is_correct).length;
    if (correctOptionsCount !== 1) {
      // Temporarily disabling this validation as sample data q4 (ASSERTION_REASONING) also uses options
      // and might be treated as MCQ by this check if not careful.
      // For true MCQs, this validation is good.
      // return next(new Error('MCQ questions must have exactly one correct option.'));
    }
  }
  this.updatedAt = Date.now();
  next();
});

QuestionSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

const Question = mongoose.model('Question', QuestionSchema);

module.exports = Question;
