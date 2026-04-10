// src/pages/SettingsPage.tsx
import { useState, FormEvent } from 'react';
import { Settings, User, Save } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../services/api';
import Avatar from '../components/ui/Avatar';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      const res = await authApi.updateProfile({ name: name.trim() });
      updateUser(res.data.user);
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-gray-500/15 border border-gray-500/25 rounded-lg flex items-center justify-center">
          <Settings size={16} className="text-gray-400" />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold text-white">Settings</h1>
          <p className="text-xs text-gray-500">Manage your account preferences</p>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-display font-semibold text-white mb-5 flex items-center gap-2">
          <User size={16} className="text-indigo-400" /> Profile
        </h2>

        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-navy-700">
          <Avatar name={user?.name || ''} avatar={user?.avatar} size="lg" />
          <div>
            <p className="font-medium text-white">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <span className={`text-xs mt-1 inline-block px-2 py-0.5 rounded-full capitalize font-medium ${
              user?.role === 'admin'
                ? 'bg-amber-500/10 text-amber-400'
                : 'bg-navy-700 text-gray-400'
            }`}>
              {user?.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Display Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input text-sm"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Email</label>
            <input value={user?.email || ''} disabled className="input text-sm opacity-50 cursor-not-allowed" />
            <p className="text-[10px] text-gray-600 mt-1">Email cannot be changed</p>
          </div>

          <button type="submit" disabled={isSaving} className="btn-primary text-sm flex items-center gap-2">
            <Save size={14} />
            {isSaving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* App info */}
      <div className="card p-6 mt-4">
        <h2 className="font-display font-semibold text-white mb-4">About TaskFlow</h2>
        <div className="space-y-2 text-sm text-gray-500">
          <div className="flex justify-between"><span>Version</span><span className="text-gray-400">1.0.0</span></div>
          <div className="flex justify-between"><span>Workflow Stages</span><span className="text-gray-400">16</span></div>
          <div className="flex justify-between"><span>Stack</span><span className="text-gray-400">React + Node + MongoDB</span></div>
        </div>
      </div>
    </div>
  );
}
