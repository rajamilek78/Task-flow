// src/controllers/taskController.ts
import { Response } from 'express';
import path from 'path';
import fs from 'fs';
import Task from '../models/Task';
import ActivityLog from '../models/ActivityLog';
import Notification from '../models/Notification';
import { AuthRequest } from '../types';
import { getColumnTitle, WORKFLOW_COLUMNS } from '../utils/columns';
import { notifyTaskCreated, notifyTaskMoved } from '../utils/slack';

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks with optional filters
 * @access  Private
 */
export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { assignee, priority, search, columnId, archived, projectId } = req.query;

    const filter: any = { isArchived: archived === 'true' ? true : false };

    if (projectId) filter.projectId = projectId;
    if (assignee) filter.assignees = assignee;
    if (priority) filter.priority = priority;
    if (columnId) filter.columnId = columnId;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search as string, 'i')] } },
      ];
    }

    const tasks = await Task.find(filter)
      .populate('assignees', 'name email avatar role')
      .populate('createdBy', 'name email avatar')
      .populate('comments.author', 'name email avatar')
      .sort({ columnId: 1, order: 1, createdAt: -1 });

    res.json({ success: true, tasks });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   GET /api/tasks/:id
 * @desc    Get a single task by ID
 * @access  Private
 */
export const getTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignees', 'name email avatar role')
      .populate('createdBy', 'name email avatar')
      .populate('comments.author', 'name email avatar')
      .populate('attachments.uploadedBy', 'name email');

    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    res.json({ success: true, task });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Private
 */
