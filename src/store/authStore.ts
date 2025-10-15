import { create } from 'zustand';

interface AuthStore {
  accessToken: string | null;
  userEmail: string | null;
  isAuthenticated: boolean;

  setAccessToken: (token: string | null) => void;
  setUserEmail: (email: string | null) => void;
  setAuthenticated: (authenticated: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  accessToken: localStorage.getItem('google_access_token'),
  userEmail: localStorage.getItem('user_email'),
  isAuthenticated: !!localStorage.getItem('google_access_token'),

  setAccessToken: (token) => {
    if (token) {
      localStorage.setItem('google_access_token', token);
    } else {
      localStorage.removeItem('google_access_token');
    }
    set({ accessToken: token, isAuthenticated: !!token });
  },

  setUserEmail: (email) => {
    if (email) {
      localStorage.setItem('user_email', email);
    } else {
      localStorage.removeItem('user_email');
    }
    set({ userEmail: email });
  },

  setAuthenticated: (authenticated) => set({ isAuthenticated: authenticated }),

  logout: () => {
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('user_email');
    set({ accessToken: null, userEmail: null, isAuthenticated: false });
  }
}));
