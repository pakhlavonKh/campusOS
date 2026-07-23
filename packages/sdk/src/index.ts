import { CampusOsClient, SdkConfig } from './client.js';

export * from './client.js';

/**
 * CampusOS SDK Instance providing typed resources across all domain contexts.
 * GAP-PKG-02: SRS §20.7, SDD §24.8
 */
export class CampusOsSdk {
  private client: CampusOsClient;

  constructor(config: SdkConfig) {
    this.client = new CampusOsClient(config);
  }

  // Auth & Session endpoints
  auth = {
    login: (credentials: { email: string; password: string }) =>
      this.client.request<{ data: { accessToken: string; refreshToken: string; user: any; organizationId: string; memberships?: any[] } }>(
        '/api/v1/auth/login',
        { method: 'POST', body: JSON.stringify(credentials) },
      ),
    verifyMfa: (data: { challengeToken: string; code: string }) =>
      this.client.request<{ data: { accessToken: string; refreshToken: string } }>(
        '/api/v1/auth/mfa/verify',
        { method: 'POST', body: JSON.stringify(data) },
      ),
    switchContext: (membershipId: string) =>
      this.client.request<{ data: { accessToken: string; activeMembership: any } }>(
        '/api/v1/auth/context/switch',
        { method: 'POST', body: JSON.stringify({ membershipId }) },
      ),
    forgotPassword: (email: string) =>
      this.client.request<{ data: { message: string } }>(
        '/api/v1/auth/forgot-password',
        { method: 'POST', body: JSON.stringify({ email }) },
      ),
  };

  // LMS Courses endpoints
  courses = {
    list: (params?: { page?: number; limit?: number }) =>
      this.client.request<{ data: any[]; total: number }>(
        `/api/v1/courses${params ? `?page=${params.page || 1}&limit=${params.limit || 20}` : ''}`,
      ),
    get: (id: string) => this.client.request<{ data: any }>(`/api/v1/courses/${id}`),
    create: (data: any) =>
      this.client.request<{ data: any }>('/api/v1/courses', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  };

  // Attendance endpoints
  attendance = {
    getStats: (date: string) =>
      this.client.request<{ data: { date: string; records: any[] } }>(`/api/v1/attendance/stats?date=${date}`),
    record: (payload: { studentId: string; date: string; status: string }) =>
      this.client.request<{ data: any }>('/api/v1/attendance', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  };

  // Messaging endpoints
  messaging = {
    listConversations: () => this.client.request<{ data: any[] }>('/api/v1/messaging/conversations'),
    getMessages: (conversationId: string) =>
      this.client.request<{ data: any[] }>(`/api/v1/messaging/conversations/${conversationId}/messages`),
    sendMessage: (conversationId: string, content: string) =>
      this.client.request<{ data: any }>(`/api/v1/messaging/conversations/${conversationId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      }),
  };

  // Users & Memberships endpoints
  users = {
    getMyMemberships: () => this.client.request<{ data: any[] }>('/api/v1/users/me/memberships'),
    getProfile: () => this.client.request<{ data: any }>('/api/v1/users/me'),
  };

  // Organizations endpoints
  organizations = {
    list: () => this.client.request<{ data: any[] }>('/api/v1/organizations'),
    getPublicWhiteLabel: (slug: string) =>
      this.client.request<{ data: any }>(`/api/v1/organizations/${slug}/white-label/public`),
  };
}
