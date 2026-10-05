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

  const isTokenExpired = (jwtToken) => {
    try {
      const payload = JSON.parse(atob(jwtToken.split('.')[1]));
      return payload.exp ? payload.exp * 1000 < Date.now() : false;
    } catch {
      return true;
    }
  };

  const fetchUserProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token || isTokenExpired(token)) {
      logout();
      return;
    }

    try {
      const response = await api.get('/v1/users/me');
      const userData = response.data?.data?.user || response.data?.user || response.data;
      setUser(userData);
      setLoggedIn(true);
    } catch (error) {
      // If 401 / 403, session is invalid or revoked — do not keep user logged in
      if (error.response?.status === 401 || error.response?.status === 403) {
        logout();
      } else {
        // Network or offline fallback only if token is still valid
        try {
          const decoded = JSON.parse(atob(token.split('.')[1]));
          setUser(decoded);
          setLoggedIn(true);
        } catch {
          logout();
        }
      }
    }
  };

  useEffect(() => {
    const checkUserStatus = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        if (isTokenExpired(token)) {
          localStorage.removeItem('token');
          setUser(null);
          setLoggedIn(false);
        } else {
          try {
            const decoded = JSON.parse(atob(token.split('.')[1]));
            setUser(decoded);
            setLoggedIn(true);
            await fetchUserProfile();
          } catch {
            localStorage.removeItem('token');
          }
        }
      }
      setLoading(false);
    };

    checkUserStatus();
  }, []);

  const login = async (token, userData = null) => {
    localStorage.setItem('token', token);
    if (userData) {
      setUser(userData);
      setLoggedIn(true);
    } else {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setUser(decoded);
        setLoggedIn(true);
      } catch {
        // Ignored
      }
      await fetchUserProfile();
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setLoggedIn(false);
    setUser(null);
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950 text-white">
        <Loading />
      </div>
    );
  }

  return (
    <LoginContext.Provider value={{ loggedIn, user, login, logout, loading, setUser }}>
      {children}
    </LoginContext.Provider>
  );
};
