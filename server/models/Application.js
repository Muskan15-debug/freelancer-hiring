import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  agency: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agency',
  },
  coverLetter: {
    type: String,
    required: [true, 'Cover letter is required'],
    trim: true,
    maxlength: 5000,
  },
  proposedBudget: {
    type: Number,
    required: true,
    min: 0,
  },
  proposedTimeline: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'shortlisted', 'invited', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

// Prevent duplicate applications
applicationSchema.index({ project: 1, applicant: 1 }, { unique: true });
applicationSchema.index({ project: 1, status: 1 });

const Application = mongoose.models.Application || mongoose.model('Application', applicationSchema);
export default Application;
