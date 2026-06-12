import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loading } from '../components/Loading';
import { api } from '../utils/api';

const LoginContext = createContext();

export const useLogin = () => useContext(LoginContext);

export const LoginProvider = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/user/profile');
      setUser(response.data.user);
      setLoggedIn(true);
    } catch (error) {
      // The error is already logged by the axios interceptor
      logout();
    }
  };

  useEffect(() => {
    const checkUserStatus = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        // The token is automatically added to the request by the interceptor
        await fetchUserProfile();
      }
      setLoading(false);
    };

    checkUserStatus();
  }, []);

  const login = async (token) => {
    localStorage.setItem('token', token);
    await fetchUserProfile();
  };

  const logout = () => {
    localStorage.removeItem('token');
    setLoggedIn(false);
    setUser(null);
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <LoginContext.Provider value={{ loggedIn, user, login, logout, loading }}>
      {children}
    </LoginContext.Provider>
  );
};

  const login = (token) => {
    localStorage.setItem("token", token);
    const decodedToken = JSON.parse(atob(token.split(".")[1])); // Decode JWT
    setUser(decodedToken);
    setLoggedIn(true);
    navigate("/");
  };

  const logout = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
    setUser(null);
    navigate("/login");
  };

  if (loggedIn && !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <LoginContext.Provider value={{ loggedIn, login, logout, user }}>
      {children}
    </LoginContext.Provider>
  );
};
