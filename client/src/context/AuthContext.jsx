import React, { createContext, useState, useEffect } from "react";
import axios from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  // 1. Function to Load User Data (The Fix)
  const loadUser = async () => {
    if (localStorage.getItem("token")) {
      axios.defaults.headers.common["x-auth-token"] =
        localStorage.getItem("token");
    }

    try {
      const res = await axios.get("/auth/user"); // Hit the new backend route
      setUser(res.data); // Set real user data (Name, Email)
    } catch (err) {
      console.error("User load failed", err);
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
      delete axios.defaults.headers.common["x-auth-token"];
    } finally {
      setLoading(false);
    }
  };

  // 2. Run this whenever the Token changes (Login/Refresh)
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      loadUser(); // <--- Fetch the real data!
    } else {
      localStorage.removeItem("token");
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  // 3. Login
  const login = async (email, password) => {
    const res = await axios.post("/auth/login", { email, password });
    setToken(res.data.token); // Triggers useEffect -> loadUser
  };

  // 4. Register
  const register = async (name, email, password) => {
    const res = await axios.post("/auth/register", { name, email, password });
    setToken(res.data.token); // Triggers useEffect -> loadUser
  };

  // 5. Logout
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["x-auth-token"];
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
