import { apiRequest } from '../../lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Helper to build query string from options
const buildQueryString = (options = {}) => {
  const {
    page = 1,
    size = 10,
    search = '',
    type,
    status,
    month,
    startMonth,
    endMonth,
    sortBy = 'name',
    sortDirection = 'asc'
  } = options;

  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('size', size.toString());
  
  if (search) params.append('search', search);
  if (type) params.append('type', type);
  if (status) params.append('status', status);
  if (month) params.append('month', month);
  if (startMonth) params.append('startMonth', startMonth);
  if (endMonth) params.append('endMonth', endMonth);
  if (sortBy) params.append('sortBy', sortBy);
  if (sortDirection) params.append('sortDirection', sortDirection);

  return params.toString();
};

export const channelService = {
  getChannels: async (options = {}) => {
    try {
      const queryString = buildQueryString(options);
      const { data } = await apiRequest(`${API_BASE_URL}/api/channels?${queryString}`, {
        method: 'GET'
      });
      return data;
    } catch (error) {
      console.error('Error fetching channels:', error);
      throw error;
    }
  },

  getChannelSummary: async () => {
    try {
      const { data } = await apiRequest(`${API_BASE_URL}/api/channels/summary`, {
        method: 'GET'
      });
      return data;
    } catch (error) {
      console.error('Error fetching channel summary:', error);
      throw error;
    }
  },

  getChannelById: async id => {
    try {
      const { data } = await apiRequest(`${API_BASE_URL}/api/channels/${id}`, {
        method: 'GET'
      });
      return data;
    } catch (error) {
      console.error('Error fetching channel:', error);
      throw error;
    }
  },

  getChannelCampaigns: async (id, options = {}) => {
    try {
      const { page = 1, size = 5, sortBy = 'name', sortDirection = 'asc' } = options;
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('size', size.toString());
      params.append('sortBy', sortBy);
      params.append('sortDirection', sortDirection);
      
      const { data } = await apiRequest(`${API_BASE_URL}/api/channels/${id}/campaigns?${params.toString()}`, {
        method: 'GET'
      });
      return data;
    } catch (error) {
      console.error('Error fetching channel campaigns:', error);
      throw error;
    }
  },

  getChannelsWithStats: async (options = {}) => {
    try {
      const queryString = buildQueryString(options);
      const { data } = await apiRequest(`${API_BASE_URL}/api/channels/with-stats?${queryString}`, {
        method: 'GET'
      });
      return data;
    } catch (error) {
      console.error('Error fetching channels with stats:', error);
      throw error;
    }
  },

  getChannelStats: async () => {
    try {
      const { data } = await apiRequest(`${API_BASE_URL}/api/channels/stats`, {
        method: 'GET'
      });
      return data;
    } catch (error) {
      console.error('Error fetching channel stats:', error);
      throw error;
    }
  },

  addChannel: async channel => {
    try {
      const { data } = await apiRequest(`${API_BASE_URL}/api/channels`, {
        method: 'POST',
        body: JSON.stringify({
          name: channel.name,
          type: channel.type,
          status: channel.status || 'active'
        })
      });
      return data;
    } catch (error) {
      console.error('Error creating channel:', error);
      throw error;
    }
  },

  updateChannel: async (id, updates) => {
    try {
      const { data } = await apiRequest(`${API_BASE_URL}/api/channels/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      return data;
    } catch (error) {
      console.error('Error updating channel:', error);
      throw error;
    }
  },

  deleteChannel: async id => {
    try {
      const { data } = await apiRequest(`${API_BASE_URL}/api/channels/${id}`, {
        method: 'DELETE'
      });
      return data;
    } catch (error) {
      console.error('Error deleting channel:', error);
      throw error;
    }
  }
};

