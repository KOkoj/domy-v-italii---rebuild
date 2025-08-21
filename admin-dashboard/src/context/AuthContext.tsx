// src/context/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { api, normalizeError, getAuthData, setAuthData, clearAuthData } from "@/lib/api";
import toast from "react-hot-toast";

type User = {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
} | null;

type AuthContextValue = {
  // state
  token: string | null;
  refreshToken: string | null;
  user: User;
  isAuthenticated: boolean;
  isLoading: boolean;
  // setters
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
  setRefreshToken: React.Dispatch<React.SetStateAction<string | null>>;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  // actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // hydrate from localStorage (safe-null)
  const initial = getAuthData();
  const [token, setToken] = useState<string | null>(initial?.token ?? null);
  const [refreshToken, setRefreshToken] = useState<string | null>(initial?.refreshToken ?? null);
  const [user, setUser] = useState<User>(initial?.user ?? null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // one-time hydration (covers SSR/first paint)
  useEffect(() => {
    const data = getAuthData();
    setToken(data?.token ?? null);
    setRefreshToken(data?.refreshToken ?? null);
    setUser(data?.user ?? null);
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      if (!res.data?.success) throw new Error(res.data?.message || "Login failed");

      const t = res.data?.data?.token ?? null;
      const rt = res.data?.data?.refreshToken ?? null;
      const u: User = res.data?.data?.user ?? null;

      setToken(t);
      setRefreshToken(rt);
      setUser(u);

      // persist all pieces so Provider rehydrates consistently
      const prev = getAuthData() || {};
      setAuthData({ ...prev, token: t, refreshToken: rt, user: u });

      toast.success("Logged in");
    } catch (error: unknown) {
      const { message } = normalizeError(error);
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    clearAuthData();
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    toast.success("Logged out");
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      refreshToken,
      user,
      isAuthenticated: !!token,
      isLoading,
      setToken,
      setRefreshToken,
      setUser,
      login,
      logout,
    }),
    [token, refreshToken, user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
