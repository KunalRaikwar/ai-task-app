import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  inputText: {
    type: String,
    required: true
  },
  operation: {
    type: String,
    required: true,
    enum: ['uppercase', 'lowercase', 'reverse', 'word_count']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'running', 'success', 'failed'],
    default: 'pending',
    index: true
  },
  result: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  logs: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    message: String
  }],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Compound index for user dashboard queries
taskSchema.index({ userId: 1, createdAt: -1 });

const Task = mongoose.model('Task', taskSchema);

export default Task;
