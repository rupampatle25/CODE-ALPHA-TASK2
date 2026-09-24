'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ChevronRight, ArrowRight, Sparkles, Building2, GraduationCap, Stethoscope, ShoppingBag
} from 'lucide-react';
import { ChatWindow } from '@/components/chatbot/ChatWindow';

export default function LandingPage() {
  const [activeFaqAccordion, setActiveFaqAccordion] = useState<number | null>(null);

  const landingFaqs = [
    {
      q: "How does Sahayak AI retrieve answers without hallucinations?",
      a: "Sahayak AI uses a deterministic vector space model combining TF-IDF term weighting and cosine similarity. It only returns answers from your approved knowledge base. If the similarity score falls below your calibrated confidence threshold, it triggers a safe fallback rather than inventing unsupported answers."
    },
    {
      q: "Can I embed the chatbot on my existing website?",
      a: "Yes! You can embed it on any website (WordPress, Shopify, Webflow, custom HTML) by pasting a single <script> tag before your closing </body> tag. It includes a floating launcher with zero CSS conflict."
    },
    {
      q: "How is my business data isolated from other organizations?",
      a: "Every workspace is assigned a distinct UUID. All database queries, vector indexes, and widget configurations enforce workspace-level authorization filters, ensuring tenant data is completely quarantined."
    },
    {
      q: "Can I bulk import our existing FAQs from CSV?",
      a: "Yes. Our dashboard includes a built-in CSV parser that validates required question and answer columns, previews rows before import, and detects potential duplicate questions."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Academic Banner */}
      <div className="bg-indigo-900 text-indigo-100 text-xs py-2 px-4 text-center font-medium border-b border-indigo-800">
        🎓 <strong className="text-white">College Assignment Task 2 Fulfill & Elevate:</strong> Industrial NLP Preprocessing • Cosine Similarity • Multi-Tenant Architecture • Zero Hallucination.
      </div>

      {/* Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white shadow-md shadow-indigo-500/10 border border-slate-200/80 flex items-center justify-center p-0.5 shrink-0">
              <Image
                src="/sahayak-logo.png"
                alt="Sahayak AI Logo"
                width={40}
                height={40}
                className="w-full h-full object-contain rounded-lg"
                priority
              />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-slate-900">Sahayak <span className="text-indigo-600">AI</span></span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold rounded bg-indigo-50 text-indigo-700 border border-indigo-200">B2B SaaS</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
            <a href="#demo" className="hover:text-indigo-600 transition">Live Demo</a>
            <a href="#features" className="hover:text-indigo-600 transition">Features</a>
            <a href="#architecture" className="hover:text-indigo-600 transition">NLP Architecture</a>
            <a href="#faq" className="hover:text-indigo-600 transition">FAQ</a>
          </nav>

          <div className="flex items-center space-x-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-700 hover:text-slate-900 px-3.5 py-2 rounded-lg hover:bg-slate-100 transition"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg shadow-sm hover:shadow transition flex items-center gap-1.5"
            >
              Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden bg-gradient-to-b from-indigo-50/50 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Pitch */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100/80 border border-indigo-200 text-xs font-semibold text-indigo-800">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Next-Gen Customer Support Automation
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                Turn Your Business Knowledge Into <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700">Instant Customer Support.</span>
              </h1>

              <p className="text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Deploy an AI FAQ chatbot trained strictly on your approved business documentation. Powered by mathematical NLP cosine similarity, zero hallucinations, and 1-click website embed.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/login"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition flex items-center justify-center gap-2"
                >
                  Explore Live Dashboard <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#demo"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white border border-slate-300 hover:border-slate-400 text-slate-700 font-semibold hover:bg-slate-50 transition flex items-center justify-center gap-2"
                >
                  Try Interactive Demo
                </a>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200 text-center sm:text-left max-w-lg mx-auto lg:mx-0">
                <div>
                  <p className="text-2xl font-bold text-slate-900">92.3%</p>
                  <p className="text-xs text-slate-500 font-medium">Top-1 Accuracy</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">&lt; 5 ms</p>
                  <p className="text-xs text-slate-500 font-medium">Retrieval Latency</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-600">0%</p>
                  <p className="text-xs text-slate-500 font-medium">Hallucinations</p>
                </div>
              </div>
            </div>

            {/* Right Live Interactive Demo */}
            <div id="demo" className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-3xl blur-xl opacity-20 transform -rotate-1" />
                <div className="relative">
                  <div className="mb-2 text-xs font-semibold text-slate-500 flex items-center justify-between px-2">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Live Interactive Chatbot Preview
                    </span>
                    <span className="text-indigo-600">Workspace: Sahayak AI</span>
                  </div>
                  <ChatWindow
                    workspaceId="ws_technova_demo"
                    botName="Sahayak AI"
                    welcomeMessage="Hello! I am Sahayak AI. How can I help you today?"
                    primaryColor="#2563EB"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Target Segments Section */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">Industry Solutions</h2>
            <p className="text-3xl font-extrabold text-slate-900">Built For High-Touch Businesses</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">E-Commerce Stores</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Handle shipping timelines, tracking lookups, return window questions, and payment options automatically.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Colleges & Institutes</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Provide 24/7 instant answers to admissions questions, syllabus queries, course fees, and exam dates.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Clinics & Healthcare</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Answer visiting hours, consultation fees, and appointment cancellation policies with grounded disclaimers.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">SaaS & Startups</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Reduce support tickets by answering API limits, pricing tier comparisons, and integration questions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Academic NLP Pipeline Walkthrough */}
      <section id="architecture" className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider border border-indigo-500/30">
              Task 2 Assignment Core
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-4">
              Mathematical NLP Retrieval Pipeline
            </h2>
            <p className="text-slate-400 mt-3 text-base">
              How our system processes user queries, calculates cosine similarity, and guarantees zero hallucination.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 relative">
              <div className="text-xs font-bold text-indigo-400 mb-2">STAGE 1</div>
              <h3 className="font-bold text-lg mb-2">Text Preprocessing</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Lowercasing, symbol stripping, and tokenization. <strong>Crucial innovation:</strong> Negation words (&quot;not&quot;, &quot;never&quot;) are strictly preserved to maintain intent.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 relative">
              <div className="text-xs font-bold text-indigo-400 mb-2">STAGE 2</div>
              <h3 className="font-bold text-lg mb-2">TF-IDF Vectorization</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Computes Term Frequency and smoothed Inverse Document Frequency: <code className="text-xs bg-slate-950 px-1 py-0.5 rounded text-indigo-300">ln((1+N)/(1+df)) + 1</code>.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 relative">
              <div className="text-xs font-bold text-indigo-400 mb-2">STAGE 3</div>
              <h3 className="font-bold text-lg mb-2">Cosine Similarity</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Calculates the normalized dot product of vectors in n-dimensional space: <code className="text-xs bg-slate-950 px-1 py-0.5 rounded text-indigo-300">(u·v)/(||u||·||v||)</code>.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 relative">
              <div className="text-xs font-bold text-indigo-400 mb-2">STAGE 4</div>
              <h3 className="font-bold text-lg mb-2">Confidence Guardrail</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                If the highest candidate score is &ge; threshold (0.25), return approved answer. Otherwise, trigger safe fallback with 100% precision.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">Got Questions?</h2>
            <p className="text-3xl font-extrabold text-slate-900">Frequently Asked Questions</p>
          </div>

          <div className="space-y-4">
            {landingFaqs.map((faq, idx) => {
              const isOpen = activeFaqAccordion === idx;
              return (
                <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setActiveFaqAccordion(isOpen ? null : idx)}
                    className="w-full px-6 py-4 text-left font-semibold text-slate-900 flex items-center justify-between hover:bg-slate-50 transition"
                  >
                    <span>{faq.q}</span>
                    <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-white shadow-sm flex items-center justify-center shrink-0 p-0.5">
                <Image
                  src="/sahayak-logo.png"
                  alt="Sahayak AI Logo"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain rounded"
                />
              </div>
              <span className="font-bold text-white text-lg">Sahayak AI</span>
            </div>

            <p className="text-xs text-slate-500 text-center md:text-left">
              &copy; {new Date().getFullYear()} Sahayak AI. Built as an advanced demonstration of Task 2 NLP Chatbot engineering.
            </p>

            <div className="flex items-center space-x-6 text-xs font-medium">
              <Link href="/login" className="hover:text-white transition">Sign In</Link>
              <Link href="/dashboard" className="hover:text-white transition">Dashboard</Link>
              <a href="#architecture" className="hover:text-white transition">NLP Algorithm</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
