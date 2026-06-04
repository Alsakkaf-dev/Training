import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { api } from "../lib/api";
import { connectRealtime, disconnectRealtime, onRealtime } from "../lib/realtime";
import { toast } from "../components/Toast";

const TOKEN_KEY = "utmb_token";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unread, setUnread] = useState(0);
  const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
  const bootRef = useRef(false);

  const refreshUnread = useCallback(async () => {
    try {
      const { data } = await api.get("/notifications");
      setUnread(data.unread || 0);
    } catch {
      /* ignore — unread badge is best-effort */
    }
  }, []);

  const finishLogin = useCallback(
    (tok, u) => {
      localStorage.setItem(TOKEN_KEY, tok);
      setUser(u);
      connectRealtime(tok);
      refreshUnread();
    },
    [refreshUnread]
  );

  const login = useCallback(
    async (email, password) => {
      const { data } = await api.post("/auth/login", { email, password });
      finishLogin(data.token, data.user);
      return data.user;
    },
    [finishLogin]
  );

  const register = useCallback(
    async (payload) => {
      const { data } = await api.post("/auth/register", payload);
      finishLogin(data.token, data.user);
      return data.user;
    },
    [finishLogin]
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      /* ignore */
    }
    localStorage.removeItem(TOKEN_KEY);
    disconnectRealtime();
    setUser(null);
    setUnread(0);
  }, []);

  // Bootstrap the session from a stored token on first mount.
  useEffect(() => {
    if (bootRef.current) return;
    bootRef.current = true;
    const tok = localStorage.getItem(TOKEN_KEY);
    if (!tok) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const { data } = await api.get("/auth/me");
        setUser(data.user);
        connectRealtime(tok);
        refreshUnread();
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        disconnectRealtime();
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshUnread]);

  // Live notifications: bump the badge and surface a toast.
  useEffect(() => {
    const off = onRealtime("notification.new", (payload) => {
      setUnread((n) => n + 1);
      if (payload && payload.message) toast.info(payload.message);
    });
    return off;
  }, []);

  const value = { user, setUser, loading, unread, setUnread, refreshUnread, login, register, logout, token };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

export default AuthContext;
