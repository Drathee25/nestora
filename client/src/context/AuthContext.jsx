import { createContext, useContext, useState } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('adminToken'));

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('adminToken', data.token);
    setToken(data.token);
  }

  function logout() {
    localStorage.removeItem('adminToken');
    setToken(null);
  }

  return (
    <AuthContext.Provider value={{ token, isAuthed: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
