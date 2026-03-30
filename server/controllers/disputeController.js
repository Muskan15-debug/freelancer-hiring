import Dispute from '../models/Dispute.js';
import Contract from '../models/Contract.js';
import User from '../models/User.js';
import { DISPUTE_TRANSITIONS } from '../utils/constants.js';

export const createDispute = async (req, res, next) => {
  try {
    const data = req.validatedBody;
    data.raisedBy = req.user._id;
    const contract = await Contract.findById(data.contract);
    if (!contract) return res.status(404).json({ message: 'Contract not found' });
    const userId = req.user._id.toString();
    const isParty = contract.worker.toString() === userId || contract.recruiter.toString() === userId || (contract.projectManager && contract.projectManager.toString() === userId);
    if (!isParty) return res.status(403).json({ message: 'Only contract parties can raise a dispute' });
    const dispute = await Dispute.create(data);
    const Project = (await import('../models/Project.js')).default;
    await Project.findByIdAndUpdate(contract.project, { status: 'disputed' });
    await User.findByIdAndUpdate(data.respondent, { $push: { notifications: { message: `A dispute has been raised: "${data.reason}"`, type: 'dispute', link: '/disputes' } } });
    res.status(201).json({ message: 'Dispute created', dispute });
  } catch (error) { next(error); }
};

export const getDisputes = async (req, res, next) => {
  try {
    const isAdmin = req.user.roles.includes('admin');
    const filter = isAdmin ? {} : { $or: [{ raisedBy: req.user._id }, { respondent: req.user._id }] };
    if (req.query.status) filter.status = req.query.status;
    const disputes = await Dispute.find(filter).populate('contract', 'project totalAmount').populate('raisedBy', 'name avatar').populate('respondent', 'name avatar').sort({ createdAt: -1 });
    res.json({ disputes });
  } catch (error) { next(error); }
};

export const getDispute = async (req, res, next) => {
  try {
    const dispute = await Dispute.findById(req.params.id).populate('contract').populate('milestone').populate('raisedBy', 'name avatar email').populate('respondent', 'name avatar email').populate('resolution.resolvedBy', 'name avatar').populate('messages.sender', 'name avatar');
    if (!dispute) return res.status(404).json({ message: 'Dispute not found' });
    const userId = req.user._id.toString();
    const isAdmin = req.user.roles.includes('admin');
    const isParty = dispute.raisedBy._id.toString() === userId || dispute.respondent._id.toString() === userId;
    if (!isAdmin && !isParty) return res.status(403).json({ message: 'Access denied' });
    res.json({ dispute });
  } catch (error) { next(error); }
};

export const updateDisputeStatus = async (req, res, next) => {
  try {
    const { status, decision, message } = req.validatedBody;
    const dispute = await Dispute.findById(req.params.id);
    if (!dispute) return res.status(404).json({ message: 'Dispute not found' });
    const allowed = DISPUTE_TRANSITIONS[dispute.status];
    if (!allowed || !allowed.includes(status)) return res.status(400).json({ message: `Cannot transition from '${dispute.status}' to '${status}'` });
    if (['resolved', 'escalated'].includes(status) && !req.user.roles.includes('admin')) return res.status(403).json({ message: 'Only admin can resolve or escalate' });
    dispute.status = status;
    if (message) dispute.messages.push({ sender: req.user._id, text: message });
    if (status === 'resolved' && decision) dispute.resolution = { decision, resolvedBy: req.user._id, resolvedAt: new Date() };
    await dispute.save();
    res.json({ message: `Dispute ${status}`, dispute });
  } catch (error) { next(error); }
};
