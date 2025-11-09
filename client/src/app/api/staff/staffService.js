import { apiRequest } from '../../lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Helper to build query string from options
const buildQueryString = (options = {}) => {
  const {
    page = 1,
    size = 10,
    search = '',
    role,
    status,
    department,
    campaignId,
    sortBy = 'name',
    sortDirection = 'asc'
  } = options;

  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('size', size.toString());
  
  if (search) params.append('search', search);
  if (role) params.append('role', role);
  if (status) params.append('status', status);
  if (department) params.append('department', department);
  if (campaignId) params.append('campaignId', campaignId.toString());
  if (sortBy) params.append('sortBy', sortBy);
  if (sortDirection) params.append('sortDirection', sortDirection);

  return params.toString();
};

export const staffService = {
  getStaffMembers: async (options = {}) => {
    try {
      const queryString = buildQueryString(options);
      const { data } = await apiRequest(`${API_BASE_URL}/api/staff?${queryString}`, {
        method: 'GET'
      });
      return data;
    } catch (error) {
      console.error('Error fetching staff:', error);
      throw error;
    }
  },

  getStaffSummary: async () => {
    try {
      const { data } = await apiRequest(`${API_BASE_URL}/api/staff/summary`, {
        method: 'GET'
      });
      return data;
    } catch (error) {
      console.error('Error fetching staff summary:', error);
      throw error;
    }
  },

  getStaffById: async id => {
    try {
      const { data } = await apiRequest(`${API_BASE_URL}/api/staff/${id}`, {
        method: 'GET'
      });
      return data;
    } catch (error) {
      console.error('Error fetching staff:', error);
      throw error;
    }
  },

  addStaff: async staff => {
    try {
      const { data } = await apiRequest(`${API_BASE_URL}/api/staff`, {
        method: 'POST',
        body: JSON.stringify({
          name: staff.name,
          role: staff.role,
          status: staff.status,
          department: staff.department,
          email: staff.email,
          phoneNumber: staff.phoneNumber
        })
      });
      return data;
    } catch (error) {
      console.error('Error creating staff:', error);
      throw error;
    }
  },

  updateStaff: async (id, updates) => {
    try {
      const { data } = await apiRequest(`${API_BASE_URL}/api/staff/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      return data;
    } catch (error) {
      console.error('Error updating staff:', error);
      throw error;
    }
  },

  deleteStaff: async id => {
    try {
      const { data } = await apiRequest(`${API_BASE_URL}/api/staff/${id}`, {
        method: 'DELETE'
      });
      return data;
    } catch (error) {
      console.error('Error deleting staff:', error);
      throw error;
    }
  },

  assignCampaigns: async (id, campaignIds) => {
    try {
      const { data } = await apiRequest(`${API_BASE_URL}/api/staff/${id}/assign-campaigns`, {
        method: 'POST',
        body: JSON.stringify({ campaignIds })
      });
      return data;
    } catch (error) {
      console.error('Error assigning campaigns:', error);
      throw error;
    }
  }
};

