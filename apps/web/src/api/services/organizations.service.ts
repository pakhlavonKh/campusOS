import { apiClient } from '../client';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  billingPlan?: string;
  domain?: string;
  status?: string;
  userCount?: number;
}

export interface WhiteLabelConfig {
  tier?: string;
  tokens?: {
    colorPrimary?: string;
    colorSecondary?: string;
    fontFamily?: string;
    logoUrl?: string | null;
    faviconUrl?: string | null;
    customDomain?: string | null;
  };
  layoutVariant?: string | null;
  customBuildRef?: string | null;
}

export const organizationsService = {
  listOrganizations: () => {
    return apiClient<{ success: boolean; data: Organization[] }>('/organizations');
  },

  register: (data: { name: string; slug: string; billingPlan?: string }) => {
    return apiClient<{ success: boolean; data: Organization }>('/organizations', {
      method: 'POST',
      requireAuth: false,
      body: JSON.stringify(data),
    });
  },

  getMyOrg: (tenantId?: string) => {
    return apiClient<{ success: boolean; data: Organization }>('/organizations/me', {
      headers: tenantId ? { 'x-tenant-id': tenantId } : {},
    });
  },

  updateMyOrg: (data: Partial<Organization>, tenantId?: string) => {
    return apiClient<{ success: boolean; data: Organization }>('/organizations/me', {
      method: 'PUT',
      headers: tenantId ? { 'x-tenant-id': tenantId } : {},
      body: JSON.stringify(data),
    });
  },

  getWhiteLabel: (tenantId?: string) => {
    return apiClient<{ success: boolean; data: WhiteLabelConfig }>('/organizations/me/white-label', {
      headers: tenantId ? { 'x-tenant-id': tenantId } : {},
    });
  },

  updateWhiteLabel: (config: Record<string, any>, tenantId?: string) => {
    return apiClient<{ success: boolean; data: WhiteLabelConfig }>('/organizations/me/white-label', {
      method: 'PUT',
      headers: tenantId ? { 'x-tenant-id': tenantId } : {},
      body: JSON.stringify(config),
    });
  },

  getFeatures: (tenantId?: string) => {
    return apiClient<{ success: boolean; data: Record<string, boolean> }>('/organizations/me/features', {
      headers: tenantId ? { 'x-tenant-id': tenantId } : {},
    });
  },
};
