import { apiClient } from '../client';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName?: string;
  classId?: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
}

export interface AttendanceStats {
  present: number;
  absent: number;
  late: number;
  excused: number;
  total: number;
}

export const attendanceService = {
  getDailyStats: (date: string, organizationId?: string) => {
    return apiClient<{ success: boolean; data: AttendanceStats }>('/attendance/stats', {
      params: { date },
      headers: organizationId ? { 'x-tenant-id': organizationId } : {},
    });
  },

  getClassAttendance: (classId: string, date: string, organizationId?: string) => {
    return apiClient<{ success: boolean; data: AttendanceRecord[] }>(
      `/attendance/classes/${classId}`,
      {
        params: { date },
        headers: organizationId ? { 'x-tenant-id': organizationId } : {},
      },
    );
  },

  getStudentAttendance: (studentId: string, params?: { startDate?: string; endDate?: string }, organizationId?: string) => {
    return apiClient<{ success: boolean; data: AttendanceRecord[] }>(
      `/attendance/students/${studentId}`,
      {
        params: params as Record<string, string>,
        headers: organizationId ? { 'x-tenant-id': organizationId } : {},
      },
    );
  },

  recordAttendance: (
    data: {
      studentId: string;
      classId?: string;
      date: string;
      status: 'present' | 'absent' | 'late' | 'excused';
      notes?: string;
    },
    organizationId?: string,
  ) => {
    return apiClient<{ success: boolean; data: AttendanceRecord }>('/attendance', {
      method: 'POST',
      headers: organizationId ? { 'x-tenant-id': organizationId } : {},
      body: JSON.stringify(data),
    });
  },
};
