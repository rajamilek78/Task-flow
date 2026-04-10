// src/types/index.ts

export type Role = 'admin' | 'member';

export interface Project {
  _id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  createdBy: User;
  members: User[];
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type NotificationType = 'task_assigned' | 'task_moved' | 'comment_added' | 'deadline_reminder';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  createdAt: string;
}

export interface Comment {
  _id: string;
  text: string;
  author: User;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  _id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  uploadedBy: User;
  uploadedAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  projectId?: string;
  columnId: string;
  priority: Priority;
  assignees: User[];
  createdBy: User;
  deadline?: string;
  attachments: Attachment[];
  comments: Comment[];
  tags: string[];
  order: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: string;
  title: string;
  color: string;
  description: string;
}

export interface ActivityLog {
  _id: string;
  taskId: string;
  userId: User;
  action: string;
  fromColumn?: string;
  toColumn?: string;
  details?: string;
  createdAt: string;
}

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  taskId?: { _id: string; title: string; columnId: string };
  isRead: boolean;
  createdAt: string;
}

export interface DashboardStats {
  total: number;
  byPriority: Record<Priority, number>;
  byColumn: Record<string, number>;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}
