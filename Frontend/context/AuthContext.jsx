import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Minimal client-side auth state bootstrap.
  // Backend integration can later replace this logic.
  useEffect(() => {
    try {
      const raw = localStorage.getItem("auth_user");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const u = parsed?.user ?? parsed;
      const role = parsed?.role ?? u?.role;

      setUser(u || null);
      setIsAuthenticated(Boolean(u));
      setIsAdmin(role === "admin" || role === "Admin");
    } catch (e) {
      // ignore
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isAdmin,
      login: async (username, password) => {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ username, password }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.success) {
          throw new Error(json?.message || "Login gagal");
        }

        // Simpan token dan user data ke localStorage
        localStorage.setItem("token", json.data.token);
        localStorage.setItem("auth_user", JSON.stringify(json.data.user));

        // Update states
        setUser(json.data.user);
        setIsAuthenticated(true);
        setIsAdmin(
          json.data.user.role === "admin" || json.data.user.role === "Admin",
        );

        return json.data;
      },
      logout: async () => {
        const token = localStorage.getItem("token");
        if (token) {
          await fetch("/api/auth/logout", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }).catch(() => {});
        }
        localStorage.removeItem("auth_user");
        localStorage.removeItem("token");
        setUser(null);
        setIsAuthenticated(false);
        setIsAdmin(false);
      },
    }),
    [user, isAuthenticated, isAdmin],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
