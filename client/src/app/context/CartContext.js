"use client"

import React, { createContext, useState, useContext, useEffect } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

const CartContext = createContext();
const CART_COOKIE_KEY = 'cart_items';

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [error, setError] = useState("");
  const [openError, setOpenError] = useState(false);
  const { user } = useAuth();

  // Load cart from cookies when component mounts
  useEffect(() => {
    const savedCart = Cookies.get(CART_COOKIE_KEY);
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error parsing cart from cookies:', error);
      }
    }
  }, []);

  // Save cart to cookies whenever it changes
  useEffect(() => {
    Cookies.set(CART_COOKIE_KEY, JSON.stringify(cartItems), { expires: 7 }); // Expires in 7 days
  }, [cartItems]);

  const uploadToPinata = async(file) => {
    if(file){
      try {
        const formData = new FormData();
        formData.append("file",file);

        const response = await axios({
          method: "post",
          url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
          data: formData,
          headers: {
            pinata_api_key:`5b9afb41a6a64bcad1f7`,
            pinata_secret_api_key:`080a3e13f1c8a9527e3ff8faaeb9871b5df53900099d88edba2259f98be701ec`,
            "Content-Type": "multipart/form-data",
          }
        });

        const ImgHash = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
        console.log("Image successfully uploaded to Pinata:", ImgHash);
        return ImgHash;
      } catch (error) {
        console.error("Pinata upload error:", error.response?.data || error.message);
        setError("Unable to upload image to Pinata");
        setOpenError(true);
        throw error;
      }
    }
  };

  const addToCart = (product) => {
    if (!user) {
      // Nếu người dùng chưa đăng nhập, hiển thị thông báo và từ chối thêm vào giỏ hàng
      setError("Please login to add items to cart");
      setOpenError(true);
      toast?.error("Please login to add items to cart");
      return false;
    }

    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      
      if (existingItem) {
        // Nếu sản phẩm đã tồn tại, tăng số lượng theo quantity được truyền vào (mặc định +1)
        const quantityToAdd = product.quantity || 1;
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantityToAdd }
            : item
        );
      } else {
        // Nếu sản phẩm chưa tồn tại, thêm mới với quantity từ product (mặc định 1)
        const initialQuantity = product.quantity || 1;
        return [...prevItems, { ...product, quantity: initialQuantity }];
      }
    });
    return true;
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    Cookies.remove(CART_COOKIE_KEY);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      uploadToPinata,
      error,
      setError,
      openError,
      setOpenError
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
} 