'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { 
  Send, User, ThumbsUp, ThumbsDown, RotateCcw, 
  Sparkles, Check, AlertCircle, Mic, MicOff, X, Globe, ChevronDown, Headphones,
  HelpCircle, ChevronRight
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, SupportedLanguage, UI_TRANSLATIONS } from '@/lib/translation/languages';

export interface ChatMessageItem {
  id: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  originalContent?: string;
  showOriginal?: boolean;
  confidence?: number;
  isFallback?: boolean;
  latencyMs?: number;
  sourceQuestion?: string;
  alternativeFaqs?: Array<{ id: string; question: string; confidence: number }>;
  suggestedQuestions?: string[];
  feedbackSubmitted?: 'HELPFUL' | 'UNHELPFUL';
  wasTranslated?: boolean;
}

interface ChatWindowProps {
  workspaceId: string;
  botName?: string;
  welcomeMessage?: string;
  primaryColor?: string;
  suggestedQuestions?: string[];
  channel?: 'DASHBOARD' | 'WIDGET' | 'TEST';
  isEmbedded?: boolean;
  initialLanguage?: SupportedLanguage;
}

export function ChatWindow({
  workspaceId,
  botName = 'Sahayak AI',
  welcomeMessage,
  primaryColor = '#2563EB',
  suggestedQuestions,
  channel = 'DASHBOARD',
  isEmbedded = false,
  initialLanguage = 'en',
}: ChatWindowProps) {
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>(initialLanguage);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  // Localized UI strings
  const currentUi = UI_TRANSLATIONS[selectedLang];

  const [messages, setMessages] = useState<ChatMessageItem[]>([
    {
      id: 'welcome',
      role: 'ASSISTANT',
      content: welcomeMessage || currentUi.welcomeMessage,
      confidence: 1.0,
      isFallback: false,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [dynamicStarters, setDynamicStarters] = useState<string[]>([]);

  // Web Speech API Voice-to-Text states
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  // Human Support Handoff Modal states
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [supportQuestion, setSupportQuestion] = useState('');
  const [visitorName, setVisitorName] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [supportDetails, setSupportDetails] = useState('');
  const [supportPriority, setSupportPriority] = useState<'NORMAL' | 'URGENT'>('NORMAL');
  const [isSubmittingSupport, setIsSubmittingSupport] = useState(false);
  const [supportError, setSupportError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  // Check Web Speech API browser support on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      setIsSpeechSupported(Boolean(SpeechRecognitionClass));
    }
  }, []);

  // Fetch category-based suggested questions if not provided via props
  useEffect(() => {
    if (workspaceId && (!suggestedQuestions || suggestedQuestions.length === 0)) {
      fetch(`/api/workspaces/${workspaceId}/suggested-questions?mode=starter`)
        .then(res => res.json())
        .then(data => {
          if (data?.questions && Array.isArray(data.questions) && data.questions.length > 0) {
            setDynamicStarters(data.questions);
          }
        })
        .catch(err => {
          console.warn('Failed to load category suggestions:', err);
        });
    }
  }, [workspaceId, suggestedQuestions]);

  // Close language menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // When language changes, update welcome message if only 1 message exists
  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setSelectedLang(newLang);
    setIsLangMenuOpen(false);
    if (isListening) {
      stopListening();
    }

    if (messages.length <= 1) {
      setMessages([
        {
          id: 'welcome',
          role: 'ASSISTANT',
          content: UI_TRANSLATIONS[newLang].welcomeMessage,
          confidence: 1.0,
          isFallback: false,
        },
      ]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Clean up recognition instance on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignored
      }
    }
    setIsListening(false);
  }, []);

  const startListening = () => {
    setSpeechError(null);

    if (typeof window === 'undefined') return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      setSpeechError('Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognitionClass();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = SUPPORTED_LANGUAGES[selectedLang].speechLocale;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        if (currentTranscript.trim()) {
          setInput(currentTranscript);
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onerror = (event: any) => {
        setIsListening(false);
        const errType = event.error;
        if (errType === 'not-allowed') {
          setSpeechError('Microphone permission was denied. Please allow microphone access in your browser settings.');
        } else if (errType === 'no-speech') {
          setSpeechError('No speech was detected. Click the mic button and try speaking again.');
        } else if (errType === 'audio-capture') {
          setSpeechError('No microphone detected. Please connect an audio input device.');
        } else if (errType === 'network') {
          setSpeechError('Network error occurred during speech recognition.');
        } else {
          setSpeechError(`Voice input error: ${errType || 'Unable to recognize speech'}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to initialize speech recognition:', err);
      setIsListening(false);
      setSpeechError('Could not start speech recognition. Please check your microphone permissions.');
    }
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleOpenSupportModal = (inquiryContext?: string) => {
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'USER');
    setSupportQuestion(inquiryContext || lastUserMsg?.content || input || 'Assistance requested with business inquiry');
    setVisitorName('');
    setVisitorEmail('');
    setVisitorPhone('');
    setSupportDetails('');
    setSupportPriority('NORMAL');
    setSupportError(null);
    setIsSupportModalOpen(true);
  };

  const handleSubmitSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName.trim() || !visitorEmail.trim() || !supportQuestion.trim()) {
      setSupportError('Name, email, and question are required.');
      return;
    }

    setIsSubmittingSupport(true);
    setSupportError(null);

    try {
      const res = await fetch('/api/support-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          question: supportQuestion.trim(),
          visitorName: visitorName.trim(),
          visitorEmail: visitorEmail.trim(),
          visitorPhone: visitorPhone.trim() || undefined,
          details: supportDetails.trim() || undefined,
          priority: supportPriority,
          sessionId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSupportError(data.error || 'Failed to submit support request');
      } else {
        setIsSupportModalOpen(false);
        const confirmMsg: ChatMessageItem = {
          id: `support_confirm_${Date.now()}`,
          role: 'ASSISTANT',
          content: `✅ Support Ticket ${data.ticket.ticketNumber} Logged!\n\nYour inquiry has been escalated to our verified staff support desk. A team representative will review your request and contact you at ${visitorEmail}.\n\n(Ticket Status: PENDING)`,
          confidence: 1.0,
          isFallback: false,
        };
        setMessages(prev => [...prev, confirmMsg]);
      }
    } catch {
      setSupportError('Network error submitting support request.');
    } finally {
      setIsSubmittingSupport(false);
    }
  };

  const handleSend = async (questionText?: string) => {
    if (isListening) {
      stopListening();
    }

    const textToSend = questionText || input;
    if (!textToSend.trim() || isLoading) return;

    // Check if user is asking to speak with a human
    const lowerQ = textToSend.toLowerCase();
    const isHumanRequest = ['human', 'agent', 'support staff', 'representative', 'customer care', 'help desk', 'talk to person'].some(k => lowerQ.includes(k));

    const userMsg: ChatMessageItem = {
      id: `usr_${Date.now()}`,
      role: 'USER',
      content: textToSend.trim(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const effectiveWorkspaceId = workspaceId || 'ws_technova_demo';

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: effectiveWorkspaceId,
          query: textToSend.trim(),
          sessionId,
          channel,
          language: selectedLang,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorDetail = data?.error || `Server responded with status ${res.status}`;
        setMessages(prev => [
          ...prev,
          {
            id: `err_${Date.now()}`,
            role: 'ASSISTANT',
            content: `⚠️ Error: ${errorDetail}`,
            confidence: 0,
            isFallback: true,
          },
        ]);
        return;
      }

      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
      }

      const botMsg: ChatMessageItem = {
        id: data.messageId || `asst_${Date.now()}`,
        role: 'ASSISTANT',
        content: data.answer || "I couldn't process your request.",
        originalContent: data.originalAnswer,
        showOriginal: false,
        wasTranslated: data.wasTranslated,
        confidence: data.confidence,
        isFallback: data.isFallback || isHumanRequest,
        latencyMs: data.latencyMs,
        sourceQuestion: data.sourceQuestion,
        alternativeFaqs: data.alternativeFaqs,
        suggestedQuestions: data.suggestedQuestions,
      };

      setMessages(prev => [...prev, botMsg]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'ASSISTANT',
          content: '⚠️ Network connection issue. Unable to reach the Sahayak AI support server. Please verify your connection and try again.',
          isFallback: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleOriginalAnswer = (messageId: string) => {
    setMessages(prev =>
      prev.map(m => (m.id === messageId ? { ...m, showOriginal: !m.showOriginal } : m))
    );
  };

  const handleFeedback = async (messageId: string, rating: 'HELPFUL' | 'UNHELPFUL') => {
    try {
      await fetch('/api/chat/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId,
          workspaceId,
          rating,
        }),
      });

      setMessages(prev =>
        prev.map(m => (m.id === messageId ? { ...m, feedbackSubmitted: rating } : m))
      );
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    }
  };

  const handleClear = () => {
    if (isListening) {
      stopListening();
    }
    setMessages([
      {
        id: 'welcome',
        role: 'ASSISTANT',
        content: UI_TRANSLATIONS[selectedLang].welcomeMessage,
        confidence: 1.0,
        isFallback: false,
      },
    ]);
    setSessionId(null);
  };

  const activeStarterQuestions = (suggestedQuestions && suggestedQuestions.length > 0)
    ? suggestedQuestions
    : (dynamicStarters.length > 0 ? dynamicStarters : currentUi.suggestedQuestions);

  return (
    <div className={`flex flex-col bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden relative ${isEmbedded ? 'h-full w-full border-none rounded-none' : 'h-[620px] max-w-lg w-full'}`}>
      {/* Chatbot Header */}
      <div 
        className="px-5 py-3.5 flex items-center justify-between text-white shadow-sm"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-white p-0.5 shadow-md flex items-center justify-center shrink-0 overflow-hidden">
            <Image
              src="/sahayak-logo.png"
              alt={botName}
              width={38}
              height={38}
              className="w-full h-full object-contain rounded-full"
            />
          </div>
          <div>
            <h3 className="font-semibold text-sm leading-tight flex items-center gap-1.5">
              {botName}
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Online" />
            </h3>
            <p className="text-[11px] text-white/80 font-medium">Verified Knowledge Base • Fast &amp; Grounded</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Support Ticket Quick Button */}
          <button
            type="button"
            onClick={() => handleOpenSupportModal()}
            className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 transition text-white/90 hover:text-white"
            title="Connect with Human Support"
          >
            <Headphones className="w-4 h-4" />
          </button>

          {/* Multilingual Selector Dropdown */}
          <div className="relative" ref={langMenuRef}>
            <button
              type="button"
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="px-2.5 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 transition text-xs font-semibold text-white flex items-center gap-1 border border-white/20"
              title="Select Language / भाषा चुनें"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{SUPPORTED_LANGUAGES[selectedLang].nativeName}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isLangMenuOpen && (
              <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-xl border border-slate-200 py-1 text-slate-800 z-50 animate-in fade-in zoom-in-95">
                {(Object.keys(SUPPORTED_LANGUAGES) as SupportedLanguage[]).map(langKey => {
                  const lang = SUPPORTED_LANGUAGES[langKey];
                  const isSelected = selectedLang === langKey;
                  return (
                    <button
                      key={langKey}
                      type="button"
                      onClick={() => handleLanguageChange(langKey)}
                      className={`w-full px-3 py-2 text-left text-xs font-medium flex items-center justify-between hover:bg-slate-50 transition ${
                        isSelected ? 'text-indigo-600 font-bold bg-indigo-50/50' : 'text-slate-700'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span>{lang.flag}</span>
                        <span>{lang.nativeName}</span>
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <button
            onClick={handleClear}
            title="Reset conversation"
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition text-white/90 hover:text-white"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/60">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'USER' ? 'items-end' : 'items-start'}`}
          >
            <div className={`flex items-start gap-2.5 max-w-[85%] ${msg.role === 'USER' ? 'flex-row-reverse' : ''}`}>
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold overflow-hidden ${
                  msg.role === 'USER'
                    ? 'bg-slate-800 text-white'
                    : 'bg-white p-0.5 shadow-xs border border-slate-200'
                }`}
              >
                {msg.role === 'USER' ? (
                  <User className="w-4 h-4" />
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

              <div
                className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.role === 'USER'
                    ? 'bg-slate-900 text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
                }`}
              >
                <p className="whitespace-pre-line">
                  {msg.showOriginal && msg.originalContent ? msg.originalContent : msg.content}
                </p>

                {/* Clickable suggested starter questions directly below the welcome message */}
                {msg.id === 'welcome' && activeStarterQuestions && activeStarterQuestions.length > 0 && (
                  <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-2">
                    <p className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>{currentUi.suggestedHeader || 'Suggested Questions:'}</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {activeStarterQuestions.map((q, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSend(q)}
                          disabled={isLoading}
                          className="text-left text-xs bg-slate-50 hover:bg-indigo-50 active:bg-indigo-100 text-slate-700 hover:text-indigo-700 border border-slate-200/90 hover:border-indigo-300 rounded-xl px-2.5 py-1.5 transition font-medium shadow-2xs hover:shadow-xs flex items-center gap-1.5 group cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                          role="button"
                          tabIndex={0}
                          aria-label={`Ask suggested question: ${q}`}
                        >
                          <HelpCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 shrink-0" />
                          <span>{q}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Multilingual Translation Switcher Badge */}
                {msg.wasTranslated && msg.originalContent && (
                  <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-indigo-600 font-medium flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      {msg.showOriginal ? 'Showing Grounded English Source' : `Translated to ${SUPPORTED_LANGUAGES[selectedLang].name}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleOriginalAnswer(msg.id)}
                      className="text-slate-500 hover:text-indigo-700 underline text-[10px] font-semibold transition"
                    >
                      {msg.showOriginal ? 'View Translation' : 'View English Original'}
                    </button>
                  </div>
                )}

                {/* Attribution & Confidence badge */}
                {msg.role === 'ASSISTANT' && msg.id !== 'welcome' && (
                  <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
                    <span className="flex items-center gap-1">
                      {msg.isFallback ? (
                        <span className="text-amber-600 flex items-center gap-1 font-medium">
                          <AlertCircle className="w-3 h-3" /> {currentUi.unmatchedQuery}
                        </span>
                      ) : (
                        <span className="text-emerald-600 flex items-center gap-1 font-medium">
                          <Check className="w-3 h-3" /> {currentUi.approvedSource}
                        </span>
                      )}
                      {msg.confidence !== undefined && (
                        <span>• Match: {Math.round(msg.confidence * 100)}%</span>
                      )}
                      {msg.latencyMs !== undefined && (
                        <span>• {msg.latencyMs}ms</span>
                      )}
                    </span>

                    {/* Feedback Rating */}
                    {!msg.feedbackSubmitted ? (
                      <div className="flex items-center gap-1">
                        <span className="mr-0.5">{currentUi.helpful}</span>
                        <button
                          onClick={() => handleFeedback(msg.id, 'HELPFUL')}
                          className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-emerald-600 transition"
                          title="Helpful"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleFeedback(msg.id, 'UNHELPFUL')}
                          className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-rose-600 transition"
                          title="Not helpful"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-emerald-600 font-medium">
                        ✓ {currentUi.feedbackRecorded}
                      </span>
                    )}
                  </div>
                )}

                {/* Smart contextual follow-up suggested questions after responses */}
                {msg.role === 'ASSISTANT' && msg.id !== 'welcome' && msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-2">
                    <p className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>{currentUi.relatedFaqs || 'Related Questions:'}</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestedQuestions.map((sq, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSend(sq)}
                          disabled={isLoading}
                          className="text-left text-xs bg-slate-50 hover:bg-indigo-50 active:bg-indigo-100 text-slate-700 hover:text-indigo-700 border border-slate-200/90 hover:border-indigo-300 rounded-xl px-2.5 py-1.5 transition font-medium shadow-2xs hover:shadow-xs flex items-center gap-1.5 group cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                          role="button"
                          tabIndex={0}
                          aria-label={`Ask follow-up question: ${sq}`}
                        >
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 shrink-0" />
                          <span>{sq}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Alternative suggestions fallback if suggestedQuestions not present */}
                {(!msg.suggestedQuestions || msg.suggestedQuestions.length === 0) && msg.alternativeFaqs && msg.alternativeFaqs.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-100 space-y-1.5">
                    <p className="text-[11px] font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" /> {currentUi.relatedFaqs}
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {msg.alternativeFaqs.map(alt => (
                        <button
                          key={alt.id}
                          type="button"
                          onClick={() => handleSend(alt.question)}
                          disabled={isLoading}
                          className="text-left text-xs bg-slate-50 hover:bg-indigo-50 text-indigo-700 hover:text-indigo-900 border border-slate-200/60 rounded-lg px-2.5 py-1.5 transition font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                          role="button"
                          tabIndex={0}
                          aria-label={`Ask: ${alt.question}`}
                        >
                          {alt.question}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Human Support Handoff Action Button on Fallback / Unmatched Queries */}
                {msg.isFallback && msg.id !== 'welcome' && (
                  <div className="mt-3 pt-2.5 border-t border-amber-100/80 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleOpenSupportModal()}
                      className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition flex items-center gap-1.5 shadow-sm"
                    >
                      <Headphones className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Contact Human Support Team</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-2.5">
            <div 
              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-white p-0.5 shadow-xs border border-slate-200 overflow-hidden"
            >
              <Image
                src="/sahayak-logo.png"
                alt="Sahayak AI typing"
                width={24}
                height={24}
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <div className="p-3 bg-white border border-slate-200/80 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2.5">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {selectedLang === 'hi' 
                  ? 'सहायक एआई उत्तर खोज रहा है...' 
                  : selectedLang === 'mr' 
                  ? 'सहायक एआय उत्तर शोधत आहे...' 
                  : 'Sahayak AI is searching the knowledge base...'}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions Bottom Quick Dock */}
      {messages.length <= 2 && activeStarterQuestions && activeStarterQuestions.length > 0 && (
        <div className="p-2.5 bg-slate-50/90 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 px-1">
            Quick prompts:
          </span>
          {activeStarterQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(q)}
              disabled={isLoading}
              className="text-xs font-medium text-slate-600 hover:text-indigo-700 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-full px-3 py-1 transition whitespace-nowrap shrink-0 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              role="button"
              tabIndex={0}
              aria-label={`Ask starter prompt: ${q}`}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Voice Recognition Active Indicator Banner */}
      {isListening && (
        <div className="px-4 py-2 bg-rose-50 border-t border-rose-200 flex items-center justify-between text-xs text-rose-800">
          <div className="flex items-center gap-2 font-semibold">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600" />
            </span>
            <span>{currentUi.listeningBanner} ({SUPPORTED_LANGUAGES[selectedLang].name})</span>
          </div>
          <button
            type="button"
            onClick={stopListening}
            className="text-[11px] font-bold text-rose-700 hover:text-rose-900 bg-rose-100/80 hover:bg-rose-200 px-2 py-0.5 rounded transition"
          >
            {currentUi.doneSpeaking}
          </button>
        </div>
      )}

      {/* Speech Error Banner */}
      {speechError && (
        <div className="px-4 py-2 bg-amber-50 border-t border-amber-200 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-1.5 pr-2">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>{speechError}</span>
          </div>
          <button
            type="button"
            onClick={() => setSpeechError(null)}
            className="text-amber-500 hover:text-amber-800 p-0.5"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Input Form with Microphone & Language Support */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={isListening ? currentUi.listeningPlaceholder : currentUi.inputPlaceholder}
          className={`flex-1 px-4 py-2.5 bg-slate-100 border focus:bg-white rounded-xl text-sm outline-none transition text-slate-800 placeholder:text-slate-400 ${
            isListening ? 'border-rose-400 bg-rose-50/30' : 'border-transparent focus:border-indigo-500'
          }`}
          disabled={isLoading}
        />

        {/* Microphone Button (Web Speech API with dynamic locale) */}
        <button
          type="button"
          onClick={toggleVoiceInput}
          disabled={isLoading}
          title={
            !isSpeechSupported
              ? "Voice input not supported in this browser (Chrome, Edge, Safari recommended)"
              : isListening
              ? "Stop listening"
              : `Voice typing in ${SUPPORTED_LANGUAGES[selectedLang].name}`
          }
          className={`p-2.5 rounded-xl transition shadow-sm shrink-0 flex items-center justify-center ${
            isListening
              ? 'bg-rose-600 text-white animate-pulse ring-2 ring-rose-400'
              : isSpeechSupported
              ? 'bg-slate-100 text-slate-600 hover:text-indigo-600 hover:bg-slate-200/80'
              : 'bg-slate-100 text-slate-300 cursor-not-allowed opacity-60'
          }`}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-2.5 rounded-xl text-white transition disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shrink-0 flex items-center justify-center"
          style={{ backgroundColor: primaryColor }}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Human Support Handoff Modal */}
      {isSupportModalOpen && (
        <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-3.5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Headphones className="w-4 h-4 text-indigo-600" />
                Connect With Support Desk
              </h4>
              <button
                type="button"
                onClick={() => setIsSupportModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {supportError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{supportError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitSupport} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Your Inquiry / Question *
                </label>
                <input
                  type="text"
                  required
                  value={supportQuestion}
                  onChange={e => setSupportQuestion(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-600 rounded-xl text-xs outline-none text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={visitorName}
                    onChange={e => setVisitorName(e.target.value)}
                    placeholder="Priya Sharma"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-600 rounded-xl text-xs outline-none text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={supportPriority}
                    onChange={e => setSupportPriority(e.target.value as 'NORMAL' | 'URGENT')}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none text-slate-800 font-medium"
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Your Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={visitorEmail}
                  onChange={e => setVisitorEmail(e.target.value)}
                  placeholder="priya@example.com"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-600 rounded-xl text-xs outline-none text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={visitorPhone}
                  onChange={e => setVisitorPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-600 rounded-xl text-xs outline-none text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Additional Details (Optional)
                </label>
                <textarea
                  rows={2}
                  value={supportDetails}
                  onChange={e => setSupportDetails(e.target.value)}
                  placeholder="Provide any details to help staff answer accurately..."
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-600 rounded-xl text-xs outline-none text-slate-800"
                />
              </div>

              <p className="text-[10px] text-slate-400 leading-tight">
                🔒 Privacy protected: Your details are encrypted and accessed exclusively by verified business support staff.
              </p>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsSupportModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSupport}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-40"
                >
                  {isSubmittingSupport ? 'Logging Ticket...' : 'Submit Support Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
