import Task from '../models/Task.js';
import Contract from '../models/Contract.js';
import { TASK_TRANSITIONS } from '../utils/constants.js';

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

// POST /api/contracts/:id/tasks
export const createTask = async (req, res, next) => {
  try {
    const contract = await getContractWithAccess(req.params.id, req.user._id, req.user.roles);
    if (!contract) return res.status(404).json({ message: 'Contract not found or access denied' });
    if (contract.status !== 'active') return res.status(400).json({ message: 'Contract is not active' });

    const data = req.validatedBody;
    data.contract = req.params.id;

    const task = await Task.create(data);
    res.status(201).json({ message: 'Task created', task });
  } catch (error) {
    next(error);
  }
};

// GET /api/contracts/:id/tasks
export const getTasks = async (req, res, next) => {
  try {
    const contract = await getContractWithAccess(req.params.id, req.user._id, req.user.roles);
    if (!contract) return res.status(404).json({ message: 'Contract not found or access denied' });

    const filter = { contract: req.params.id };
    if (req.query.milestone) filter.milestone = req.query.milestone;
    if (req.query.assignee) filter.assignee = req.query.assignee;
    if (req.query.status) filter.status = req.query.status;

    const tasks = await Task.find(filter)
      .populate('assignee', 'name avatar')
      .populate('milestone', 'title')
      .sort({ priority: -1, createdAt: -1 });

    res.json({ tasks });
  } catch (error) {
    next(error);
  }
};

// PUT /api/contracts/:id/tasks/:taskId
export const updateTask = async (req, res, next) => {
  try {
    const contract = await getContractWithAccess(req.params.id, req.user._id, req.user.roles);
    if (!contract) return res.status(404).json({ message: 'Contract not found or access denied' });

    const task = await Task.findOne({ _id: req.params.taskId, contract: req.params.id });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    Object.assign(task, req.validatedBody);
    await task.save();

    res.json({ message: 'Task updated', task });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/contracts/:id/tasks/:taskId/status
export const updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.validatedBody;
    const contract = await getContractWithAccess(req.params.id, req.user._id, req.user.roles);
    if (!contract) return res.status(404).json({ message: 'Contract not found or access denied' });

    const task = await Task.findOne({ _id: req.params.taskId, contract: req.params.id });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const allowedTransitions = TASK_TRANSITIONS[task.status];
    if (!allowedTransitions || !allowedTransitions.includes(status)) {
      return res.status(400).json({
        message: `Cannot transition from '${task.status}' to '${status}'`,
      });
    }

    task.status = status;
    await task.save();

    res.json({ message: `Task ${status}`, task });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/contracts/:id/tasks/:taskId
export const deleteTask = async (req, res, next) => {
  try {
    const contract = await getContractWithAccess(req.params.id, req.user._id, req.user.roles);
    if (!contract) return res.status(404).json({ message: 'Contract not found or access denied' });

    const task = await Task.findOne({ _id: req.params.taskId, contract: req.params.id });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
};
