import { memo, useCallback, useState, useEffect } from 'react'
import { profileStyles } from '../assets/pageStyles'
import Modal from 'react-modal';
import api from '../utils/axiosConfig';
import { Eye, EyeOff, Lock, User, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';

Modal.setAppElement('#root');
// Move PasswordInput component outside of ProfilePage to prevent recreation on every render
const PasswordInput = memo(({ name, label, value, error, showField, onToggle, onChange, disabled }) => (
    <div>
        <label className={profileStyles.passwordLabel}>
            {label}
        </label>
        <div className={profileStyles.passwordContainer}>
            <input
                type={showField ? "text" : "password"}
                name={name}
                value={value}
                onChange={onChange}
                className={`${profileStyles.inputWithError} ${error ? 'border-red-300' : 'border-gray-200'
                    }`}
                placeholder={`Enter ${label.toLowerCase()}`}
                disabled={disabled}
                // Add key prop to help React identify the input
                key={`password-input-${name}`}
            />
            <button
                type="button"
                onClick={onToggle}
                className={profileStyles.passwordToggle}
                disabled={disabled}
            >
                {showField ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
        </div>
        {error && (
            <p className={profileStyles.errorText}>{error}</p>
        )}
    </div>
));

const Profile = ({ onUpdateProfile, onLogout }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        name: '',
        email: '',
        joinDate: ''
    });
    const [editMode, setEditMode] = useState(false);
    const [tempUser, setTempUser] = useState({ ...user });
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        current: '',
        new: '',
        confirm: ''
    });
    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [passwordErrors, setPasswordErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleApiRequest = useCallback(async (method, endpoint, data = null) => {

        try {
            setLoading(true);
            const config = {
                method,
                url: endpoint,
            };
            if (data) config.data = data;
            const response = await api(config);
            return response.data;
        } catch (error) {
            console.error(`Error during ${method} request to ${endpoint}:`, error);
            if (error.response && error.response.status === 401) {
                navigate('/login');
            }
            throw error;
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    // fetch current user data on component mount
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const data = await handleApiRequest('get', '/user/me');
                if (data) {
                    const userData = data.existingUser || data
                    setUser(userData);
                    setTempUser(userData);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        }
        fetchUserData();
    }, [handleApiRequest]);

    // Input change handlers
    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setTempUser(prev => ({ ...prev, [name]: value }));
    }, []);

    const handlePasswordChange = useCallback((e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
        // Clear error for this field when user starts typing
        setPasswordErrors(prev => ({ ...prev, [name]: '' }));
    }, []);

    // Password visibility toggle
    const togglePasswordVisibility = useCallback((field) => {
        setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
    }, []);

    // save profile
    const handleSaveProfile = async () => {
        try {
            const data = await handleApiRequest('put', '/user/profile', tempUser);
            if (data) {
                const updatedUser = data.updatedUser || data;
                setUser(updatedUser);
                setTempUser(updatedUser);
                setEditMode(false);
                onUpdateProfile(updatedUser);
                toast.success('Profile updated successfully');
            }
        }
        catch (error) {
            toast.error(error.response?.data?.message || 'Error updating profile');
        } finally {
            setLoading(false);
        }
    }

    const handleCancelEdit = useCallback(() => {
        setTempUser(user);
        setEditMode(false);
    }, [user]);

    // Password validation
    // eslint-disable-next-line react-hooks/preserve-manual-memoization
    const validatePassword = useCallback(() => {
        const errors = {};
        if (!passwordData.current) errors.current = 'Current password is required';
        if (!passwordData.new) {
            errors.new = 'New password is required';
        } else if (passwordData.new.length < 8) {
            errors.new = 'Password must be at least 8 characters';
        }
        if (passwordData.new !== passwordData.confirm) {
            errors.confirm = 'Passwords do not match';
        }
        setPasswordErrors(errors);
        return Object.keys(errors).length === 0;
    }, [passwordData]);

    // To update password
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (!validatePassword()) return;
        try {
            await handleApiRequest('put', '/user/password', {
                oldPassword: passwordData.current,
                newPassword: passwordData.new
            });
            setShowPasswordModal(false);
            setPasswordData({ current: '', new: '', confirm: '' });
            setPasswordErrors({});

            //reset password visibility
            setShowPassword({ current: false, new: false, confirm: false });
            toast.success('Password updated successfully');
        }
        catch (error) {
            toast.error(error.response?.data?.message || 'Error updating password');
        }
    }

    const handleLogout = useCallback(() => {
        onLogout();
        navigate('/signup');
    }, [onLogout, navigate]);

    const closePasswordModal = useCallback(() => {
        if (!loading) {
            setShowPasswordModal(false);
            setPasswordData({ current: '', new: '', confirm: '' });
            setPasswordErrors({});

            setShowPassword({ current: false, new: false, confirm: false });
        }
    }, [loading]);

    return (

        <div className={profileStyles.container}>
            {/* Toast container */}
            <ToastContainer
                position="top-right"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
            <div className={profileStyles.mainContainer}>
                <div className={profileStyles.header}>
                    <div className={profileStyles.avatar}>
                        <User className='w-12 h-12' />
                    </div>
                    <h1 className={profileStyles.userName}>
                        {user.name || 'Loading...'}
                    </h1>
                    <p className={profileStyles.userEmail}>
                        {user.email || 'Loading...'}
                    </p>
                </div>

                <div className={profileStyles.content}>
                    <div className={profileStyles.grid}>
                        <div className={profileStyles.card}>
                            <div className='flex justify-between items-center mb-6'>
                                <h2 className={profileStyles.cardTitle}>
                                    <User className={profileStyles.icon} />
                                    Personal Information
                                </h2>
                                {!editMode && (
                                    <button onClick={() => setEditMode(true)} className={profileStyles.editButton} disabled={loading}>
                                        Edit
                                    </button>
                                )}
                            </div>

                            {editMode ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className={profileStyles.label}>Full Name</label>
                                        <input type="text" name="name" value={tempUser.name}
                                            onChange={handleInputChange} className={profileStyles.input}
                                            placeholder="Enter full name" disabled={loading} />
                                    </div>
                                    <div>
                                        <label className={profileStyles.label}>Email</label>
                                        <input type="email" name="email" value={tempUser.email}
                                            onChange={handleInputChange} className={profileStyles.input}
                                            placeholder="Enter email" disabled={loading} />
                                    </div>
                                    <div className="flex gap-3 pt-4">
                                        <button onClick={handleSaveProfile} className={profileStyles.buttonPrimary} disabled={loading}>
                                            {loading ? 'Saving...' : 'Save'}
                                        </button>
                                        <button onClick={handleCancelEdit} className={profileStyles.buttonSecondary} disabled={loading}>
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <p className={profileStyles.label}>Full Name</p>
                                        <p className="font-medium text-gray-800">{user.name}</p>
                                    </div>
                                    <div>
                                        <p className={profileStyles.label}>Email</p>
                                        <p className="font-medium text-gray-800">{user.email}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className={profileStyles.card}>
                            <h2 className={profileStyles.cardTitle}>
                                <Lock className={profileStyles.icon} />
                                Account Security
                            </h2>

                            <div className="space-y-4">
                                <div className={profileStyles.securityItem}>
                                    <div>
                                        <p className={profileStyles.securityText}>Password</p>
                                    </div>
                                    <button onClick={() => setShowPasswordModal(true)} className={profileStyles.changeButton} disabled={loading}>
                                        Change Password
                                    </button>
                                </div>
                            </div>

                            <button onClick={handleLogout} className={`${profileStyles.buttonPrimary} mt-6 w-full hover:opacity-90 transition-opacity`}
                                disabled={loading}>
                                {loading ? 'Logging out...' : 'Logout'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Change password Modal */}
            <Modal
                isOpen={showPasswordModal}
                onRequestClose={closePasswordModal}
                contentLabel="Change Password"
                className="modal"
                overlayClassName="modal-overlay"
                // Prevent unnecessary re-renders
                shouldCloseOnOverlayClick={!loading}
                shouldCloseOnEsc={!loading}
            >
                <div className={profileStyles.modalContent}>
                    <div className={profileStyles.modalHeader}>
                        <h3 className={profileStyles.modalTitle}>Change Password</h3>
                        <button
                            onClick={closePasswordModal}
                            className="text-gray-500 hover:text-gray-800 disabled:opacity-50"
                            disabled={loading}
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={handlePasswordSubmit} className="space-y-4 lg:-mx-20">
                        <PasswordInput
                            name="current"
                            label="Current Password"
                            value={passwordData.current}
                            error={passwordErrors.current}
                            showField={showPassword.current}
                            onToggle={() => togglePasswordVisibility('current')}
                            onChange={handlePasswordChange}
                            disabled={loading}
                        />

                        <PasswordInput
                            name="new"
                            label="New Password"
                            value={passwordData.new}
                            error={passwordErrors.new}
                            showField={showPassword.new}
                            onToggle={() => togglePasswordVisibility('new')}
                            onChange={handlePasswordChange}
                            disabled={loading}
                        />

                        <PasswordInput
                            name="confirm"
                            label="Confirm New Password"
                            value={passwordData.confirm}
                            error={passwordErrors.confirm}
                            showField={showPassword.confirm}
                            onToggle={() => togglePasswordVisibility('confirm')}
                            onChange={handlePasswordChange}
                            disabled={loading}
                        />

                        <div className="flex gap-3 pt-4">
                            <button
                                type="submit"
                                className={profileStyles.buttonPrimary}
                                disabled={loading}
                            >
                                {loading ? 'Updating...' : 'Update Password'}
                            </button>
                            <button
                                type="button"
                                onClick={closePasswordModal}
                                className={profileStyles.buttonSecondary}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

        </div>
    )
}

export default Profile
