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

type AuthData = {
  token: string | null;
  refreshToken: string | null;
};

type AuthContextValue = {
  token: string | null;
  refreshToken: string | null;
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
  setRefreshToken: React.Dispatch<React.SetStateAction<string | null>>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // ✅ Initialize with null-safe values
  const [token, setToken] = useState<string | null>(() => getAuthData()?.token ?? null);
  const [refreshToken, setRefreshToken] = useState<string | null>(
    () => getAuthData()?.refreshToken ?? null
  );

  // Keep state in sync if something else updates localStorage (rare but safe)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "ire_admin_auth") {
        const data = getAuthData();
        setToken(data?.token ?? null);
        setRefreshToken(data?.refreshToken ?? null);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      if (!res.data?.success) {
        throw new Error(res.data?.message || "Login failed");
      }
      const t = res.data.data?.token ?? null;          // ✅ null, not undefined
      const rt = res.data.data?.refreshToken ?? null;  // ✅ null, not undefined

      setToken(t);
      setRefreshToken(rt);
      setAuthData({ ...(getAuthData() || {}), token: t, refreshToken: rt });
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
    toast.success("Logged out");
  };

  const value = useMemo<AuthContextValue>(
    () => ({ token, refreshToken, setToken, setRefreshToken, login, logout }),
    [token, refreshToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};
