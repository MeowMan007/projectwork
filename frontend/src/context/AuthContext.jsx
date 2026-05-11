import { createContext, useState, useContext, useEffect } from 'react';
import { login as loginApi, signup as signupApi, getProfile } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hydrate user from token on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getProfile()
        .then((res) => setUser(res.data))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    const res = await loginApi(credentials);
    localStorage.setItem('token', res.data.token);
    setUser(res.data);
    return res.data;
  };

  const signup = async (userData) => {
    const res = await signupApi(userData);
    localStorage.setItem('token', res.data.token);
    setUser(res.data);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
