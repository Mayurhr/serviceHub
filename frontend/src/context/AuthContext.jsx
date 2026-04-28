import { createContext, useContext, useState } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const [loading, setLoading] = useState(false);

  const login = async (creds) => {
    setLoading(true);
    try {
      const { data } = await authAPI.login(creds);
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      return { success: true };
    } catch (e) { return { success: false, message: e.response?.data?.message || 'Login failed' }; }
    finally { setLoading(false); }
  };

  const providerLogin = async (creds) => {
    setLoading(true);
    try {
      const { data } = await authAPI.providerLogin(creds);
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      return { success: true };
    } catch (e) { return { success: false, message: e.response?.data?.message || 'Provider login failed' }; }
    finally { setLoading(false); }
  };

  const register = async (d) => {
    setLoading(true);
    try {
      const { data } = await authAPI.register(d);
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      return { success: true };
    } catch (e) { return { success: false, message: e.response?.data?.message || 'Registration failed' }; }
    finally { setLoading(false); }
  };

  const logout = () => { localStorage.removeItem('user'); setUser(null); };

  const updateUser = (data) => {
    const u = { ...user, ...data };
    localStorage.setItem('user', JSON.stringify(u));
    setUser(u);
  };

  return (
    <AuthContext.Provider value={{
      user, loading, login, providerLogin, register, logout, updateUser,
      isAdmin: user?.role === 'admin',
      isProvider: user?.role === 'provider',
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
