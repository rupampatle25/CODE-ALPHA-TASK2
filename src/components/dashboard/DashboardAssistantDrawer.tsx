'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, Sparkles } from 'lucide-react';
import { ChatWindow } from '@/components/chatbot/ChatWindow';

interface DashboardAssistantDrawerProps {
  workspaceId: string;
  workspaceName: string;
}

export function DashboardAssistantDrawer({ workspaceId, workspaceName }: DashboardAssistantDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-[420px] max-w-[90vw] h-[640px] max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header Bar */}
          <div className="bg-indigo-600 text-white px-4 py-3 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-white p-0.5 shadow-xs overflow-hidden shrink-0">
                <Image
                  src="/sahayak-logo.png"
                  alt="Sahayak AI"
                  width={28}
                  height={28}
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
              <div>
                <h4 className="text-xs font-bold leading-tight flex items-center gap-1.5">
                  <span>{workspaceName} Assistant</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </h4>
                <p className="text-[10px] text-indigo-200 font-medium">Sahayak AI Live Test</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-indigo-700 rounded-lg text-indigo-100 hover:text-white transition"
              title="Close Assistant"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Embedded ChatWindow */}
          <div className="flex-1 overflow-hidden">
            <ChatWindow
              workspaceId={workspaceId}
              botName="Sahayak AI"
              isEmbedded={true}
              channel="DASHBOARD"
            />
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-xl shadow-indigo-600/30 transition transform hover:-translate-y-0.5 active:translate-y-0 font-semibold text-xs border border-indigo-500/40 group"
          title="Open Assistant to ask questions"
        >
          <div className="w-6 h-6 rounded-full bg-white p-0.5 shadow-xs overflow-hidden shrink-0 relative">
            <Image
              src="/sahayak-logo.png"
              alt="Sahayak AI"
              width={24}
              height={24}
              className="w-full h-full object-contain rounded-full"
            />
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border border-white" />
          </div>
          <span className="tracking-wide">Ask Sahayak AI</span>
          <Sparkles className="w-3.5 h-3.5 text-indigo-200 group-hover:rotate-12 transition-transform" />
        </button>
      )}
    </div>
  );
}
