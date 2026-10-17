import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, AppRole, AuthUser } from '../services/retailApiService';

/** Roles the backend allows to create/edit/deactivate products. Everyone else is Staff. */
const ADMIN_ROLES = ['Admin', 'SuperAdmin', 'StoreManager'];

interface AuthState {
  user: AuthUser | null;
  role: AppRole | null;
  roleLabel: string;
  isAdmin: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
}

const Ctx = createContext<AuthState | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => (api.getToken() ? api.getStoredUser() : null));

  const logout = useCallback(() => {
    api.clearSession();
    setUser(null);
  }, []);

  useEffect(() => {
    api.setUnauthorizedHandler(logout);
    return () => api.setUnauthorizedHandler(null);
  }, [logout]);

  const login = useCallback(async (identifier: string, password: string) => {
    setUser(await api.login(identifier, password));
  }, []);

  const value = useMemo<AuthState>(() => {
    const isAdmin = !!user && ADMIN_ROLES.includes(user.role);
    return {
      user,
      isAdmin,
      role: user ? (isAdmin ? 'Admin' : 'Staff') : null,
      roleLabel: !user ? '' : user.role === 'StoreManager' ? 'Store manager' : isAdmin ? 'Admin' : 'Staff',
      login,
      logout,
    };
  }, [user, login, logout]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useAuth = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth must be used inside AuthProvider');
  return v;
};
