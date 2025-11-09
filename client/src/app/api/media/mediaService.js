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
    sortBy = 'createdAt',
    sortDirection = 'desc'
  } = options;

  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('size', size.toString());
  
  if (search) params.append('search', search);
  if (type) params.append('type', type);
  if (status) params.append('status', status);
  if (sortBy) params.append('sortBy', sortBy);
  if (sortDirection) params.append('sortDirection', sortDirection);

  return params.toString();
};

export const mediaService = {
  getMedia: async (options = {}) => {
    try {
      const queryString = buildQueryString(options);
      const { data } = await apiRequest(`${API_BASE_URL}/api/media?${queryString}`, {
        method: 'GET'
      });
      return data;
    } catch (error) {
      console.error('Error fetching media:', error);
      throw error;
    }
  },

  getMediaSummary: async () => {
    try {
      const { data } = await apiRequest(`${API_BASE_URL}/api/media/summary`, {
        method: 'GET'
      });
      return data;
    } catch (error) {
      console.error('Error fetching media summary:', error);
      throw error;
    }
  },

  getMediaById: async id => {
    try {
      const { data } = await apiRequest(`${API_BASE_URL}/api/media/${id}`, {
        method: 'GET'
      });
      return data;
    } catch (error) {
      console.error('Error fetching media:', error);
      throw error;
    }
  },

  addMedia: async media => {
    try {
      const { data } = await apiRequest(`${API_BASE_URL}/api/media`, {
        method: 'POST',
        body: JSON.stringify({
          name: media.name,
          type: media.type,
          url: media.url,
          description: media.description,
          fileSize: media.fileSize,
          mimeType: media.mimeType,
          status: media.status || 'active'
        })
      });
      return data;
    } catch (error) {
      console.error('Error creating media:', error);
      throw error;
    }
  },

  updateMedia: async (id, updates) => {
    try {
      const { data } = await apiRequest(`${API_BASE_URL}/api/media/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      return data;
    } catch (error) {
      console.error('Error updating media:', error);
      throw error;
    }
  },

  deleteMedia: async id => {
    try {
      const { data } = await apiRequest(`${API_BASE_URL}/api/media/${id}`, {
        method: 'DELETE'
      });
      return data;
    } catch (error) {
      console.error('Error deleting media:', error);
      throw error;
    }
  }
};

