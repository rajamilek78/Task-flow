// src/components/task/TaskDetailModal.tsx
import { useState, useEffect, useRef } from 'react';
import {
  X, Edit2, Trash2, Calendar, Tag, Clock, MessageSquare,
  Activity, ChevronRight, AlertCircle, Send, Paperclip,
  ImageIcon, Film, Download, ZoomIn,
} from 'lucide-react';
import { useTaskStore } from '../../store/taskStore';
import { useAuthStore } from '../../store/authStore';
import { taskApi } from '../../services/api';
import Avatar from '../ui/Avatar';
import { PriorityBadge } from '../ui/Badge';
import { formatDate, formatDateTime, timeAgo, getDeadlineStatus } from '../../utils/helpers';
import { ActivityLog } from '../../types';
import toast from 'react-hot-toast';
import TaskFormModal from './TaskFormModal';

export default function TaskDetailModal() {
  const { selectedTask, setSelectedTask, deleteTask, addComment, columns } = useTaskStore();
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'activity'>('details');
  const [commentText, setCommentText] = useState('');
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace('/api', '');

  const task = selectedTask;
  const column = columns.find((c) => c.id === task?.columnId);

  useEffect(() => {
    if (task && activeTab === 'activity') {
      taskApi.getActivity(task._id).then((res) => setActivityLogs(res.data.logs)).catch(() => {});
    }
  }, [task, activeTab]);

  if (!task) return null;

  const deadlineStatus = getDeadlineStatus(task.deadline);
  const deadlineColors: Record<string, string> = {
    overdue:  'text-red-400 bg-red-400/10 border-red-400/20',
    today:    'text-amber-400 bg-amber-400/10 border-amber-400/20',
    tomorrow: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    upcoming: 'text-gray-400 bg-navy-700 border-navy-600',
  };

  const handleDelete = async () => {
    if (!confirm('Archive this task?')) return;
    try {
      await deleteTask(task._id);
      toast.success('Task archived');
      setSelectedTask(null);
    } catch {
      toast.error('Failed to archive task');
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    setIsAddingComment(true);
    try {
      await addComment(task._id, commentText.trim());
      setCommentText('');
      toast.success('Comment added');
    } catch {
      toast.error('Failed to add comment');
    } finally {
      setIsAddingComment(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !task) return;
    setIsUploading(true);
    try {
      const res = await taskApi.uploadAttachment(task._id, file);
      useTaskStore.getState().updateTask(task._id, { attachments: res.data.attachments });
      toast.success('File uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!task) return;
    try {
      const res = await taskApi.deleteAttachment(task._id, attachmentId);
      useTaskStore.getState().updateTask(task._id, { attachments: res.data.attachments });
      toast.success('Removed');
    } catch {
      toast.error('Failed to remove');
    }
  };

  const getFileUrl = (filename: string) => `${BASE_URL}/uploads/${filename}`;

  const isImage = (mimetype: string) => mimetype.startsWith('image/');
  const isVideo = (mimetype: string) => mimetype.startsWith('video/');

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const actionIcons: Record<string, string> = {
    created:  '✦',
    moved:    '→',
    edited:   '✎',
    commented:'💬',
    archived: '🗃',
    assigned: '👤',
  };

  return (
    <>
      <div className="modal-overlay" onClick={() => setSelectedTask(null)}>
        <div
          className="modal-content w-full max-w-2xl max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start gap-3 px-6 py-4 border-b border-navy-700">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                {column && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                    style={{ color: column.color, background: `${column.color}18` }}
                  >
                    {column.title}
                  </span>
                )}
                <PriorityBadge priority={task.priority} />
              </div>
              <h2 className="font-display font-semibold text-lg text-white leading-snug">
                {task.title}
              </h2>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => setIsEditOpen(true)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-navy-700 transition-colors"
                title="Edit task"
              >
                <Edit2 size={15} />
              </button>
              {(user?.role === 'admin' || user?.id === (task.createdBy as any)?._id || user?.id === task.createdBy?.id) && (
                <button
                  onClick={handleDelete}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Archive task"
                >
                  <Trash2 size={15} />
                </button>
              )}
              <button
                onClick={() => setSelectedTask(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-navy-700 transition-colors ml-1"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-0 border-b border-navy-700 px-6">
            {(['details', 'comments', 'activity'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 px-3 py-3 text-xs font-medium border-b-2 transition-colors capitalize -mb-px ${
                  activeTab === tab
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab === 'comments' && <MessageSquare size={12} />}
                {tab === 'activity' && <Activity size={12} />}
                {tab}
                {tab === 'comments' && task.comments.length > 0 && (
                  <span className="bg-navy-700 text-gray-400 rounded-full px-1.5 text-[10px]">
                    {task.comments.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            {/* ── Details Tab ── */}
            {activeTab === 'details' && (
              <div className="p-6 space-y-5">
                {/* Description */}
                {task.description ? (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Description</p>
                    <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {task.description}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 italic">No description provided.</p>
                )}

                {/* Meta grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Assignees */}
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Assignees</p>
                    {task.assignees.length > 0 ? (
                      <div className="space-y-2">
                        {task.assignees.map((a) => (
                          <div key={a.id || (a as any)._id} className="flex items-center gap-2">
                            <Avatar name={a.name} avatar={a.avatar} size="xs" />
                            <div>
                              <p className="text-xs text-white">{a.name}</p>
                              <p className="text-[10px] text-gray-500 capitalize">{a.role}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-600">Unassigned</p>
                    )}
                  </div>

                  {/* Info */}
                  <div className="space-y-3">
                    {task.deadline && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1.5">Deadline</p>
                        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border font-medium ${deadlineColors[deadlineStatus || 'upcoming']}`}>
                          {deadlineStatus === 'overdue' && <AlertCircle size={11} />}
                          <Calendar size={11} />
                          {formatDate(task.deadline)}
                        </span>
                      </div>
                    )}

                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1.5">Created by</p>
                      <div className="flex items-center gap-1.5">
                        <Avatar name={task.createdBy?.name || 'Unknown'} size="xs" />
                        <span className="text-xs text-gray-300">{task.createdBy?.name}</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Created</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock size={10} />
                        {timeAgo(task.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {task.tags.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Tag size={10} /> Tags
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {task.tags.map((tag) => (
                        <span key={tag} className="badge bg-navy-700 text-gray-300 text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Media & Attachments ── */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <Paperclip size={10} /> Media & Files
                      {task.attachments.length > 0 && (
                        <span className="ml-1 bg-navy-700 text-gray-400 rounded-full px-1.5 text-[10px]">
                          {task.attachments.length}
                        </span>
                      )}
                    </p>
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-navy-700 hover:bg-navy-600 text-gray-300 hover:text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                      >
                        {isUploading ? (
                          <span className="w-3 h-3 border-2 border-gray-400/30 border-t-gray-400 rounded-full animate-spin" />
                        ) : (
                          <Paperclip size={12} />
                        )}
                        {isUploading ? 'Uploading…' : 'Upload'}
                      </button>
                    </div>
                  </div>

                  {task.attachments.length === 0 ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-navy-600 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-colors group"
                    >
                      <Paperclip size={24} className="mx-auto text-gray-700 group-hover:text-indigo-400 mb-2 transition-colors" />
                      <p className="text-xs text-gray-600 group-hover:text-gray-400">
                        Click to upload images or videos
                      </p>
                      <p className="text-[10px] text-gray-700 mt-0.5">PNG, JPG, GIF, MP4, WebM — up to 50MB</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {task.attachments.map((att: any) => {
                        const url = getFileUrl(att.filename);
                        const img = isImage(att.mimetype);
                        const vid = isVideo(att.mimetype);
                        return (
                          <div key={att._id} className="relative group bg-navy-800 border border-navy-700 rounded-xl overflow-hidden">
                            {img && (
                              <div
                                className="relative cursor-zoom-in"
                                onClick={() => setLightboxSrc(url)}
                              >
                                <img
                                  src={url}
                                  alt={att.originalName}
                                  className="w-full h-32 object-cover"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                                  <ZoomIn size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </div>
                            )}
                            {vid && (
                              <video
                                src={url}
                                controls
                                className="w-full h-32 object-cover bg-black"
                              />
                            )}
                            {!img && !vid && (
                              <div className="h-16 flex items-center justify-center bg-navy-700">
                                <Paperclip size={20} className="text-gray-500" />
                              </div>
                            )}
                            <div className="px-2.5 py-2">
                              <p className="text-xs text-white truncate font-medium">{att.originalName}</p>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                  {img && <ImageIcon size={9} />}
                                  {vid && <Film size={9} />}
                                  {formatBytes(att.size)}
                                </span>
                                <div className="flex items-center gap-1">
                                  <a
                                    href={url}
                                    download={att.originalName}
                                    className="p-1 text-gray-600 hover:text-indigo-400 transition-colors"
                                    title="Download"
                                  >
                                    <Download size={11} />
                                  </a>
                                  <button
                                    onClick={() => handleDeleteAttachment(att._id)}
                                    className="p-1 text-gray-600 hover:text-red-400 transition-colors"
                                    title="Remove"
                                  >
                                    <X size={11} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Upload more tile */}
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-navy-600 rounded-xl h-full min-h-[120px] flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-colors group"
                      >
                        <Paperclip size={18} className="text-gray-700 group-hover:text-indigo-400 mb-1 transition-colors" />
                        <span className="text-[10px] text-gray-600 group-hover:text-gray-400">Add more</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Lightbox ── */}
            {lightboxSrc && (
              <div
                className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
                onClick={() => setLightboxSrc(null)}
              >
                <button
                  className="absolute top-4 right-4 p-2 text-white/70 hover:text-white bg-white/10 rounded-full"
                  onClick={() => setLightboxSrc(null)}
                >
                  <X size={20} />
                </button>
                <img
                  src={lightboxSrc}
                  alt="Preview"
                  className="max-w-full max-h-full rounded-xl shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}

            {/* ── Comments Tab ── */}
            {activeTab === 'comments' && (
              <div className="p-6 space-y-4">
                {task.comments.length === 0 && (
                  <div className="text-center py-8">
                    <MessageSquare size={28} className="mx-auto text-gray-700 mb-2" />
                    <p className="text-sm text-gray-600">No comments yet. Start the conversation.</p>
                  </div>
                )}

                {task.comments.map((comment) => (
                  <div key={comment._id} className="flex gap-3">
                    <Avatar name={comment.author?.name || 'User'} avatar={comment.author?.avatar} size="sm" />
                    <div className="flex-1 bg-navy-700/50 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-semibold text-white">{comment.author?.name}</span>
                        <span className="text-[10px] text-gray-500">{timeAgo(comment.createdAt)}</span>
                      </div>
                      <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{comment.text}</p>
                    </div>
                  </div>
                ))}

                {/* Add comment */}
                <div className="flex gap-3 pt-2 border-t border-navy-700">
                  <Avatar name={user?.name || ''} avatar={user?.avatar} size="sm" />
                  <div className="flex-1 flex gap-2">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write a comment…"
                      rows={2}
                      className="input text-sm flex-1 resize-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAddComment();
                      }}
                    />
                    <button
                      onClick={handleAddComment}
                      disabled={isAddingComment || !commentText.trim()}
                      className="btn-primary p-2.5 self-end"
                    >
                      {isAddingComment
                        ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin block" />
                        : <Send size={14} />
                      }
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Activity Tab ── */}
            {activeTab === 'activity' && (
              <div className="p-6">
                {activityLogs.length === 0 && (
                  <div className="text-center py-8">
                    <Activity size={28} className="mx-auto text-gray-700 mb-2" />
                    <p className="text-sm text-gray-600">No activity recorded yet.</p>
                  </div>
                )}

                <div className="space-y-1">
                  {activityLogs.map((log, i) => (
                    <div key={log._id} className="flex gap-3 group">
                      {/* Timeline */}
                      <div className="flex flex-col items-center">
                        <div className="w-7 h-7 rounded-full bg-navy-700 border border-navy-600 flex items-center justify-center text-xs flex-shrink-0">
                          {actionIcons[log.action] || '·'}
                        </div>
                        {i < activityLogs.length - 1 && (
                          <div className="w-px flex-1 bg-navy-700 mt-1" />
                        )}
                      </div>

                      <div className="flex-1 pb-4">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs font-semibold text-white">
                            {(log.userId as any)?.name || 'Someone'}
                          </span>
                          <span className="text-xs text-gray-500">{timeAgo(log.createdAt)}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{log.details || log.action}</p>
                        {log.fromColumn && log.toColumn && (
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-[10px] bg-navy-700 text-gray-400 px-1.5 py-0.5 rounded">
                              {log.fromColumn}
                            </span>
                            <ChevronRight size={10} className="text-gray-600" />
                            <span className="text-[10px] bg-indigo-500/15 text-indigo-400 px-1.5 py-0.5 rounded">
                              {log.toColumn}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit modal */}
      <TaskFormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        editTask={task}
      />
    </>
  );
}
