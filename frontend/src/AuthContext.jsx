import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isLoggedIn: false,
    user: null,
    masterPassword: null,
  });

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const user = localStorage.getItem("user");

    if (accessToken && user) {
      setAuth({
        isLoggedIn: true,
        user: user,
        masterPassword: null, 
      });
    }
  }, []);

  const login = ({ email, masterPassword }) => {
    setAuth({
      isLoggedIn: true,
      user: email,
      masterPassword: masterPassword,
    });
  };

  const setMasterPassword = (masterPassword) => {
    setAuth((prev) => ({
      ...prev,
      masterPassword,
    }));
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");

    setAuth({
      isLoggedIn: false,
      user: null,
      masterPassword: null,
    });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, setMasterPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
