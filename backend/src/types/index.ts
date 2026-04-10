// src/types/index.ts
import { Request } from 'express';
import { Document, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'member';
  avatar?: string;
  isActive: boolean;
  invitedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IProject extends Document {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  createdBy: Types.ObjectId;
  members: Types.ObjectId[];
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITask extends Document {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  projectId?: Types.ObjectId;
  columnId: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignees: Types.ObjectId[];
  createdBy: Types.ObjectId;
  deadline?: Date;
  attachments: IAttachment[];
  comments: IComment[];
  tags: string[];
  order: number;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAttachment {
  _id: Types.ObjectId;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  uploadedBy: Types.ObjectId;
  uploadedAt: Date;
}

export interface IComment {
  _id: Types.ObjectId;
  text: string;
  author: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IActivityLog extends Document {
  _id: Types.ObjectId;
  taskId: Types.ObjectId;
  userId: Types.ObjectId;
  action: string;
  fromColumn?: string;
  toColumn?: string;
  details?: string;
  createdAt: Date;
}

export interface INotification extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  message: string;
  type: 'task_assigned' | 'task_moved' | 'comment_added' | 'deadline_reminder';
  taskId?: Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export interface JWTPayload {
  id: string;
  email: string;
  role: string;
}
