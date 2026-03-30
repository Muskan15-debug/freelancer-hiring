import User from '../models/User.js';
import Agency from '../models/Agency.js';
import Dispute from '../models/Dispute.js';
import Contract from '../models/Contract.js';
import Payment from '../models/Payment.js';
import Project from '../models/Project.js';

export const getUsers = async (req, res, next) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (role) filter.roles = role;
    if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(filter);
    const users = await User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
    res.json({ users, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) { next(error); }
};

export const updateUser = async (req, res, next) => {
  try {
    const { action } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (action === 'verify') user.isVerified = true;
    else if (action === 'ban') user.isBanned = true;
    else if (action === 'unban') user.isBanned = false;
    else return res.status(400).json({ message: 'Invalid action' });
    await user.save();
    res.json({ message: `User ${action}ed`, user });
  } catch (error) { next(error); }
};

export const getPendingAgencies = async (req, res, next) => {
  try {
    const agencies = await Agency.find({ isApproved: false }).populate('owner', 'name email avatar').sort({ createdAt: -1 });
    res.json({ agencies });
  } catch (error) { next(error); }
};

export const updateAgency = async (req, res, next) => {
  try {
    const { action } = req.body;
    const agency = await Agency.findById(req.params.id);
    if (!agency) return res.status(404).json({ message: 'Agency not found' });
    if (action === 'approve') agency.isApproved = true;
    else if (action === 'reject') { await agency.deleteOne(); return res.json({ message: 'Agency rejected and removed' }); }
    else return res.status(400).json({ message: 'Invalid action' });
    await agency.save();
    res.json({ message: `Agency ${action}d`, agency });
  } catch (error) { next(error); }
};

export const getAnalytics = async (req, res, next) => {
  try {
    const { type = 'overview' } = req.query;
    if (type === 'overview') {
      const [totalUsers, totalProjects, totalContracts, activeContracts, totalDisputes] = await Promise.all([User.countDocuments(), Project.countDocuments(), Contract.countDocuments(), Contract.countDocuments({ status: 'active' }), Dispute.countDocuments()]);
      return res.json({ totalUsers, totalProjects, totalContracts, activeContracts, totalDisputes });
    }
    if (type === 'revenue') {
      const payments = await Payment.aggregate([{ $match: { status: 'completed', type: { $in: ['escrow_fund', 'milestone_release'] } } }, { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } }]);
      return res.json({ revenue: payments });
    }
    if (type === 'top_freelancers') {
      const freelancers = await User.find({ roles: 'freelancer' }).sort({ 'rating.average': -1 }).limit(10).select('name avatar rating skills title');
      return res.json({ freelancers });
    }
    res.json({});
  } catch (error) { next(error); }
};

export const getAdminDisputes = async (req, res, next) => {
  try {
    const disputes = await Dispute.find().populate('contract', 'project totalAmount').populate('raisedBy', 'name avatar').populate('respondent', 'name avatar').sort({ createdAt: -1 });
    res.json({ disputes });
  } catch (error) { next(error); }
};
