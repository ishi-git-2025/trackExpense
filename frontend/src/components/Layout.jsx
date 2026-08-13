import React from 'react'
import {styles} from '../assets/pageStyles'
import Navbar from './Navbar'

const Layout = ({ user, onLogout }) => {
  return (
    <div className={styles.layout.root}>
      <Navbar user={user} onLogout = {onLogout} />
    </div>
  )
}

export default Layout
