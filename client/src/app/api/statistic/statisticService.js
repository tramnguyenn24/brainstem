import { apiRequest } from '../../lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const statisticService = {
  getRevenue: async (startDate, endDate, period = 'day') => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (period) params.append('period', period);
      
      const { data } = await apiRequest(`${API_BASE_URL}/api/statistics/revenue?${params.toString()}`, {
        method: 'GET'
      });
      return data;
    } catch (error) {
      console.error('Error fetching revenue statistics:', error);
      throw error;
    }
  },

  getStatistics: async (startDate, endDate) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const { data } = await apiRequest(`${API_BASE_URL}/api/statistics?${params.toString()}`, {
        method: 'GET'
      });
      return data;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      throw error;
    }
  },

  getDashboardStats: async (startDate, endDate) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const { data } = await apiRequest(`${API_BASE_URL}/api/statistics/dashboard?${params.toString()}`, {
        method: 'GET'
      });
      return data;
    } catch (error) {
      console.error('Error fetching dashboard statistics:', error);
      throw error;
    }
  },

  downloadRevenueExport: async (startDate, endDate) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      // Get token from cookie
      const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
      };
      
      const token = getCookie('token');
      const headers = {
        'Authorization': token ? `Bearer ${token}` : '',
      };
      
      const response = await fetch(`${API_BASE_URL}/api/statistics/revenue/export?${params.toString()}`, {
        method: 'GET',
        headers,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { message: errorText || response.statusText || `HTTP ${response.status}` };
        }
        throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'revenue_report.csv';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }
      
      // Download file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      return { filename };
    } catch (error) {
      console.error('Error downloading revenue export:', error);
      throw error;
    }
  }
};

