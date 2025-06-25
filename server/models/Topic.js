const mongoose = require('mongoose');

const TopicSchema = new mongoose.Schema({
  name: { // Changed from topic_name to align with syllabus.json 'name'
    type: String,
    required: [true, 'Topic name is required.'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  unit_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SyllabusUnit',
    required: [true, 'Unit ID is required.'],
    index: true,
  },
  order: { // To maintain specific order within a unit
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

TopicSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

TopicSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

// Ensure a topic name is unique within the same unit_id
TopicSchema.index({ name: 1, unit_id: 1 }, { unique: true });


const Topic = mongoose.model('Topic', TopicSchema);

module.exports = Topic;
