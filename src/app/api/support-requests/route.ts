import { NextRequest, NextResponse } from 'next/server';
import { supportTicketRepo, workspaceRepo } from '@/lib/db';
import { TicketPriority } from '@/lib/db/types';

export async function POST(req: NextRequest) {
  try {
    const { 
      workspaceId, 
      question, 
      visitorName, 
      visitorEmail, 
      visitorPhone, 
      details, 
      priority = 'NORMAL' as TicketPriority,
      sessionId 
    } = await req.json();

    if (!workspaceId) {
      return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 });
    }

    const workspace = workspaceRepo.getById(workspaceId);
    if (!workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
    }

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    if (!visitorName || typeof visitorName !== 'string' || visitorName.trim().length < 2) {
      return NextResponse.json({ error: 'A valid name is required (at least 2 characters)' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!visitorEmail || typeof visitorEmail !== 'string' || !emailRegex.test(visitorEmail.trim())) {
      return NextResponse.json({ error: 'A valid email address is required so staff can respond' }, { status: 400 });
    }

    const ticket = supportTicketRepo.create(workspaceId, {
      visitorName,
      visitorEmail,
      visitorPhone,
      question,
      details,
      priority,
      sessionId,
    });

    return NextResponse.json({
      success: true,
      ticket: {
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        status: ticket.status,
        createdAt: ticket.createdAt,
      },
      message: `Your support request has been logged as ${ticket.ticketNumber}. A team member from ${workspace.name} will review your inquiry and follow up at ${ticket.visitorEmail}.`,
    }, { status: 201 });
  } catch (error) {
    console.error('Support request submission error:', error);
    return NextResponse.json({ error: 'Failed to submit support request' }, { status: 500 });
  }
}
