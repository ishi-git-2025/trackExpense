import React from 'react'
import { styles } from '../assets/pageStyles'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

const Layout = ({ user, onLogout }) => {

    const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

    return (
        <div className={styles.layout.root}>
            <Navbar user={user} onLogout={onLogout} />
            <Sidebar user={user} isCollapsed={sidebarCollapsed} setIsCollapsed={setSidebarCollapsed} />
        </div>
    )
}

export default Layout
