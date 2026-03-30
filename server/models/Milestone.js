import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema({
  contract: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Milestone title is required'],
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 5000,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  dueDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'submitted', 'approved', 'revision_requested'],
    default: 'pending',
  },
  attachments: [String],
  order: {
    type: Number,
    default: 0,
  },
  submissionNote: String,
  revisionNote: String,
}, {
  timestamps: true,
});

milestoneSchema.index({ contract: 1, order: 1 });

const Milestone = mongoose.models.Milestone || mongoose.model('Milestone', milestoneSchema);
export default Milestone;
