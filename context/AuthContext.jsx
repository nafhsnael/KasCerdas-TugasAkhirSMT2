import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Minimal client-side auth state bootstrap.
  // Backend integration can later replace this logic.
  useEffect(() => {
    try {
      const raw = localStorage.getItem('auth_user');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const u = parsed?.user ?? parsed;
      const role = parsed?.role ?? u?.role;

      setUser(u || null);
      setIsAuthenticated(Boolean(u));
      setIsAdmin(role === 'admin' || role === 'Admin');
    } catch (e) {
      // ignore
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isAdmin,
      // Placeholders for future implementation
      login: async () => {},
      logout: async () => {
        localStorage.removeItem('auth_user');
        setUser(null);
        setIsAuthenticated(false);
        setIsAdmin(false);
      },
    }),
    [user, isAuthenticated, isAdmin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

