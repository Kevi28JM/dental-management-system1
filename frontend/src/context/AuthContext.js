"use client"; // Next.js client component

import React, { createContext, useContext, useEffect, useState } from "react";

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


  // On first load, check if there's saved auth data
  useEffect(() => {
    const savedAuth = localStorage.getItem("authData");
    if (savedAuth) {
      setAuthData(JSON.parse(savedAuth));
    }
  }, []);


  // Call this after successful login
  const login = ({ user_id, patient_id = null, role, token }) => {
    const newAuthData = { user_id, patient_id, role, token };
    setAuthData(newAuthData);
    localStorage.setItem("authData", JSON.stringify(newAuthData));
  };

  // Call this to logout user
  const logout = () => {
    setAuthData({ user_id: null, patient_id: null, role: null, token: null });
    localStorage.removeItem("authData");
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