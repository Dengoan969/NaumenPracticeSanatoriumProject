import React, { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token");
  });

  const navigate = useNavigate();

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    navigate("/auth");
  }, [navigate]);

  const fetchUserData = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/auth/me");
      const userData = {
        id: response.data.id,
        login: response.data.login,
        email: response.data.email,
        roles: response.data.roles,
      };

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      logout();
    }
  }, [logout]);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      if (!user) {
        fetchUserData();
      }
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token, user, fetchUserData]);

  const login = async (login, password) => {
    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/signin",
        {
          login,
          password,
        },
      );

      const { token, id, login: userLogin, email, roles } = response.data;

      localStorage.setItem("token", token);
      setToken(token);

      const userData = {
        id: id,
        login: userLogin,
        email: email,
        roles: roles,
      };

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));

      return { success: true };
    } catch (error) {
      let message = "Ошибка входа";
      if (error.response) {
        message =
          error.response.data?.message ||
          (error.response.status === 401
            ? "Неверный логин или пароль"
            : message);
      }
      return {
        success: false,
        message: message,
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: user,
        token: token,
        login: login,
        logout: logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);
