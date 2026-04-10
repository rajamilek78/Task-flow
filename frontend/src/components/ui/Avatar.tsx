// src/components/ui/Avatar.tsx
import { getInitials, getAvatarColor } from '../../utils/helpers';

interface AvatarProps {
  name: string;
  avatar?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  xs: 'w-5 h-5 text-[9px]',
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-12 h-12 text-base',
};

export default function Avatar({ name, avatar, size = 'sm', className = '' }: AvatarProps) {
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        className={`${sizes[size]} rounded-full object-cover ring-2 ring-navy-800 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} ${getAvatarColor(name)} rounded-full flex items-center justify-center font-semibold text-white ring-2 ring-navy-800 flex-shrink-0 ${className}`}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
}

// Stack of overlapping avatars
export function AvatarGroup({ users, max = 3 }: { users: Array<{ name: string; avatar?: string }>; max?: number }) {
  const visible = users.slice(0, max);
  const extra = users.length - max;

  return (
    <div className="flex -space-x-2">
      {visible.map((user, i) => (
        <Avatar key={i} name={user.name} avatar={user.avatar} size="xs" />
      ))}
      {extra > 0 && (
        <div className="w-5 h-5 rounded-full bg-navy-600 border-2 border-navy-800 flex items-center justify-center text-[9px] text-gray-400 font-medium">
          +{extra}
        </div>
      )}
    </div>
  );
}
