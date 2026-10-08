import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Input, Select } from '@/components/UI';
import { showToast } from '@/components/Toast';
import type { UserRole } from '@/types';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

export function Login() {
  const { signIn, session, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('manager');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && session && profile) {
      if (profile.role === 'admin') navigate('/admin');
      else if (profile.role === 'manager') navigate('/manager');
      else if (profile.role === 'vendor') navigate('/vendor');
    }
  }, [session, profile, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('error', 'Please fill in all fields');
      return;
    }
    setSubmitting(true);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) {
      showToast('error', error);
    } else {
      showToast('success', 'Login successful');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">AI</div>
          <span className="text-xl font-bold text-gray-900">VendorAI</span>
        </Link>
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-xl shadow-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="mt-1 text-sm text-gray-500">Sign in to your account to continue</p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Email / Username</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-10 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Select
              label="Select Role"
              value={role}
              onChange={(v) => setRole(v as UserRole)}
              options={[
                { value: 'admin', label: 'Admin' },
                { value: 'manager', label: 'Procurement Manager' },
                { value: 'vendor', label: 'Vendor' },
              ]}
            />
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-600">
                <input type="checkbox" className="rounded border-gray-300" /> Remember me
              </label>
              <button type="button" onClick={() => showToast('info', 'Password reset is not available in this demo')} className="text-blue-600 hover:underline">
                Forgot Password?
              </button>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-60"
            >
              {submitting ? 'Signing in...' : <>Login <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-blue-600 hover:underline">Register</Link>
          </p>
        </div>
        <p className="mt-4 text-center text-xs text-gray-400">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}

export function Register() {
  const { signUp, session, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('manager');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && session && profile) {
      if (profile.role === 'admin') navigate('/admin');
      else if (profile.role === 'manager') navigate('/manager');
      else if (profile.role === 'vendor') navigate('/vendor');
    }
  }, [session, profile, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      showToast('error', 'Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      showToast('error', 'Passwords do not match');
      return;
    }
    if (password.length < 6) {
      showToast('error', 'Password must be at least 6 characters');
      return;
    }
    setSubmitting(true);
    const { error } = await signUp(email, password, name, role);
    setSubmitting(false);
    if (error) {
      showToast('error', error);
    } else {
      showToast('success', 'Account created successfully');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 px-4 py-8">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">AI</div>
          <span className="text-xl font-bold text-gray-900">VendorAI</span>
        </Link>
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-xl shadow-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="mt-1 text-sm text-gray-500">Join VendorAI to get started</p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input label="Full Name" value={name} onChange={setName} required placeholder="John Doe" />
            <Input label="Email" value={email} onChange={setEmail} type="email" required placeholder="you@example.com" />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-10 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Input label="Confirm Password" value={confirmPassword} onChange={setConfirmPassword} type="password" required placeholder="Re-enter password" />
            <Select
              label="Select Role"
              value={role}
              onChange={(v) => setRole(v as UserRole)}
              options={[
                { value: 'admin', label: 'Admin' },
                { value: 'manager', label: 'Procurement Manager' },
                { value: 'vendor', label: 'Vendor' },
              ]}
            />
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-60"
            >
              {submitting ? 'Creating account...' : <>Create Account <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-blue-600 hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
