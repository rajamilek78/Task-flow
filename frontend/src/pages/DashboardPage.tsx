// src/pages/DashboardPage.tsx
import { useEffect } from 'react';
import { CheckCircle2, Clock, AlertTriangle, BarChart2, Users, TrendingUp } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { useAuthStore } from '../store/authStore';
import { priorityConfig } from '../utils/helpers';
import { Priority } from '../types';

export default function DashboardPage() {
  const { stats, tasks, columns, fetchStats, fetchTasks, fetchColumns } = useTaskStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchStats();
    fetchTasks();
    fetchColumns();
  }, []);

  const activeTasks = tasks.filter((t) => !t.isArchived);
  const overdueTasks = activeTasks.filter(
    (t) => t.deadline && new Date(t.deadline) < new Date()
  );
  const completedTasks = activeTasks.filter((t) => t.columnId === 'completed');
  const myTasks = activeTasks.filter((t) =>
    t.assignees.some((a) => (a.id || (a as any)._id) === user?.id)
  );

  const statCards = [
    { label: 'Total Tasks',  value: activeTasks.length, icon: BarChart2,    color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'My Tasks',     value: myTasks.length,     icon: Users,        color: 'text-blue-400',   bg: 'bg-blue-500/10'   },
    { label: 'Overdue',      value: overdueTasks.length,icon: AlertTriangle, color: 'text-red-400',    bg: 'bg-red-500/10'    },
    { label: 'Completed',    value: completedTasks.length, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ];

  // Build column progress bars
  const columnStats = columns.map((col) => ({
    ...col,
    count: activeTasks.filter((t) => t.columnId === col.id).length,
  }));
  const maxColCount = Math.max(...columnStats.map((c) => c.count), 1);

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-500/15 border border-blue-500/25 rounded-lg flex items-center justify-center">
          <TrendingUp size={16} className="text-blue-400" />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold text-white">Dashboard</h1>
          <p className="text-xs text-gray-500">Project overview and metrics</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-5">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-4`}>
              <Icon size={20} className={color} />
            </div>
            <p className="text-3xl font-display font-bold text-white mb-1">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority breakdown */}
        <div className="card p-5">
          <h2 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart2 size={16} className="text-indigo-400" /> Priority Breakdown
          </h2>
          <div className="space-y-3">
            {(['urgent', 'high', 'medium', 'low'] as Priority[]).map((priority) => {
              const config = priorityConfig[priority];
              const count = stats?.byPriority[priority] || 0;
              const pct = activeTasks.length ? Math.round((count / activeTasks.length) * 100) : 0;
              return (
                <div key={priority}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className={`text-xs font-medium ${config.color} capitalize`}>{priority}</span>
                    <span className="text-xs text-gray-500">{count} tasks ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-navy-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: config.dot.replace('bg-', '') }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Column distribution */}
        <div className="card p-5">
          <h2 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
            <Clock size={16} className="text-blue-400" /> Tasks by Stage
          </h2>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {columnStats.map((col) => (
              <div key={col.id} className="flex items-center gap-3">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: col.color }}
                />
                <span className="text-xs text-gray-400 flex-1 truncate" title={col.title}>
                  {col.title}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-navy-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${(col.count / maxColCount) * 100}%`,
                        backgroundColor: col.color,
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-4 text-right">{col.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent tasks */}
      <div className="card p-5">
        <h2 className="font-display font-semibold text-white mb-4">Recent Tasks</h2>
        <div className="space-y-2">
          {activeTasks.slice(0, 8).map((task) => {
            const col = columns.find((c) => c.id === task.columnId);
            const config = priorityConfig[task.priority];
            return (
              <div key={task._id} className="flex items-center gap-4 py-2.5 border-b border-navy-700/50 last:border-0">
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.dot}`} />
                <p className="text-sm text-white flex-1 truncate">{task.title}</p>
                {col && (
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ color: col.color, background: `${col.color}18` }}
                  >
                    {col.title}
                  </span>
                )}
                <span className={`text-[10px] font-medium ${config.color} ${config.bg} px-1.5 py-0.5 rounded-full capitalize flex-shrink-0`}>
                  {task.priority}
                </span>
              </div>
            );
          })}
          {activeTasks.length === 0 && (
            <p className="text-sm text-gray-600 py-4 text-center">No tasks yet. Create your first task on the board!</p>
          )}
        </div>
      </div>
    </div>
  );
}
