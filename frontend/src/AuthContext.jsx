import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isLoggedIn: false,
    user: null,
  });

  const login = (userData) => {
    setAuth({
      isLoggedIn: true,
      user: userData,
    });
  };

  const logout = () => {
    setAuth({
      isLoggedIn: false,
      user: null,
    });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
