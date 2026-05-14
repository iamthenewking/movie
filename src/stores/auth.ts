import { type StoredShow } from '@/lib/personalization';
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  type LocalAuthUser,
} from '@/lib/local-auth';
import { create } from 'zustand';

type AuthMode = 'login' | 'register';

interface AuthState {
  user: LocalAuthUser | null;
  hydrated: boolean;
  dialogOpen: boolean;
  mode: AuthMode;
  pendingMyListShow: StoredShow | null;
  hydrate: () => void;
  openDialog: (mode?: AuthMode, show?: StoredShow | null) => void;
  closeDialog: () => void;
  register: (input: {
    name: string;
    email: string;
    password: string;
  }) => LocalAuthUser;
  login: (input: { email: string; password: string }) => LocalAuthUser;
  logout: () => void;
  clearPendingMyListShow: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  hydrated: false,
  dialogOpen: false,
  mode: 'register',
  pendingMyListShow: null,
  hydrate: () =>
    set(() => ({
      user: getCurrentUser(),
      hydrated: true,
    })),
  openDialog: (mode = 'register', show = null) =>
    set(() => ({
      dialogOpen: true,
      mode,
      pendingMyListShow: show,
    })),
  closeDialog: () =>
    set(() => ({
      dialogOpen: false,
      pendingMyListShow: null,
    })),
  register: (input) => {
    const user = registerUser(input);
    set(() => ({
      user,
      dialogOpen: false,
      mode: 'register',
    }));
    return user;
  },
  login: (input) => {
    const user = loginUser(input);
    set(() => ({
      user,
      dialogOpen: false,
      mode: 'login',
    }));
    return user;
  },
  logout: () => {
    logoutUser();
    set(() => ({
      user: null,
      pendingMyListShow: null,
    }));
  },
  clearPendingMyListShow: () =>
    set(() => ({
      pendingMyListShow: null,
    })),
}));
