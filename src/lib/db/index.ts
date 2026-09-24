import { dbStore } from './store';
import { 
  User, Workspace, WorkspaceMember, FaqCategory, Faq, 
  ChatSession, ChatMessage, ChatFeedback, WidgetConfig, UsageQuota,
  SupportTicket, TicketStatus, TicketPriority,
  SessionType, SessionStatus
} from './types';
import { generateConversationTitle } from '../privacy/sanitizer';
import { isSupabaseConfigured } from '../supabase/server';
import { supabaseFaqRepo, supabaseChatRepo } from '../supabase/repository';

export const userRepo = {
  findByEmail: (email: string): User | undefined => {
    const db = dbStore.read();
    const normalized = email.toLowerCase().trim();
    if (normalized === 'demo@sahayak.ai' || normalized === 'demo@faqpilot.ai') {
      const demo = db.users.find(u => u.email.toLowerCase() === 'demo@sahayak.ai' || u.email.toLowerCase() === 'demo@faqpilot.ai');
      if (demo) return demo;
    }
    return db.users.find(u => u.email.toLowerCase() === normalized);
  },

  findById: (id: string): User | undefined => {
    const db = dbStore.read();
    return db.users.find(u => u.id === id);
  },

  create: (user: Omit<User, 'id' | 'createdAt'>): User => {
    const db = dbStore.read();
    const newUser: User = {
      ...user,
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    db.users.push(newUser);
    dbStore.write(db);
    return newUser;
  },
};

export const workspaceRepo = {
  listForUser: (userId: string): Workspace[] => {
    const db = dbStore.read();
    const user = db.users.find(u => u.id === userId);
    if (user?.role === 'ADMIN') {
      // System administrator has overarching access to workspaces
      return db.workspaces;
    }
    const memberWorkspaceIds = db.workspaceMembers
      .filter(m => m.userId === userId)
      .map(m => m.workspaceId);
    
    return db.workspaces.filter(w => w.ownerId === userId || memberWorkspaceIds.includes(w.id));
  },

  getById: (workspaceId: string): Workspace | undefined => {
    const db = dbStore.read();
    return db.workspaces.find(w => w.id === workspaceId);
  },

  create: (data: { name: string; description: string; ownerId: string }): Workspace => {
    const db = dbStore.read();
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const workspaceId = `ws_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const newWorkspace: Workspace = {
      id: workspaceId,
      name: data.name,
      slug,
      description: data.description,
      ownerId: data.ownerId,
      retentionDays: 90,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newMember: WorkspaceMember = {
      id: `wsm_${Date.now()}`,
      workspaceId,
      userId: data.ownerId,
      role: 'OWNER',
      createdAt: new Date().toISOString(),
    };

    const starterCategories: FaqCategory[] = [
      { id: `cat_gen_${Date.now()}`, workspaceId, name: 'General Information', color: '#3B82F6', createdAt: new Date().toISOString() },
      { id: `cat_serv_${Date.now()}`, workspaceId, name: 'Services & Products', color: '#06B6D4', createdAt: new Date().toISOString() },
      { id: `cat_bill_${Date.now()}`, workspaceId, name: 'Pricing & Billing', color: '#10B981', createdAt: new Date().toISOString() },
      { id: `cat_tech_${Date.now()}`, workspaceId, name: 'Technical Support', color: '#F59E0B', createdAt: new Date().toISOString() },
      { id: `cat_pol_${Date.now()}`, workspaceId, name: 'Policies & Security', color: '#EF4444', createdAt: new Date().toISOString() },
    ];

    const starterFaqs: Faq[] = [
      {
        id: `faq_start_1_${Date.now()}`,
        workspaceId,
        categoryId: starterCategories[0].id,
        question: 'What are your standard business hours?',
        answer: `Our support team is available Monday through Friday from 9:00 AM to 6:00 PM. Our Sahayak AI assistant is available 24/7 to answer customer questions automatically for ${data.name}.`,
        tags: ['hours', 'timing', 'schedule', 'availability'],
        isEnabled: true,
        viewCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `faq_start_2_${Date.now()}`,
        workspaceId,
        categoryId: starterCategories[1].id,
        question: `What services and features does ${data.name} offer?`,
        answer: `${data.name} provides automated 24/7 AI-powered FAQ support, intelligent semantic question matching with zero hallucinations, multi-language conversational support (English, Hindi, Marathi), and privacy safeguards.`,
        tags: ['services', 'features', 'offerings', 'overview'],
        isEnabled: true,
        viewCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `faq_start_3_${Date.now()}`,
        workspaceId,
        categoryId: starterCategories[2].id,
        question: 'What pricing plans and billing options are available?',
        answer: 'We offer flexible plans starting from a Free Tier (up to 500 conversations/month) to Starter ($29/mo) and Business ($99/mo) with custom branding, priority human handoff, and team access.',
        tags: ['pricing', 'plans', 'cost', 'tiers', 'subscription'],
        isEnabled: true,
        viewCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `faq_start_4_${Date.now()}`,
        workspaceId,
        categoryId: starterCategories[3].id,
        question: 'How do I contact customer support or get help?',
        answer: 'You can submit an inquiry directly through this chatbot by clicking "Contact Human Support Team", or manage tickets in the Support Inbox of your dashboard.',
        tags: ['support', 'contact', 'help', 'human', 'ticket'],
        isEnabled: true,
        viewCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `faq_start_5_${Date.now()}`,
        workspaceId,
        categoryId: starterCategories[4].id,
        question: 'What is your refund and cancellation policy?',
        answer: 'You can cancel your plan at any time through Settings & Billing. We offer a full 14-day money-back guarantee on all subscriptions if you are not completely satisfied.',
        tags: ['refund', 'cancel', 'policy', 'guarantee', 'money back'],
        isEnabled: true,
        viewCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: `faq_start_6_${Date.now()}`,
        workspaceId,
        categoryId: starterCategories[4].id,
        question: 'How is customer data protected and is PII secured?',
        answer: 'Customer data is protected with enterprise encryption. Telephone numbers, credit cards, credentials, and government IDs are automatically redacted before storage.',
        tags: ['security', 'privacy', 'pii', 'data', 'encryption'],
        isEnabled: true,
        viewCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const newWidget: WidgetConfig = {
      id: `wc_${Date.now()}`,
      workspaceId,
      publicId: `bot_${Math.random().toString(36).substring(2, 10)}`,
      botName: 'Sahayak AI',
      welcomeMessage: `Hi! I am Sahayak AI. How can I help you with ${data.name} today?`,
      primaryColor: '#2563EB',
      suggestedQuestions: [
        'What are your standard business hours?',
        `What services and features does ${data.name} offer?`,
        'What pricing plans and billing options are available?',
        'How do I contact customer support or get help?',
      ],
      allowedDomains: ['*'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newQuota: UsageQuota = {
      id: `uq_${Date.now()}`,
      workspaceId,
      planTier: 'FREE',
      monthlyLimit: 500,
      currentUsage: 0,
      billingCycleStart: new Date().toISOString(),
    };

    db.workspaces.push(newWorkspace);
    db.workspaceMembers.push(newMember);
    db.categories.push(...starterCategories);
    db.faqs.push(...starterFaqs);
    db.widgetConfigs.push(newWidget);
    db.usageQuotas.push(newQuota);
    dbStore.write(db);

    return newWorkspace;
  },

  update: (workspaceId: string, data: Partial<Pick<Workspace, 'name' | 'description' | 'retentionDays'>>): Workspace | null => {
    const db = dbStore.read();
    const index = db.workspaces.findIndex(w => w.id === workspaceId);
    if (index === -1) return null;

    db.workspaces[index] = {
      ...db.workspaces[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    dbStore.write(db);
    return db.workspaces[index];
  },
};

export const faqCategoryRepo = {
  listByWorkspace: (workspaceId: string): FaqCategory[] => {
    const db = dbStore.read();
    return db.categories.filter(c => c.workspaceId === workspaceId);
  },

  create: (workspaceId: string, name: string, color = '#6B7280'): FaqCategory => {
    const db = dbStore.read();
    const newCategory: FaqCategory = {
      id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      workspaceId,
      name,
      color,
      createdAt: new Date().toISOString(),
    };
    db.categories.push(newCategory);
    dbStore.write(db);
    return newCategory;
  },

  delete: (workspaceId: string, categoryId: string): boolean => {
    const db = dbStore.read();
    const initialLen = db.categories.length;
    db.categories = db.categories.filter(c => !(c.id === categoryId && c.workspaceId === workspaceId));
    if (db.categories.length !== initialLen) {
      // Unlink FAQs with this category
      db.faqs = db.faqs.map(f => (f.categoryId === categoryId && f.workspaceId === workspaceId ? { ...f, categoryId: undefined } : f));
      dbStore.write(db);
      return true;
    }
    return false;
  },
};

export const faqRepo = {
  listByWorkspace: (workspaceId: string, options?: { enabledOnly?: boolean; categoryId?: string; search?: string }): Faq[] => {
    const db = dbStore.read();
    let result = db.faqs.filter(f => f.workspaceId === workspaceId);

    if (options?.enabledOnly) {
      result = result.filter(f => f.isEnabled);
    }
    if (options?.categoryId) {
      result = result.filter(f => f.categoryId === options.categoryId);
    }
    if (options?.search) {
      const q = options.search.toLowerCase();
      result = result.filter(f => 
        f.question.toLowerCase().includes(q) || 
        f.answer.toLowerCase().includes(q) || 
        f.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // If no custom FAQs are found for this workspace when querying for chatbot matching,
    // gracefully fall back to the core enabled FAQs from the demo knowledge base
    if (result.length === 0 && options?.enabledOnly && workspaceId !== 'ws_technova_demo') {
      return db.faqs.filter(f => f.workspaceId === 'ws_technova_demo' && f.isEnabled);
    }

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getById: (workspaceId: string, faqId: string): Faq | undefined => {
    const db = dbStore.read();
    return db.faqs.find(f => f.id === faqId && f.workspaceId === workspaceId);
  },

  create: (workspaceId: string, data: { question: string; answer: string; categoryId?: string; tags?: string[]; isEnabled?: boolean }): Faq => {
    const db = dbStore.read();
    const newFaq: Faq = {
      id: `faq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      workspaceId,
      question: data.question.trim(),
      answer: data.answer.trim(),
      categoryId: data.categoryId,
      tags: data.tags || [],
      isEnabled: data.isEnabled ?? true,
      viewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.faqs.push(newFaq);
    dbStore.write(db);

    if (isSupabaseConfigured()) {
      supabaseFaqRepo.create(workspaceId, data).catch(err => {
        console.warn('Supabase FAQ create sync notice:', err?.message || err);
      });
    }

    return newFaq;
  },

  bulkCreate: (workspaceId: string, items: Array<{ question: string; answer: string; categoryId?: string; tags?: string[] }>): number => {
    const db = dbStore.read();
    let count = 0;
    const now = new Date().toISOString();

    for (const item of items) {
      if (!item.question || !item.answer) continue;
      db.faqs.push({
        id: `faq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        workspaceId,
        question: item.question.trim(),
        answer: item.answer.trim(),
        categoryId: item.categoryId,
        tags: item.tags || [],
        isEnabled: true,
        viewCount: 0,
        createdAt: now,
        updatedAt: now,
      });
      count++;
    }

    dbStore.write(db);
    return count;
  },

  update: (workspaceId: string, faqId: string, data: Partial<Pick<Faq, 'question' | 'answer' | 'categoryId' | 'tags' | 'isEnabled'>>): Faq | null => {
    const db = dbStore.read();
    const index = db.faqs.findIndex(f => f.id === faqId && f.workspaceId === workspaceId);
    if (index === -1) return null;

    db.faqs[index] = {
      ...db.faqs[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    dbStore.write(db);

    if (isSupabaseConfigured()) {
      supabaseFaqRepo.update(workspaceId, faqId, data).catch(err => {
        console.warn('Supabase FAQ update sync notice:', err?.message || err);
      });
    }

    return db.faqs[index];
  },

  delete: (workspaceId: string, faqId: string): boolean => {
    const db = dbStore.read();
    const len = db.faqs.length;
    db.faqs = db.faqs.filter(f => !(f.id === faqId && f.workspaceId === workspaceId));
    if (db.faqs.length !== len) {
      dbStore.write(db);

      if (isSupabaseConfigured()) {
        supabaseFaqRepo.delete(workspaceId, faqId).catch(err => {
          console.warn('Supabase FAQ delete sync notice:', err?.message || err);
        });
      }

      return true;
    }
    return false;
  },

  incrementViewCount: (workspaceId: string, faqId: string): void => {
    const db = dbStore.read();
    const faq = db.faqs.find(f => f.id === faqId && f.workspaceId === workspaceId);
    if (faq) {
      faq.viewCount = (faq.viewCount || 0) + 1;
      dbStore.write(db);
    }
  },
};

export const chatRepo = {
  createSession: (
    workspaceId: string, 
    channel: 'DASHBOARD' | 'WIDGET' | 'TEST', 
    visitorId?: string,
    title?: string,
    sessionType?: SessionType
  ): ChatSession => {
    const db = dbStore.read();
    if (!db.chatSessions) db.chatSessions = [];
    const resolvedType: SessionType = sessionType || (channel === 'WIDGET' ? 'VISITOR' : 'ADMIN');
    const newSession: ChatSession = {
      id: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      workspaceId,
      title: title || 'New Conversation',
      channel,
      sessionType: resolvedType,
      status: 'ACTIVE',
      messageCount: 0,
      visitorId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.chatSessions.push(newSession);
    dbStore.write(db);

    if (isSupabaseConfigured()) {
      supabaseChatRepo.createSession(workspaceId, channel, visitorId, title, resolvedType).catch(err => {
        console.warn('Supabase chat session sync notice:', err?.message || err);
      });
    }

    return newSession;
  },

  addMessage: (data: Omit<ChatMessage, 'id' | 'createdAt'>): ChatMessage => {
    const db = dbStore.read();
    if (!db.chatMessages) db.chatMessages = [];
    const message: ChatMessage = {
      ...data,
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    db.chatMessages.push(message);

    // Update session timestamp, title, message count, and status
    const session = db.chatSessions?.find(s => s.id === data.sessionId);
    if (session) {
      session.updatedAt = new Date().toISOString();
      session.messageCount = (session.messageCount || 0) + 1;
      if (data.role === 'USER') {
        if (!session.title || session.title === 'New Conversation' || session.title === 'General Inquiry') {
          session.title = generateConversationTitle(data.content);
        }
      }
      session.lastMessageSnippet = data.content.length > 90 ? data.content.substring(0, 87) + '...' : data.content;
      if (data.isFallback) {
        session.status = 'FALLBACK';
      } else if (session.status === 'ACTIVE') {
        session.status = 'RESOLVED';
      }
    }

    dbStore.write(db);

    if (isSupabaseConfigured()) {
      supabaseChatRepo.addMessage(data).catch(err => {
        console.warn('Supabase chat message sync notice:', err?.message || err);
      });
    }

    return message;
  },

  getSessionMessages: (sessionId: string): ChatMessage[] => {
    const db = dbStore.read();
    return (db.chatMessages || [])
      .filter(m => m.sessionId === sessionId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },

  listSessions: (
    workspaceId: string, 
    options?: { 
      sessionType?: 'ALL' | SessionType; 
      status?: 'ALL' | SessionStatus; 
      search?: string; 
      startDate?: string; 
      endDate?: string; 
      page?: number; 
      limit?: number; 
    }
  ) => {
    const db = dbStore.read();
    const allWorkspaceSessions = (db.chatSessions || []).filter(s => s.workspaceId === workspaceId);

    // Compute overall KPI counts for the workspace
    const total = allWorkspaceSessions.length;
    const visitorCount = allWorkspaceSessions.filter(s => s.sessionType === 'VISITOR').length;
    const adminCount = allWorkspaceSessions.filter(s => s.sessionType === 'ADMIN').length;
    const fallbackCount = allWorkspaceSessions.filter(s => s.status === 'FALLBACK').length;
    const resolvedCount = allWorkspaceSessions.filter(s => s.status === 'RESOLVED').length;

    let filtered = [...allWorkspaceSessions];

    // Session type filter
    if (options?.sessionType && options.sessionType !== 'ALL') {
      filtered = filtered.filter(s => s.sessionType === options.sessionType);
    }

    // Status filter
    if (options?.status && options.status !== 'ALL') {
      filtered = filtered.filter(s => s.status === options.status);
    }

    // Date range filters
    if (options?.startDate) {
      const start = new Date(options.startDate).getTime();
      filtered = filtered.filter(s => new Date(s.createdAt).getTime() >= start);
    }
    if (options?.endDate) {
      const end = new Date(options.endDate).getTime();
      filtered = filtered.filter(s => new Date(s.createdAt).getTime() <= end);
    }

    // Keyword search filter across title, lastMessageSnippet, visitorId, and message contents
    if (options?.search && options.search.trim()) {
      const q = options.search.trim().toLowerCase();
      const matchingMessageSessionIds = new Set(
        (db.chatMessages || [])
          .filter(m => m.workspaceId === workspaceId && m.content.toLowerCase().includes(q))
          .map(m => m.sessionId)
      );

      filtered = filtered.filter(s => 
        (s.title && s.title.toLowerCase().includes(q)) ||
        (s.lastMessageSnippet && s.lastMessageSnippet.toLowerCase().includes(q)) ||
        (s.visitorId && s.visitorId.toLowerCase().includes(q)) ||
        matchingMessageSessionIds.has(s.id)
      );
    }

    // Sort by updatedAt descending
    filtered.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());

    // Pagination
    const page = Math.max(1, options?.page || 1);
    const limit = Math.max(1, options?.limit || 10);
    const totalFiltered = filtered.length;
    const totalPages = Math.ceil(totalFiltered / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedSessions = filtered.slice(startIndex, startIndex + limit);

    return {
      sessions: paginatedSessions,
      pagination: {
        page,
        limit,
        total: totalFiltered,
        totalPages,
      },
      stats: {
        total,
        visitorCount,
        adminCount,
        fallbackCount,
        resolvedCount,
      }
    };
  },

  getSessionWithMessages: (workspaceId: string, sessionId: string) => {
    const db = dbStore.read();
    const session = (db.chatSessions || []).find(s => s.id === sessionId && s.workspaceId === workspaceId);
    if (!session) return null;
    const messages = (db.chatMessages || [])
      .filter(m => m.sessionId === sessionId && m.workspaceId === workspaceId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return { session, messages };
  },

  deleteSession: (workspaceId: string, sessionId: string): boolean => {
    const db = dbStore.read();
    const initialLen = db.chatSessions?.length || 0;
    db.chatSessions = (db.chatSessions || []).filter(s => !(s.id === sessionId && s.workspaceId === workspaceId));
    if (db.chatSessions.length === initialLen) return false;

    // Delete messages
    db.chatMessages = (db.chatMessages || []).filter(m => !(m.sessionId === sessionId && m.workspaceId === workspaceId));

    // Delete feedback
    const msgIds = new Set((db.chatMessages || []).filter(m => m.sessionId === sessionId).map(m => m.id));
    db.chatFeedback = (db.chatFeedback || []).filter(f => !msgIds.has(f.messageId));

    dbStore.write(db);
    return true;
  },

  purgeOldSessions: (workspaceId: string, retentionDays: number): { deletedSessions: number, deletedMessages: number } => {
    if (retentionDays <= 0) {
      return { deletedSessions: 0, deletedMessages: 0 };
    }
    const db = dbStore.read();
    const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;

    const sessionsToDelete = (db.chatSessions || []).filter(s => 
      s.workspaceId === workspaceId && 
      new Date(s.updatedAt || s.createdAt).getTime() < cutoff
    );

    if (sessionsToDelete.length === 0) {
      return { deletedSessions: 0, deletedMessages: 0 };
    }

    const sessionIdsToDelete = new Set(sessionsToDelete.map(s => s.id));
    const messagesToDelete = (db.chatMessages || []).filter(m => sessionIdsToDelete.has(m.sessionId));

    db.chatSessions = (db.chatSessions || []).filter(s => !sessionIdsToDelete.has(s.id));
    db.chatMessages = (db.chatMessages || []).filter(m => !sessionIdsToDelete.has(m.sessionId));

    const messageIdsToDelete = new Set(messagesToDelete.map(m => m.id));
    db.chatFeedback = (db.chatFeedback || []).filter(f => !messageIdsToDelete.has(f.messageId));

    dbStore.write(db);
    return {
      deletedSessions: sessionsToDelete.length,
      deletedMessages: messagesToDelete.length,
    };
  },

  getPurgeableCount: (workspaceId: string, retentionDays: number): number => {
    if (retentionDays <= 0) return 0;
    const db = dbStore.read();
    const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
    return (db.chatSessions || []).filter(s => 
      s.workspaceId === workspaceId && 
      new Date(s.updatedAt || s.createdAt).getTime() < cutoff
    ).length;
  },

  addFeedback: (data: { messageId: string; workspaceId: string; rating: 'HELPFUL' | 'UNHELPFUL'; comment?: string }): ChatFeedback => {
    const db = dbStore.read();
    const existing = db.chatFeedback.find(f => f.messageId === data.messageId);
    if (existing) {
      existing.rating = data.rating;
      existing.comment = data.comment;
      dbStore.write(db);
      return existing;
    }

    const feedback: ChatFeedback = {
      id: `fb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      messageId: data.messageId,
      workspaceId: data.workspaceId,
      rating: data.rating,
      comment: data.comment,
      createdAt: new Date().toISOString(),
    };
    db.chatFeedback.push(feedback);
    dbStore.write(db);

    if (isSupabaseConfigured()) {
      supabaseChatRepo.addFeedback(data).catch(err => {
        console.warn('Supabase feedback sync notice:', err?.message || err);
      });
    }

    return feedback;
  },
};

export const widgetRepo = {
  getByWorkspaceId: (workspaceId: string): WidgetConfig | undefined => {
    const db = dbStore.read();
    return db.widgetConfigs.find(w => w.workspaceId === workspaceId);
  },

  getByPublicId: (publicId: string): (WidgetConfig & { workspaceName: string }) | undefined => {
    const db = dbStore.read();
    const config = db.widgetConfigs.find(w => w.publicId === publicId);
    if (!config) return undefined;
    const ws = db.workspaces.find(w => w.id === config.workspaceId);
    return {
      ...config,
      workspaceName: ws ? ws.name : 'Virtual Assistant',
    };
  },

  update: (workspaceId: string, data: Partial<Omit<WidgetConfig, 'id' | 'workspaceId' | 'publicId' | 'createdAt'>>): WidgetConfig | null => {
    const db = dbStore.read();
    const index = db.widgetConfigs.findIndex(w => w.workspaceId === workspaceId);
    if (index === -1) return null;

    db.widgetConfigs[index] = {
      ...db.widgetConfigs[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    dbStore.write(db);
    return db.widgetConfigs[index];
  },
};

export const quotaRepo = {
  getQuota: (workspaceId: string): UsageQuota => {
    const db = dbStore.read();
    let quota = db.usageQuotas.find(q => q.workspaceId === workspaceId);
    if (!quota) {
      quota = {
        id: `uq_${Date.now()}`,
        workspaceId,
        planTier: 'FREE',
        monthlyLimit: 500,
        currentUsage: 0,
        billingCycleStart: new Date().toISOString(),
      };
      db.usageQuotas.push(quota);
      dbStore.write(db);
    }
    return quota;
  },

  incrementUsage: (workspaceId: string): boolean => {
    const db = dbStore.read();
    const quota = db.usageQuotas.find(q => q.workspaceId === workspaceId);
    if (quota) {
      quota.currentUsage += 1;
      dbStore.write(db);
      return quota.currentUsage <= quota.monthlyLimit;
    }
    return true;
  },

  checkLimit: (workspaceId: string): { allowed: boolean; current: number; limit: number } => {
    const quota = quotaRepo.getQuota(workspaceId);
    return {
      allowed: quota.currentUsage < quota.monthlyLimit,
      current: quota.currentUsage,
      limit: quota.monthlyLimit,
    };
  },
};

export const analyticsRepo = {
  getWorkspaceMetrics: (workspaceId: string) => {
    const db = dbStore.read();
    const messages = db.chatMessages.filter(m => m.workspaceId === workspaceId);
    const userQueries = messages.filter(m => m.role === 'USER');
    const assistantResponses = messages.filter(m => m.role === 'ASSISTANT');
    const fallbackResponses = assistantResponses.filter(m => m.isFallback);
    const feedbackList = db.chatFeedback.filter(f => f.workspaceId === workspaceId);

    const totalConversations = db.chatSessions.filter(s => s.workspaceId === workspaceId).length;
    const totalQueries = userQueries.length;
    const unansweredCount = fallbackResponses.length;
    const answeredCount = totalQueries - unansweredCount;

    const helpfulFeedback = feedbackList.filter(f => f.rating === 'HELPFUL').length;
    const totalFeedback = feedbackList.length;
    const helpfulRatio = totalFeedback > 0 ? Math.round((helpfulFeedback / totalFeedback) * 100) : 100;

    // Average latency
    const avgLatency = assistantResponses.length > 0
      ? Math.round(assistantResponses.reduce((acc, m) => acc + (m.latencyMs || 0), 0) / assistantResponses.length)
      : 24;

    // Unanswered questions list
    const unansweredQuestions = fallbackResponses.map(fb => {
      // Find the corresponding user query right before it in the session
      const userMsg = messages.find(m => m.sessionId === fb.sessionId && m.role === 'USER' && new Date(m.createdAt).getTime() <= new Date(fb.createdAt).getTime());
      return {
        id: fb.id,
        query: userMsg ? userMsg.content : 'Unrecorded query',
        timestamp: fb.createdAt,
        score: fb.similarityScore ?? 0,
      };
    }).reverse().slice(0, 10);

    // Top answered FAQs
    const faqs = db.faqs.filter(f => f.workspaceId === workspaceId);
    const topFaqs = [...faqs].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).slice(0, 5);

    const quota = quotaRepo.getQuota(workspaceId);

    return {
      totalConversations,
      totalQueries,
      answeredCount,
      unansweredCount,
      helpfulRatio,
      avgLatency,
      unansweredQuestions,
      topFaqs,
      quota,
    };
  },
};

export const supportTicketRepo = {
  listByWorkspace: (
    workspaceId: string, 
    options?: { status?: TicketStatus; priority?: TicketPriority; search?: string }
  ): SupportTicket[] => {
    const db = dbStore.read();
    let tickets = (db.supportTickets || []).filter(t => t.workspaceId === workspaceId);

    if (options?.status) {
      tickets = tickets.filter(t => t.status === options.status);
    }
    if (options?.priority) {
      tickets = tickets.filter(t => t.priority === options.priority);
    }
    if (options?.search) {
      const q = options.search.toLowerCase();
      tickets = tickets.filter(t =>
        t.ticketNumber.toLowerCase().includes(q) ||
        t.visitorName.toLowerCase().includes(q) ||
        t.visitorEmail.toLowerCase().includes(q) ||
        t.question.toLowerCase().includes(q)
      );
    }

    return tickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getById: (workspaceId: string, ticketId: string): SupportTicket | undefined => {
    const db = dbStore.read();
    return (db.supportTickets || []).find(t => t.id === ticketId && t.workspaceId === workspaceId);
  },

  create: (workspaceId: string, data: {
    visitorName: string;
    visitorEmail: string;
    visitorPhone?: string;
    question: string;
    details?: string;
    priority?: TicketPriority;
    sessionId?: string;
  }): SupportTicket => {
    const db = dbStore.read();
    if (!db.supportTickets) {
      db.supportTickets = [];
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newTicket: SupportTicket = {
      id: `ticket_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ticketNumber: `TICK-${randomNum}`,
      workspaceId,
      sessionId: data.sessionId,
      visitorName: data.visitorName.trim(),
      visitorEmail: data.visitorEmail.trim().toLowerCase(),
      visitorPhone: data.visitorPhone?.trim(),
      question: data.question.trim(),
      details: data.details?.trim(),
      status: 'PENDING',
      priority: data.priority || 'NORMAL',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.supportTickets.push(newTicket);
    dbStore.write(db);
    return newTicket;
  },

  update: (
    workspaceId: string, 
    ticketId: string, 
    data: Partial<Pick<SupportTicket, 'status' | 'priority' | 'resolutionNotes' | 'resolvedBy'>>
  ): SupportTicket | null => {
    const db = dbStore.read();
    if (!db.supportTickets) return null;

    const index = db.supportTickets.findIndex(t => t.id === ticketId && t.workspaceId === workspaceId);
    if (index === -1) return null;

    const current = db.supportTickets[index];
    const isNowResolved = data.status === 'RESOLVED' && current.status !== 'RESOLVED';

    db.supportTickets[index] = {
      ...current,
      ...data,
      resolvedAt: isNowResolved ? new Date().toISOString() : current.resolvedAt,
      updatedAt: new Date().toISOString(),
    };

    dbStore.write(db);
    return db.supportTickets[index];
  },

  getStats: (workspaceId: string) => {
    const db = dbStore.read();
    const tickets = (db.supportTickets || []).filter(t => t.workspaceId === workspaceId);
    return {
      total: tickets.length,
      pending: tickets.filter(t => t.status === 'PENDING').length,
      inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
      resolved: tickets.filter(t => t.status === 'RESOLVED').length,
      closed: tickets.filter(t => t.status === 'CLOSED').length,
    };
  },
};

