import { create } from 'zustand';

export type UserRole = 'admin' | 'teacher' | 'assistant_teacher' | 'student' | 'parent';

export interface UserProfile {
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

const roleProfiles: Record<UserRole, UserProfile> = {
  admin: {
    name: 'Eleanor Vance',
    email: 'e.vance@campusos.edu',
    role: 'admin',
    roleTitle: 'Branch Administrator — Main Campus',
    avatarText: 'EV',
  },
  teacher: {
    name: 'Dr. Sarah Jenkins',
    email: 's.jenkins@campusos.edu',
    role: 'teacher',
    roleTitle: 'Senior Professor — Computer Science',
    avatarText: 'SJ',
  },
  assistant_teacher: {
    name: 'Marcus Brody',
    email: 'm.brody@campusos.edu',
    role: 'assistant_teacher',
    roleTitle: 'Assistant Teacher — Physics & CS',
    avatarText: 'MB',
  },
  student: {
    name: 'Alex Student',
    email: 'alex@student.edu',
    role: 'student',
    roleTitle: 'Undergraduate — CS Year 3',
    avatarText: 'AS',
  },
  parent: {
    name: 'David Student (Parent)',
    email: 'david.parent@gmail.com',
    role: 'parent',
    roleTitle: 'Parent / Guardian — Alex Student',
    avatarText: 'DS',
  },
};

export const useAuthStore = create<AuthState>((set: any) => ({
  role: 'teacher',
  user: roleProfiles.teacher,
  setRole: (role: UserRole) =>
    set({
      role,
      user: roleProfiles[role] || roleProfiles.teacher,
    }),
}));
