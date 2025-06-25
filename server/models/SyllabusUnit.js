const mongoose = require('mongoose');

const SyllabusUnitSchema = new mongoose.Schema({
  name: { // Changed from unit_name in DB_SCHEMA.md to align with syllabus.json 'name'
    type: String,
    required: [true, 'Unit name is required.'],
    trim: true,
    unique: true,
  },
  description: {
    type: String,
    trim: true,
  },
  order: { // To maintain specific order if needed
    type: Number,
    default: 0,
  },
  // topics will be populated via virtuals or separate queries if needed directly on unit
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

SyllabusUnitSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

SyllabusUnitSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

// Virtual for topics (optional, can also be fetched separately)
SyllabusUnitSchema.virtual('topics_list', {
  ref: 'Topic',
  localField: '_id',
  foreignField: 'unit_id'
});

SyllabusUnitSchema.set('toObject', { virtuals: true });
SyllabusUnitSchema.set('toJSON', { virtuals: true });


const SyllabusUnit = mongoose.model('SyllabusUnit', SyllabusUnitSchema);

module.exports = SyllabusUnit;
