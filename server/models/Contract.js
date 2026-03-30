import mongoose from 'mongoose';

const contractSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  agency: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agency',
  },
  projectManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  recruiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'terminated'],
    default: 'active',
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  escrowFunded: {
    type: Boolean,
    default: false,
  },
  razorpayOrderId: String,
  activity: [{
    action: { type: String, required: true },
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    note: String,
    createdAt: { type: Date, default: Date.now },
  }],
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: Date,
}, {
  timestamps: true,
});

contractSchema.index({ worker: 1, status: 1 });
contractSchema.index({ recruiter: 1 });
contractSchema.index({ projectManager: 1 });
contractSchema.index({ project: 1 });

const Contract = mongoose.models.Contract || mongoose.model('Contract', contractSchema);
export default Contract;
