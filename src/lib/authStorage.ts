export type AuthUser = {
  id: string;
  name: string;
  city: string;
  email: string;
  phone: string;
  active: boolean;
  level: string;
};

export type AuthSession = {
  expiresAt: string | null;
};

const USER_KEY = "auth:user";
const SESSION_KEY = "auth:session";

export const authStorage = {
  getUser(): AuthUser | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  },

  setUser(user: AuthUser) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  removeUser() {
    localStorage.removeItem(USER_KEY);
  },

  getSession(): AuthSession | null {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as AuthSession;
    } catch {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
  },

  setSession(session: AuthSession) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  },

  removeSession() {
    localStorage.removeItem(SESSION_KEY);
  },

  clear() {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(SESSION_KEY);
  },

  isAuthenticated() {
    return Boolean(this.getUser()) && this.isSessionValid();
  },

  isSessionValid() {
    const session = this.getSession();

    if (!session?.expiresAt) return false;

    const expiresAt = new Date(session.expiresAt).getTime();

    if (Number.isNaN(expiresAt)) return false;

    return expiresAt > Date.now();
  },
};