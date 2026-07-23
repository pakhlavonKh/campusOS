import { apiClient } from '../client';

export interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

export interface Message {
  id: string;
  sender: string;
  content: string;
  time: string;
  isOwn: boolean;
}

export const messagingService = {
  getConversations: (organizationId?: string) => {
    return apiClient<{ success: boolean; data: Conversation[] }>('/messaging/conversations', {
      headers: organizationId ? { 'x-tenant-id': organizationId } : {},
    });
  },

  getMessages: (conversationId: string, organizationId?: string) => {
    return apiClient<{ success: boolean; data: Message[] }>(`/messaging/conversations/${conversationId}/messages`, {
      headers: organizationId ? { 'x-tenant-id': organizationId } : {},
    });
  },

  sendMessage: (conversationId: string, content: string, organizationId?: string) => {
    return apiClient<{ success: boolean; data: Message }>(`/messaging/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: organizationId ? { 'x-tenant-id': organizationId } : {},
      body: JSON.stringify({ content }),
    });
  },

  createConversation: (recipientName: string, organizationId?: string) => {
    return apiClient<{ success: boolean; data: Conversation }>('/messaging/conversations', {
      method: 'POST',
      headers: organizationId ? { 'x-tenant-id': organizationId } : {},
      body: JSON.stringify({ recipientName }),
    });
  },
};
