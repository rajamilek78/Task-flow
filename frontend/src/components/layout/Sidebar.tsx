// src/components/layout/Sidebar.tsx
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Layers, LayoutDashboard, Bell, Users, LogOut, Settings, ChevronRight,
  FolderOpen, ChevronDown, X,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useProjectStore } from '../../store/projectStore';
import Avatar from '../ui/Avatar';
import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';

const navItems = [
  { to: '/projects',      icon: FolderOpen,      label: 'Projects'      },
  { to: '/board',         icon: Layers,          label: 'Board'         },
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard'     },
  { to: '/notifications', icon: Bell,            label: 'Notifications' },
  { to: '/team',          icon: Users,           label: 'Team'          },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const { projects, activeProjectId, setActiveProject, fetchProjects } = useProjectStore();
  const navigate = useNavigate();
  const [projectsOpen, setProjectsOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Signed out');
    navigate('/login');
  };

  const activeProject = projects.find((p) => p._id === activeProjectId);

  return (
    <aside className="w-60 bg-navy-900 border-r border-navy-700/60 flex flex-col h-screen sticky top-0 flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-navy-700/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shadow shadow-indigo-500/30">
            <Layers size={16} className="text-white" />
          </div>
          <span className="font-display text-lg font-bold text-white">TaskFlow</span>
        </div>
      </div>

      {/* Active project pill */}
      {activeProject && (
        <div className="px-3 pt-3">
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg border"
            style={{
              backgroundColor: `${activeProject.color}12`,
              borderColor: `${activeProject.color}30`,
            }}
          >
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: activeProject.color }}
            />
            <span className="text-xs font-medium text-white truncate flex-1">{activeProject.name}</span>
            <button
              onClick={() => setActiveProject(null)}
              className="text-gray-500 hover:text-white transition-colors flex-shrink-0"
              title="Clear project filter"
            >
              <X size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest px-3 mb-3">
          Workspace
        </p>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-navy-700'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={16} className={isActive ? 'text-indigo-400' : 'text-gray-500 group-hover:text-gray-300'} />
                {label}
                {isActive && <ChevronRight size={14} className="ml-auto text-indigo-400/60" />}
              </>
            )}
          </NavLink>
        ))}

        {/* Quick project switcher */}
        {projects.length > 0 && (
          <div className="pt-3">
            <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest px-3 mb-2">
              Quick Switch
            </p>
            <button
              onClick={() => setProjectsOpen((o) => !o)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-500 hover:text-gray-300 hover:bg-navy-700 transition-all"
            >
              <FolderOpen size={13} />
              <span className="flex-1 text-left truncate">
                {activeProject ? activeProject.name : 'All Projects'}
              </span>
              <ChevronDown
                size={12}
                className={`transition-transform ${projectsOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {projectsOpen && (
              <div className="mt-1 space-y-0.5 pl-2">
                <button
                  onClick={() => { setActiveProject(null); setProjectsOpen(false); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all ${
                    !activeProjectId
                      ? 'bg-navy-700 text-white'
                      : 'text-gray-500 hover:text-gray-300 hover:bg-navy-700'
                  }`}
                >
                  <div className="w-2 h-2 rounded-full bg-gray-600" />
                  All Projects
                </button>
                {projects.map((p) => (
                  <button
                    key={p._id}
                    onClick={() => { setActiveProject(p._id); setProjectsOpen(false); navigate('/board'); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all ${
                      activeProjectId === p._id
                        ? 'bg-navy-700 text-white'
                        : 'text-gray-500 hover:text-gray-300 hover:bg-navy-700'
                    }`}
                  >
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                    <span className="truncate">{p.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-navy-700/60 space-y-1">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isActive ? 'bg-indigo-500/15 text-indigo-400' : 'text-gray-400 hover:text-white hover:bg-navy-700'
            }`
          }
        >
          <Settings size={16} />
          Settings
        </NavLink>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={16} />
          Sign out
        </button>

        {/* User info */}
        <div className="flex items-center gap-3 px-3 py-3 mt-2 rounded-xl bg-navy-800 border border-navy-700">
          <Avatar name={user?.name || ''} avatar={user?.avatar} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
