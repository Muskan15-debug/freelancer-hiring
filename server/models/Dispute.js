import mongoose from 'mongoose';

const disputeSchema = new mongoose.Schema({
  contract: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract',
    required: true,
  },
  milestone: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Milestone',
  },
  raisedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  respondent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reason: {
    type: String,
    required: [true, 'Dispute reason is required'],
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: 5000,
  },
  status: {
    type: String,
    enum: ['open', 'under_review', 'resolved', 'escalated'],
    default: 'open',
  },
  resolution: {
    decision: String,
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: Date,
  },
  messages: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    createdAt: { type: Date, default: Date.now },
  }],
  attachments: [String],
}, {
  timestamps: true,
});

disputeSchema.index({ contract: 1 });
disputeSchema.index({ status: 1 });
disputeSchema.index({ raisedBy: 1 });

const Dispute = mongoose.models.Dispute || mongoose.model('Dispute', disputeSchema);
export default Dispute;
