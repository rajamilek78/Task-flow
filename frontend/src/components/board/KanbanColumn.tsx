// src/components/board/KanbanColumn.tsx
import { Droppable } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import { Column, Task } from '../../types';
import TaskCard from './TaskCard';

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  onAddTask: (columnId: string) => void;
}

export default function KanbanColumn({ column, tasks, onAddTask }: KanbanColumnProps) {
  return (
    <div className="flex-shrink-0 w-72 flex flex-col max-h-full">
      {/* Column header */}
      <div
        className="flex items-center justify-between px-3 py-2.5 rounded-t-xl border border-b-0"
        style={{
          borderColor: `${column.color}30`,
          background: `linear-gradient(135deg, ${column.color}12, ${column.color}06)`,
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: column.color }}
          />
          <h2 className="text-xs font-semibold text-gray-200 truncate" title={column.title}>
            {column.title}
          </h2>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
            style={{ color: column.color, background: `${column.color}20` }}
          >
            {tasks.length}
          </span>
          <button
            onClick={() => onAddTask(column.id)}
            className="w-5 h-5 rounded-md flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Plus size={12} />
          </button>
        </div>
      </div>

      {/* Droppable task list */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 min-h-[120px] p-2 rounded-b-xl border border-t-0 space-y-2 overflow-y-auto transition-colors duration-150
              ${snapshot.isDraggingOver
                ? 'bg-indigo-500/5 border-indigo-500/30'
                : 'bg-navy-900/50 border-navy-700/40'
              }`}
          >
            {tasks.map((task, index) => (
              <TaskCard key={task._id} task={task} index={index} />
            ))}
            {provided.placeholder}

            {/* Empty state */}
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div
                  className="w-8 h-8 rounded-lg mb-2 flex items-center justify-center opacity-30"
                  style={{ background: `${column.color}20` }}
                >
                  <div className="w-3 h-3 rounded-sm" style={{ background: column.color }} />
                </div>
                <p className="text-[11px] text-gray-600">Drop tasks here</p>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
