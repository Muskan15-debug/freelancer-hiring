import Application from '../models/Application.js';
import Project from '../models/Project.js';
import Contract from '../models/Contract.js';
import User from '../models/User.js';
import { APPLICATION_TRANSITIONS } from '../utils/constants.js';

// POST /api/projects/:id/applications
export const createApplication = async (req, res, next) => {
  try {
    const { id: projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.status !== 'open') {
      return res.status(400).json({ message: 'Project is not accepting applications' });
    }

    if (project.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot apply to your own project' });
    }

    // Check for existing application
    const existing = await Application.findOne({
      project: projectId,
      applicant: req.user._id,
    });
    if (existing) {
      return res.status(409).json({ message: 'You have already applied to this project' });
    }

    const data = req.validatedBody;
    data.project = projectId;
    data.applicant = req.user._id;

    const application = await Application.create(data);

    // Increment applications count
    await Project.findByIdAndUpdate(projectId, { $inc: { applicationsCount: 1 } });

    // Notify project owner
    await User.findByIdAndUpdate(project.owner, {
      $push: {
        notifications: {
          message: `New application on "${project.title}"`,
          type: 'project',
          link: `/projects/${projectId}`,
        },
      },
    });

    res.status(201).json({ message: 'Application submitted', application });
  } catch (error) {
    next(error);
  }
};

// GET /api/projects/:id/applications
export const getApplications = async (req, res, next) => {
  try {
    const { id: projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isOwner = project.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.roles.includes('admin');

    let filter = { project: projectId };

    // Freelancers can only see their own application
    if (!isOwner && !isAdmin) {
      filter.applicant = req.user._id;
    }

    const applications = await Application.find(filter)
      .populate('applicant', 'name avatar title skills rating hourlyRate')
      .populate('agency', 'name logo')
      .sort({ createdAt: -1 });

    res.json({ applications });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/projects/:id/applications/:appId/status
export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { id: projectId, appId } = req.params;
    const { status } = req.validatedBody;

    const application = await Application.findById(appId).populate('applicant');
    if (!application || application.project.toString() !== projectId) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isOwner = project.owner.toString() === req.user._id.toString();
    const isApplicant = application.applicant._id.toString() === req.user._id.toString();

    // Role-based validation
    const recruiterActions = ['shortlisted', 'invited', 'rejected'];
    const freelancerActions = ['accepted', 'withdrawn'];

    if (recruiterActions.includes(status) && !isOwner) {
      return res.status(403).json({ message: 'Only the recruiter can perform this action' });
    }
    if (freelancerActions.includes(status) && !isApplicant) {
      return res.status(403).json({ message: 'Only the applicant can perform this action' });
    }

    // Validate transition
    const allowedTransitions = APPLICATION_TRANSITIONS[application.status];
    if (!allowedTransitions || !allowedTransitions.includes(status)) {
      return res.status(400).json({
        message: `Cannot transition from '${application.status}' to '${status}'`,
      });
    }

    application.status = status;
    await application.save();

    // If accepted, create contract and move project to in_progress
    if (status === 'accepted') {
      const contract = await Contract.create({
        project: projectId,
        worker: application.applicant._id,
        agency: application.agency,
        recruiter: project.owner,
        projectManager: project.projectManager,
        totalAmount: application.proposedBudget,
        activity: [{
          action: 'Contract created',
          by: req.user._id,
          note: 'Application accepted, contract auto-generated',
        }],
      });

      project.status = 'in_progress';
      project.assignedTo = application.applicant._id;
      await project.save();

      // Reject all other pending/shortlisted/invited applications
      await Application.updateMany(
        {
          project: projectId,
          _id: { $ne: appId },
          status: { $in: ['pending', 'shortlisted', 'invited'] },
        },
        { status: 'rejected' }
      );

      // Notify
      await User.findByIdAndUpdate(application.applicant._id, {
        $push: {
          notifications: {
            message: `Your application for "${project.title}" was accepted! Contract created.`,
            type: 'contract',
            link: `/contracts/${contract._id}`,
          },
        },
      });

      return res.json({
        message: 'Application accepted, contract created',
        application,
        contract,
      });
    }

    // Notify applicant about status change
    if (!isApplicant) {
      await User.findByIdAndUpdate(application.applicant._id, {
        $push: {
          notifications: {
            message: `Your application for "${project.title}" was ${status}`,
            type: 'project',
            link: `/projects/${projectId}`,
          },
        },
      });
    }

    res.json({ message: `Application ${status}`, application });
  } catch (error) {
    next(error);
  }
};
