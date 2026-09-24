'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, Lock, Mail, Sparkles, AlertCircle, 
  Eye, EyeOff, ShieldCheck, KeyRound, CheckCircle2 
} from 'lucide-react';

type LoginTab = 'workspace' | 'admin';

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<LoginTab>('workspace');
  
  // Workspace form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Admin form state
  const [adminEmail, setAdminEmail] = useState('rupam@gmail.com');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Quick Demo Autofill Handlers
  const handleFillDemo = () => {
    setEmail('demo@sahayak.ai');
    setPassword('demo1234');
    setError(null);
  };

  const handleFillAdminDemo = () => {
    setAdminEmail('rupam@gmail.com');
    setAdminPassword('Admin@1234');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent, isAdmin: boolean) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const submitEmail = isAdmin ? adminEmail : email;
    const submitPassword = isAdmin ? adminPassword : password;

    if (!submitEmail.trim() || !submitPassword) {
      setError('Please provide both email and password.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: submitEmail.trim(), 
          password: submitPassword,
          isAdminLogin: isAdmin,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Authentication failed. Please verify your credentials.');
      } else {
        router.push('/dashboard');
      }
    } catch {
      setError('Network error connecting to authentication service.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-3 mb-4 group">
          <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white shadow-md shadow-indigo-600/15 border border-slate-200/80 flex items-center justify-center p-1 group-hover:scale-105 transition-transform shrink-0">
            <Image
              src="/sahayak-logo.png"
              alt="Sahayak AI Logo"
              width={48}
              height={48}
              className="w-full h-full object-contain rounded-xl"
              priority
            />
          </div>
          <span className="font-extrabold text-2xl text-slate-900 tracking-tight">
            Sahayak <span className="text-indigo-600">AI</span>
          </span>
        </Link>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          {activeTab === 'admin' ? 'System Administrator Portal' : 'Sign in to your workspace'}
        </h2>
        <p className="mt-1.5 text-sm text-slate-600">
          {activeTab === 'admin'
            ? 'Authorized administrative access for system configuration, knowledge base governance, and audit logs.'
            : 'Manage your knowledge base, customize your chatbot, and view analytics.'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-200 sm:px-10">
          
          {/* Tab Selector: Workspace Login vs Admin Portal */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl mb-6 border border-slate-200/80">
            <button
              type="button"
              onClick={() => {
                setActiveTab('workspace');
                setError(null);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'workspace'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Workspace Login
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('admin');
                setError(null);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin Portal
            </button>
          </div>

          {/* Error Message Display */}
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-center gap-2 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="text-xs font-medium leading-relaxed">{error}</span>
            </div>
          )}

          {/* TAB 1: WORKSPACE LOGIN */}
          {activeTab === 'workspace' && (
            <>
              {/* Quick Demo Credentials Banner */}
              <div className="mb-6 p-3.5 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-between">
                <div className="text-xs text-indigo-900">
                  <p className="font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> College / Evaluator Quick Login
                  </p>
                  <p className="text-indigo-700 mt-0.5">Use pre-seeded demo workspace</p>
                </div>
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
                >
                  Fill Demo
                </button>
              </div>

              <form onSubmit={e => handleSubmit(e, false)} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Work Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="alex@technova.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-600 rounded-xl text-sm outline-none transition text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-600 rounded-xl text-sm outline-none transition text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                >
                  {isLoading ? 'Signing In...' : 'Sign In to Dashboard'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="mt-6 text-center text-xs text-slate-500">
                Don&apos;t have an account yet?{' '}
                <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-800">
                  Create workspace
                </Link>
              </div>
            </>
          )}

          {/* TAB 2: ADMIN PORTAL LOGIN */}
          {activeTab === 'admin' && (
            <>
              {/* Admin Notice Banner */}
              <div className="mb-6 p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-amber-900">Designated Admin Account</p>
                      <p className="text-[11px] text-amber-700">Configured for <strong>rupam@gmail.com</strong></p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleFillAdminDemo}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-semibold rounded-lg shadow-sm transition"
                  >
                    Fill Admin
                  </button>
                </div>
              </div>

              <form onSubmit={e => handleSubmit(e, true)} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Admin Email Address
                    </label>
                    <span className="text-[10px] text-indigo-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> System Role: ADMIN
                    </span>
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={e => setAdminEmail(e.target.value)}
                      placeholder="rupam@gmail.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-600 rounded-xl text-sm outline-none transition text-slate-800 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Admin Password
                    </label>
                    <span className="text-[10px] text-slate-400">
                      From env <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600 font-mono">ADMIN_PASSWORD</code>
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type={showAdminPassword ? 'text' : 'password'}
                      required
                      value={adminPassword}
                      onChange={e => setAdminPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-600 rounded-xl text-sm outline-none transition text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition"
                      title={showAdminPassword ? 'Hide password' : 'Show password'}
                    >
                      {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                >
                  {isLoading ? 'Authenticating Admin...' : 'Sign In as System Admin'}
                  <ShieldCheck className="w-4 h-4" />
                </button>
              </form>

              <div className="mt-6 p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  🛡️ <strong>Security Notice</strong>: Admin credentials are protected with server-side bcrypt hashing and HMAC session signatures. Secrets are never exposed to browser client code.
                </p>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
