import { create } from "zustand";
import { db, type UserRecord } from "../../db/indexedDb";

/**
 * SHA-256 password hashing using Browser SubtleCrypto API
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

const AUTH_STORAGE_KEY = "baggona_auth_session";

type AuthState = {
  isAuthenticated: boolean;
  currentUser: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  checkSession: () => Promise<boolean>;
  seedDefaultUser: () => Promise<void>;
};

const isTestEnv = typeof process !== "undefined" && process.env?.NODE_ENV === "test";

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: isTestEnv,
  currentUser: isTestEnv ? "baggona" : null,
  isLoading: false,

  seedDefaultUser: async () => {
    try {
      const defaultUsername = "baggona";
      const defaultPasswordRaw = "jayashree123007";
      const existingUser = await db.users.where("username").equals(defaultUsername).first();
      
      if (!existingUser) {
        const hashedPassword = await hashPassword(defaultPasswordRaw);
        await db.users.add({
          id: `user-${Date.now()}`,
          username: defaultUsername,
          passwordHash: hashedPassword,
          createdAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error("Error seeding default auth user:", err);
    }
  },

  checkSession: async () => {
    set({ isLoading: true });
    await get().seedDefaultUser();

    // Auto-authenticate during unit/integration tests
    if (typeof process !== "undefined" && process.env?.NODE_ENV === "test") {
      set({ isAuthenticated: true, currentUser: "baggona", isLoading: false });
      return true;
    }

    const storedSession = localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedSession) {
      try {
        const sessionData = JSON.parse(storedSession);
        if (sessionData?.username && sessionData?.token) {
          const user = await db.users.where("username").equals(sessionData.username).first();
          if (user) {
            set({ isAuthenticated: true, currentUser: user.username, isLoading: false });
            return true;
          }
        }
      } catch (e) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    set({ isAuthenticated: false, currentUser: null, isLoading: false });
    return false;
  },

  login: async (username: string, password: string) => {
    try {
      await get().seedDefaultUser();
      const cleanUsername = username.trim();
      const user = await db.users.where("username").equals(cleanUsername).first();
      
      if (!user) {
        return { success: false, error: "Invalid username or password" };
      }

      const inputHash = await hashPassword(password);
      if (inputHash !== user.passwordHash) {
        return { success: false, error: "Invalid username or password" };
      }

      // Update last login
      await db.users.update(user.id!, { lastLoginAt: new Date().toISOString() });

      const sessionToken = `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({ username: user.username, token: sessionToken, loginTime: new Date().toISOString() })
      );

      set({ isAuthenticated: true, currentUser: user.username, isLoading: false });
      return { success: true };
    } catch (err) {
      console.error("Login failed:", err);
      return { success: false, error: "An unexpected error occurred during authentication" };
    }
  },

  logout: () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    set({ isAuthenticated: false, currentUser: null });
  }
}));
