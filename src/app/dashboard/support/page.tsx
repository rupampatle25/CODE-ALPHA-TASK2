'use client';

import React, { useState, useEffect } from 'react';
import { 
  Headphones, Search, CheckCircle2, 
  X, Mail, Phone, User, ArrowRight 
} from 'lucide-react';
import { SupportTicket, TicketStatus } from '@/lib/db/types';

export default function SupportTicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0, closed: 0 });
  const [activeWorkspaceId, setActiveWorkspaceId] = useState('ws_technova_demo');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Manage Ticket Modal
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [updateStatus, setUpdateStatus] = useState<TicketStatus>('PENDING');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      const wsId = meData.workspaces?.[0]?.id || 'ws_technova_demo';
      setActiveWorkspaceId(wsId);

      const res = await fetch(`/api/workspaces/${wsId}/support-tickets`);
      const data = await res.json();
      setTickets(data.tickets || []);
      setStats(data.stats || { total: 0, pending: 0, inProgress: 0, resolved: 0, closed: 0 });
    } catch (err) {
      console.error('Failed to load support tickets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchTickets();
  }, []);

  const filteredTickets = tickets.filter(t => {
    const matchesStatus = selectedStatus === 'ALL' || t.status === selectedStatus;
    const matchesSearch = 
      t.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
      t.visitorName.toLowerCase().includes(search.toLowerCase()) ||
      t.visitorEmail.toLowerCase().includes(search.toLowerCase()) ||
      t.question.toLowerCase().includes(search.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const handleOpenTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setUpdateStatus(ticket.status);
    setResolutionNotes(ticket.resolutionNotes || '');
    setUpdateSuccess(false);
  };

  const handleUpdateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    setIsUpdating(true);
    setUpdateSuccess(false);

    try {
      const res = await fetch(`/api/workspaces/${activeWorkspaceId}/support-tickets/${selectedTicket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: updateStatus,
          resolutionNotes: resolutionNotes.trim(),
        }),
      });

      if (res.ok) {
        setUpdateSuccess(true);
        setTimeout(() => {
          setSelectedTicket(null);
          setUpdateSuccess(false);
          fetchTickets();
        }, 1200);
      }
    } catch (err) {
      console.error('Failed to update ticket:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Headphones className="w-6 h-6 text-indigo-600" />
            Human Support Handoff Inbox
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Review and resolve escalated inquiries submitted by visitors when the AI chatbot needed human assistance.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Escalations</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              {stats.total}
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{stats.total}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Tickets logged from chat</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Pending Review</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              {stats.pending}
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 mt-2">{stats.pending}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Requires staff response</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">In Progress</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              {stats.inProgress}
            </div>
          </div>
          <p className="text-2xl font-black text-blue-600 mt-2">{stats.inProgress}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Being handled by team</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Resolved</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              {stats.resolved}
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">{stats.resolved}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Successfully answered</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tickets, email, customer..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-600 rounded-xl text-xs outline-none transition text-slate-800"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'PENDING', label: 'Pending' },
            { id: 'IN_PROGRESS', label: 'In Progress' },
            { id: 'RESOLVED', label: 'Resolved' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
                selectedStatus === tab.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading support inbox...</div>
        ) : filteredTickets.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredTickets.map(ticket => (
              <div key={ticket.id} className="p-5 hover:bg-slate-50/70 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1 pr-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {ticket.ticketNumber}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      ticket.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-800'
                        : ticket.status === 'IN_PROGRESS'
                        ? 'bg-blue-100 text-blue-800'
                        : ticket.status === 'RESOLVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {ticket.status}
                    </span>
                    {ticket.priority === 'URGENT' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                        URGENT
                      </span>
                    )}
                    <span className="text-slate-400 text-xs">• {new Date(ticket.createdAt).toLocaleString()}</span>
                  </div>

                  <p className="font-bold text-sm text-slate-900">{ticket.question}</p>
                  {ticket.details && (
                    <p className="text-xs text-slate-500 line-clamp-1">{ticket.details}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <strong className="text-slate-700">{ticket.visitorName}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {ticket.visitorEmail}
                    </span>
                    {ticket.visitorPhone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {ticket.visitorPhone}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleOpenTicket(ticket)}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-semibold text-xs rounded-xl border border-slate-200 hover:border-indigo-200 transition flex items-center gap-1"
                  >
                    Manage Ticket <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-60" />
            <p className="text-sm font-semibold text-slate-800">No support tickets found</p>
            <p className="text-xs text-slate-500 mt-0.5">Your support queue is completely clear!</p>
          </div>
        )}
      </div>

      {/* Ticket Details & Resolution Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-100">
                  {selectedTicket.ticketNumber}
                </span>
                <span className="text-sm font-bold text-slate-900">Manage Support Request</span>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {updateSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Ticket status and notes updated successfully!
              </div>
            )}

            {/* Ticket Inquiry Details */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Customer Inquiry</span>
                <p className="font-semibold text-slate-900 text-sm">{selectedTicket.question}</p>
                {selectedTicket.details && (
                  <p className="text-slate-600 mt-1 leading-relaxed">{selectedTicket.details}</p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-2 text-slate-600">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Contact Name</span>
                  <span className="font-medium text-slate-800">{selectedTicket.visitorName}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Contact Email</span>
                  <span className="font-medium text-slate-800">{selectedTicket.visitorEmail}</span>
                </div>
              </div>
            </div>

            {/* Resolution Form */}
            <form onSubmit={handleUpdateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Ticket Status
                </label>
                <select
                  value={updateStatus}
                  onChange={e => setUpdateStatus(e.target.value as TicketStatus)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-600 rounded-xl text-xs outline-none text-slate-800 font-semibold"
                >
                  <option value="PENDING">Pending (Awaiting Response)</option>
                  <option value="IN_PROGRESS">In Progress (Staff Reviewing)</option>
                  <option value="RESOLVED">Resolved (Issue Answered)</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Internal Resolution Notes &amp; Reply Record
                </label>
                <textarea
                  rows={3}
                  value={resolutionNotes}
                  onChange={e => setResolutionNotes(e.target.value)}
                  placeholder="Record your communication with the customer or internal follow-up steps taken..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-600 rounded-xl text-xs outline-none text-slate-800 leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold transition"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition flex items-center gap-1.5"
                >
                  {isUpdating ? 'Saving...' : 'Save Ticket Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
