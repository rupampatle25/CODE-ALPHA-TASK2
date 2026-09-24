'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { 
  MessageSquare, Search, Filter, Trash2, ShieldCheck, 
  User, AlertTriangle, Clock, RefreshCw, 
  ChevronLeft, ChevronRight, CheckCircle2, Globe, Laptop, HelpCircle
} from 'lucide-react';
import { ChatSession, ChatMessage, SessionType, SessionStatus } from '@/lib/db/types';

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface StatsInfo {
  total: number;
  visitorCount: number;
  adminCount: number;
  fallbackCount: number;
  resolvedCount: number;
}

export default function ConversationsHistoryPage() {
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Filters & Pagination
  const [activeTypeTab, setActiveTypeTab] = useState<'ALL' | SessionType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | SessionStatus>('ALL');
  const [dateRange, setDateRange] = useState<'ALL' | 'TODAY' | '7_DAYS' | '30_DAYS'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [stats, setStats] = useState<StatsInfo>({ total: 0, visitorCount: 0, adminCount: 0, fallbackCount: 0, resolvedCount: 0 });

  // Retention info
  const [retentionDays, setRetentionDays] = useState<number>(90);
  const [purgeableCount, setPurgeableCount] = useState<number>(0);
  const [isPurging, setIsPurging] = useState(false);

  // Deletion modal
  const [sessionToDelete, setSessionToDelete] = useState<ChatSession | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchRetentionInfo = async (wsId: string) => {
    try {
      const res = await fetch(`/api/workspaces/${wsId}/retention`);
      const data = await res.json();
      if (data.success) {
        setRetentionDays(data.retentionDays);
        setPurgeableCount(data.purgeableCount);
      }
    } catch (err) {
      console.error('Failed to fetch retention info:', err);
    }
  };

  // 1. Initial Workspace Fetch
  useEffect(() => {
    async function init() {
      try {
        const meRes = await fetch('/api/auth/me');
        const meData = await meRes.json();
        const ws = meData.workspaces?.[0];
        if (ws) {
          setWorkspaceId(ws.id);
          fetchRetentionInfo(ws.id);
        }
      } catch (err) {
        console.error('Failed to initialize workspace:', err);
      }
    }
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Fetch Sessions List
  const fetchSessions = useCallback(async (page = 1) => {
    if (!workspaceId) return;
    setIsLoadingList(true);
    try {
      const params = new URLSearchParams();
      if (activeTypeTab !== 'ALL') params.set('sessionType', activeTypeTab);
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      params.set('page', page.toString());
      params.set('limit', '10');

      // Date range calculation
      if (dateRange === 'TODAY') {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        params.set('startDate', start.toISOString());
      } else if (dateRange === '7_DAYS') {
        const start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        params.set('startDate', start.toISOString());
      } else if (dateRange === '30_DAYS') {
        const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        params.set('startDate', start.toISOString());
      }

      const res = await fetch(`/api/workspaces/${workspaceId}/conversations?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setSessions(data.sessions);
        setPagination(data.pagination);
        setStats(data.stats);
        setCurrentPage(page);

        // Auto-select first session if none selected or if previously selected is gone
        if (data.sessions.length > 0) {
          if (!selectedSessionId || !data.sessions.some((s: ChatSession) => s.id === selectedSessionId)) {
            setSelectedSessionId(data.sessions[0].id);
          }
        } else {
          setSelectedSessionId(null);
          setSelectedSession(null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setIsLoadingList(false);
    }
  }, [workspaceId, activeTypeTab, statusFilter, searchQuery, dateRange, selectedSessionId]);

  useEffect(() => {
    if (workspaceId) {
      void fetchSessions(1);
    }
  }, [workspaceId, activeTypeTab, statusFilter, dateRange, fetchSessions]);

  // Handle Search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSessions(1);
  };

  // 3. Fetch Single Conversation Messages
  useEffect(() => {
    if (!workspaceId || !selectedSessionId) return;
    async function loadTranscript() {
      setIsLoadingMessages(true);
      try {
        const res = await fetch(`/api/workspaces/${workspaceId}/conversations/${selectedSessionId}`);
        const data = await res.json();
        if (data.success) {
          setSelectedSession(data.session);
          setMessages(data.messages);
        }
      } catch (err) {
        console.error('Failed to load messages:', err);
      } finally {
        setIsLoadingMessages(false);
      }
    }
    loadTranscript();
  }, [workspaceId, selectedSessionId]);

  // 4. Delete Single Conversation
  const handleDeleteConversation = async () => {
    if (!workspaceId || !sessionToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/conversations/${sessionToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccess('Conversation deleted successfully.');
        setSessionToDelete(null);
        setTimeout(() => setActionSuccess(null), 3000);
        fetchSessions(currentPage);
      } else {
        alert(data.error || 'Failed to delete conversation');
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // 5. Purge Expired Sessions
  const handlePurgeExpired = async () => {
    if (!workspaceId) return;
    if (!window.confirm(`Are you sure you want to permanently delete all conversations older than ${retentionDays} days? This action cannot be undone.`)) {
      return;
    }
    setIsPurging(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/retention`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ triggerPurge: true }),
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccess(data.message || 'Expired conversations successfully purged.');
        fetchRetentionInfo(workspaceId);
        fetchSessions(1);
        setTimeout(() => setActionSuccess(null), 4000);
      }
    } catch (err) {
      console.error('Failed to purge expired records:', err);
    } finally {
      setIsPurging(false);
    }
  };

  const formatTimestamp = (iso: string) => {
    if (!iso) return '';
    const date = new Date(iso);
    const now = new Date();
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffHours < 1) {
      const diffMins = Math.max(1, Math.round(diffHours * 60));
      return `${diffMins}m ago`;
    }
    if (diffHours < 24) {
      return `${Math.round(diffHours)}h ago`;
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const fallbackPercent = stats.total > 0 ? Math.round((stats.fallbackCount / stats.total) * 100) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Title & Retention Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-indigo-600" />
            Secure Chat History
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Audit authorized visitor and admin conversations with automated PII masking and configurable data retention.
          </p>
        </div>

        {/* Retention Info & Action */}
        <div className="flex items-center gap-2 text-xs bg-white px-3.5 py-2 rounded-2xl border border-slate-200 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold text-slate-700">PII Masking Active</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-600">
            Retention: <strong className="text-slate-900">{retentionDays === 0 ? 'Indefinite' : `${retentionDays} Days`}</strong>
          </span>
          {purgeableCount > 0 && (
            <button
              onClick={handlePurgeExpired}
              disabled={isPurging}
              className="ml-2 text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded-lg border border-rose-200 transition"
              title="Purge conversations older than retention threshold"
            >
              {isPurging ? 'Purging...' : `Purge Expired (${purgeableCount})`}
            </button>
          )}
        </div>
      </div>

      {/* Success Alert Banner */}
      {actionSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-2xl flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-1">Total Conversations</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{stats.total}</span>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">All Sessions</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-1">Visitor Sessions</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-blue-600">{stats.visitorCount}</span>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Globe className="w-3 h-3" /> Website Widget
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-1">Admin Preview Tests</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-purple-600">{stats.adminCount}</span>
            <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Laptop className="w-3 h-3" /> Staff Playground
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-1">Fallback Escalation Rate</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-600">{fallbackPercent}%</span>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              {stats.fallbackCount} Fallbacks
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        {/* Top Row: Type Tabs & Search */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Segmented Type Switcher */}
          <div className="inline-flex bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600">
            <button
              onClick={() => setActiveTypeTab('ALL')}
              className={`px-3 py-1.5 rounded-xl transition ${activeTypeTab === 'ALL' ? 'bg-white text-indigo-600 shadow-sm' : 'hover:text-slate-900'}`}
            >
              All Conversations ({stats.total})
            </button>
            <button
              onClick={() => setActiveTypeTab('VISITOR')}
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${activeTypeTab === 'VISITOR' ? 'bg-white text-blue-600 shadow-sm' : 'hover:text-slate-900'}`}
            >
              <Globe className="w-3.5 h-3.5" />
              Visitor Sessions ({stats.visitorCount})
            </button>
            <button
              onClick={() => setActiveTypeTab('ADMIN')}
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${activeTypeTab === 'ADMIN' ? 'bg-white text-purple-600 shadow-sm' : 'hover:text-slate-900'}`}
            >
              <Laptop className="w-3.5 h-3.5" />
              Admin Testing ({stats.adminCount})
            </button>
          </div>

          {/* Keyword Search */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative">
            <input
              type="text"
              placeholder="Search conversations, visitor IDs, or messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-20 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[11px] px-2.5 py-1 rounded-lg transition"
            >
              Search
            </button>
          </form>
        </div>

        {/* Bottom Row: Status & Date Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Status Select */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'ALL' | SessionStatus)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="ALL">All Statuses</option>
            <option value="RESOLVED">Resolved (Grounded Answer)</option>
            <option value="FALLBACK">Fallback (Escalation Triggered)</option>
            <option value="ACTIVE">Active</option>
          </select>

          {/* Date Range Select */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as 'ALL' | 'TODAY' | '7_DAYS' | '30_DAYS')}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="ALL">All Time</option>
            <option value="TODAY">Today Only</option>
            <option value="7_DAYS">Last 7 Days</option>
            <option value="30_DAYS">Last 30 Days</option>
          </select>

          {(searchQuery || statusFilter !== 'ALL' || dateRange !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
                setDateRange('ALL');
              }}
              className="text-[11px] font-bold text-slate-500 hover:text-slate-800 underline ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Two-Column Master/Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[580px]">
        {/* Left Column: Conversation List (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <span className="font-bold text-xs text-slate-700 uppercase tracking-wider">
              Conversations ({pagination.total})
            </span>
            <button
              onClick={() => fetchSessions(currentPage)}
              className="text-slate-400 hover:text-indigo-600 transition"
              title="Refresh list"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingList ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Sessions Scrollable List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[520px]">
            {isLoadingList ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading conversation history...</div>
            ) : sessions.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <HelpCircle className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-700">No conversations match your criteria</p>
                <p className="text-[11px] text-slate-400">Try adjusting your search terms or filters.</p>
              </div>
            ) : (
              sessions.map((sess) => {
                const isSelected = sess.id === selectedSessionId;
                const isVisitor = sess.sessionType === 'VISITOR';

                return (
                  <button
                    key={sess.id}
                    onClick={() => setSelectedSessionId(sess.id)}
                    className={`w-full text-left p-4 transition flex flex-col gap-1.5 ${
                      isSelected 
                        ? 'bg-indigo-50/70 border-l-4 border-indigo-600' 
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      {/* Origin Badge */}
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        isVisitor 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {isVisitor ? <Globe className="w-2.5 h-2.5" /> : <Laptop className="w-2.5 h-2.5" />}
                        {isVisitor ? 'Visitor' : 'Admin Test'}
                      </span>

                      {/* Timestamp */}
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3" />
                        {formatTimestamp(sess.updatedAt || sess.createdAt)}
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className="font-bold text-xs text-slate-900 line-clamp-1">
                      {sess.title || 'Conversation Inquiry'}
                    </h4>

                    {/* Message Snippet */}
                    {sess.lastMessageSnippet && (
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {sess.lastMessageSnippet}
                      </p>
                    )}

                    {/* Bottom Metadata */}
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span>{sess.messageCount || 2} messages</span>
                      <span className={`font-semibold px-1.5 py-0.5 rounded ${
                        sess.status === 'RESOLVED' 
                          ? 'text-emerald-700 bg-emerald-50' 
                          : sess.status === 'FALLBACK' 
                          ? 'text-amber-700 bg-amber-50'
                          : 'text-slate-600 bg-slate-100'
                      }`}>
                        {sess.status === 'RESOLVED' ? 'Resolved' : sess.status === 'FALLBACK' ? 'Fallback' : 'Active'}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50/50">
              <span className="text-slate-500 text-[11px]">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => fetchSessions(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none text-slate-700"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => fetchSessions(currentPage + 1)}
                  disabled={currentPage >= pagination.totalPages}
                  className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none text-slate-700"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Transcript Detail Viewer (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          {selectedSession ? (
            <>
              {/* Transcript Header */}
              <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      selectedSession.sessionType === 'VISITOR' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                    }`}>
                      {selectedSession.sessionType === 'VISITOR' ? 'Website Visitor' : 'Admin Test Preview'}
                    </span>
                    <span className="text-xs text-slate-400">
                      ID: <code className="text-slate-600 font-mono">{selectedSession.id}</code>
                    </span>
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    {selectedSession.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Started on {new Date(selectedSession.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSessionToDelete(selectedSession)}
                    className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl border border-rose-200 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Session
                  </button>
                </div>
              </div>

              {/* PII Notification Strip */}
              <div className="bg-emerald-50/60 border-b border-emerald-100 px-5 py-2 text-[11px] text-emerald-800 flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  PII Sanitization Active: Credit cards, phone numbers, and credentials are automatically masked.
                </span>
                <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">
                  Compliance Guard
                </span>
              </div>

              {/* Messages Body */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4 max-h-[480px]">
                {isLoadingMessages ? (
                  <div className="text-center p-8 text-xs text-slate-400">Loading conversation messages...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center p-8 text-xs text-slate-400">No messages in this conversation.</div>
                ) : (
                  messages.map((msg) => {
                    const isUser = msg.role === 'USER';

                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                      >
                        {/* Avatar */}
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs overflow-hidden ${
                          isUser ? 'bg-slate-700 text-white' : 'bg-white p-0.5 shadow-xs border border-slate-200'
                        }`}>
                          {isUser ? (
                            <User className="w-3.5 h-3.5" />
                          ) : (
                            <Image
                              src="/sahayak-logo.png"
                              alt="Sahayak AI"
                              width={24}
                              height={24}
                              className="w-full h-full object-contain rounded-full"
                            />
                          )}
                        </div>

                        {/* Message Box */}
                        <div className={`rounded-2xl p-3.5 text-xs leading-relaxed space-y-1.5 ${
                          isUser 
                            ? 'bg-slate-900 text-white rounded-tr-none' 
                            : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/60'
                        }`}>
                          <p>{msg.content}</p>

                          {/* PII Flag if applicable */}
                          {msg.hasPii && (
                            <div className="text-[10px] text-amber-300 font-semibold flex items-center gap-1 pt-1">
                              <AlertTriangle className="w-3 h-3 text-amber-400" />
                              <span>Sensitive identifiers masked before storage</span>
                            </div>
                          )}

                          {/* Assistant Metadata */}
                          {!isUser && (
                            <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 flex flex-wrap items-center gap-2">
                              {msg.matchedFaqId ? (
                                <span className="text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">
                                  FAQ: {msg.matchedFaqId}
                                </span>
                              ) : msg.isFallback ? (
                                <span className="text-amber-700 font-bold bg-amber-100 px-1.5 py-0.5 rounded">
                                  Safe Fallback Triggered
                                </span>
                              ) : null}

                              {msg.similarityScore !== undefined && (
                                <span>Confidence: {(msg.similarityScore * 100).toFixed(0)}%</span>
                              )}

                              {msg.latencyMs !== undefined && (
                                <span>{msg.latencyMs}ms</span>
                              )}
                            </div>
                          )}

                          <div className={`text-[10px] ${isUser ? 'text-slate-400 text-right' : 'text-slate-400'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-400 m-auto space-y-3">
              <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">Select a conversation to view transcript</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Explore customer queries from website visitors or preview tests executed by team members.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {sessionToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-scale-up">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-900">Delete Conversation?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to permanently delete <strong className="text-slate-800">&quot;{sessionToDelete.title}&quot;</strong>?
                This will delete the conversation transcript and all associated messages. This action cannot be reversed.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSessionToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConversation}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition shadow-sm"
              >
                {isDeleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
