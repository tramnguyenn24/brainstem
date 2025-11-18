import { apiRequest } from '../../lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Helper to build query string from options
const buildQueryString = (options = {}) => {
  const {
    page = 1,
    size = 10,
    search = '',
    status,
    interestLevel,
    campaignId,
    channelId,
    assignedStaffId,
    tags,
    campaignName,
    sortBy = 'createdAt',
    sortDirection = 'desc'
  } = options;

  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('size', size.toString());
  
  if (search) params.append('search', search);
  if (status) params.append('status', status);
  if (interestLevel) params.append('interestLevel', interestLevel);
  if (campaignId) params.append('campaignId', campaignId.toString());
  if (channelId) params.append('channelId', channelId.toString());
  if (assignedStaffId) params.append('assignedStaffId', assignedStaffId.toString());
  if (tags && Array.isArray(tags)) params.append('tags', tags.join(','));
  if (campaignName) params.append('campaignName', campaignName);
  if (sortBy) params.append('sortBy', sortBy);
  if (sortDirection) params.append('sortDirection', sortDirection);

  return params.toString();
};

export const leadService = {
  getLeads: async (options = {}) => {
    try {
      const queryString = buildQueryString(options);
      const { data } = await apiRequest(`${API_BASE_URL}/api/leads?${queryString}`, {
        method: 'GET'
      });
      return data;
    } catch (error) {
      console.error('Error fetching leads:', error);
      throw error;
    }
  },

  getLeadSummary: async () => {
    try {
      const { data } = await apiRequest(`${API_BASE_URL}/api/leads/summary`, {
        method: 'GET'
      });
      return data;
    } catch (error) {
      console.error('Error fetching lead summary:', error);
      throw error;
    }
  },

  getLeadById: async id => {
    try {
      const { data } = await apiRequest(`${API_BASE_URL}/api/leads/${id}`, {
        method: 'GET'
      });
      return data;
    } catch (error) {
      console.error('Error fetching lead:', error);
      throw error;
    }
  },

  addLead: async lead => {
    try {
      const { data } = await apiRequest(`${API_BASE_URL}/api/leads`, {
        method: 'POST',
        body: JSON.stringify({
          fullName: lead.fullName,
          email: lead.email,
          phone: lead.phone,
          campaignId: lead.campaignId,
          channelId: lead.channelId,
          assignedStaffId: lead.assignedStaffId,
          tags: lead.tags
        })
      });
      return data;
    } catch (error) {
      console.error('Error creating lead:', error);
      throw error;
    }
  },

  updateLead: async (id, updates) => {
    try {
      const { data } = await apiRequest(`${API_BASE_URL}/api/leads/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      return data;
    } catch (error) {
      console.error('Error updating lead:', error);
      throw error;
    }
  },

  deleteLead: async id => {
    try {
      const { data } = await apiRequest(`${API_BASE_URL}/api/leads/${id}`, {
        method: 'DELETE'
      });
      return data;
    } catch (error) {
      console.error('Error deleting lead:', error);
      throw error;
    }
  },

  convertLead: async (id, { studentId = null, status = 'REGISTERED', courseId = null } = {}) => {
    try {
      const { data } = await apiRequest(`${API_BASE_URL}/api/leads/${id}/convert`, {
        method: 'POST',
        body: JSON.stringify({ studentId, status, courseId })
      });
      return data;
    } catch (error) {
      console.error('Error converting lead:', error);
      throw error;
    }
  }
};

