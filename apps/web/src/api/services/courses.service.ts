import { apiClient } from '../client';

export interface Course {
  id: string;
  title: string;
  subject: string;
  format: string;
  status: 'draft' | 'published' | 'archived';
  organizationId: string;
}

export interface CoursesResponse {
  success: boolean;
  data: Course[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

export const coursesService = {
  getCourses: (organizationId: string, params?: { page?: number; limit?: number }) => {
    return apiClient<CoursesResponse>('/courses', {
      method: 'GET',
      headers: {
        'x-tenant-id': organizationId, // Required by our @TenantId decorator
      },
      params: params as Record<string, string>,
    });
  },

  createCourse: (organizationId: string, data: Partial<Course>) => {
    return apiClient<{ success: boolean; data: Course }>('/courses', {
      method: 'POST',
      headers: {
        'x-tenant-id': organizationId,
      },
      body: JSON.stringify(data),
    });
  },
};
