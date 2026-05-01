import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('lx_token');
    const u = localStorage.getItem('lx_user');
    if (t && u) {
      try { setUser(JSON.parse(u)); } catch { /* ignore bad JSON */ }
    }
    setLoading(false);
  }, []);

  const save = (token, user) => {
    localStorage.setItem('lx_token', token);
    localStorage.setItem('lx_user', JSON.stringify(user));
    setUser(user);
  };

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    save(data.token, data.user);
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    save(data.token, data.user);
  };

  const logout = () => {
    localStorage.removeItem('lx_token');
    localStorage.removeItem('lx_user');
    setUser(null);
  };

  return (
    <Ctx.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
