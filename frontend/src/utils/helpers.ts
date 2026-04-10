// src/utils/helpers.ts
import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from 'date-fns';
import { Priority } from '../types';

export const formatDate = (date: string | Date): string =>
  format(new Date(date), 'MMM d, yyyy');

export const formatDateTime = (date: string | Date): string =>
  format(new Date(date), 'MMM d, yyyy · h:mm a');

export const timeAgo = (date: string | Date): string =>
  formatDistanceToNow(new Date(date), { addSuffix: true });

export const getDeadlineStatus = (deadline?: string) => {
  if (!deadline) return null;
  const d = new Date(deadline);
  if (isPast(d) && !isToday(d)) return 'overdue';
  if (isToday(d)) return 'today';
  if (isTomorrow(d)) return 'tomorrow';
  return 'upcoming';
};

export const priorityConfig: Record<Priority, { label: string; color: string; bg: string; dot: string }> = {
  low:    { label: 'Low',    color: 'text-emerald-400', bg: 'bg-emerald-400/10', dot: 'bg-emerald-400' },
  medium: { label: 'Medium', color: 'text-amber-400',   bg: 'bg-amber-400/10',   dot: 'bg-amber-400'   },
  high:   { label: 'High',   color: 'text-orange-400',  bg: 'bg-orange-400/10',  dot: 'bg-orange-400'  },
  urgent: { label: 'Urgent', color: 'text-red-400',     bg: 'bg-red-400/10',     dot: 'bg-red-400'     },
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const getAvatarColor = (name: string): string => {
  const colors = [
    'bg-violet-500', 'bg-indigo-500', 'bg-blue-500', 'bg-cyan-500',
    'bg-emerald-500', 'bg-amber-500', 'bg-orange-500', 'bg-rose-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return colors[hash % colors.length];
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const truncate = (str: string, len: number): string =>
  str.length > len ? str.slice(0, len) + '…' : str;
