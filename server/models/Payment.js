import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  contract: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract',
    required: true,
  },
  milestone: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Milestone',
  },
  payer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  payee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  type: {
    type: String,
    enum: ['escrow_fund', 'milestone_release', 'refund'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
  },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpayTransferId: String,
  razorpaySignature: String,
  metadata: mongoose.Schema.Types.Mixed,
}, {
  timestamps: true,
});

paymentSchema.index({ contract: 1 });
paymentSchema.index({ payer: 1 });
paymentSchema.index({ payee: 1 });
paymentSchema.index({ type: 1 });

const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
export default Payment;
