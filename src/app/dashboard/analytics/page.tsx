import React from 'react';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { workspaceRepo, analyticsRepo } from '@/lib/db';
import { 
  ThumbsUp, MessageSquare, Zap, 
  AlertCircle, CheckCircle2, Plus 
} from 'lucide-react';

export default async function AnalyticsPage() {
  const session = await getSession();
  const workspaces = session ? workspaceRepo.listForUser(session.userId) : [];
  const activeWorkspace = workspaces[0] || {
    id: 'ws_technova_demo',
    name: 'Sahayak AI',
  };

  const metrics = analyticsRepo.getWorkspaceMetrics(activeWorkspace.id);
  const resolutionRate = metrics.totalQueries > 0 
    ? Math.round((metrics.answeredCount / metrics.totalQueries) * 100) 
    : 100;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Usage & Performance Analytics</h2>
        <p className="text-xs text-slate-500 mt-1">
          Real-time metrics calculated from actual customer interactions and NLP retrieval events.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Inquiries</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-3">{metrics.totalQueries}</p>
          <p className="text-xs text-slate-500 mt-1">{metrics.totalConversations} unique sessions</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Auto-Resolution</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-600 mt-3">{resolutionRate}%</p>
          <p className="text-xs text-slate-500 mt-1">{metrics.answeredCount} matched queries</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Customer Satisfaction</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ThumbsUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-3">{metrics.helpfulRatio}%</p>
          <p className="text-xs text-slate-500 mt-1">Helpful rating feedback</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Average Latency</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-3">{metrics.avgLatency} ms</p>
          <p className="text-xs text-slate-500 mt-1">Sub-second vector lookup</p>
        </div>
      </div>

      {/* Unanswered Queries / Knowledge Gaps */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500" />
              Unanswered Questions (Knowledge Gaps)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              These user queries did not meet the confidence threshold and triggered safe fallback.
            </p>
          </div>
          <Link
            href="/dashboard/faqs"
            className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl border border-indigo-200 transition flex items-center gap-1 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" /> Add to Knowledge Base
          </Link>
        </div>

        {metrics.unansweredQuestions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Visitor Query</th>
                  <th className="py-3 px-4">Best Similarity Score</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {metrics.unansweredQuestions.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-medium text-slate-900 max-w-md truncate">
                      {item.query}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold text-[11px]">
                        {Math.round(item.score * 100)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(item.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/dashboard/faqs`}
                        className="text-indigo-600 hover:text-indigo-900 font-semibold text-xs transition"
                      >
                        + Create Answer
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-70" />
            <p className="font-semibold text-slate-700">No Knowledge Gaps Detected</p>
            <p className="text-[11px] text-slate-500 mt-1">
              All queries have either matched approved FAQs or no traffic has triggered fallback yet.
            </p>
          </div>
        )}
      </div>

      {/* Top 5 Answered FAQs */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="font-bold text-base text-slate-900">Highest Engagement FAQs</h3>
        <p className="text-xs text-slate-500">The most requested questions answered by the system.</p>

        <div className="divide-y divide-slate-100">
          {metrics.topFaqs.map((faq, i) => (
            <div key={faq.id} className="py-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 overflow-hidden">
                <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <p className="text-xs font-semibold text-slate-800 truncate">{faq.question}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-indigo-600 px-2.5 py-1 bg-indigo-50 rounded-lg border border-indigo-100">
                  {faq.viewCount} queries answered
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
