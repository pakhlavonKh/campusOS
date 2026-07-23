import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface StudentParentUser {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'parent';
  avatar: string;
  organizationName: string;
  children?: { id: string; name: string; grade: string; avatar: string }[];
  activeChildId?: string;
}

interface PortalAuthState {
  token: string | null;
  user: StudentParentUser | null;
  activeRole: 'student' | 'parent';
  setAuth: (token: string, user: StudentParentUser) => void;
  switchRole: (role: 'student' | 'parent') => void;
  setActiveChild: (childId: string) => void;
  logout: () => void;
}

export const usePortalAuthStore = create<PortalAuthState>()(
  persist(
    (set, get) => ({
      token: 'demo_portal_token_123',
      user: {
        id: 'u_student_01',
        email: 'alex.student@campusos.edu',
        name: 'Alex Johnson',
        role: 'student',
        avatar: 'AJ',
        organizationName: 'Apex Academy',
        children: [
          { id: 'c1', name: 'Alex Johnson', grade: 'Grade 11', avatar: 'AJ' },
          { id: 'c2', name: 'Mia Johnson', grade: 'Grade 8', avatar: 'MJ' },
        ],
        activeChildId: 'c1',
      },
      activeRole: 'student',

      setAuth: (token, user) => set({ token, user, activeRole: user.role }),
      switchRole: (role) => set({ activeRole: role }),
      setActiveChild: (activeChildId) =>
        set((state) => ({
          user: state.user ? { ...state.user, activeChildId } : null,
        })),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: 'portal-auth-storage',
    }
  )
);
