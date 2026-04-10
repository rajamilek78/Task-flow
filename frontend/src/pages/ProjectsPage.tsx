// src/pages/ProjectsPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderOpen, Plus, Trash2, Edit2, Users, Layers, X, Check } from 'lucide-react';
import { useProjectStore } from '../store/projectStore';
import { useAuthStore } from '../store/authStore';
import { Project } from '../types';
import Avatar from '../components/ui/Avatar';
import toast from 'react-hot-toast';

const PROJECT_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f97316',
  '#eab308', '#22c55e', '#14b8a6', '#3b82f6',
];

const PROJECT_ICONS = ['folder', 'layers', 'star', 'zap', 'shield', 'globe', 'box', 'cpu'];

function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {PROJECT_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className="w-7 h-7 rounded-full border-2 transition-all"
          style={{
            backgroundColor: c,
            borderColor: value === c ? '#fff' : 'transparent',
            boxShadow: value === c ? `0 0 0 2px ${c}` : 'none',
          }}
        />
      ))}
    </div>
  );
}

interface ProjectFormProps {
  initial?: Partial<Project>;
  onSubmit: (data: { name: string; description: string; color: string }) => Promise<void>;
  onCancel: () => void;
  submitLabel: string;
}

function ProjectForm({ initial, onSubmit, onCancel, submitLabel }: ProjectFormProps) {
  const [name, setName] = useState(initial?.name || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [color, setColor] = useState(initial?.color || '#6366f1');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSubmit({ name: name.trim(), description: description.trim(), color });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1.5">Project Name *</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Website Redesign"
          className="w-full bg-navy-800 border border-navy-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
          autoFocus
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1.5">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What is this project about?"
          rows={3}
          className="w-full bg-navy-800 border border-navy-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1.5">Color</label>
        <ColorPicker value={color} onChange={setColor} />
      </div>
      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={!name.trim() || saving}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Check size={14} />
          {saving ? 'Saving…' : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-navy-700 hover:bg-navy-600 text-gray-300 text-sm font-medium rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { projects, fetchProjects, createProject, updateProject, deleteProject, setActiveProject, isLoading } = useProjectStore();
  const { user } = useAuthStore();
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (data: { name: string; description: string; color: string }) => {
    try {
      await createProject(data);
      setShowCreate(false);
      toast.success('Project created');
    } catch {
      toast.error('Failed to create project');
    }
  };

  const handleUpdate = async (id: string, data: { name: string; description: string; color: string }) => {
    try {
      await updateProject(id, data);
      setEditingId(null);
      toast.success('Project updated');
    } catch {
      toast.error('Failed to update project');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProject(id);
      setDeletingId(null);
      toast.success('Project archived');
    } catch {
      toast.error('Failed to archive project');
    }
  };

  const handleOpenBoard = (project: Project) => {
    setActiveProject(project._id);
    navigate('/board');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-5 border-b border-navy-700/60 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-500/15 border border-indigo-500/25 rounded-lg flex items-center justify-center">
              <FolderOpen size={16} className="text-indigo-400" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-white">Projects</h1>
              <p className="text-xs text-gray-500">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <button
            onClick={() => { setShowCreate(true); setEditingId(null); }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus size={14} />
            New Project
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">

        {/* Create form */}
        {showCreate && (
          <div className="bg-navy-800 border border-indigo-500/30 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">New Project</h3>
            <ProjectForm
              onSubmit={handleCreate}
              onCancel={() => setShowCreate(false)}
              submitLabel="Create Project"
            />
          </div>
        )}

        {/* Loading */}
        {isLoading && projects.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && projects.length === 0 && !showCreate && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-navy-800 border border-navy-700 rounded-2xl flex items-center justify-center mb-4">
              <FolderOpen size={28} className="text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-300 mb-1">No projects yet</h3>
            <p className="text-sm text-gray-600 mb-4">Create your first project to organize tasks</p>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus size={14} />
              New Project
            </button>
          </div>
        )}

        {/* Projects grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div
              key={project._id}
              className="bg-navy-800 border border-navy-700 rounded-xl overflow-hidden hover:border-navy-600 transition-colors"
            >
              {/* Color bar */}
              <div className="h-1.5" style={{ backgroundColor: project.color }} />

              <div className="p-4">
                {editingId === project._id ? (
                  <ProjectForm
                    initial={project}
                    onSubmit={(data) => handleUpdate(project._id, data)}
                    onCancel={() => setEditingId(null)}
                    submitLabel="Save"
                  />
                ) : (
                  <>
                    {/* Title row */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${project.color}20`, border: `1px solid ${project.color}40` }}
                        >
                          <FolderOpen size={14} style={{ color: project.color }} />
                        </div>
                        <h3 className="font-semibold text-white truncate text-sm">{project.name}</h3>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {((project.createdBy as any)._id === user?.id || user?.role === 'admin') && (
                          <>
                            <button
                              onClick={() => { setEditingId(project._id); setDeletingId(null); }}
                              className="p-1.5 text-gray-500 hover:text-white hover:bg-navy-700 rounded-md transition-colors"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => setDeletingId(deletingId === project._id ? null : project._id)}
                              className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    {project.description && (
                      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{project.description}</p>
                    )}

                    {/* Members */}
                    <div className="flex items-center gap-1.5 mb-4">
                      <Users size={12} className="text-gray-600" />
                      <div className="flex -space-x-1.5">
                        {project.members.slice(0, 5).map((m) => (
                          <Avatar key={m.id || (m as any)._id} name={m.name} avatar={m.avatar} size="xs" />
                        ))}
                      </div>
                      <span className="text-xs text-gray-600 ml-0.5">
                        {project.members.length} member{project.members.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Delete confirm */}
                    {deletingId === project._id && (
                      <div className="mb-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
                        <p className="mb-2">Archive this project? Tasks will be preserved.</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDelete(project._id)}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-md transition-colors"
                          >
                            Archive
                          </button>
                          <button
                            onClick={() => setDeletingId(null)}
                            className="px-3 py-1.5 bg-navy-700 hover:bg-navy-600 text-gray-300 rounded-md transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Open board */}
                    <button
                      onClick={() => handleOpenBoard(project)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-navy-700 hover:bg-navy-600 text-gray-300 hover:text-white text-xs font-medium rounded-lg transition-colors"
                    >
                      <Layers size={13} />
                      Open Board
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
