import { createContext, useContext, useState, type ReactNode } from "react";
import { api } from "@/lib/api";

interface AuthUser {
  user_id: number;
  username: string;
  role: "super_admin" | "store_manager" | "fulfillment";
}

interface LoginResponse {
  message: string;
  token: string;
  user: AuthUser;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function loadStoredUser(): AuthUser | null {
  const raw = localStorage.getItem("gg-user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadStoredUser);

  const login = async (username: string, password: string) => {
    const data = await api.post<LoginResponse>("/auth/login", { username, password });
    localStorage.setItem("gg-token", data.token);
    localStorage.setItem("gg-user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("gg-token");
    localStorage.removeItem("gg-user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
