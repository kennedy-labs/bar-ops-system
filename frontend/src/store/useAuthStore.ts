import { create } from 'zustand';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';
const DEMO_USER_KEY = 'demo_user';

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

// Auto-login as demo user on page load (security disabled for development)
if (typeof window !== 'undefined') {
  const storedUser = readStorage<any>(USER_KEY);
  const storedToken = readStorage<string>(TOKEN_KEY);
  const demoUser = readStorage<any>(DEMO_USER_KEY);

  if (!storedUser || !storedToken) {
    // Create a demo user session
    const fakeUser = demoUser || {
      id: 'demo-user-1',
      name: 'worker1',
      businessId: 'joypub',
      role: 'WORKER',
    };
    const fakeToken = storedToken || 'demo-token-' + Date.now();
    writeStorage(TOKEN_KEY, fakeToken);
    writeStorage(USER_KEY, fakeUser);
    writeStorage(DEMO_USER_KEY, fakeUser);
    // We can't call set() here without the store instance, but localStorage will be read on next load
  }
}
