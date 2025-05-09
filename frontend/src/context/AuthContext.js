"use client"; // Next.js client component

import React, { createContext, useContext, useState } from "react";

// Create the context
const AuthContext = createContext();

// Provider component
const AuthProvider = ({ children }) => {
  const [authData, setAuthData] = useState({
    user_id: null,
    patient_id: null,
    role: null,
    token: null,
  });

  // Call this after successful login
  const login = ({ user_id, patient_id = null, role, token }) => {
    setAuthData({ user_id, patient_id, role, token });
  };

  // Call this to logout user
  const logout = () => {
    setAuthData({ user_id: null, patient_id: null, role: null, token: null });
  };

  return (
    <AuthContext.Provider value={{ authData, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to access auth data easily
  const useAuth = () => {
  return useContext(AuthContext);
};
 
export { AuthProvider, useAuth };