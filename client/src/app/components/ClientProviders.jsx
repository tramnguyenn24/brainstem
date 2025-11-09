"use client";

import React from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../context/AuthContext';

export default function ClientProviders({ children }) {
  return (
    <AuthProvider>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 2000,
            style: {
              background: '#4caf50',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: '#f44336',
            },
          },
        }}
      />
    </AuthProvider>
  );
}

