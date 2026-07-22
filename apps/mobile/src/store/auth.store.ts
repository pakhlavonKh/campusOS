import { create } from 'zustand';

export type UserRole = 'student' | 'teacher';

interface UserProfile {
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  avatarText: string;
}

interface AuthState {
  role: UserRole;
  user: UserProfile;
  setRole: (role: UserRole) => void;
}

export const useAuthStore = create<AuthState>((set: any) => ({
  role: 'teacher', // Default to Teacher view to showcase teacher capabilities
  user: {
    name: 'Dr. Sarah Jenkins',
    email: 's.jenkins@campusos.edu',
    role: 'teacher',
    roleTitle: 'Senior Professor — Computer Science',
    avatarText: 'SJ',
  },
  setRole: (role: UserRole) =>
    set({
      role,
      user:
        role === 'teacher'
          ? {
              name: 'Dr. Sarah Jenkins',
              email: 's.jenkins@campusos.edu',
              role: 'teacher',
              roleTitle: 'Senior Professor — Computer Science',
              avatarText: 'SJ',
            }
          : {
              name: 'Alex Student',
              email: 'alex@student.edu',
              role: 'student',
              roleTitle: 'Undergraduate — CS Year 3',
              avatarText: 'AS',
            },
    }),
}));
