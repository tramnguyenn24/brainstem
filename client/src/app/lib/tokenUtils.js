import { authService } from '../api/auth/authService';

// Helper functions for cookie management
const getCookie = (name) => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const setCookie = (name, value, days) => {
  if (typeof document === 'undefined') return;
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

// Decode JWT token (simple base64 decode, no verification)
export const decodeJWT = (token) => {
  try {
    if (!token) return null;
    
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

// Check if token is expired or will expire soon
export const isTokenExpired = (token, bufferMinutes = 5) => {
  try {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    const expirationTime = decoded.exp;
    const bufferTime = bufferMinutes * 60; // Convert to seconds
    
    return currentTime >= (expirationTime - bufferTime);
  } catch (error) {
    console.error('Error checking token expiry:', error);
    return true;
  }
};

// Get current token from cookie
export const getCurrentToken = () => {
  return getCookie('token');
};

// Get refresh token from cookie
export const getRefreshToken = () => {
  return getCookie('refreshToken');
};

// Check if current token needs refresh
export const shouldRefreshToken = () => {
  const token = getCurrentToken();
  const refreshToken = getRefreshToken();
  
  if (!token || !refreshToken) return false;
  
  return isTokenExpired(token, 5); // Refresh if expires in 5 minutes
};

// Proactively refresh token if needed
export const checkAndRefreshToken = async () => {
  try {
    if (!shouldRefreshToken()) {
      return false; // No refresh needed
    }
    
    console.log('🔄 Proactively refreshing token...');
    const refreshResult = await authService.refreshToken();
    
    // Update cookies with new tokens
    const newAccessToken = refreshResult.accessToken || refreshResult.token;
    const newRefreshToken = refreshResult.refreshToken;
    
    if (newAccessToken) {
      setCookie('token', newAccessToken, 7);
      console.log('🍪 Proactively updated access token in cookie');
    }
    
    if (newRefreshToken) {
      setCookie('refreshToken', newRefreshToken, 7);
      console.log('🍪 Proactively updated refresh token in cookie');
    }
    
    // Update user data if available
    if (refreshResult.user) {
      setCookie('user', JSON.stringify(refreshResult.user), 7);
    }
    
    // Dispatch event to notify components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tokenRefreshed', {
        detail: { newAccessToken, newRefreshToken, proactive: true }
      }));
    }
    
    console.log('✅ Token proactively refreshed');
    return true;
  } catch (error) {
    console.error('❌ Proactive token refresh failed:', error);
    return false;
  }
};

// Get token info for debugging
export const getTokenInfo = () => {
  const token = getCurrentToken();
  const refreshToken = getRefreshToken();
  
  if (!token) {
    return { hasToken: false, hasRefreshToken: !!refreshToken };
  }
  
  const decoded = decodeJWT(token);
  const isExpired = isTokenExpired(token);
  const willExpireSoon = isTokenExpired(token, 10); // Check if expires in 10 minutes
  
  return {
    hasToken: true,
    hasRefreshToken: !!refreshToken,
    isExpired,
    willExpireSoon,
    expiresAt: decoded?.exp ? new Date(decoded.exp * 1000) : null,
    username: decoded?.sub || decoded?.username,
    role: decoded?.role,
    decoded
  };
};

export default {
  decodeJWT,
  isTokenExpired,
  getCurrentToken,
  getRefreshToken,
  shouldRefreshToken,
  checkAndRefreshToken,
  getTokenInfo
}; 