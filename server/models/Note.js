const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    default: ''
  },
  personInCharge: {
    type: String,
    default: ''
  },
  timeFrame: {
    startDate: {
      type: String,
      default: ''
    },
    endDate: {
      type: String,
      default: ''
    }
  },
  progressEvents: [{
    id: String,
    description: String,
    completed: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    completedAt: Date,
    images: [{
      id: String,
      path: String,
      uploadTime: Date
    }],
    things: [{
      id: String,
      content: String,
      completed: Boolean,
      createdAt: Date,
      images: [{
        id: String,
        path: String,
        uploadTime: Date
      }]
    }]
  }],
  images: [{
    id: String,
    path: String,
    name: String,
    createdAt: Date
  }],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 更新时自动设置updatedAt
noteSchema.pre('findOneAndUpdate', function() {
  this.set({ updatedAt: new Date() });
});

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;