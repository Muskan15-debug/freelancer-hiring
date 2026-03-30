import Project from '../models/Project.js';
import { PROJECT_TRANSITIONS } from '../utils/constants.js';

// POST /api/projects
export const createProject = async (req, res, next) => {
  try {
    const data = req.validatedBody;
    data.owner = req.user._id;

    if (req.files?.length) {
      data.attachments = req.files.map(f => `/uploads/projects/${f.filename}`);
    }

    const project = await Project.create(data);
    res.status(201).json({ message: 'Project created', project });
  } catch (error) {
    next(error);
  }
};

// GET /api/projects
export const getProjects = async (req, res, next) => {
  try {
    const { status, skills, budgetMin, budgetMax, category, sort, owner, search, page = 1, limit = 12 } = req.query;

    const filter = {};

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (owner === 'me' && req.user) filter.owner = req.user._id;
    if (skills) {
      const skillsArr = skills.split(',').map(s => s.trim());
      filter.skills = { $in: skillsArr };
    }
    if (budgetMin || budgetMax) {
      filter['budget.min'] = {};
      if (budgetMin) filter['budget.min'].$gte = parseInt(budgetMin);
      if (budgetMax) filter['budget.max'] = { $lte: parseInt(budgetMax) };
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOptions = {};
    if (sort === 'budget_high') sortOptions['budget.max'] = -1;
    else if (sort === 'budget_low') sortOptions['budget.min'] = 1;
    else if (sort === 'oldest') sortOptions.createdAt = 1;
    else sortOptions.createdAt = -1; // newest first

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Project.countDocuments(filter);
    const projects = await Project.find(filter)
      .populate('owner', 'name avatar')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      projects,
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

// GET /api/projects/:id
export const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name avatar email rating')
      .populate('assignedTo', 'name avatar')
      .populate('projectManager', 'name avatar');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ project });
  } catch (error) {
    next(error);
  }
};

// PUT /api/projects/:id
export const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the project owner can edit' });
    }

    if (!['draft', 'open'].includes(project.status)) {
      return res.status(400).json({ message: 'Cannot edit a project that is in progress' });
    }

    const updates = req.validatedBody;
    if (req.files?.length) {
      updates.attachments = [
        ...(project.attachments || []),
        ...req.files.map(f => `/uploads/projects/${f.filename}`),
      ];
    }

    Object.assign(project, updates);
    await project.save();

    res.json({ message: 'Project updated', project });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/projects/:id/status
export const updateProjectStatus = async (req, res, next) => {
  try {
    const { status } = req.validatedBody;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check ownership (admin can also change)
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.roles.includes('admin');

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Validate transition
    const allowedTransitions = PROJECT_TRANSITIONS[project.status];
    if (!allowedTransitions || !allowedTransitions.includes(status)) {
      return res.status(400).json({
        message: `Cannot transition from '${project.status}' to '${status}'`,
      });
    }

    project.status = status;
    await project.save();

    res.json({ message: `Project status updated to ${status}`, project });
  } catch (error) {
    next(error);
  }
};
