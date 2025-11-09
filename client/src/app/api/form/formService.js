import { apiRequest } from '../../lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Helper to build query string from options
const buildQueryString = (options = {}) => {
  const {
    page = 1,
    size = 10,
    search = '',
    status,
    sortBy = 'name',
    sortDirection = 'asc'
  } = options;

  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('size', size.toString());
  
  if (search) params.append('search', search);
  if (status) params.append('status', status);
  if (sortBy) params.append('sortBy', sortBy);
  if (sortDirection) params.append('sortDirection', sortDirection);

  return params.toString();
};

export const formService = {
  getForms: async (options = {}) => {
    try {
      const queryString = buildQueryString(options);
      const { data } = await apiRequest(`${API_BASE_URL}/api/forms?${queryString}`, {
        method: 'GET'
      });
      return data;
    } catch (error) {
      console.error('Error fetching forms:', error);
      throw error;
    }
  },

  getFormById: async id => {
    try {
      const { data } = await apiRequest(`${API_BASE_URL}/api/forms/${id}`, {
        method: 'GET'
      });
      return data;
    } catch (error) {
      console.error('Error fetching form:', error);
      throw error;
    }
  },

  getFormEmbed: async id => {
    try {
      const { data } = await apiRequest(`${API_BASE_URL}/api/forms/${id}/embed`, {
        method: 'GET'
      });
      return data;
    } catch (error) {
      console.error('Error fetching form embed:', error);
      throw error;
    }
  },

  createForm: async form => {
    try {
      const { data } = await apiRequest(`${API_BASE_URL}/api/forms`, {
        method: 'POST',
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          status: form.status,
          campaignId: form.campaignId,
          fields: form.fields,
          settings: form.settings
        })
      });
      return data;
    } catch (error) {
      console.error('Error creating form:', error);
      throw error;
    }
  },

  updateForm: async (id, updates) => {
    try {
      const { data } = await apiRequest(`${API_BASE_URL}/api/forms/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      return data;
    } catch (error) {
      console.error('Error updating form:', error);
      throw error;
    }
  },

  deleteForm: async id => {
    try {
      const { data } = await apiRequest(`${API_BASE_URL}/api/forms/${id}`, {
        method: 'DELETE'
      });
      return data;
    } catch (error) {
      console.error('Error deleting form:', error);
      throw error;
    }
  }
};

