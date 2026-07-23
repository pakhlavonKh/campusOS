export interface UploadResponse {
  success: boolean;
  data: {
    url: string;
    fileName: string;
    mimeType: string;
    size: number;
  };
  timestamp: string;
}

export const storageService = {
  uploadFile: async (file: File, organizationId?: string): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const headers: Record<string, string> = {};
    if (organizationId) {
      headers['x-tenant-id'] = organizationId;
    }

    const authStateStr = localStorage.getItem('auth-storage');
    if (authStateStr) {
      try {
        const authState = JSON.parse(authStateStr);
        const token = authState?.state?.token;
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      } catch (e) {
        console.error('Failed to parse auth state', e);
      }
    }

    const response = await fetch('/api/v1/storage/upload', {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = response.statusText;
      try {
        const errJson = await response.json();
        if (errJson.message) errorMessage = errJson.message;
      } catch (e) {
        // Not JSON
      }
      throw new Error(`Upload failed: ${errorMessage}`);
    }

    return response.json();
  },
};
