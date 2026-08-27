import React, { useEffect } from 'react';
import { Route, Routes, useNavigate, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './components/Login';
import Signup from './components/Signup';
import axios from 'axios';

const BASE_URL = 'http://localhost:4000/api';

// to get user data from localStorage
const getTransactionsFromStorage = () => {
  const storedTransactions = localStorage.getItem('transactions');
  return storedTransactions ? JSON.parse(storedTransactions) : [];
}

//protected route component to check if user is logged in
const ProtectedRoute = ({ user, children }) => {
  const localToken = localStorage.getItem('token');
  const sessionToken = sessionStorage.getItem('token');
  const hasToken = localToken || sessionToken;

  if (!user || !hasToken) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

//scroll to top
const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return null;
}

const App = () => {
  const [user, setUser] = React.useState(null);
  const [token, setToken] = React.useState(null);
  const [transactions, setTransactions] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
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

  // to update the user data in localStorage or state
  const updateUserData = (updatedUser) => {
    setUser(updatedUser);

    const localToken = localStorage.getItem('token');
    const sessionToken = sessionStorage.getItem('token');

    if (localToken) {
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } else if (sessionToken) {
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
    }
  }

  // to load user with token from localStorage or sessionStorage on app load
  useEffect(() => {
    (async () => {
      try {
        const localUser = localStorage.getItem('user');
        const sessionUser = sessionStorage.getItem('user');
        const localToken = localStorage.getItem('token');
        const sessionToken = sessionStorage.getItem('token');

        const storedUser = localUser ? JSON.parse(localUser) : sessionUser ? JSON.parse(sessionUser) : null;
        const storedToken = localToken || sessionToken || null;

        if (storedUser && storedToken) {
          setUser(storedUser);
          setToken(storedToken);
          setLoading(false);
          return;
        }
        if (storedToken) {
          try {
            const response = await axios.get(`${BASE_URL}/user/me`, {
              headers: {
                'Authorization': `Bearer ${storedToken}`,
              }
            });
            const profile = response.data;
            persistAuth(profile, !!localToken, storedToken);
          } catch (error) {
            console.error('Error fetching user data:', error);
          }
        }
      }
      catch (error) {
        console.error('Error loading user:', error);
        clearAuth();
      } finally {
        setLoading(false);
        try {
          setTransactions(getTransactionsFromStorage());
        } catch (error) {
          console.error('Error loading transactions:', error);
        }
      }

    })();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('transactions', JSON.stringify(transactions));
    } catch (error) {
      console.error('Error saving transactions:', error);
    }
  }, [transactions]);

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

  // transaction helpers
  const addTransaction = (newTransaction) =>
    setTransactions((p) => [newTransaction, ...p]);
  const editTransaction = (id, updatedTransaction) =>
    setTransactions((p) =>
      p.map((t) => (t.id === id ? { ...updatedTransaction, id } : t)),
    );
  const deleteTransaction = (id) =>
    setTransactions((p) => p.filter((t) => t.id !== id));
  const refreshTransactions = () =>
    setTransactions(getTransactionsFromStorage());


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/signup" element={<Signup onSignup={handleSignup} />} />
        <Route path="/" element=
          {<ProtectedRoute user={user}>
            <Layout user={user} onLogout={handleLogout} 
            transactions={transactions} 
            addTransaction={addTransaction}
            editTransaction={editTransaction}
            deleteTransaction={deleteTransaction}
            refreshTransactions={refreshTransactions}
            />
          </ProtectedRoute>}>
          <Route path='/' element={<Dashboard 
            transactions={transactions} 
            addTransaction={addTransaction}
            editTransaction={editTransaction}
            deleteTransaction={deleteTransaction}
            refreshTransactions={refreshTransactions}
          />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
