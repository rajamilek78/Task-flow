// src/pages/BoardPage.tsx
import { useEffect, useState } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Layers, FolderOpen } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { useProjectStore } from '../store/projectStore';
import KanbanColumn from '../components/board/KanbanColumn';
import BoardFilters from '../components/board/BoardFilters';
import TaskDetailModal from '../components/task/TaskDetailModal';
import TaskFormModal from '../components/task/TaskFormModal';
import toast from 'react-hot-toast';

export default function BoardPage() {
  const { tasks, columns, selectedTask, fetchTasks, fetchColumns, moveTask, isLoading } = useTaskStore();
  const { activeProjectId, getActiveProject } = useProjectStore();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createColumnId, setCreateColumnId] = useState<string | undefined>();

  const activeProject = getActiveProject();

  useEffect(() => {
    fetchColumns();
  }, []);

  useEffect(() => {
    // Re-fetch tasks whenever the active project changes
    fetchTasks(activeProjectId ? { projectId: activeProjectId } : { projectId: undefined });
  }, [activeProjectId]);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    try {
      await moveTask(draggableId, destination.droppableId, destination.index);
    } catch {
      toast.error('Failed to move task');
    }
  };

  const handleAddTask = (columnId: string) => {
    setCreateColumnId(columnId);
    setIsCreateOpen(true);
  };

  const getColumnTasks = (columnId: string) =>
    tasks
      .filter((t) => t.columnId === columnId && !t.isArchived)
      .sort((a, b) => a.order - b.order);

  const totalTasks = tasks.filter((t) => !t.isArchived).length;

  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <div className="px-6 py-5 border-b border-navy-700/60 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-500/15 border border-indigo-500/25 rounded-lg flex items-center justify-center">
              <Layers size={16} className="text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-xl font-bold text-white">Kanban Board</h1>
                {activeProject && (
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${activeProject.color}18`,
                      color: activeProject.color,
                      border: `1px solid ${activeProject.color}35`,
                    }}
                  >
                    <FolderOpen size={11} />
                    {activeProject.name}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">
                {columns.length} stages · {totalTasks} active task{totalTasks !== 1 ? 's' : ''}
                {!activeProject && ' · All Projects'}
              </p>
            </div>
          </div>
        </div>
        <BoardFilters onCreateTask={() => { setCreateColumnId(undefined); setIsCreateOpen(true); }} />
      </div>

      {/* Board */}
      <div className="flex-1 overflow-hidden">
        {isLoading && tasks.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
              <p className="text-sm text-gray-500">Loading board…</p>
            </div>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="board-scroll h-full p-6">
              <div className="flex gap-4 h-full min-w-max">
                {columns.map((column) => (
                  <KanbanColumn
                    key={column.id}
                    column={column}
                    tasks={getColumnTasks(column.id)}
                    onAddTask={handleAddTask}
                  />
                ))}
              </div>
            </div>
          </DragDropContext>
        )}
      </div>

      {/* Modals */}
      {selectedTask && <TaskDetailModal />}
      <TaskFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        defaultColumnId={createColumnId}
      />
    </div>
  );
}
