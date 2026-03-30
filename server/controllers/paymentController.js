import razorpay from '../config/razorpay.js';
import Payment from '../models/Payment.js';
import Contract from '../models/Contract.js';
import crypto from 'crypto';

export const createEscrow = async (req, res, next) => {
  try {
    const { contractId, amount } = req.validatedBody;
    const contract = await Contract.findById(contractId);
    if (!contract) return res.status(404).json({ message: 'Contract not found' });
    if (contract.recruiter.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Only recruiter can fund escrow' });
    const order = await razorpay.orders.create({ amount: amount * 100, currency: 'INR', receipt: `escrow_${contractId}` });
    const payment = await Payment.create({ contract: contractId, payer: req.user._id, amount, type: 'escrow_fund', status: 'pending', razorpayOrderId: order.id });
    res.json({ order, payment });
  } catch (error) { next(error); }
};

export const getPaymentHistory = async (req, res, next) => {
  try {
    const isAdmin = req.user.roles.includes('admin');
    const filter = isAdmin ? {} : { $or: [{ payer: req.user._id }, { payee: req.user._id }] };
    const payments = await Payment.find(filter).populate('contract', 'project totalAmount').populate('payer', 'name').populate('payee', 'name').populate('milestone', 'title').sort({ createdAt: -1 });
    res.json({ payments });
  } catch (error) { next(error); }
};

export const refundPayment = async (req, res, next) => {
  try {
    const { paymentId, amount, reason } = req.validatedBody;
    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    const refundAmt = amount || payment.amount;
    if (payment.razorpayPaymentId) {
      await razorpay.payments.refund(payment.razorpayPaymentId, { amount: refundAmt * 100 });
    }
    const refund = await Payment.create({ contract: payment.contract, payer: payment.payee, payee: payment.payer, amount: refundAmt, type: 'refund', status: 'completed', metadata: { originalPayment: paymentId, reason } });
    res.json({ message: 'Refund processed', refund });
  } catch (error) { next(error); }
};

export const handleWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);
    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET).update(body).digest('hex');
    if (signature !== expected) return res.status(400).json({ message: 'Invalid signature' });
    const event = req.body.event;
    const payload = req.body.payload;
    if (event === 'payment.captured') {
      const rpPaymentId = payload.payment.entity.id;
      const rpOrderId = payload.payment.entity.order_id;
      const payment = await Payment.findOne({ razorpayOrderId: rpOrderId });
      if (payment) {
        payment.status = 'completed';
        payment.razorpayPaymentId = rpPaymentId;
        await payment.save();
        if (payment.type === 'escrow_fund') {
          await Contract.findByIdAndUpdate(payment.contract, { escrowFunded: true, razorpayOrderId: rpOrderId });
        }
      }
    }
    res.json({ status: 'ok' });
  } catch (error) { next(error); }
};
