"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getMe, logout, superAdminLogin } from "@/lib/fetcher";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [permittedModules, setPermittedModules] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ===== LOAD USER ON REFRESH ===== */
  useEffect(() => {
    const init = async () => {
      try {
        const res = await getMe();
        const u = res.data?.user || res.user;
        setUser(u);
        setRole(u.role);

        if (u.role === "superAdmin") {
          setPermittedModules(["*"]);
        } else {
          setPermittedModules(u.permitted_modules || []);
        }
      } catch {
        setUser(null);
        setRole(null);
        setPermittedModules([]);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  /* ===== LOGIN ===== */
  const login = async (credentials) => {
    const res = await superAdminLogin(credentials);
    const u = res.user;

    setUser(u);
    setRole(u.role);

    if (u.role === "superAdmin") {
      setPermittedModules(["*"]);
    } else {
      setPermittedModules(u.permitted_modules || []);
    }

    window.location.href = "/dashboard";
  };

  /* ===== LOGOUT ===== */
  const logoutApi = async () => {
    await logout();
    setUser(null);
    setRole(null);
    setPermittedModules([]);
    router.replace("/");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        permittedModules,
        loading,
        isAuthenticated: !!user,
        login,
        logoutApi,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
