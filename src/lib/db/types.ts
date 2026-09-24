export type UserRole = 'OWNER' | 'ADMIN' | 'MEMBER';
export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER';
export type PlanTier = 'FREE' | 'STARTER' | 'BUSINESS';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description: string;
  ownerId: string;
  retentionDays?: number; // Configurable data retention policy in days (0 = indefinite)
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  createdAt: string;
}

export interface FaqCategory {
  id: string;
  workspaceId: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface Faq {
  id: string;
  workspaceId: string;
  categoryId?: string;
  question: string;
  answer: string;
  tags: string[];
  isEnabled: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export type SessionType = 'VISITOR' | 'ADMIN';
export type SessionStatus = 'ACTIVE' | 'RESOLVED' | 'FALLBACK';

export interface ChatSession {
  id: string;
  workspaceId: string;
  title: string;
  channel: 'DASHBOARD' | 'WIDGET' | 'TEST';
  sessionType: SessionType;
  status: SessionStatus;
  messageCount: number;
  lastMessageSnippet?: string;
  visitorId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  workspaceId: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  matchedFaqId?: string;
  similarityScore?: number;
  isFallback: boolean;
  latencyMs: number;
  hasPii?: boolean;
  redactedTypes?: string[];
  createdAt: string;
}

export interface ChatFeedback {
  id: string;
  messageId: string;
  workspaceId: string;
  rating: 'HELPFUL' | 'UNHELPFUL';
  comment?: string;
  createdAt: string;
}

export interface WidgetConfig {
  id: string;
  workspaceId: string;
  publicId: string;
  botName: string;
  welcomeMessage: string;
  primaryColor: string;
  suggestedQuestions: string[];
  allowedDomains: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UsageQuota {
  id: string;
  workspaceId: string;
  planTier: PlanTier;
  monthlyLimit: number;
  currentUsage: number;
  billingCycleStart: string;
}

export interface AuditLog {
  id: string;
  workspaceId: string;
  userId: string;
  action: string;
  details: string;
  timestamp: string;
}

export type TicketStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'NORMAL' | 'URGENT';

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  workspaceId: string;
  sessionId?: string;
  visitorName: string;
  visitorEmail: string;
  visitorPhone?: string;
  question: string;
  details?: string;
  status: TicketStatus;
  priority: TicketPriority;
  resolutionNotes?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseSchema {
  users: User[];
  workspaces: Workspace[];
  workspaceMembers: WorkspaceMember[];
  categories: FaqCategory[];
  faqs: Faq[];
  chatSessions: ChatSession[];
  chatMessages: ChatMessage[];
  chatFeedback: ChatFeedback[];
  widgetConfigs: WidgetConfig[];
  usageQuotas: UsageQuota[];
  auditLogs: AuditLog[];
  supportTickets: SupportTicket[];
}

