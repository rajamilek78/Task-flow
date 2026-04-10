// src/pages/LoginPage.tsx
import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layers, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/board');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 relative overflow-hidden flex-col items-center justify-center p-12">
        {/* Decorative grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-sm text-center">
          <div className="w-16 h-16 bg-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-indigo-500/30">
            <Layers size={32} className="text-white" />
          </div>
          <h1 className="font-display text-4xl font-bold text-white mb-4">TaskFlow</h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Your team's complete workflow — from design to deployment, all in one board.
          </p>

          <div className="mt-12 grid grid-cols-2 gap-4 text-left">
            {[
              { n: '16', label: 'Workflow Stages' },
              { n: '∞', label: 'Tasks' },
              { n: '100%', label: 'Traceable' },
              { n: '⚡', label: 'Real-time' },
            ].map(({ n, label }) => (
              <div key={label} className="bg-navy-700/50 rounded-xl p-4 border border-navy-600/50">
                <div className="font-display text-2xl font-bold text-indigo-400">{n}</div>
                <div className="text-gray-400 text-sm mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
              <Layers size={20} className="text-white" />
            </div>
            <span className="font-display text-xl font-bold">TaskFlow</span>
          </div>

          <h2 className="font-display text-3xl font-bold text-white mb-2">Sign in</h2>
          <p className="text-gray-400 mb-8">Welcome back — pick up where you left off.</p>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-4 py-3 mb-6 text-sm animate-slide-in">
              <AlertCircle size={16} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="input pl-9"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input pl-9 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3 mt-2 text-sm font-semibold"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className="mt-6 p-4 bg-navy-800 rounded-xl border border-navy-700">
            <p className="text-xs text-gray-500 mb-2 font-medium">Demo credentials:</p>
            <div className="space-y-1 text-xs text-gray-400">
              <div>Admin: <span className="text-gray-300">admin@taskflow.com / password123</span></div>
              <div>Member: <span className="text-gray-300">krish@taskflow.com / password123</span></div>
            </div>
          </div>

          <p className="text-center text-gray-500 text-sm mt-6">
            No account?{' '}
            <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
