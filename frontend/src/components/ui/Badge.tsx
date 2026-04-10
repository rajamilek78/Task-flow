// src/components/ui/Badge.tsx
import { Priority } from '../../types';
import { priorityConfig } from '../../utils/helpers';

interface PriorityBadgeProps {
  priority: Priority;
  size?: 'sm' | 'md';
}

export function PriorityBadge({ priority, size = 'sm' }: PriorityBadgeProps) {
  const config = priorityConfig[priority];
  return (
    <span className={`badge ${config.color} ${config.bg} ${size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} inline-block`} />
      {config.label}
    </span>
  );
}

interface TagProps {
  label: string;
  onRemove?: () => void;
}

export function Tag({ label, onRemove }: TagProps) {
  return (
    <span className="badge bg-navy-700 text-gray-300 text-[10px] px-2 py-0.5 gap-1">
      {label}
      {onRemove && (
        <button onClick={onRemove} className="hover:text-white transition-colors ml-0.5">
          ×
        </button>
      )}
    </span>
  );
}
