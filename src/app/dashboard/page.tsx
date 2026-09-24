import React from 'react';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { workspaceRepo, faqRepo, analyticsRepo } from '@/lib/db';
import { 
  Database, MessageSquare, Zap, CheckCircle, 
  ArrowRight, Plus, Upload, Palette, AlertCircle, Sparkles 
} from 'lucide-react';
import { ChatWindow } from '@/components/chatbot/ChatWindow';

export default async function DashboardOverviewPage() {
  const session = await getSession();
  const workspaces = session ? workspaceRepo.listForUser(session.userId) : [];
  const activeWorkspace = workspaces[0] || {
    id: 'ws_technova_demo',
    name: 'Sahayak AI',
  };

  const faqs = faqRepo.listByWorkspace(activeWorkspace.id);
  const metrics = analyticsRepo.getWorkspaceMetrics(activeWorkspace.id);

  const resolutionRate = metrics.totalQueries > 0 
    ? Math.round((metrics.answeredCount / metrics.totalQueries) * 100) 
    : 100;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-600/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold text-white">
            <Sparkles className="w-3.5 h-3.5" /> Workspace Operational
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">Welcome, {activeWorkspace.name}</h2>
          <p className="text-indigo-100 text-sm max-w-xl">
            Your Sahayak AI assistant is trained on {faqs.length} approved FAQs and ready to serve customer queries instantly.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard/faqs"
            className="px-4 py-2.5 bg-white text-indigo-700 hover:bg-indigo-50 font-semibold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add New FAQ
          </Link>
          <Link
            href="/dashboard/chatbot"
            className="px-4 py-2.5 bg-indigo-900/60 hover:bg-indigo-900/80 text-white font-semibold text-xs rounded-xl border border-white/20 transition flex items-center gap-1.5"
          >
            <Palette className="w-4 h-4" /> Customize Bot
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Approved FAQs</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-3">{faqs.length}</p>
          <p className="text-xs text-slate-500 mt-1">Knowledge base size</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Queries Processed</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-3">{metrics.totalQueries}</p>
          <p className="text-xs text-slate-500 mt-1">{metrics.totalConversations} total sessions</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Resolution Rate</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-600 mt-3">{resolutionRate}%</p>
          <p className="text-xs text-slate-500 mt-1">Confidence &gt;= threshold</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Average Latency</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-3">{metrics.avgLatency} ms</p>
          <p className="text-xs text-slate-500 mt-1">Local NLP computation</p>
        </div>
      </div>

      {/* Live Interactive Chatbot Assistant on User Dashboard */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                🤖 Live Assistant Playground
              </h3>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Directly Connected
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Ask questions to your Sahayak AI assistant in real-time. Verified against {faqs.length} approved FAQs in <strong>{activeWorkspace.name}</strong>.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/chatbot"
              className="text-xs font-semibold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition flex items-center gap-1.5"
            >
              <Palette className="w-3.5 h-3.5" /> Customize Assistant
            </Link>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            <ChatWindow
              workspaceId={activeWorkspace.id}
              botName="Sahayak AI"
              channel="DASHBOARD"
            />
          </div>
        </div>
      </div>

      {/* Grid: Popular FAQs & Unanswered Questions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Most Viewed FAQs */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-base text-slate-900">Most Frequently Asked FAQs</h3>
                <p className="text-xs text-slate-500">Highest viewed answers by visitors</p>
              </div>
              <Link href="/dashboard/faqs" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {metrics.topFaqs.length > 0 ? (
                metrics.topFaqs.map((faq, i) => (
                  <div key={faq.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden mr-2">
                      <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <p className="text-xs font-semibold text-slate-800 truncate">{faq.question}</p>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 px-2 py-0.5 rounded bg-white border border-slate-200 shrink-0">
                      {faq.viewCount} views
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-6 text-center">No questions recorded yet.</p>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <Link
              href="/dashboard/faqs"
              className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
            >
              <Upload className="w-4 h-4 text-slate-400" /> Need to import questions? Use CSV Bulk Uploader.
            </Link>
          </div>
        </div>

        {/* Unanswered Queries (Knowledge Gaps) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  Knowledge Gaps (Unanswered)
                  {metrics.unansweredCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                      {metrics.unansweredCount}
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500">Queries that triggered the safe fallback guardrail</p>
              </div>
              <Link href="/dashboard/analytics" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                Analytics <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {metrics.unansweredQuestions.length > 0 ? (
                metrics.unansweredQuestions.map(item => (
                  <div key={item.id} className="p-3.5 bg-rose-50/50 rounded-xl border border-rose-100 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      <p className="text-xs font-medium text-slate-800 truncate">{item.query}</p>
                    </div>
                    <Link
                      href="/dashboard/faqs"
                      className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 bg-white border border-indigo-200 px-2.5 py-1 rounded-lg shrink-0 transition"
                    >
                      + Add FAQ
                    </Link>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">
                  <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-60" />
                  <p className="font-medium text-slate-600">No unanswered questions detected!</p>
                  <p className="text-[11px] mt-0.5">Your knowledge base is answering current visitor queries effectively.</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <p className="text-[11px] text-slate-500">
              💡 <em>Adding answers for common fallback questions directly increases resolution rate.</em>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
