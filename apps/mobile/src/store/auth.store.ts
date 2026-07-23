import { create } from 'zustand';
import { apiFetch } from '../api/client';

export type UserRole = 'admin' | 'teacher' | 'assistant_teacher' | 'student' | 'parent';

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  avatarText: string;
}

interface AuthState {
  role: UserRole;
  user: UserProfile;
  loading: boolean;
  setAuth: (user: Partial<UserProfile> & { role?: UserRole }) => void;
  fetchProfile: () => Promise<void>;
  signOut: () => void;
}

const getRoleTitle = (role: string): string => {
  switch (role.toLowerCase()) {
    case 'admin':
    case 'super_admin':
    case 'org_admin':
    case 'branch_admin':
      return 'Administrator';
    case 'teacher':
    case 'instructor':
      return 'Faculty / Instructor';
    case 'assistant_teacher':
      return 'Assistant Teacher';
    case 'parent':
      return 'Parent / Guardian';
    default:
      return 'Student Account';
  }
};

const defaultUser: UserProfile = {
  name: 'User Account',
  email: 'user@campusos.edu',
  role: 'student',
  roleTitle: 'Student Account',
  avatarText: 'UA',
};

export const useAuthStore = create<AuthState>((set, get) => ({
  role: 'student',
  user: defaultUser,
  loading: false,

  setAuth: (userData) => {
    const role: UserRole = userData.role || 'student';
    const name = userData.name || 'User Account';
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'UA';

    set({
      role,
      user: {
        id: userData.id,
        name,
        email: userData.email || 'user@campusos.edu',
        role,
        roleTitle: userData.roleTitle || getRoleTitle(role),
        avatarText: userData.avatarText || initials,
      },
    });
  },

  fetchProfile: async () => {
    set({ loading: true });
    try {
      const res = await apiFetch('/users/me');
      if (res.success && res.data) {
        const u = res.data;
        const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || 'User Account';
        const primaryRole: UserRole = (u.roles?.[0] || u.role || 'student').toLowerCase() as UserRole;
        const initials = name
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .substring(0, 2)
          .toUpperCase() || 'UA';

        get().setAuth({
          id: u.id,
          name,
          email: u.email,
          role: primaryRole,
          roleTitle: getRoleTitle(primaryRole),
          avatarText: initials,
        });
      }
    } catch (err) {
      console.warn('[Mobile AuthStore] Failed to load backend profile:', err);
    } finally {
      set({ loading: false });
    }
  },

  signOut: () => {
    set({
      role: 'student',
      user: defaultUser,
      loading: false,
    });
  },
}));
