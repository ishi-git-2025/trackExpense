import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { navbarStyles } from '../assets/pageStyles';
import logo from '../assets/logo.png';
import { ChevronDown, User, LogOut } from 'lucide-react'

const Navbar = ({ user, onLogout }) => {
    const navigate = useNavigate();
    const menuRef = useRef();
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => setMenuOpen((prev) => !prev);

    const handleLogout = () => {
        setMenuOpen(false);
        localStorage.removeItem('user');
        // localStorage.removeItem('token');
        // sessionStorage.removeItem('user');
        // sessionStorage.removeItem('token');
        onLogout();
        navigate('/login');
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };

        // Add event listener to detect clicks outside the menu
        document.addEventListener('pointerdown', handleClickOutside);

        // Cleanup the event listener on component unmount
        return () => {
            document.removeEventListener('pointerdown', handleClickOutside);
        };
    }, []);

    return (
        <header className={navbarStyles.header}>
            <div className={navbarStyles.container}>
                {/* Logo and navigation */}
                <div onClick={() => navigate('/')} className={navbarStyles.logoContainer}>
                    <div className={navbarStyles.logoImage}>
                        <img src={logo} alt="Logo" />
                    </div>
                    <span className={navbarStyles.logoText}>Track Expense</span>
                </div>

                {user && (
                    <div className={navbarStyles.userContainer} ref={menuRef}>
                        <button onClick={toggleMenu} className={navbarStyles.userButton}>
                            <div className='relative'>
                                <div className={navbarStyles.userAvatar}>
                                    {user?.name?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div className={navbarStyles.statusIndicator}></div>
                            </div>
                            <div className={navbarStyles.userTextContainer}>
                                <p className={navbarStyles.userName}>{user?.name || 'User'}</p>
                                <p className={navbarStyles.userEmail}>{user?.email || 'test@example.com'}</p>
                            </div>

                            <ChevronDown className={navbarStyles.chevronIcon(menuOpen)} />
                        </button>

                        {/* Dropdown menu */}
                        {menuOpen && (
                            <div className={navbarStyles.dropdownMenu}>
                                <div className={navbarStyles.dropdownHeader}>
                                    <div className="flex items-center gap-3">
                                        <div className={navbarStyles.dropdownAvatar}>
                                            {user?.name?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <p className={navbarStyles.dropdownName}>{user?.name || 'User'}</p>
                                            <p className={navbarStyles.dropdownEmail}>{user?.email || 'test@example.com'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className={navbarStyles.menuItemContainer}>
                                    <button 
                                    onClick={() => {setMenuOpen(false); navigate('/profile');}} 
                                    className={navbarStyles.menuItem}>
                                       <User className="w-4 h-4" /> 
                                       <span>My Profile</span>
                                    </button>
                                </div>
                                <div className={navbarStyles.menuItemBorder}>
                                    <button 
                                    onClick={handleLogout} 
                                    className={navbarStyles.logoutButton}>
                                       <LogOut className="w-4 h-4" /> 
                                       <span>Logout</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

            </div>
        </header>
    )
}

export default Navbar;
