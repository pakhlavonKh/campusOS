import { apiClient } from '../client';

export interface LoginResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
    };
    organizationId: string;
    theme?: Record<string, string>;
  };
}

export const authService = {
  login: (credentials: { email: string; password: string }) => {
    return apiClient<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      requireAuth: false, // Don't need token to login
    });
  },

  logout: () => {
    return apiClient('/auth/logout', {
      method: 'POST',
    });
  },
  
  // Future: refreshToken, resetPassword, etc.
};