export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, columnId, priority, assignees, deadline, tags, projectId } = req.body;

    // Get the highest order value in the target column (scoped to project if provided)
    const orderFilter: any = { columnId };
    if (projectId) orderFilter.projectId = projectId;
    const lastTask = await Task.findOne(orderFilter).sort({ order: -1 });
    const order = lastTask ? lastTask.order + 1 : 0;

    const task = await Task.create({
      title,
      description,
      columnId: columnId || WORKFLOW_COLUMNS[0].id,
      projectId: projectId || null,
      priority: priority || 'medium',
      assignees: assignees || [],
      createdBy: req.user?.id,
      deadline,
      tags: tags || [],
      order,
    });

    await task.populate('assignees', 'name email avatar role');
    await task.populate('createdBy', 'name email avatar');

    // Slack notification
    notifyTaskCreated({
      _id: task._id.toString(),
      title: task.title,
      columnId: task.columnId,
      priority: task.priority,
      assignees: (task.assignees as any[]).map((a) => ({ name: a.name })),
      createdBy: { name: (task.createdBy as any).name },
    });

    // Log activity
    await ActivityLog.create({
      taskId: task._id,
      userId: req.user?.id,
      action: 'created',
      toColumn: columnId,
      details: `Task "${title}" created`,
    });

    // Create notifications for assignees
    if (assignees && assignees.length > 0) {
      const notifications = assignees
        .filter((userId: string) => userId !== req.user?.id)
        .map((userId: string) => ({
          userId,
          title: 'New Task Assigned',
          message: `You have been assigned to "${title}"`,
          type: 'task_assigned',
          taskId: task._id,
        }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    }

    res.status(201).json({ success: true, task });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update a task
 * @access  Private
 */
export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, priority, assignees, deadline, tags } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    // Track new assignees for notifications
    const previousAssignees = task.assignees.map((id) => id.toString());
    const newAssignees = assignees || [];
    const addedAssignees = newAssignees.filter(
      (id: string) => !previousAssignees.includes(id) && id !== req.user?.id
    );

    await Task.findByIdAndUpdate(req.params.id, {
      title,
      description,
      priority,
      assignees,
      deadline,
      tags,
    });

    const updatedTask = await Task.findById(req.params.id)
      .populate('assignees', 'name email avatar role')
      .populate('createdBy', 'name email avatar')
      .populate('comments.author', 'name email avatar');

    // Log activity
    await ActivityLog.create({
      taskId: task._id,
      userId: req.user?.id,
      action: 'edited',
      details: `Task updated`,
    });

    // Notify newly added assignees
    if (addedAssignees.length > 0) {
      const notifications = addedAssignees.map((userId: string) => ({
        userId,
        title: 'Task Assigned',
        message: `You have been assigned to "${title || task.title}"`,
        type: 'task_assigned',
        taskId: task._id,
      }));
      await Notification.insertMany(notifications);
    }

    res.json({ success: true, task: updatedTask });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   PUT /api/tasks/:id/move
 * @desc    Move a task to a different column (drag-and-drop)
 * @access  Private
 */
export const moveTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { columnId, order } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    const fromColumn = task.columnId;
    const toColumn = columnId;

    // Update the moved task
    await Task.findByIdAndUpdate(req.params.id, { columnId, order });

    // Reorder tasks in the target column
    if (order !== undefined) {
      await Task.updateMany(
        {
          columnId,
          _id: { $ne: req.params.id },
          order: { $gte: order },
        },
        { $inc: { order: 1 } }
      );
    }

    const updatedTask = await Task.findById(req.params.id)
      .populate('assignees', 'name email avatar role')
      .populate('createdBy', 'name email avatar');

    // Log the move
    if (fromColumn !== toColumn) {
      // Slack notification
      notifyTaskMoved(
        {
          _id: task._id.toString(),
          title: task.title,
          priority: task.priority,
          assignees: (task.assignees as any[]).map((a) => ({ name: a.name || a.toString() })),
        },
        fromColumn,
        toColumn,
        req.user?.email || 'Someone'
      );

      await ActivityLog.create({
        taskId: task._id,
        userId: req.user?.id,
        action: 'moved',
        fromColumn,
        toColumn,
        details: `Moved from "${getColumnTitle(fromColumn)}" to "${getColumnTitle(toColumn)}"`,
      });

      // Notify all assignees of status change
      const notifications = task.assignees
        .filter((userId) => userId.toString() !== req.user?.id)
        .map((userId) => ({
          userId,
          title: 'Task Status Updated',
          message: `"${task.title}" was moved to ${getColumnTitle(toColumn)}`,
          type: 'task_moved',
          taskId: task._id,
        }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    }

    res.json({ success: true, task: updatedTask });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete (archive) a task
 * @access  Private
 */
export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    // Soft delete - archive instead of hard delete
    await Task.findByIdAndUpdate(req.params.id, { isArchived: true });

    await ActivityLog.create({
      taskId: task._id,
      userId: req.user?.id,
      action: 'archived',
      details: `Task "${task.title}" archived`,
    });

    res.json({ success: true, message: 'Task archived successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   POST /api/tasks/:id/comments
 * @desc    Add a comment to a task
 * @access  Private
 */
export const addComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { text } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    task.comments.push({ text, author: req.user?.id } as any);
    await task.save();

    await task.populate('comments.author', 'name email avatar');

    // Log activity
    await ActivityLog.create({
      taskId: task._id,
      userId: req.user?.id,
      action: 'commented',
      details: `Added a comment`,
    });

    // Notify assignees of new comment
    const notifications = task.assignees
      .filter((userId) => userId.toString() !== req.user?.id)
      .map((userId) => ({
        userId,
        title: 'New Comment',
        message: `A comment was added to "${task.title}"`,
        type: 'comment_added',
        taskId: task._id,
      }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.json({ success: true, comments: task.comments });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   GET /api/tasks/:id/activity
 * @desc    Get activity log for a task
 * @access  Private
 */
export const getTaskActivity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const logs = await ActivityLog.find({ taskId: req.params.id })
      .populate('userId', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, logs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   GET /api/tasks/stats/dashboard
 * @desc    Get dashboard statistics
 * @access  Private
 */
export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.query;
    const baseFilter: any = { isArchived: false };
    if (projectId) baseFilter.projectId = projectId;

    const [total, byPriority, byColumn] = await Promise.all([
      Task.countDocuments(baseFilter),
      Task.aggregate([
        { $match: baseFilter },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),
      Task.aggregate([
        { $match: baseFilter },
        { $group: { _id: '$columnId', count: { $sum: 1 } } },
      ]),
    ]);

    res.json({
      success: true,
      stats: {
        total,
        byPriority: byPriority.reduce((acc: any, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byColumn: byColumn.reduce((acc: any, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   POST /api/tasks/:id/attachments
 * @desc    Upload an image or video attachment to a task
 * @access  Private
 */
export const uploadAttachment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    const attachment = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploadedBy: req.user?.id,
      uploadedAt: new Date(),
    };

    task.attachments.push(attachment as any);
    await task.save();
    await task.populate('attachments.uploadedBy', 'name email');

    await ActivityLog.create({
      taskId: task._id,
      userId: req.user?.id,
      action: 'edited',
      details: `Uploaded file "${req.file.originalname}"`,
    });

    res.status(201).json({ success: true, attachments: task.attachments });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   DELETE /api/tasks/:id/attachments/:attachmentId
 * @desc    Delete an attachment from a task
 * @access  Private
 */
export const deleteAttachment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    const attachment = task.attachments.find(
      (a: any) => a._id.toString() === req.params.attachmentId
    );

    if (!attachment) {
      res.status(404).json({ success: false, message: 'Attachment not found' });
      return;
    }

    // Delete file from disk
    const filePath = path.join(__dirname, '../../uploads', attachment.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    task.attachments = task.attachments.filter(
      (a: any) => a._id.toString() !== req.params.attachmentId
    ) as any;
    await task.save();

    res.json({ success: true, attachments: task.attachments });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
