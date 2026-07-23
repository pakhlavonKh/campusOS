import { apiClient } from '../client';

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  roles?: string[];
  status?: string;
}

export interface UserMembership {
  id: string;
  userId: string;
  organizationId: string;
  branchId?: string;
  status: 'active' | 'suspended' | 'inactive';
  user?: UserProfile;
}

export const usersService = {
  getProfile: () => {
    return apiClient<{ success: boolean; data: UserProfile }>('/users/me');
  },

  updateProfile: (data: Partial<UserProfile>) => {
    return apiClient<{ success: boolean; data: UserProfile }>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  getMyMemberships: () => {
    return apiClient<{ success: boolean; data: UserMembership[] }>('/users/me/memberships');
  },

  createMembership: (data: { userId: string; organizationId: string; branchId?: string }) => {
    return apiClient<{ success: boolean; data: UserMembership }>('/users/memberships', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateMembershipStatus: (id: string, status: 'active' | 'suspended' | 'inactive') => {
    return apiClient<{ success: boolean; data: UserMembership }>(`/users/memberships/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
};
