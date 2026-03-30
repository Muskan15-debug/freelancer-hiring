import Contract from '../models/Contract.js';
import User from '../models/User.js';

// GET /api/contracts
export const getContracts = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { status, page = 1, limit = 10 } = req.query;

    const filter = {
      $or: [
        { worker: userId },
        { recruiter: userId },
        { projectManager: userId },
      ],
    };

    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Contract.countDocuments(filter);
    const contracts = await Contract.find(filter)
      .populate('project', 'title status category')
      .populate('worker', 'name avatar')
      .populate('recruiter', 'name avatar')
      .populate('projectManager', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      contracts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/contracts/:id
export const getContract = async (req, res, next) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('project')
      .populate('worker', 'name avatar email skills')
      .populate('recruiter', 'name avatar email')
      .populate('projectManager', 'name avatar email')
      .populate('agency', 'name logo')
      .populate('activity.by', 'name avatar');

    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    // Check access
    const userId = req.user._id.toString();
    const hasAccess =
      contract.worker._id.toString() === userId ||
      contract.recruiter._id.toString() === userId ||
      (contract.projectManager && contract.projectManager._id.toString() === userId) ||
      req.user.roles.includes('admin');

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ contract });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/contracts/:id/assign-pm
export const assignProjectManager = async (req, res, next) => {
  try {
    const { projectManagerId } = req.validatedBody;
    const contract = await Contract.findById(req.params.id);

    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    // Only recruiter or admin can assign PM
    const isRecruiter = contract.recruiter.toString() === req.user._id.toString();
    const isAdmin = req.user.roles.includes('admin');

    if (!isRecruiter && !isAdmin) {
      return res.status(403).json({ message: 'Only recruiter or admin can assign a PM' });
    }

    // Verify PM exists and has the role
    const pm = await User.findById(projectManagerId);
    if (!pm || !pm.roles.includes('projectManager')) {
      return res.status(400).json({ message: 'Invalid project manager' });
    }

    contract.projectManager = projectManagerId;
    contract.activity.push({
      action: 'Project manager assigned',
      by: req.user._id,
      note: `${pm.name} assigned as project manager`,
    });
    await contract.save();

    // Also update the project's PM
    const Project = (await import('../models/Project.js')).default;
    await Project.findByIdAndUpdate(contract.project, { projectManager: projectManagerId });

    // Notify PM
    await User.findByIdAndUpdate(projectManagerId, {
      $push: {
        notifications: {
          message: 'You have been assigned as project manager',
          type: 'contract',
          link: `/contracts/${contract._id}`,
        },
      },
    });

    res.json({ message: 'Project manager assigned', contract });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/contracts/:id/terminate
export const terminateContract = async (req, res, next) => {
  try {
    const { reason } = req.validatedBody;
    const contract = await Contract.findById(req.params.id);

    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    if (contract.status !== 'active') {
      return res.status(400).json({ message: 'Contract is not active' });
    }

    const userId = req.user._id.toString();
    const isParty =
      contract.worker.toString() === userId ||
      contract.recruiter.toString() === userId ||
      req.user.roles.includes('admin');

    if (!isParty) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    contract.status = 'terminated';
    contract.endDate = new Date();
    contract.activity.push({
      action: 'Contract terminated',
      by: req.user._id,
      note: reason,
    });
    await contract.save();

    // Update project status
    const Project = (await import('../models/Project.js')).default;
    await Project.findByIdAndUpdate(contract.project, { status: 'cancelled' });

    res.json({ message: 'Contract terminated', contract });
  } catch (error) {
    next(error);
  }
};
