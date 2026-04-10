// src/store/projectStore.ts
import { create } from 'zustand';
import { Project } from '../types';
import { projectApi } from '../services/api';

interface ProjectState {
  projects: Project[];
  activeProjectId: string | null; // null = "All Projects"
  isLoading: boolean;

  fetchProjects: () => Promise<void>;
  createProject: (data: { name: string; description?: string; color?: string; icon?: string; members?: string[] }) => Promise<Project>;
  updateProject: (id: string, data: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setActiveProject: (id: string | null) => void;
  getActiveProject: () => Project | null;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  activeProjectId: null,
  isLoading: false,

  fetchProjects: async () => {
    set({ isLoading: true });
    try {
      const res = await projectApi.getAll();
      set({ projects: res.data.projects, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createProject: async (data) => {
    const res = await projectApi.create(data);
    const newProject = res.data.project;
    set((state) => ({ projects: [newProject, ...state.projects] }));
    return newProject;
  },

  updateProject: async (id, data) => {
    const res = await projectApi.update(id, data as any);
    const updated = res.data.project;
    set((state) => ({
      projects: state.projects.map((p) => (p._id === id ? updated : p)),
    }));
  },

  deleteProject: async (id) => {
    await projectApi.delete(id);
    set((state) => ({
      projects: state.projects.filter((p) => p._id !== id),
      activeProjectId: state.activeProjectId === id ? null : state.activeProjectId,
    }));
  },

  setActiveProject: (id) => set({ activeProjectId: id }),

  getActiveProject: () => {
    const { projects, activeProjectId } = get();
    if (!activeProjectId) return null;
    return projects.find((p) => p._id === activeProjectId) || null;
  },
}));
