// src/pages/TeamPage.tsx
import { useEffect, useState, FormEvent } from 'react';
import { Users, UserPlus, Shield, User, AlertCircle, X } from 'lucide-react';
import { authApi } from '../services/api';
import { User as UserType } from '../types';
import { useAuthStore } from '../store/authStore';
import Avatar from '../components/ui/Avatar';
import Modal from '../components/ui/Modal';
import { timeAgo } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePassword, setInvitePassword] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const { user } = useAuthStore();

  const loadTeam = async () => {
    try {
      const res = await authApi.getTeam();
      setTeamMembers(res.data.users);
    } catch { /* silent */ }
    finally { setIsLoading(false); }
  };

  useEffect(() => { loadTeam(); }, []);

  const handleInvite = async (e: FormEvent) => {
    e.preventDefault();
    setInviteError('');
    if (invitePassword.length < 6) {
      setInviteError('Password must be at least 6 characters');
      return;
    }
    setIsInviting(true);
    try {
      await authApi.inviteUser({ name: inviteName, email: inviteEmail, password: invitePassword });
      toast.success(`${inviteName} added to the team!`);
      setIsInviteOpen(false);
      setInviteName(''); setInviteEmail(''); setInvitePassword('');
      loadTeam();
    } catch (err: any) {
      setInviteError(err.response?.data?.message || 'Failed to invite member');
    } finally {
      setIsInviting(false);
    }
  };

  const admins = teamMembers.filter((m) => m.role === 'admin');
  const members = teamMembers.filter((m) => m.role === 'member');

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500/15 border border-emerald-500/25 rounded-lg flex items-center justify-center">
            <Users size={16} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-white">Team</h1>
            <p className="text-xs text-gray-500">{teamMembers.length} members</p>
          </div>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => setIsInviteOpen(true)}
            className="btn-primary flex items-center gap-1.5 text-sm"
          >
            <UserPlus size={15} /> Add Member
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-4 flex items-center gap-4">
              <div className="w-10 h-10 skeleton rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 skeleton rounded w-32" />
                <div className="h-3 skeleton rounded w-48" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Admins */}
          {admins.length > 0 && (
            <div>
              <h2 className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3 flex items-center gap-1.5">
                <Shield size={11} /> Admins
              </h2>
              <div className="space-y-2">
                {admins.map((member) => (
                  <MemberCard key={(member as any)._id} member={member} currentUser={user} />
                ))}
              </div>
            </div>
          )}

          {/* Members */}
          {members.length > 0 && (
            <div>
              <h2 className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3 flex items-center gap-1.5">
                <User size={11} /> Members
              </h2>
              <div className="space-y-2">
                {members.map((member) => (
                  <MemberCard key={(member as any)._id} member={member} currentUser={user} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Invite Modal */}
      <Modal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} title="Add Team Member" size="sm">
        <form onSubmit={handleInvite}>
          <div className="p-6 space-y-4">
            {inviteError && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-3 py-2.5 text-sm">
                <AlertCircle size={14} />
                {inviteError}
              </div>
            )}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Full Name</label>
              <input value={inviteName} onChange={(e) => setInviteName(e.target.value)} placeholder="Jane Smith" required className="input text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Email</label>
              <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="jane@company.com" required className="input text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Temporary Password</label>
              <input type="password" value={invitePassword} onChange={(e) => setInvitePassword(e.target.value)} placeholder="Min. 6 characters" required className="input text-sm" />
            </div>
          </div>
          <div className="flex gap-3 px-6 py-4 border-t border-navy-700">
            <button type="button" onClick={() => setIsInviteOpen(false)} className="btn-ghost text-sm flex-1">Cancel</button>
            <button type="submit" disabled={isInviting} className="btn-primary text-sm flex-1">
              {isInviting ? 'Adding…' : 'Add Member'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function MemberCard({ member, currentUser }: { member: UserType; currentUser: UserType | null }) {
  const isMe = (member as any)._id === currentUser?.id || member.id === currentUser?.id;
  return (
    <div className="card p-4 flex items-center gap-4">
      <Avatar name={member.name} avatar={member.avatar} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-white">{member.name}</p>
          {isMe && <span className="text-[10px] bg-indigo-500/15 text-indigo-400 px-1.5 py-0.5 rounded-full">You</span>}
        </div>
        <p className="text-xs text-gray-500">{member.email}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${
          member.role === 'admin'
            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            : 'bg-navy-700 text-gray-400'
        }`}>
          {member.role}
        </span>
        <span className="text-[10px] text-gray-600">{timeAgo(member.createdAt)}</span>
      </div>
    </div>
  );
}
