import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { userRepo, workspaceRepo, quotaRepo } from '@/lib/db';
import { 
  LayoutDashboard, Database, MessageSquareCode, 
  BarChart3, Settings, ExternalLink, LogOut, ShieldCheck, Headphones, History 
} from 'lucide-react';
import { DashboardAssistantDrawer } from '@/components/dashboard/DashboardAssistantDrawer';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const user = userRepo.findById(session.userId);
  if (!user) {
    redirect('/login');
  }

  const workspaces = workspaceRepo.listForUser(user.id);
  const activeWorkspace = workspaces[0] || {
    id: 'ws_technova_demo',
    name: 'Sahayak AI',
  };

  const quota = quotaRepo.getQuota(activeWorkspace.id);
  const quotaPercent = Math.min(100, Math.round((quota.currentUsage / quota.monthlyLimit) * 100));

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans text-slate-800">
      {/* Left Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800">
        {/* Brand / Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
          <div className="w-9 h-9 rounded-xl overflow-hidden bg-white shadow-md flex items-center justify-center p-0.5 shrink-0">
            <Image
              src="/sahayak-logo.png"
              alt="Sahayak AI Logo"
              width={36}
              height={36}
              className="w-full h-full object-contain rounded-lg"
              priority
            />
          </div>
          <div>
            <h1 className="font-bold text-white text-base leading-tight">Sahayak <span className="text-indigo-400">AI</span></h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Support SaaS</p>
          </div>
        </div>

        {/* Active Workspace Selector */}
        <div className="p-4 border-b border-slate-800/80">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Active Workspace
          </label>
          <div className="px-3 py-2 bg-slate-800/90 rounded-xl text-xs font-semibold text-white flex items-center justify-between border border-slate-700/60">
            <span className="truncate">{activeWorkspace.name}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Active" />
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 text-sm font-medium">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition"
          >
            <LayoutDashboard className="w-4 h-4 text-indigo-400" />
            Overview
          </Link>

          <Link
            href="/dashboard/faqs"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition"
          >
            <Database className="w-4 h-4 text-emerald-400" />
            Knowledge Base (FAQs)
          </Link>

          <Link
            href="/dashboard/chatbot"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition"
          >
            <MessageSquareCode className="w-4 h-4 text-blue-400" />
            Chatbot Customizer
          </Link>

          <Link
            href="/dashboard/analytics"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition"
          >
            <BarChart3 className="w-4 h-4 text-amber-400" />
            Usage Analytics
          </Link>

          <Link
            href="/dashboard/conversations"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition"
          >
            <History className="w-4 h-4 text-cyan-400" />
            Chat History
          </Link>

          <Link
            href="/dashboard/support"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition"
          >
            <Headphones className="w-4 h-4 text-rose-400" />
            Support Inbox
          </Link>

          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition"
          >
            <Settings className="w-4 h-4 text-purple-400" />
            Settings & Billing
          </Link>
        </nav>

        {/* Quota Progress Banner */}
        <div className="p-4 mx-3 mb-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 text-xs">
          <div className="flex justify-between items-center mb-1.5 font-semibold text-slate-300">
            <span>Monthly Quota</span>
            <span className="text-indigo-400">{quota.currentUsage} / {quota.monthlyLimit}</span>
          </div>
          <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${quotaPercent > 85 ? 'bg-amber-400' : 'bg-indigo-500'}`}
              style={{ width: `${quotaPercent}%` }}
            />
          </div>
          <p className="mt-2 text-[10px] text-slate-400">Plan: <strong className="text-white uppercase">{quota.planTier}</strong></p>
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className={`w-8 h-8 rounded-full ${user.role === 'ADMIN' ? 'bg-gradient-to-tr from-amber-500 to-rose-500' : 'bg-indigo-600'} text-white font-bold text-xs flex items-center justify-center shrink-0`}>
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                {user.role === 'ADMIN' && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded tracking-wider">
                    ADMIN
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              title="Sign out"
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Tenant Data Isolated: <strong>{activeWorkspace.id}</strong></span>
            {user.role === 'ADMIN' && (
              <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                System Admin Mode
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="text-xs font-semibold text-slate-600 hover:text-indigo-600 flex items-center gap-1 transition"
            >
              Landing Page <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Deterministic NLP Active
            </span>
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>

      {/* Persistent Floating Sahayak AI Assistant Drawer for all dashboard views */}
      <DashboardAssistantDrawer
        workspaceId={activeWorkspace.id}
        workspaceName={activeWorkspace.name}
      />
    </div>
  );
}
