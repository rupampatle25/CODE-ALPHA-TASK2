import { getSupabaseServerClient } from './server';
import { Faq, ChatSession, ChatMessage, ChatFeedback, SessionType } from '../db/types';

/**
 * Supabase PostgreSQL Repository Adapter
 * 
 * Maps application data models to/from Supabase PostgreSQL tables.
 * Enforces tenant workspace isolation in every query.
 */

export const supabaseFaqRepo = {
  listByWorkspace: async (workspaceId: string, options?: { search?: string; categoryId?: string; enabledOnly?: boolean }): Promise<Faq[]> => {
    const supabase = getSupabaseServerClient();
    if (!supabase) return [];

    let query = supabase
      .from('faqs')
      .select('*')
      .eq('workspace_id', workspaceId);

    if (options?.enabledOnly) {
      query = query.eq('is_enabled', true);
    }
    if (options?.categoryId && options.categoryId !== 'ALL') {
      query = query.eq('category_id', options.categoryId);
    }
    if (options?.search && options.search.trim()) {
      const q = options.search.trim();
      query = query.or(`question.ilike.%${q}%,answer.ilike.%${q}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error || !data) {
      console.error('Supabase list FAQs error:', error);
      return [];
    }

    return data.map(row => ({
      id: row.id,
      workspaceId: row.workspace_id,
      categoryId: row.category_id,
      question: row.question,
      answer: row.answer,
      tags: row.tags || [],
      isEnabled: row.is_enabled,
      viewCount: row.view_count || 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  },

  getById: async (workspaceId: string, faqId: string): Promise<Faq | null> => {
    const supabase = getSupabaseServerClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('id', faqId)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      workspaceId: data.workspace_id,
      categoryId: data.category_id,
      question: data.question,
      answer: data.answer,
      tags: data.tags || [],
      isEnabled: data.is_enabled,
      viewCount: data.view_count || 0,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  create: async (workspaceId: string, data: { question: string; answer: string; categoryId?: string; tags?: string[]; isEnabled?: boolean }): Promise<Faq | null> => {
    const supabase = getSupabaseServerClient();
    if (!supabase) return null;

    const newId = `faq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const insertPayload = {
      id: newId,
      workspace_id: workspaceId,
      category_id: data.categoryId || null,
      question: data.question.trim(),
      answer: data.answer.trim(),
      tags: data.tags || [],
      is_enabled: data.isEnabled ?? true,
      view_count: 0,
      created_at: now,
      updated_at: now,
    };

    const { data: inserted, error } = await supabase
      .from('faqs')
      .insert(insertPayload)
      .select()
      .single();

    if (error || !inserted) {
      console.error('Supabase create FAQ error:', error);
      return null;
    }

    return {
      id: inserted.id,
      workspaceId: inserted.workspace_id,
      categoryId: inserted.category_id,
      question: inserted.question,
      answer: inserted.answer,
      tags: inserted.tags || [],
      isEnabled: inserted.is_enabled,
      viewCount: inserted.view_count || 0,
      createdAt: inserted.created_at,
      updatedAt: inserted.updated_at,
    };
  },

  update: async (workspaceId: string, faqId: string, data: Partial<Pick<Faq, 'question' | 'answer' | 'categoryId' | 'tags' | 'isEnabled'>>): Promise<Faq | null> => {
    const supabase = getSupabaseServerClient();
    if (!supabase) return null;

    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (data.question !== undefined) updatePayload.question = data.question.trim();
    if (data.answer !== undefined) updatePayload.answer = data.answer.trim();
    if (data.categoryId !== undefined) updatePayload.category_id = data.categoryId || null;
    if (data.tags !== undefined) updatePayload.tags = data.tags;
    if (data.isEnabled !== undefined) updatePayload.is_enabled = data.isEnabled;

    const { data: updated, error } = await supabase
      .from('faqs')
      .update(updatePayload)
      .eq('workspace_id', workspaceId)
      .eq('id', faqId)
      .select()
      .single();

    if (error || !updated) {
      console.error('Supabase update FAQ error:', error);
      return null;
    }

    return {
      id: updated.id,
      workspaceId: updated.workspace_id,
      categoryId: updated.category_id,
      question: updated.question,
      answer: updated.answer,
      tags: updated.tags || [],
      isEnabled: updated.is_enabled,
      viewCount: updated.view_count || 0,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
    };
  },

  delete: async (workspaceId: string, faqId: string): Promise<boolean> => {
    const supabase = getSupabaseServerClient();
    if (!supabase) return false;

    const { error } = await supabase
      .from('faqs')
      .delete()
      .eq('workspace_id', workspaceId)
      .eq('id', faqId);

    if (error) {
      console.error('Supabase delete FAQ error:', error);
      return false;
    }
    return true;
  },

  incrementViewCount: async (workspaceId: string, faqId: string): Promise<void> => {
    const supabase = getSupabaseServerClient();
    if (!supabase) return;

    try {
      await supabase.rpc('increment_faq_view', { ws_id: workspaceId, faq_id: faqId });
    } catch {
      // Fallback update if RPC not present
      await supabase
        .from('faqs')
        .update({ updated_at: new Date().toISOString() })
        .eq('workspace_id', workspaceId)
        .eq('id', faqId);
    }
  }
};

export const supabaseChatRepo = {
  createSession: async (
    workspaceId: string, 
    channel: 'DASHBOARD' | 'WIDGET' | 'TEST', 
    visitorId?: string,
    title?: string,
    sessionType?: SessionType
  ): Promise<ChatSession | null> => {
    const supabase = getSupabaseServerClient();
    if (!supabase) return null;

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

    const { error } = await supabase.from('chat_sessions').insert({
      id: newSession.id,
      workspace_id: newSession.workspaceId,
      title: newSession.title,
      channel: newSession.channel,
      session_type: newSession.sessionType,
      status: newSession.status,
      message_count: 0,
      visitor_id: newSession.visitorId,
      created_at: newSession.createdAt,
      updated_at: newSession.updatedAt,
    });

    if (error) {
      console.error('Supabase create chat session error:', error);
      return null;
    }

    return newSession;
  },

  addMessage: async (data: Omit<ChatMessage, 'id' | 'createdAt'>): Promise<ChatMessage | null> => {
    const supabase = getSupabaseServerClient();
    if (!supabase) return null;

    const message: ChatMessage = {
      ...data,
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };

    const { error } = await supabase.from('chat_messages').insert({
      id: message.id,
      session_id: message.sessionId,
      workspace_id: message.workspaceId,
      role: message.role,
      content: message.content,
      matched_faq_id: message.matchedFaqId || null,
      similarity_score: message.similarityScore || null,
      is_fallback: message.isFallback,
      latency_ms: message.latencyMs,
      has_pii: message.hasPii || false,
      redacted_types: message.redactedTypes || [],
      created_at: message.createdAt,
    });

    if (error) {
      console.error('Supabase add message error:', error);
      return null;
    }

    // Update session timestamp & status
    await supabase.from('chat_sessions').update({
      updated_at: new Date().toISOString(),
      status: data.isFallback ? 'FALLBACK' : 'RESOLVED',
      last_message_snippet: data.content.length > 90 ? data.content.substring(0, 87) + '...' : data.content,
    }).eq('id', data.sessionId);

    return message;
  },

  addFeedback: async (data: { messageId: string; workspaceId: string; rating: 'HELPFUL' | 'UNHELPFUL'; comment?: string }): Promise<ChatFeedback | null> => {
    const supabase = getSupabaseServerClient();
    if (!supabase) return null;

    const feedback: ChatFeedback = {
      id: `fb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      messageId: data.messageId,
      workspaceId: data.workspaceId,
      rating: data.rating,
      comment: data.comment,
      createdAt: new Date().toISOString(),
    };

    const { error } = await supabase.from('chat_feedback').upsert({
      id: feedback.id,
      message_id: feedback.messageId,
      workspace_id: feedback.workspaceId,
      rating: feedback.rating,
      comment: feedback.comment || null,
      created_at: feedback.createdAt,
    }, { onConflict: 'message_id' });

    if (error) {
      console.error('Supabase add feedback error:', error);
      return null;
    }

    return feedback;
  }
};
