import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Restore session from localStorage
    const saved = localStorage.getItem('scrummaster_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('scrummaster_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('scrummaster_user');
  };

  const isManager = user?.role === 'manager';
  const isEmployee = user?.role === 'employee';
  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, isManager, isEmployee, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
