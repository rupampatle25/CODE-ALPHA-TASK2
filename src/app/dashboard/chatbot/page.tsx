'use client';

import React, { useState, useEffect } from 'react';
import { 
  Palette, Check, ExternalLink, 
  Sparkles, Plus, Trash2 
} from 'lucide-react';
import { ChatWindow } from '@/components/chatbot/ChatWindow';
import { WidgetConfig } from '@/lib/db/types';

const COLOR_SWATCHES = ['#2563EB', '#4F46E5', '#7C3AED', '#059669', '#DC2626', '#0F172A'];

export default function ChatbotCustomizerPage() {
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>('ws_technova_demo');
  const [widgetConfig, setWidgetConfig] = useState<WidgetConfig | null>(null);

  // Form states
  const [botName, setBotName] = useState('Sahayak AI');
  const [welcomeMessage, setWelcomeMessage] = useState('Hello! How can I help you today?');
  const [primaryColor, setPrimaryColor] = useState('#2563EB');
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([
    'What pricing plans do you offer?',
    'What is your refund policy?',
    'What are the API rate limits?',
  ]);
  const [newQuestionInput, setNewQuestionInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateMsg, setGenerateMsg] = useState<string | null>(null);

  const handleAutoGenerateFromCategories = async () => {
    setIsGenerating(true);
    setGenerateMsg(null);
    try {
      const res = await fetch(`/api/workspaces/${activeWorkspaceId}/suggested-questions`);
      const data = await res.json();
      if (data?.categoryQuestions && data.categoryQuestions.length > 0) {
        setSuggestedQuestions(data.categoryQuestions);
        setGenerateMsg(`Auto-populated ${data.categoryQuestions.length} questions across active categories!`);
        setTimeout(() => setGenerateMsg(null), 3500);
      } else {
        setGenerateMsg('No active category questions found. Add FAQs to categories first.');
        setTimeout(() => setGenerateMsg(null), 3500);
      }
    } catch {
      setGenerateMsg('Error generating questions from categories.');
      setTimeout(() => setGenerateMsg(null), 3500);
    } finally {
      setIsGenerating(false);
    }
  };

  const fetchConfig = async () => {
    try {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      const wsId = meData.workspaces?.[0]?.id || 'ws_technova_demo';
      setActiveWorkspaceId(wsId);

      const res = await fetch(`/api/workspaces/${wsId}/widget`);
      const data = await res.json();
      if (data.config) {
        setWidgetConfig(data.config);
        setBotName(data.config.botName);
        setWelcomeMessage(data.config.welcomeMessage);
        setPrimaryColor(data.config.primaryColor);
        setSuggestedQuestions(data.config.suggestedQuestions || []);
      }
    } catch (err) {
      console.error('Failed to load widget config:', err);
    }
  };

  useEffect(() => {
    void fetchConfig();
  }, []);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch(`/api/workspaces/${activeWorkspaceId}/widget`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botName,
          welcomeMessage,
          primaryColor,
          suggestedQuestions,
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSuggestedQuestion = () => {
    if (!newQuestionInput.trim()) return;
    setSuggestedQuestions(prev => [...prev, newQuestionInput.trim()]);
    setNewQuestionInput('');
  };

  const handleRemoveSuggestedQuestion = (index: number) => {
    setSuggestedQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const publicId = widgetConfig?.publicId || 'tn-public-bot-982';

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Chatbot Customizer</h2>
          <p className="text-xs text-slate-500 mt-1">
            Customize your virtual assistant&apos;s appearance, suggested questions, and behavior.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`/widget/${publicId}`}
            target="_blank"
            className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
          >
            <ExternalLink className="w-4 h-4 text-slate-400" /> Open Fullscreen Widget
          </a>
        </div>
      </div>

      {/* 2-Column Layout: Controls & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Customization Controls */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Palette className="w-4 h-4 text-indigo-600" /> Appearance & Prompts
            </h3>
            {saveSuccess && (
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Saved!
              </span>
            )}
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Chatbot Display Name
              </label>
              <input
                type="text"
                required
                value={botName}
                onChange={e => setBotName(e.target.value)}
                placeholder="Sahayak AI"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-600 rounded-xl text-xs outline-none text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Initial Welcome Message
              </label>
              <textarea
                required
                rows={3}
                value={welcomeMessage}
                onChange={e => setWelcomeMessage(e.target.value)}
                placeholder="Hello! Ask me anything about our services..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-600 rounded-xl text-xs outline-none text-slate-800 leading-relaxed"
              />
            </div>

            {/* Brand Color Picker */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Primary Brand Theme Color
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {COLOR_SWATCHES.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setPrimaryColor(color)}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        primaryColor.toLowerCase() === color.toLowerCase()
                          ? 'scale-125 ring-2 ring-offset-2 ring-slate-900'
                          : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-1.5 border border-slate-200 rounded-xl px-2.5 py-1 bg-slate-50">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={e => setPrimaryColor(e.target.value)}
                    className="w-5 h-5 cursor-pointer border-none bg-transparent"
                  />
                  <span className="text-[11px] font-mono text-slate-600">{primaryColor}</span>
                </div>
              </div>
            </div>

            {/* Suggested Question Starter Chips */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Smart Suggested Questions
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Clickable prompts shown below the welcome message and after chatbot answers.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAutoGenerateFromCategories}
                  disabled={isGenerating}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-semibold text-xs rounded-xl transition flex items-center gap-1.5 self-start sm:self-auto shadow-2xs hover:shadow-xs disabled:opacity-50 cursor-pointer"
                  title="Automatically extract top questions from each active FAQ category"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{isGenerating ? 'Generating...' : 'Auto-Generate from Categories'}</span>
                </button>
              </div>

              {generateMsg && (
                <div className="p-2.5 bg-indigo-50/90 border border-indigo-200 text-indigo-800 text-xs rounded-xl flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>{generateMsg}</span>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newQuestionInput}
                    onChange={e => setNewQuestionInput(e.target.value)}
                    placeholder="Add custom question (e.g. What are your hours?)"
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-600 rounded-xl text-xs outline-none text-slate-800"
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSuggestedQuestion();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddSuggestedQuestion}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>

                <div className="space-y-1.5 pt-1">
                  {suggestedQuestions.map((q, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs hover:border-slate-300 transition">
                      <span className="truncate pr-2 font-medium text-slate-700 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        {q}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSuggestedQuestion(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition cursor-pointer"
                        title="Remove question"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {suggestedQuestions.length === 0 && (
                    <div className="text-center py-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
                      No custom prompts. Click &quot;Auto-Generate from Categories&quot; or add custom questions above.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2 text-xs"
            >
              {isSaving ? 'Saving Changes...' : 'Save Configuration'}
            </button>
          </form>
        </div>

        {/* Right Column: Live Interactive Chatbot Preview */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div className="w-full max-w-md">
            <div className="mb-2 text-xs font-semibold text-slate-500 flex items-center justify-between px-2">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Real-Time Interactive Preview
              </span>
              <span className="text-[11px] text-slate-400">Updates live as you type</span>
            </div>
            
            <ChatWindow
              key={`${activeWorkspaceId}-${botName}-${primaryColor}-${suggestedQuestions.join('|')}`}
              workspaceId={activeWorkspaceId}
              botName={botName}
              welcomeMessage={welcomeMessage}
              primaryColor={primaryColor}
              suggestedQuestions={suggestedQuestions}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
