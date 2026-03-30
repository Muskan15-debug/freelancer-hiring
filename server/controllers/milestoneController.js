import Milestone from '../models/Milestone.js';
import Contract from '../models/Contract.js';
import Payment from '../models/Payment.js';
import User from '../models/User.js';
import { MILESTONE_TRANSITIONS } from '../utils/constants.js';

// Helper: check contract access
const getContractWithAccess = async (contractId, userId, userRoles) => {
  const contract = await Contract.findById(contractId);
  if (!contract) return null;

  const uid = userId.toString();
  const hasAccess =
    contract.worker.toString() === uid ||
    contract.recruiter.toString() === uid ||
    (contract.projectManager && contract.projectManager.toString() === uid) ||
    userRoles.includes('admin');

  return hasAccess ? contract : null;
};

// POST /api/contracts/:id/milestones
export const createMilestone = async (req, res, next) => {
  try {
    const contract = await getContractWithAccess(req.params.id, req.user._id, req.user.roles);
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found or access denied' });
    }

    if (contract.status !== 'active') {
      return res.status(400).json({ message: 'Contract is not active' });
    }

    // Only PM or recruiter can create milestones
    const canCreate =
      (contract.projectManager && contract.projectManager.toString() === req.user._id.toString()) ||
      contract.recruiter.toString() === req.user._id.toString() ||
      req.user.roles.includes('admin');

    if (!canCreate) {
      return res.status(403).json({ message: 'Only PM or recruiter can create milestones' });
    }

    const data = req.validatedBody;
    data.contract = req.params.id;

    // Auto-set order
    if (data.order === undefined) {
      const lastMilestone = await Milestone.findOne({ contract: req.params.id }).sort({ order: -1 });
      data.order = lastMilestone ? lastMilestone.order + 1 : 0;
    }

    const milestone = await Milestone.create(data);

    contract.activity.push({
      action: 'Milestone created',
      by: req.user._id,
      note: milestone.title,
    });
    await contract.save();

    res.status(201).json({ message: 'Milestone created', milestone });
  } catch (error) {
    next(error);
  }
};

// GET /api/contracts/:id/milestones
export const getMilestones = async (req, res, next) => {
  try {
    const contract = await getContractWithAccess(req.params.id, req.user._id, req.user.roles);
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found or access denied' });
    }

    const milestones = await Milestone.find({ contract: req.params.id }).sort({ order: 1 });
    res.json({ milestones });
  } catch (error) {
    next(error);
  }
};

// PUT /api/contracts/:id/milestones/:mId
export const updateMilestone = async (req, res, next) => {
  try {
    const contract = await getContractWithAccess(req.params.id, req.user._id, req.user.roles);
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found or access denied' });
    }

    const milestone = await Milestone.findOne({ _id: req.params.mId, contract: req.params.id });
    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found' });
    }

    if (['approved'].includes(milestone.status)) {
      return res.status(400).json({ message: 'Cannot edit an approved milestone' });
    }

    Object.assign(milestone, req.validatedBody);
    await milestone.save();

    res.json({ message: 'Milestone updated', milestone });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/contracts/:id/milestones/:mId/status
export const updateMilestoneStatus = async (req, res, next) => {
  try {
    const { status, note } = req.validatedBody;
    const contract = await getContractWithAccess(req.params.id, req.user._id, req.user.roles);
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found or access denied' });
    }

    const milestone = await Milestone.findOne({ _id: req.params.mId, contract: req.params.id });
    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found' });
    }

    // Validate transition
    const allowedTransitions = MILESTONE_TRANSITIONS[milestone.status];
    if (!allowedTransitions || !allowedTransitions.includes(status)) {
      return res.status(400).json({
        message: `Cannot transition from '${milestone.status}' to '${status}'`,
      });
    }

    // Role validation
    const userId = req.user._id.toString();
    const isWorker = contract.worker.toString() === userId;
    const isPM = contract.projectManager && contract.projectManager.toString() === userId;
    const isAdmin = req.user.roles.includes('admin');

    // Workers can: in_progress, submitted
    // PM/Admin can: approved, revision_requested
    if (['in_progress', 'submitted'].includes(status) && !isWorker && !isAdmin) {
      return res.status(403).json({ message: 'Only the worker can perform this action' });
    }
    if (['approved', 'revision_requested'].includes(status) && !isPM && !isAdmin) {
      return res.status(403).json({ message: 'Only the PM can perform this action' });
    }

    milestone.status = status;
    if (note && status === 'submitted') milestone.submissionNote = note;
    if (note && status === 'revision_requested') milestone.revisionNote = note;
    await milestone.save();

    contract.activity.push({
      action: `Milestone ${status}`,
      by: req.user._id,
      note: milestone.title,
    });
    await contract.save();

    // On approval, trigger payment release
    if (status === 'approved') {
      await Payment.create({
        contract: contract._id,
        milestone: milestone._id,
        payer: contract.recruiter,
        payee: contract.worker,
        amount: milestone.amount,
        type: 'milestone_release',
        status: 'completed',
      });

      // Check if all milestones are approved
      const allMilestones = await Milestone.find({ contract: contract._id });
      const allApproved = allMilestones.every(m => m.status === 'approved');

      if (allApproved) {
        contract.status = 'completed';
        contract.endDate = new Date();
        contract.activity.push({
          action: 'Contract completed',
          by: req.user._id,
          note: 'All milestones approved',
        });
        await contract.save();

        const Project = (await import('../models/Project.js')).default;
        await Project.findByIdAndUpdate(contract.project, { status: 'completed' });
      }

      // Notify worker
      await User.findByIdAndUpdate(contract.worker, {
        $push: {
          notifications: {
            message: `Milestone "${milestone.title}" approved! Payment released.`,
            type: 'payment',
            link: `/contracts/${contract._id}`,
          },
        },
      });
    }

    res.json({ message: `Milestone ${status}`, milestone });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/contracts/:id/milestones/:mId
export const deleteMilestone = async (req, res, next) => {
  try {
    const contract = await getContractWithAccess(req.params.id, req.user._id, req.user.roles);
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found or access denied' });
    }

    const milestone = await Milestone.findOne({ _id: req.params.mId, contract: req.params.id });
    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found' });
    }

    if (milestone.status !== 'pending') {
      return res.status(400).json({ message: 'Can only delete pending milestones' });
    }

    await milestone.deleteOne();

    res.json({ message: 'Milestone deleted' });
  } catch (error) {
    next(error);
  }
};
