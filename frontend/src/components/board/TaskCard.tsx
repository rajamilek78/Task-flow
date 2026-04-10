// src/components/board/TaskCard.tsx
import { Draggable } from '@hello-pangea/dnd';
import { Calendar, MessageSquare, Paperclip, AlertCircle } from 'lucide-react';
import { Task } from '../../types';
import { PriorityBadge } from '../ui/Badge';
import { AvatarGroup } from '../ui/Avatar';
import { formatDate, getDeadlineStatus, truncate } from '../../utils/helpers';
import { useTaskStore } from '../../store/taskStore';

interface TaskCardProps {
  task: Task;
  index: number;
}

export default function TaskCard({ task, index }: TaskCardProps) {
  const { setSelectedTask } = useTaskStore();
  const deadlineStatus = getDeadlineStatus(task.deadline);

  const deadlineColors: Record<string, string> = {
    overdue:  'text-red-400 bg-red-400/10',
    today:    'text-amber-400 bg-amber-400/10',
    tomorrow: 'text-yellow-400 bg-yellow-400/10',
    upcoming: 'text-gray-500 bg-navy-700',
  };

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => setSelectedTask(task)}
          className={`group bg-navy-800 border rounded-xl p-3.5 cursor-pointer select-none
            transition-all duration-150 hover:border-indigo-500/40 hover:shadow-lg hover:shadow-black/20
            ${snapshot.isDragging
              ? 'border-indigo-500/60 shadow-xl shadow-black/40 rotate-1 scale-[1.02]'
              : 'border-navy-600/60'
            }`}
        >
          {/* Priority + Tags row */}
          <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
            <PriorityBadge priority={task.priority} />
            {task.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="badge bg-navy-700 text-gray-400 text-[9px] px-1.5">
                {tag}
              </span>
            ))}
            {task.tags.length > 2 && (
              <span className="text-[9px] text-gray-600">+{task.tags.length - 2}</span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-sm font-medium text-white leading-snug mb-2.5 group-hover:text-indigo-200 transition-colors">
            {truncate(task.title, 80)}
          </h3>

          {/* Description preview */}
          {task.description && (
            <p className="text-xs text-gray-500 mb-2.5 leading-relaxed line-clamp-2">
              {truncate(task.description, 100)}
            </p>
          )}

          {/* Footer row */}
          <div className="flex items-center justify-between mt-1">
            {/* Left: deadline + meta */}
            <div className="flex items-center gap-2">
              {task.deadline && (
                <span className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md font-medium ${deadlineColors[deadlineStatus || 'upcoming']}`}>
                  {deadlineStatus === 'overdue' && <AlertCircle size={9} />}
                  <Calendar size={9} />
                  {deadlineStatus === 'today' ? 'Today'
                    : deadlineStatus === 'tomorrow' ? 'Tomorrow'
                    : formatDate(task.deadline)}
                </span>
              )}

              {task.comments.length > 0 && (
                <span className="flex items-center gap-1 text-[10px] text-gray-600">
                  <MessageSquare size={9} />
                  {task.comments.length}
                </span>
              )}

              {task.attachments.length > 0 && (
                <span className="flex items-center gap-1 text-[10px] text-gray-600">
                  <Paperclip size={9} />
                  {task.attachments.length}
                </span>
              )}
            </div>

            {/* Right: assignees */}
            {task.assignees.length > 0 && (
              <AvatarGroup users={task.assignees} max={3} />
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
