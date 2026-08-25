import React from 'react'
import { loginStyles } from '../assets/pageStyles'
import { Eye, EyeOff, Lock, MailIcon, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';

const BASE_URL = 'http://localhost:4000/api';

const Login = ({ onLogin }) => {

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(false);
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();

  //to fetch user data and token from backend
  const fetchProfile = async (token) => {
    if (!token) return;
    try {
      const response = await axios.get(`${BASE_URL}/user/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = response.data;
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }

  const persistAuth = (profile, token) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    try {
      if (token) storage.setItem('token', token);
      if (profile) storage.setItem('user', JSON.stringify(profile));
    } catch (error) {
      console.error('Error saving auth data:', error);
    }
  }

  //to handle login form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${BASE_URL}/user/login`, {
        email,
        password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = response.data || {};
      const token = data.token || null;

      // To derive user profile
      let profile = data.user ?? null;

      if (!profile && token) {
        try {
          profile = await fetchProfile(token);
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      }

      persistAuth(profile, token);

      if (typeof onLogin === 'function') {
        try {
          onLogin(profile, rememberMe, token);
        } catch (error) {
          console.error('Error in onLogin callback:', error);
          navigate('/login');
        }
      } else {
        navigate('/');
      }
      setPassword('');
    } catch (error) {
      setError('Invalid email or password');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={loginStyles.pageContainer}>
      <div className={loginStyles.cardContainer}>
        <div className={loginStyles.header}>
          <div className={loginStyles.avatar}>
            <User className='w-10 h-10 text-white' />
          </div>
          <h1 className={loginStyles.headerTitle}>
            Login
          </h1>
          <p className={loginStyles.headerSubtitle}>
            Please enter your credentials to login.
          </p>
        </div>

        <div className={loginStyles.formContainer}>
          {error && (
            <div className={loginStyles.errorContainer}>
              <div className={loginStyles.errorIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className={loginStyles.errorText}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="email" className={loginStyles.label}>Email</label>
              <div className={loginStyles.inputContainer}>
                <div className={loginStyles.inputIcon}>
                  <MailIcon className='w-4 h-4' />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={loginStyles.input}
                  placeholder="email@example.com"
                  required
                />
              </div>
            </div>
            <div className="mb-6">
              <label htmlFor="password" className={loginStyles.label}>Password</label>
              <div className={loginStyles.inputContainer}>
                <div className={loginStyles.inputIcon}>
                  <Lock className='w-4 h-4' />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={loginStyles.input}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={loginStyles.passwordToggle}
                >
                  {showPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
                </button>
              </div>
            </div>
            <div className={loginStyles.checkboxContainer}>
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className={loginStyles.checkbox}
                required
              />
              <label htmlFor="rememberMe" className={loginStyles.checkboxLabel}>
                Remember me
              </label>
            </div>
            <button
              type="submit"
              className={`${loginStyles.button} ${loading ? loginStyles.buttonDisabled : ''}`}
              disabled={loading}
              onClick={() => setError('')}
            >
              {loading ? (
                <>
                  <svg className={loginStyles.spinner} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className={loginStyles.signUpContainer}>
            <p className={loginStyles.signUpText}>
              Don't have an account?{' '}
              <Link to="/signup" className={loginStyles.signUpLink}>
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
