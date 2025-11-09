"use client";

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from './LogoutButton.module.css';

const LogoutButton = () => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <button 
      className={styles.logoutButton}
      onClick={handleLogout}
      type="button"
    >
      Đăng xuất
    </button>
  );
};

export default LogoutButton;

