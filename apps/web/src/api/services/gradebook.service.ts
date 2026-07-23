import { apiClient } from '../client';

export interface GradeCategory {
  id: string;
  name: string;
  weight: number;
  courseId: string;
}

export interface GradeEntry {
  id: string;
  studentId: string;
  assignmentId?: string;
  score: number | null;
  maxScore?: number;
  reason?: string;
}

export interface StudentCourseGrade {
  entries: GradeEntry[];
  overallGrade: number;
}

export const gradebookService = {
  getCategories: (courseId: string, organizationId?: string) => {
    return apiClient<{ success: boolean; data: GradeCategory[] }>(`/gradebook/${courseId}/categories`, {
      headers: organizationId ? { 'x-tenant-id': organizationId } : {},
    });
  },

  createCategory: (
    courseId: string,
    data: { name: string; weight: number },
    organizationId?: string,
  ) => {
    return apiClient<{ success: boolean; data: GradeCategory }>(`/gradebook/${courseId}/categories`, {
      method: 'POST',
      headers: organizationId ? { 'x-tenant-id': organizationId } : {},
      body: JSON.stringify(data),
    });
  },

  recordGrade: (
    entryId: string,
    data: { score: number; reason?: string },
    organizationId?: string,
  ) => {
    return apiClient<{ success: boolean; data: GradeEntry }>(`/gradebook/entries/${entryId}/grade`, {
      method: 'POST',
      headers: organizationId ? { 'x-tenant-id': organizationId } : {},
      body: JSON.stringify(data),
    });
  },

  getStudentGrades: (courseId: string, studentId: string, organizationId?: string) => {
    return apiClient<{ success: boolean; data: StudentCourseGrade }>(
      `/gradebook/${courseId}/student/${studentId}`,
      {
        headers: organizationId ? { 'x-tenant-id': organizationId } : {},
      },
    );
  },
};
