// src/app/context/AuthContext.js
'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authResponses, userResponses } from '../data/apiResponses';
import { authService } from '../api/auth/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext();

const setCookie = (name, value, days) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const removeCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
};

const clearAllAuthCookies = () => {
  removeCookie('token');
  removeCookie('user');
  removeCookie('refreshToken');
  // Xoá thêm các cookie khác có thể tồn tại
  removeCookie('session');
  removeCookie('auth');
  removeCookie('remember_me');
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileFetched, setProfileFetched] = useState(false); // Để tránh fetch profile liên tục
  const [isRedirecting, setIsRedirecting] = useState(false); // Để tránh redirect liên tục
  const [lastProfileFetch, setLastProfileFetch] = useState(0); // Timestamp của lần fetch cuối
  const router = useRouter();

  // Function to update user data when token is refreshed
  const updateUserFromToken = useCallback(() => {
    try {
      const token = getCookie('token');
      const userData = getCookie('user');
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        console.log('✅ User data updated after token refresh');
      }
    } catch (error) {
      console.error('Error updating user data after token refresh:', error);
    }
  }, []);

  // Listen for token refresh events (for custom event system)
  useEffect(() => {
    const handleTokenRefresh = (event) => {
      console.log('🔄 Token refresh event received');
      updateUserFromToken();
      // Optionally fetch fresh profile data
      if (profileFetched) {
        fetchProfile(true);
      }
    };

    // Custom event for when our API interceptor refreshes tokens
    window.addEventListener('tokenRefreshed', handleTokenRefresh);
    
    return () => {
      window.removeEventListener('tokenRefreshed', handleTokenRefresh);
    };
  }, [updateUserFromToken, profileFetched]);

  // Fetch profile function - memo để tránh recreation
  const fetchProfile = useCallback(async (forceRefetch = false) => {
    console.log('🔍 fetchProfile called with forceRefetch:', forceRefetch);
    try {
      // Chỉ fetch profile khi có token
      const token = getCookie('token');
      if (!token) {
        console.log('⚠️ No token found, skipping profile fetch');
        setProfileFetched(true);
        return null;
      }
      
      // Kiểm tra cooldown (5 phút) để tránh fetch quá thường xuyên
      const now = Date.now();
      const FETCH_COOLDOWN = 5 * 60 * 1000; // 5 phút
      
      if (!forceRefetch && profileFetched && (now - lastProfileFetch < FETCH_COOLDOWN)) {
        console.log('⏰ Profile fetch on cooldown, returning cached data');
        return profile;
      }
      
      // Tránh fetch liên tục nếu đã fetch rồi và không force
      if (profileFetched && !forceRefetch && profile) {
        console.log('⚠️ Profile already fetched, returning cached data');
        return profile;
      }
      
      console.log('📡 Calling authService.getProfile()...');
      const profileData = await authService.getProfile();
      console.log('✅ Profile fetched successfully:', profileData);
      setProfile(profileData);
      setProfileFetched(true);
      setLastProfileFetch(Date.now());
      return profileData;
    } catch (error) {
      console.log('❌ Error in fetchProfile:', error);
      // Log error cho việc debug, nhưng chỉ log thông tin quan trọng
      console.error('Error fetching profile:', {
        status: error?.response?.status || error?.status,
        message: error?.message,
        error: error,
        currentPath: window.location.pathname
      });
      setProfileFetched(true);
      
      // Note: Token refresh sẽ được handle bởi API interceptor
      // AuthContext không cần handle redirect cho expired token nữa
      // vì API interceptor đã làm việc đó
      
      return null;
    }
  }, [profileFetched, lastProfileFetch, profile]); // Dependencies cho useCallback

  useEffect(() => {
    // Reset redirect flag khi component mount
    setIsRedirecting(false);
    
    // Kiểm tra token trong cookies
    const token = getCookie('token');
    const userData = getCookie('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        // Không auto fetch profile trong useEffect để tránh gọi liên tục
        // Profile sẽ được fetch khi cần thiết thông qua các component khác
        console.log('✅ User loaded from cookies, profile will be fetched when needed');
        
        // Chỉ chuyển hướng khi cần thiết
        const currentPath = window.location.pathname;
        
        // Nếu đang ở trang login và đã đăng nhập
        if (currentPath === '/login') {
          if (parsedUser.role === "ADMIN") {
            window.location.href = '/admin/dashboard';
          } else if (parsedUser.role === "MANAGER") {
            window.location.href = '/manager/dashboard';
          } else {
            window.location.href = '/';
          }
        }
        
        // Nếu đang ở trang admin nhưng không phải admin
        if (currentPath.startsWith('/admin') && parsedUser.role !== "ADMIN") {
          window.location.href = '/';
        }
        
        // Nếu đang ở trang manager nhưng không phải manager
        if (currentPath.startsWith('/manager/dashboard') && parsedUser.role !== "MANAGER") {
          window.location.href = '/';
        }
        
        // Nếu đang ở trang menu nhưng là admin hoặc manager
        if (currentPath === '/') {
          if (parsedUser.role === "ADMIN") {
            window.location.href = '/admin/dashboard';
          } else if (parsedUser.role === "MANAGER") {
            window.location.href = '/manager/dashboard';
          }
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
        clearAllAuthCookies(); // Xoá tất cả cookie khi parse thất bại
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password, rememberMe) => {
    try {
      console.log('Attempting login with:', { username });
      
      const data = await authService.login(username, password, rememberMe);
      console.log('API Response:', data);

      // Tạo user object từ response
      const userData = {
        username: data.username,
        role: data.role,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken
      };

      setUser(userData);
      setIsRedirecting(false); // Reset redirect flag khi login thành công
      
      // Lưu thông tin vào cookies
      setCookie('token', data.accessToken, 7); // Hết hạn sau 7 ngày
      setCookie('refreshToken', data.refreshToken, 7);
      setCookie('user', JSON.stringify(userData), 7);

      // Fetch profile data after login
      console.log('🚀 Calling fetchProfile after login...');
      await fetchProfile(true);

      // Show success message
      

      // Chuyển hướng dựa vào role
      if (userData.role === "ADMIN") {
        window.location.href = '/admin/dashboard';
      } else if (userData.role === "MANAGER") {
        window.location.href = '/manager/dashboard';
      } else {
        window.location.href = '/';
      }

    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      clearAllAuthCookies();
      // Hiển thị thông báo đăng xuất thành công
      toast.success('Đăng xuất thành công!', {
        duration: 2000,
        position: 'top-center',
        style: {
          background: '#4caf50',
          color: 'white',
          fontWeight: '500',
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Hiển thị thông báo đăng xuất thành công dù có lỗi
      toast.success('Đăng xuất thành công!', {
        duration: 2000,
        position: 'top-center',
        style: {
          background: '#4caf50',
          color: 'white',
          fontWeight: '500',
        },
      });
    } finally {
      setUser(null);
      setProfile(null);
      setProfileFetched(false); // Reset để có thể fetch lại cho user mới
      setIsRedirecting(false); // Reset redirect flag
      clearAllAuthCookies(); // Xoá tất cả cookie khi logout
      
      // Delay để user thấy thông báo
      setTimeout(() => {
        window.location.href = '/login';
      }, 2500);
    }
  };

  const register = async (fullName, username, password, phoneNumber, email) => {
    try {
      const data = await authService.register(fullName, username, password, phoneNumber, email);
      console.log('Registration Response:', data);

      // Chỉ trả về data, không tự động đăng nhập
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const isAdmin = () => {
    // return user?.role === "ADMIN";
    return true;
  };

  const isUser = () => {
    return user?.role === "USER";
  };

  const isManager = () => {
    return user?.role === "MANAGER";
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile,
      loading, 
      login, 
      logout,
      register,
      fetchProfile,
      updateUserFromToken, // Expose this for manual updates
      isAdmin, 
      isUser,
      isManager
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};