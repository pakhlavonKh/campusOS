import { Platform } from 'react-native';

/**
 * Returns the backend base URL.
 * Supports EXPO_PUBLIC_API_URL environment variable for physical device testing over LAN.
 * Defaults to 10.0.2.2:3000 for Android Emulator and localhost:3000 for iOS Simulator / Web.
 */
export const getBackendUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  return Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
};

// Demo Offline Fallback Data for Mobile Physical Device Testing
const MOCK_API_RESPONSES: Record<string, any> = {
  '/users/me': {
    id: 'u_mobile_01',
    firstName: 'Alex',
    lastName: 'Johnson',
    email: 'alex.student@campusos.edu',
    roles: ['student'],
    role: 'student',
  },
  '/courses': [
    { id: 'c1', code: 'CS301', title: 'Data Structures & Algorithms', instructor: 'Dr. Smith', progress: 85 },
    { id: 'c2', code: 'PHYS101', title: 'General Physics & Mechanics', instructor: 'Prof. Adams', progress: 70 },
    { id: 'c3', code: 'MATH202', title: 'Multivariable Calculus', instructor: 'Dr. Taylor', progress: 90 },
  ],
  '/attendance/stats': {
    date: new Date().toISOString().split('T')[0],
    records: [
      { id: 'r1', student: 'Alex Johnson', status: 'present', avatar: 'AJ' },
    ],
  },
};

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string }> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const baseUrl = getBackendUrl();
  const url = `${baseUrl}/api/v1${cleanEndpoint}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout for fast fallback

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      signal: controller.signal,
      ...options,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (err: any) {
    // Offline / Unreachable fallback logic for physical mobile devices
    const baseKey = cleanEndpoint.split('?')[0];
    const fallbackData = MOCK_API_RESPONSES[baseKey] || MOCK_API_RESPONSES[cleanEndpoint];

    if (fallbackData) {
      console.log(`[Mobile API Fallback] Serving offline dataset for ${cleanEndpoint}`);
      return { success: true, data: fallbackData as T };
    }

    console.warn(`[Mobile API Warning] ${cleanEndpoint} unreachable. Using offline mode.`);
    return { success: false, message: err.message };
  }
}
