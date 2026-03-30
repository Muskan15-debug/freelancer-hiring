import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    minlength: 5,
    maxlength: 200,
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    trim: true,
    minlength: 20,
    maxlength: 10000,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['draft', 'open', 'in_progress', 'under_review', 'completed', 'disputed', 'cancelled'],
    default: 'draft',
  },
  budget: {
    min: { type: Number, required: true, min: 0 },
    max: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
  },
  skills: [{
    type: String,
    trim: true,
  }],
  deadline: {
    type: Date,
  },
  attachments: [{
    type: String,
  }],
  category: {
    type: String,
    required: true,
  },
  applicationsCount: {
    type: Number,
    default: 0,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  projectManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Indexes
projectSchema.index({ status: 1 });
projectSchema.index({ skills: 1 });
projectSchema.index({ category: 1 });
projectSchema.index({ owner: 1 });
projectSchema.index({ 'budget.min': 1, 'budget.max': 1 });
projectSchema.index({ createdAt: -1 });

const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);
export default Project;
