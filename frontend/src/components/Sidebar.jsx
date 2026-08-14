import { useRef, useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { sidebarStyles, cn } from '../assets/pageStyles'
import { motion } from 'framer-motion'
import { ArrowDown, ArrowUp, Home, LogOut, User } from 'lucide-react'

const MENU_ITEMS = [
    { text: 'Dashboard', path: '/', icon: <Home size={20} /> },
    { text: 'Income', path: '/income', icon: <ArrowUp size={20} /> },
    { text: 'Expense', path: '/expense', icon: <ArrowDown size={20} /> },
    { text: 'Profile', path: '/profile', icon: <User size={20} /> },
]

const Sidebar = ({ user, isCollapsed, setIsCollapsed }) => {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const sidebarRef = useRef(null);

    const [mobileOpen, setMobileOpen] = useState(false);
    const [activeHover, setActiveHover] = useState(null);

    const { name: username = 'User name', email: email = 'user@example.com' } = user || {};
    const initial = username.charAt(0).toUpperCase() || 'U';


    // to check for overflow in mobile
    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : 'auto';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [mobileOpen]);


    // to close sidebar when clicked outside in mobile view
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (mobileOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setMobileOpen(false);
            }
        };
        document.addEventListener('pointerdown', handleClickOutside);
        return () => {
            document.removeEventListener('pointerdown', handleClickOutside);
        };
    }, [mobileOpen]);

    // to logout
    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    }

    const toggleSidebar = () => setIsCollapsed((prev) => !prev);

    // for rendering menu items
    const renderMenuItem = ({ text, path, icon }) => {
        const isActive = pathname === path;
        return (
            <motion.li key={text} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                    to={path}
                    className={cn(
                        sidebarStyles.menuItem.base,
                        isActive ? sidebarStyles.menuItem.active : sidebarStyles.menuItem.inactive,
                        isCollapsed ? sidebarStyles.menuItem.collapsed : sidebarStyles.menuItem.expanded
                    )}
                    onMouseEnter={() => setActiveHover(text)}
                    onMouseLeave={() => setActiveHover(null)}
                >
                    <span className={isActive ? sidebarStyles.menuIcon.active : sidebarStyles.menuIcon.inactive}>
                        {icon}
                    </span>
                    {!isCollapsed && (
                        <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                            {text}
                        </motion.span>
                    )}
                    {activeHover === text && !isActive && !isCollapsed && (
                        <span className={sidebarStyles.activeIndicator}></span>
                    )}
                </Link>
            </motion.li>
        );
    };

    return (
        <>
            <motion.div ref={sidebarRef} className={sidebarStyles.sidebarContainer.base}
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1, width: isCollapsed ? 80 : 256 }}
                transition={{ type: 'spring', damping: 25 }}
            >
                <div className={sidebarStyles.sidebarInner.base}>
                    <button onClick={toggleSidebar} className={sidebarStyles.toggleButton.base}>
                        <motion.div
                            initial={{ rotate: 0 }}
                            animate={{ rotate: isCollapsed ? 0 : 180 }}
                            transition={{ duration: 0.3 }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points={isCollapsed ? "9 18 15 12 9 6" : "15 18 9 12 15 6"}></polyline>
                            </svg>
                        </motion.div>
                    </button>

                    <div className={cn(
                        sidebarStyles.userProfileContainer.base,
                        isCollapsed ? sidebarStyles.userProfileContainer.collapsed : sidebarStyles.userProfileContainer.expanded
                    )}>
                        <div className='flex items-center'>
                            <div className={sidebarStyles.userInitials.base}>{initial}</div>

                            {!isCollapsed && (
                                <motion.div
                                    className="ml-3 overflow-hidden"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                >
                                    <h2 className='text-sm font-bold text-gray-800 truncate'>
                                        {username}
                                    </h2>
                                    <p className='text-xs text-gray-500 truncate'>
                                        {email}
                                    </p>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    <div className='flex-1 py-4'>
                        <ul className={sidebarStyles.menuList.base}>
                            {MENU_ITEMS.map(renderMenuItem)}
                        </ul>
                    </div>
                    <div className={cn(sidebarStyles.footerContainer.base,
                        isCollapsed ? sidebarStyles.footerContainer.collapsed : sidebarStyles.footerContainer.expanded
                    )}>
                        <button onClick={handleLogout}
                            className={cn(sidebarStyles.logoutButton.base, 
                            isCollapsed ? sidebarStyles.logoutButton.collapsed : sidebarStyles.logoutButton.expanded)}
                        >
                            <LogOut size={20} className='text-gray-500' />
                            {!isCollapsed && "Log out"}
                        </button>
                    </div>
                </div>
            </motion.div>


        </>
    )
}

export default Sidebar