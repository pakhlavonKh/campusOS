/**
 * Base API Client wrapping native fetch.
 * Handles base URL mapping, authorization headers, and common error parsing.
 */

const BASE_URL = '/api'; // Proxied to backend via Vite in dev

interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
  requireAuth?: boolean;
}

class ApiError extends Error {
  constructor(public status: number, public message: string, public data?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

export const apiClient = async <T>(endpoint: string, options: FetchOptions = {}): Promise<T> => {
  const { params, requireAuth = true, headers, ...customConfig } = options;

  let url = `${BASE_URL}${endpoint}`;
  
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  const config: RequestInit = {
    ...customConfig,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (requireAuth) {
    // We will retrieve the token from local storage or Zustand store
    const authStateStr = localStorage.getItem('auth-storage');
    if (authStateStr) {
      try {
        const authState = JSON.parse(authStateStr);
        const token = authState?.state?.token;
        if (token) {
          (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
        }
      } catch (e) {
        console.error('Failed to parse auth state', e);
      }
    }
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    let errorMessage = response.statusText;
    let errorData = null;
    try {
      errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      // Not JSON
    }

    if (response.status === 401) {
      // Global 401 handler (could trigger a redirect or token refresh here)
      console.warn('Unauthorized access, please login again.');
      // In a real app, we might dispatch a logout action to our Zustand store
    }

    throw new ApiError(response.status, errorMessage, errorData);
  }

  // Handle empty responses (e.g. 204 No Content)
  const text = await response.text();
  return text ? JSON.parse(text) : ({} as T);
};
