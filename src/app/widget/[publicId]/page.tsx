import React from 'react';
import { notFound } from 'next/navigation';
import { widgetRepo } from '@/lib/db';
import { ChatWindow } from '@/components/chatbot/ChatWindow';

export default async function PublicWidgetPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  const config = widgetRepo.getByPublicId(publicId);

  if (!config) {
    notFound();
  }

  return (
    <div className="w-screen h-screen m-0 p-0 overflow-hidden bg-transparent">
      <ChatWindow
        workspaceId={config.workspaceId}
        botName={config.botName}
        welcomeMessage={config.welcomeMessage}
        primaryColor={config.primaryColor}
        suggestedQuestions={config.suggestedQuestions}
        channel="WIDGET"
        isEmbedded={true}
      />
    </div>
  );
}
