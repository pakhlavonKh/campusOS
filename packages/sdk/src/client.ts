/**
 * CampusOS Base API Client with automatic 401 token refresh interception.
 * SDD §24.8.2, GAP-PKG-02
 */

export interface SdkConfig {
  baseUrl: string;
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  onTokensRefreshed?: (tokens: { accessToken: string; refreshToken: string }) => void;
  onAuthError?: () => void;
}

export class CampusOsClient {
  private config: SdkConfig;

  constructor(config: SdkConfig) {
    this.config = config;
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const token = this.config.getAccessToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let response = await fetch(url, { ...options, headers });

    // Automatic token refresh on 401
    if (response.status === 401 && this.config.getRefreshToken()) {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${this.config.getAccessToken()}`;
        response = await fetch(url, { ...options, headers });
      } else {
        this.config.onAuthError?.();
        throw new Error('Session expired. Please log in again.');
      }
    }

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorBody.message || `API Error ${response.status}`);
    }

    return response.json();
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = this.config.getRefreshToken();
      if (!refreshToken) return false;

      const res = await fetch(`${this.config.baseUrl}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) return false;
      const data = await res.json();
      if (data.data?.accessToken) {
        this.config.onTokensRefreshed?.(data.data);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}
