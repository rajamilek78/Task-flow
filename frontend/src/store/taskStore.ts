// src/store/taskStore.ts
import { create } from 'zustand';
import { Task, Column, DashboardStats } from '../types';
import { taskApi, columnApi } from '../services/api';

interface TaskFilters {
  search: string;
  priority: string;
  assignee: string;
  projectId?: string;
}

interface TaskState {
  tasks: Task[];
  columns: Column[];
  stats: DashboardStats | null;
  filters: TaskFilters;
  isLoading: boolean;
  selectedTask: Task | null;

  fetchTasks: (filters?: Partial<TaskFilters>) => Promise<void>;
  fetchColumns: () => Promise<void>;
  fetchStats: () => Promise<void>;
  createTask: (data: Partial<Task>) => Promise<Task>;
  updateTask: (id: string, data: Partial<Task>) => Promise<void>;
  moveTask: (taskId: string, columnId: string, order: number) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addComment: (taskId: string, text: string) => Promise<void>;
  setFilters: (filters: Partial<TaskFilters>) => void;
  setSelectedTask: (task: Task | null) => void;
  getTasksByColumn: (columnId: string) => Task[];
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  columns: [],
  stats: null,
  filters: { search: '', priority: '', assignee: '' },
  isLoading: false,
  selectedTask: null,

  fetchTasks: async (filters) => {
    set({ isLoading: true });
    // Merge incoming filters into store first, then read from store
    if (filters) {
      set((state) => ({ filters: { ...state.filters, ...filters } }));
    }
    try {
      const currentFilters = get().filters;
      const params: Record<string, string> = {};
      if (currentFilters.search) params.search = currentFilters.search;
      if (currentFilters.priority) params.priority = currentFilters.priority;
      if (currentFilters.assignee) params.assignee = currentFilters.assignee;
      if (currentFilters.projectId) params.projectId = currentFilters.projectId;

      const res = await taskApi.getAll(params);
      set({ tasks: res.data.tasks, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchColumns: async () => {
    try {
      const res = await columnApi.getAll();
      set({ columns: res.data.columns });
    } catch (err) {
      console.error('Failed to fetch columns', err);
    }
  },

  fetchStats: async () => {
    try {
      const res = await taskApi.getStats();
      set({ stats: res.data.stats });
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  },

  createTask: async (data) => {
    const res = await taskApi.create(data);
    const newTask = res.data.task;
    set((state) => ({ tasks: [...state.tasks, newTask] }));
    return newTask;
  },

  updateTask: async (id, data) => {
    const res = await taskApi.update(id, data);
    const updatedTask = res.data.task;
    set((state) => ({
      tasks: state.tasks.map((t) => (t._id === id ? updatedTask : t)),
      selectedTask: state.selectedTask?._id === id ? updatedTask : state.selectedTask,
    }));
  },

  moveTask: async (taskId, columnId, order) => {
    // Optimistic update
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t._id === taskId ? { ...t, columnId, order } : t
      ),
    }));
    try {
      await taskApi.move(taskId, columnId, order);
    } catch (err) {
      // Revert on failure
      await get().fetchTasks();
      throw err;
    }
  },

  deleteTask: async (id) => {
    await taskApi.delete(id);
    set((state) => ({
      tasks: state.tasks.filter((t) => t._id !== id),
      selectedTask: state.selectedTask?._id === id ? null : state.selectedTask,
    }));
  },

  addComment: async (taskId, text) => {
    const res = await taskApi.addComment(taskId, text);
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t._id === taskId ? { ...t, comments: res.data.comments } : t
      ),
      selectedTask:
        state.selectedTask?._id === taskId
          ? { ...state.selectedTask, comments: res.data.comments }
          : state.selectedTask,
    }));
  },

  setFilters: (filters) => {
    set((state) => ({ filters: { ...state.filters, ...filters } }));
  },

  setSelectedTask: (task) => set({ selectedTask: task }),

  getTasksByColumn: (columnId) => {
    return get()
      .tasks.filter((t) => t.columnId === columnId && !t.isArchived)
      .sort((a, b) => a.order - b.order);
  },
}));
