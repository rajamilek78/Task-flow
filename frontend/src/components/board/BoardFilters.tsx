// src/components/board/BoardFilters.tsx
import { useState, useEffect } from 'react';
import { Search, X, Plus } from 'lucide-react';
import { useTaskStore } from '../../store/taskStore';
import { useProjectStore } from '../../store/projectStore';
import { authApi } from '../../services/api';
import { User } from '../../types';

interface BoardFiltersProps {
  onCreateTask: () => void;
}

export default function BoardFilters({ onCreateTask }: BoardFiltersProps) {
  const { filters, fetchTasks } = useTaskStore();
  const { projects, activeProjectId, setActiveProject } = useProjectStore();
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [searchInput, setSearchInput] = useState(filters.search);

  useEffect(() => {
    authApi.getTeam().then((res) => setTeamMembers(res.data.users)).catch(() => {});
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTasks({ search: searchInput });
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handlePriorityChange = (priority: string) => {
    fetchTasks({ priority });
  };

  const handleAssigneeChange = (assignee: string) => {
    fetchTasks({ assignee });
  };

  const handleProjectChange = (projectId: string) => {
    setActiveProject(projectId || null);
    fetchTasks({ projectId: projectId || undefined });
  };

  const clearFilters = () => {
    setSearchInput('');
    setActiveProject(null);
    fetchTasks({ search: '', priority: '', assignee: '', projectId: undefined });
  };

  const hasActiveFilters = filters.search || filters.priority || filters.assignee || activeProjectId;

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search tasks…"
          className="input pl-8 pr-3 py-2 text-sm w-52 h-9"
        />
        {searchInput && (
          <button
            onClick={() => setSearchInput('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Priority filter */}
      <select
        value={filters.priority}
        onChange={(e) => handlePriorityChange(e.target.value)}
        className="input py-2 text-sm h-9 pr-8 w-36 cursor-pointer"
      >
        <option value="">All priorities</option>
        <option value="urgent">🔴 Urgent</option>
        <option value="high">🟠 High</option>
        <option value="medium">🟡 Medium</option>
        <option value="low">🟢 Low</option>
      </select>

      {/* Assignee filter */}
      <select
        value={filters.assignee}
        onChange={(e) => handleAssigneeChange(e.target.value)}
        className="input py-2 text-sm h-9 pr-8 w-40 cursor-pointer"
      >
        <option value="">All members</option>
        {teamMembers.map((m) => (
          <option key={(m as any)._id || m.id} value={(m as any)._id || m.id}>
            {m.name}
          </option>
        ))}
      </select>

      {/* Project filter */}
      <select
        value={activeProjectId || ''}
        onChange={(e) => handleProjectChange(e.target.value)}
        className="input py-2 text-sm h-9 pr-8 w-44 cursor-pointer"
      >
        <option value="">All projects</option>
        {projects.map((p) => (
          <option key={p._id} value={p._id}>
            {p.name}
          </option>
        ))}
      </select>

      {/* Clear filters */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white px-2.5 py-2 rounded-lg hover:bg-navy-700 transition-colors"
        >
          <X size={12} /> Clear
        </button>
      )}

      {/* Create task */}
      <button
        onClick={onCreateTask}
        className="btn-primary flex items-center gap-1.5 text-sm h-9 px-4 ml-auto"
      >
        <Plus size={15} />
        New Task
      </button>
    </div>
  );
}
