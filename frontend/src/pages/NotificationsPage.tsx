// src/pages/NotificationsPage.tsx
import { useEffect, useState } from 'react';
import { Bell, CheckCheck, ExternalLink } from 'lucide-react';
import { notificationApi } from '../services/api';
import { Notification } from '../types';
import { timeAgo } from '../utils/helpers';
import { useTaskStore } from '../store/taskStore';
import toast from 'react-hot-toast';

const typeIcons: Record<string, string> = {
  task_assigned:     '👤',
  task_moved:        '→',
  comment_added:     '💬',
  deadline_reminder: '⏰',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { setSelectedTask, fetchTasks, tasks } = useTaskStore();

  const load = async () => {
    try {
      const res = await notificationApi.getAll();
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch { /* silent */ }
    finally { setIsLoading(false); }
  };

  useEffect(() => { load(); fetchTasks(); }, []);

  const markAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch { /* silent */ }
  };

  const handleClick = async (notif: Notification) => {
    if (!notif.isRead) {
      await notificationApi.markRead(notif._id).catch(() => {});
      setNotifications((prev) =>
        prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    if (notif.taskId) {
      const task = tasks.find((t) => t._id === notif.taskId?._id);
      if (task) setSelectedTask(task);
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-500/15 border border-amber-500/25 rounded-lg flex items-center justify-center">
            <Bell size={16} className="text-amber-400" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-white">Notifications</h1>
            <p className="text-xs text-gray-500">{unreadCount} unread</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn-ghost text-xs flex items-center gap-1.5">
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="flex gap-3">
                <div className="w-9 h-9 skeleton rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 skeleton rounded w-3/4" />
                  <div className="h-3 skeleton rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="card p-12 text-center">
          <Bell size={36} className="mx-auto text-gray-700 mb-3" />
          <p className="text-gray-500">You're all caught up!</p>
          <p className="text-xs text-gray-600 mt-1">New notifications will appear here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <button
              key={notif._id}
              onClick={() => handleClick(notif)}
              className={`w-full card p-4 text-left transition-all hover:border-indigo-500/30 hover:shadow-md ${
                !notif.isRead ? 'border-indigo-500/20 bg-indigo-500/5' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-navy-700 flex items-center justify-center text-base flex-shrink-0">
                  {typeIcons[notif.type] || '🔔'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm font-medium ${notif.isRead ? 'text-gray-300' : 'text-white'}`}>
                      {notif.title}
                    </p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!notif.isRead && (
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                      )}
                      <span className="text-[10px] text-gray-600">{timeAgo(notif.createdAt)}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{notif.message}</p>
                  {notif.taskId && (
                    <p className="text-[10px] text-indigo-400/70 mt-1 flex items-center gap-1">
                      <ExternalLink size={9} /> {notif.taskId.title}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
