import { CampusOsClient, SdkConfig } from './client.js';

export * from './client.js';

/**
 * CampusOS SDK Instance providing typed resources.
 * GAP-PKG-02: SRS §20.7, SDD §24.8
 */
export class CampusOsSdk {
  private client: CampusOsClient;

  constructor(config: SdkConfig) {
    this.client = new CampusOsClient(config);
  }

  // Auth endpoints
  auth = {
    login: (credentials: { email: string; password: string }) =>
      this.client.request<{ data: { accessToken: string; refreshToken: string; challengeToken?: string } }>(
        '/api/v1/auth/login',
        { method: 'POST', body: JSON.stringify(credentials) },
      ),
    verifyMfa: (data: { challengeToken: string; code: string }) =>
      this.client.request<{ data: { accessToken: string; refreshToken: string } }>(
        '/api/v1/auth/mfa/verify',
        { method: 'POST', body: JSON.stringify(data) },
      ),
    setupMfa: () =>
      this.client.request<{ data: { provisioningUri: string; qrCode: string; backupCodes: string[] } }>(
        '/api/v1/auth/mfa/setup',
        { method: 'POST' },
      ),
    confirmMfa: (code: string) =>
      this.client.request<{ data: { enabled: boolean } }>(
        '/api/v1/auth/mfa/setup/confirm',
        { method: 'POST', body: JSON.stringify({ code }) },
      ),
    forgotPassword: (email: string) =>
      this.client.request<{ data: { message: string } }>(
        '/api/v1/auth/forgot-password',
        { method: 'POST', body: JSON.stringify({ email }) },
      ),
    resetPassword: (data: { resetToken: string; newPassword: string }) =>
      this.client.request<{ data: { message: string } }>(
        '/api/v1/auth/reset-password',
        { method: 'POST', body: JSON.stringify(data) },
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
    enroll: (courseId: string) =>
      this.client.request<{ data: any }>(`/api/v1/courses/${courseId}/enroll`, { method: 'POST' }),
    markLessonComplete: (courseId: string, lessonId: string) =>
      this.client.request<{ data: any }>(`/api/v1/courses/${courseId}/lessons/${lessonId}/complete`, {
        method: 'POST',
      }),
    getProgress: (courseId: string) =>
      this.client.request<{ data: any }>(`/api/v1/courses/${courseId}/progress`),
  };

  // Platform Admin (admin-desktop only)
  platform = {
    login: (credentials: { email: string; password: string }) =>
      this.client.request<{ data: { accessToken: string; refreshToken: string } }>(
        '/platform/v1/auth/login',
        { method: 'POST', body: JSON.stringify(credentials) },
      ),
  };
}
