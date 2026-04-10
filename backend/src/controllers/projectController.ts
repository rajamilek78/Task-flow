// src/controllers/projectController.ts
import { Response } from 'express';
import Project from '../models/Project';
import Task from '../models/Task';
import { AuthRequest } from '../types';

/**
 * @route   GET /api/projects
 * @desc    Get all projects the user is a member of or created
 * @access  Private
 */
export const getProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const projects = await Project.find({
      isArchived: false,
      $or: [{ createdBy: userId }, { members: userId }],
    })
      .populate('createdBy', 'name email avatar')
      .populate('members', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, projects });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   GET /api/projects/:id
 * @desc    Get a single project
 * @access  Private
 */
export const getProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email avatar')
      .populate('members', 'name email avatar');

    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    res.json({ success: true, project });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   POST /api/projects
 * @desc    Create a new project
 * @access  Private
 */
export const createProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, color, icon, members } = req.body;
    const userId = req.user?.id;

    // Always include the creator as a member
    const memberIds: string[] = Array.from(
      new Set([userId, ...(members || [])])
    );

    const project = await Project.create({
      name,
      description,
      color: color || '#6366f1',
      icon: icon || 'folder',
      createdBy: userId,
      members: memberIds,
    });

    await project.populate('createdBy', 'name email avatar');
    await project.populate('members', 'name email avatar');

    res.status(201).json({ success: true, project });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   PUT /api/projects/:id
 * @desc    Update a project
 * @access  Private (creator or admin)
 */
export const updateProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, color, icon, members } = req.body;
    const userId = req.user?.id;

    const project = await Project.findById(req.params.id);
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    if (project.createdBy.toString() !== userId && req.user?.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { name, description, color, icon, members },
      { new: true }
    )
      .populate('createdBy', 'name email avatar')
      .populate('members', 'name email avatar');

    res.json({ success: true, project: updatedProject });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   DELETE /api/projects/:id
 * @desc    Archive (soft-delete) a project
 * @access  Private (creator or admin)
 */
export const deleteProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    const project = await Project.findById(req.params.id);
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    if (project.createdBy.toString() !== userId && req.user?.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    await Project.findByIdAndUpdate(req.params.id, { isArchived: true });

    res.json({ success: true, message: 'Project archived successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   GET /api/projects/:id/stats
 * @desc    Get task stats for a project
 * @access  Private
 */
export const getProjectStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const projectId = req.params.id;

    const [total, byPriority, byColumn] = await Promise.all([
      Task.countDocuments({ projectId, isArchived: false }),
      Task.aggregate([
        { $match: { projectId: new (require('mongoose').Types.ObjectId)(projectId), isArchived: false } },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),
      Task.aggregate([
        { $match: { projectId: new (require('mongoose').Types.ObjectId)(projectId), isArchived: false } },
        { $group: { _id: '$columnId', count: { $sum: 1 } } },
      ]),
    ]);

    res.json({
      success: true,
      stats: {
        total,
        byPriority: byPriority.reduce((acc: any, item) => { acc[item._id] = item.count; return acc; }, {}),
        byColumn: byColumn.reduce((acc: any, item) => { acc[item._id] = item.count; return acc; }, {}),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
