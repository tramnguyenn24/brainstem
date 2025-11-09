"use client"

import { useState, useCallback } from 'react';
import { useLoading } from '../context/LoadingContext';

/**
 * Hook tùy chỉnh để quản lý việc tải dữ liệu cùng với hiển thị loading.
 * 
 * @returns {Object} - Các state và hàm xử lý
 */
export function useFetchWithLoading() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const { showLoading, hideLoading } = useLoading();

  /**
   * Hàm tải dữ liệu với hiển thị trạng thái loading
   * 
   * @param {Function} fetchFunction - Hàm async để tải dữ liệu
   * @param {Function} transformFunction - Hàm để biến đổi dữ liệu (không bắt buộc)
   * @returns {Promise<any>} - Dữ liệu nhận được
   */
  const fetchData = useCallback(async (fetchFunction, transformFunction = null) => {
    setError(null);
    showLoading();
    
    try {
      const result = await fetchFunction();
      const transformedData = transformFunction ? transformFunction(result) : result;
      setData(transformedData);
      return transformedData;
    } catch (err) {
      setError(err.message || 'Đã xảy ra lỗi khi tải dữ liệu');
      throw err;
    } finally {
      hideLoading();
    }
  }, [showLoading, hideLoading]);

  /**
   * Xóa trạng thái lỗi
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Đặt lại tất cả dữ liệu
   */
  const resetData = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return {
    data,
    error,
    loading: false, // Trạng thái loading được quản lý bởi context
    fetchData,
    clearError,
    resetData
  };
} 