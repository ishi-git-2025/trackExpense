import React from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './components/Login';

const App = () => {
  const [user, setUser] = React.useState(null);
  // eslint-disable-next-line no-unused-vars
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

  const handleLogout = () => {
    clearAuth()
    navigate('/login');
  }

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout user={user} onLogout={handleLogout} />}>
          <Route index element={<Dashboard />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
