import { apiClient } from '../client';

export interface Thread {
  id: string;
  title: string;
  author: string;
  avatar: string;
  replies: number;
  views: number;
  lastActivity: string;
  isPinned: boolean;
  tags: string[];
}

export const collaborationService = {
  getThreads: (organizationId?: string) => {
    return apiClient<{ success: boolean; data: Thread[] }>('/collaboration/threads', {
      headers: organizationId ? { 'x-tenant-id': organizationId } : {},
    });
  },

  createThread: (data: { title: string; tags: string[] }, organizationId?: string) => {
    return apiClient<{ success: boolean; data: Thread }>('/collaboration/threads', {
      method: 'POST',
      headers: organizationId ? { 'x-tenant-id': organizationId } : {},
      body: JSON.stringify(data),
    });
  },

  upvoteThread: (threadId: string, organizationId?: string) => {
    return apiClient<{ success: boolean; data: Thread }>(`/collaboration/threads/${threadId}/upvote`, {
      method: 'POST',
      headers: organizationId ? { 'x-tenant-id': organizationId } : {},
    });
  },
};
