// src/components/task/TaskFormModal.tsx
import { useState, useEffect, FormEvent } from 'react';
import { X, Calendar, Tag, AlertCircle } from 'lucide-react';
import Modal from '../ui/Modal';
import Avatar from '../ui/Avatar';
import { useTaskStore } from '../../store/taskStore';
import { useAuthStore } from '../../store/authStore';
import { useProjectStore } from '../../store/projectStore';
import { authApi } from '../../services/api';
import { Priority, Task, User } from '../../types';
import toast from 'react-hot-toast';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultColumnId?: string;
  editTask?: Task | null;
}

const PRIORITIES: Priority[] = ['low', 'medium', 'high', 'urgent'];

export default function TaskFormModal({ isOpen, onClose, defaultColumnId, editTask }: TaskFormModalProps) {
  const { columns, createTask, updateTask } = useTaskStore();
  const { user } = useAuthStore();
  const { activeProjectId, getActiveProject } = useProjectStore();
  const activeProject = getActiveProject();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [columnId, setColumnId] = useState(defaultColumnId || '');
  const [priority, setPriority] = useState<Priority>('medium');
  const [deadline, setDeadline] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isEdit = Boolean(editTask);

  // Populate form when editing
  useEffect(() => {
    if (editTask) {
      setTitle(editTask.title);
      setDescription(editTask.description || '');
      setColumnId(editTask.columnId);
      setPriority(editTask.priority);
      setDeadline(editTask.deadline ? editTask.deadline.slice(0, 10) : '');
      setTags(editTask.tags);
      setSelectedAssignees(editTask.assignees.map((a) => a.id || (a as any)._id));
    } else {
      setTitle('');
      setDescription('');
      setColumnId(defaultColumnId || columns[0]?.id || '');
      setPriority('medium');
      setDeadline('');
      setTags([]);
      setSelectedAssignees([]);
    }
  }, [editTask, isOpen, defaultColumnId, columns]);

  // Fetch team members
  useEffect(() => {
    if (isOpen) {
      authApi.getTeam().then((res) => setTeamMembers(res.data.users)).catch(() => {});
    }
  }, [isOpen]);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  };

  const toggleAssignee = (userId: string) => {
    setSelectedAssignees((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required'); return; }
    setError('');
    setIsSubmitting(true);
    try {
      const payload: any = {
        title: title.trim(),
        description: description.trim(),
        columnId,
        priority,
        assignees: selectedAssignees,
        deadline: deadline || undefined,
        tags,
      };

      // Attach projectId when creating inside a project context
      if (!isEdit && activeProjectId) {
        payload.projectId = activeProjectId;
      }

      if (isEdit && editTask) {
        await updateTask(editTask._id, payload);
        toast.success('Task updated');
      } else {
        await createTask(payload);
        toast.success('Task created');
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const priorityColors: Record<Priority, string> = {
    low:    'border-emerald-500/50 bg-emerald-500/10 text-emerald-400',
    medium: 'border-amber-500/50   bg-amber-500/10   text-amber-400',
    high:   'border-orange-500/50  bg-orange-500/10  text-orange-400',
    urgent: 'border-red-500/50     bg-red-500/10     text-red-400',
  };

  const modalTitle = isEdit
    ? 'Edit Task'
    : activeProject
    ? `New Task · ${activeProject.name}`
    : 'Create Task';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} size="xl">
      <form onSubmit={handleSubmit}>
        <div className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-3 py-2.5 text-sm">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">Task Title *</label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="input text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more context…"
              rows={3}
              className="input text-sm resize-none"
            />
          </div>

          {/* Column + Priority row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">Stage</label>
              <select
                value={columnId}
                onChange={(e) => setColumnId(e.target.value)}
                className="input text-sm"
              >
                {columns.map((col) => (
                  <option key={col.id} value={col.id}>{col.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">Priority</label>
              <div className="grid grid-cols-2 gap-1.5">
                {PRIORITIES.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`text-[11px] font-semibold py-1.5 rounded-lg border capitalize transition-all ${
                      priority === p ? priorityColors[p] : 'border-navy-600 text-gray-500 hover:border-navy-500'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium flex items-center gap-1.5">
              <Calendar size={12} /> Deadline
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="input text-sm"
              style={{ colorScheme: 'dark' }}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium flex items-center gap-1.5">
              <Tag size={12} /> Tags
            </label>
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                placeholder="Type a tag and press Enter"
                className="input text-sm flex-1"
              />
              <button type="button" onClick={addTag} className="btn-ghost text-xs px-3">
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((tag) => (
                  <span key={tag} className="badge bg-navy-700 text-gray-300 text-xs gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => setTags(tags.filter((t) => t !== tag))}
                      className="hover:text-white"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Assignees */}
          <div>
            <label className="block text-xs text-gray-400 mb-2 font-medium">Assignees</label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
              {teamMembers.map((member) => {
                const id = (member as any)._id || member.id;
                const selected = selectedAssignees.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleAssignee(id)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-left transition-all ${
                      selected
                        ? 'border-indigo-500/50 bg-indigo-500/10'
                        : 'border-navy-600 hover:border-navy-500 bg-navy-800/50'
                    }`}
                  >
                    <Avatar name={member.name} avatar={member.avatar} size="xs" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-white truncate">{member.name}</p>
                      <p className="text-[10px] text-gray-500 capitalize">{member.role}</p>
                    </div>
                    {selected && (
                      <div className="ml-auto w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-navy-700">
          <button type="button" onClick={onClose} className="btn-ghost text-sm">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary text-sm px-6">
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {isEdit ? 'Saving…' : 'Creating…'}
              </span>
            ) : isEdit ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
