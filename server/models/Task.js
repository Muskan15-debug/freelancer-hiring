import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  contract: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract',
    required: true,
  },
  milestone: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Milestone',
  },
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 2000,
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
    enum: ['todo', 'in_progress', 'completed'],
    default: 'todo',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  dueDate: Date,
}, {
  timestamps: true,
});

taskSchema.index({ contract: 1 });
taskSchema.index({ milestone: 1 });
taskSchema.index({ assignee: 1 });

const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);
export default Task;
