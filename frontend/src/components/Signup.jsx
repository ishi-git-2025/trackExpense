import React from 'react'
import { signupStyles } from '../assets/pageStyles'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';

const BASE_URL = 'http://localhost:4000/api';

const Signup = ({ onSignup }) => {

    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [name, setName] = React.useState('');
    const [showPassword, setShowPassword] = React.useState(false);
    const [rememberMe, setRememberMe] = React.useState(false);
    const [error, setError] = React.useState({});
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

    const validateForm = () => {
        const newErrors = {};

        if (!name.trim()) {
            newErrors.name = "Name is required";
        } else if (/[^a-zA-Z\s]/.test(name)) {
            newErrors.name = "Name can only contain letters and spaces";
        }
        if (!email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = "Email is invalid";
        }
        if (!password) {
            newErrors.password = "Password is required";
        } else if (password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        setError(newErrors);
        // Return true if there are no errors by checking if the newErrors object is empty else return false
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        setError({});

        try {
            const response = await axios.post(`${BASE_URL}/user/register`, {
                name,
                email,
                password
            });

            const data = response.data || {};
            const token = data.token || null;
            let profile = data.user || null;

            // Fallback: fetch profile if not in response
            if (!profile && token) {
                profile = await fetchProfile(token);
            }

            // // Fallback: create minimal profile
            // if (!profile) {
            //     profile = { name, email };
            // }

            persistAuth(profile, token);

            if (typeof onSignup === "function") {
                onSignup(profile, rememberMe, token);
            }

            navigate("/");
            setPassword("");
        }
        catch (err) {
            const errorMsg = err.response?.data?.message || err.response?.data?.errors || err.message || "An error occurred";
            setError({ api: errorMsg });
            console.error("Signup error:", err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={signupStyles.pageContainer}>
            <div className={signupStyles.cardContainer}>
                <div className={signupStyles.header}>
                    <button onClick={() => navigate(-1)} className={signupStyles.backButton}>
                        <ArrowLeft className='w-5 h-5' />
                    </button>
                    <div className={signupStyles.avatar}>
                        <User className='w-10 h-10 text-white' />
                    </div>
                    <h1 className={signupStyles.headerTitle}>
                        Create Account
                    </h1>
                    <p className={signupStyles.headerSubtitle}>
                        Sign up to get started
                    </p>
                </div>
                <div className={signupStyles.formContainer}>
                    {error.api && <p className={signupStyles.apiError}>{error.api}</p>}

                    <form onSubmit={handleSubmit} noValidate>
                        <div className='mb-6'>
                            <label htmlFor="name" className={signupStyles.label}>Full Name</label>
                            <div className={signupStyles.inputContainer}>
                                <div className={signupStyles.inputIcon}>
                                    <User className='w-5 h-5' />
                                </div>
                                <input
                                    type="text"
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className={`${signupStyles.input} ${error.name ? 'border-red-300' : 'border-gray-300'}`}
                                    placeholder="Enter your full name"
                                />
                            </div>
                            {error.name && <p className={signupStyles.fieldError}>{error.name}</p>}
                        </div>
                        <div className='mb-6'>
                            <label htmlFor="email" className={signupStyles.label}>Email Address</label>
                            <div className={signupStyles.inputContainer}>
                                <div className={signupStyles.inputIcon}>
                                    <Mail className='w-5 h-5' />
                                </div>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`${signupStyles.input} ${error.email ? 'border-red-300' : 'border-gray-300'}`}
                                    placeholder="email@example.com"
                                />
                            </div>
                            {error.email && <p className={signupStyles.fieldError}>{error.email}</p>}
                        </div>
                        <div className='mb-6'>
                            <label htmlFor="password" className={signupStyles.label}>Password</label>
                            <div className={signupStyles.inputContainer}>
                                <div className={signupStyles.inputIcon}>
                                    <Lock className='w-5 h-5' />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`${signupStyles.input} ${error.password ? 'border-red-300' : 'border-gray-300'}`}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className={signupStyles.passwordToggle}
                                >
                                    {showPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
                                </button>
                            </div>
                            {error.password && <p className={signupStyles.fieldError}>{error.password}</p>}
                        </div>
                        <div className={signupStyles.checkboxContainer}>
                            <input
                                type="checkbox"
                                id="rememberMe"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className={signupStyles.checkbox}
                            />
                            <label htmlFor="rememberMe" className={signupStyles.checkboxLabel}>
                                Remember me
                            </label>
                        </div>
                        <button
                            type="submit"
                            className={`${signupStyles.button} ${loading ? signupStyles.buttonDisabled : ''}`}
                            disabled={loading}
                            onClick={() => setError({})}
                        >
                            {loading ? (
                                <>
                                    <svg className={signupStyles.spinner} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2-647z"></path>
                                    </svg>
                                    Creating account...
                                </>
                            ) : 'Create Account'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Signup
