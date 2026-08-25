import React from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './components/Login';
import Signup from './components/Signup';

const App = () => {
  const [user, setUser] = React.useState(null);
  const [token, setToken] = React.useState(null);
  const navigate = useNavigate();

  const clearAuth = () => {
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token');
    }
    catch (error) {
      console.error('Error clearing auth:', error);
    }
    setUser(null);
    setToken(null);
  }

  //to save token and user data in localStorage or sessionStorage based on remember me option
  const persistAuth = (userObj, remember = false, token) => {
    try {
      if (remember) {
        if (userObj) localStorage.setItem("user", JSON.stringify(userObj));
        if (token) localStorage.setItem("token", token);
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("token");
      } else {
        if (userObj) sessionStorage.setItem("user", JSON.stringify(userObj));
        if (token) sessionStorage.setItem("token", token);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
      setUser(userObj || null);
      setToken(token || null);
    } catch (err) {
      console.error("persistAuth error:", err);
    }
  };

  const handleLogout = () => {
    clearAuth()
    navigate('/login');
  }

  const handleLogin = (userData, remember = false, token) => {
    persistAuth(userData, remember, token);
    navigate('/');
  }

  const handleSignup = (userData, remember = false, token) => {
    persistAuth(userData, remember, token);
    navigate('/');
  }

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/signup" element={<Signup onSignup={handleSignup} />} />
        <Route path="/" element={<Layout user={user} onLogout={handleLogout} />}>
          <Route index element={<Dashboard />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
