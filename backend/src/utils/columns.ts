// src/utils/columns.ts
// Exact workflow columns as specified - DO NOT change order

export interface Column {
  id: string;
  title: string;
  color: string;
  description: string;
}

export const WORKFLOW_COLUMNS: Column[] = [
  {
    id: 'uiux-design-todo',
    title: 'UI/UX Design To Do',
    color: '#6366f1',
    description: 'Tasks queued for UI/UX design phase',
  },
  {
    id: 'uiux-design-done',
    title: 'UI/UX Design Done',
    color: '#8b5cf6',
    description: 'UI/UX design phase completed',
  },
  {
    id: 'design-start',
    title: 'Design Start',
    color: '#a855f7',
    description: 'Visual design in progress',
  },
  {
    id: 'design-done',
    title: 'Design Done',
    color: '#ec4899',
    description: 'Visual design completed and approved',
  },
  {
    id: 'testing-local-krish',
    title: 'Testing by Local Krish',
    color: '#f97316',
    description: 'Local testing by Krish',
  },
  {
    id: 'testing-local-uiux-team',
    title: 'Testing by Local UI/UX Team',
    color: '#eab308',
    description: 'Local UI/UX team testing phase',
  },
  {
    id: 'testing-local-Project-Manager',
    title: 'Testing by Local Project Manager',
    color: '#84cc16',
    description: 'Local testing by Project Manager',
  },
  {
    id: 'development-start',
    title: 'Development Start',
    color: '#22c55e',
    description: 'Development phase initiated',
  },
  {
    id: 'development-done',
    title: 'Development Done',
    color: '#10b981',
    description: 'Development phase completed',
  },
  {
    id: 'testing-krish',
    title: 'Testing by Krish',
    color: '#14b8a6',
    description: 'QA testing by Krish',
  },
  {
    id: 'testing-Project-Manager',
    title: 'Testing by Project Manager',
    color: '#06b6d4',
    description: 'QA testing by Project Manager',
  },
  {
    id: 'ready-for-deployment',
    title: 'Ready for Deployment',
    color: '#3b82f6',
    description: 'Task approved and ready to deploy',
  },
  {
    id: 'deployed',
    title: 'Deployed',
    color: '#6366f1',
    description: 'Task deployed to production',
  },
  {
    id: 'post-deploy-testing-krish',
    title: 'Post-Deploy Testing by Krish',
    color: '#8b5cf6',
    description: 'Post-deployment verification by Krish',
  },
  {
    id: 'post-deploy-testing Project-Manager',
    title: 'Post-Deploy Testing by Project Manager',
    color: '#a855f7',
    description: 'Post-deployment verification by Project Manager',
  },
  {
    id: 'completed',
    title: 'Completed',
    color: '#22c55e',
    description: 'Task fully completed and verified',
  },
];

export const getColumnById = (id: string): Column | undefined =>
  WORKFLOW_COLUMNS.find((col) => col.id === id);

export const getColumnTitle = (id: string): string =>
  getColumnById(id)?.title || id;
