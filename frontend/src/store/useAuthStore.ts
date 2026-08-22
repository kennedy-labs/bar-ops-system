import { create } from 'zustand';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

function readStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

interface AuthState {
  token: string | null;
  user: any | null;
  setAuth: (token: string, user: any) => void;
  logout: () => void;
}

// Create the store first so we can initialize it
export const useAuthStore = create<AuthState>((set) => ({
  token: readStorage<string>(TOKEN_KEY),
  user: readStorage<any>(USER_KEY),
  setAuth: (token, user) => {
    writeStorage(TOKEN_KEY, token);
    writeStorage(USER_KEY, user);
    set({ token, user });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    set({ token: null, user: null });
  },
}));
