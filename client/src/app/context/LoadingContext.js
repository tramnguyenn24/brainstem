"use client"

import React, { createContext, useState, useContext } from 'react';
import { Loader } from '../components/componentsindex';

const LoadingContext = createContext({
  isLoading: false,
  showLoading: () => {},
  hideLoading: () => {}
});

export function LoadingProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);

  const showLoading = () => setIsLoading(true);
  const hideLoading = () => setIsLoading(false);

  return (
    <LoadingContext.Provider 
      value={{ 
        isLoading, 
        showLoading, 
        hideLoading 
      }}
    >
      {isLoading && <Loader />}
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
} 