import { apiRequest } from '../../lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Helper to build query string from options
const buildQueryString = (options = {}) => {
  const {
    page = 1,
    size = 10,
    search = '',
    name,
    status,
    channel,
    channelId,
    sortBy = 'name',
    sortDirection = 'asc'
  } = options;

  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('size', size.toString());
  
  if (search) params.append('search', search);
  if (name) params.append('name', name);
  if (status) params.append('status', status);
  if (channel) params.append('channel', channel);
  if (channelId) params.append('channelId', channelId.toString());
  if (sortBy) params.append('sortBy', sortBy);
  if (sortDirection) params.append('sortDirection', sortDirection);

  return params.toString();
};

export const campaignService = {
  getCampaigns: async (options = {}) => {
    try {
      const queryString = buildQueryString(options);
      const { data } = await apiRequest(`${API_BASE_URL}/api/campaigns?${queryString}`, {
        method: 'GET'
      });
      return data;
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      throw error;
    }
  },

  getCampaignSummary: async () => {
    try {
      const { data } = await apiRequest(`${API_BASE_URL}/api/campaigns/summary`, {
        method: 'GET'
      });
      return data;
    } catch (error) {
      console.error('Error fetching campaign summary:', error);
      throw error;
    }
  },

  getCampaignById: async id => {
    try {
      const { data } = await apiRequest(`${API_BASE_URL}/api/campaigns/${id}`, {
        method: 'GET'
      });
      return data;
    } catch (error) {
      console.error('Error fetching campaign:', error);
      throw error;
    }
  },

  getCampaignDetails: async id => {
    try {
      const { data } = await apiRequest(`${API_BASE_URL}/api/campaigns/${id}/details`, {
        method: 'GET'
      });
      return data;
    } catch (error) {
      console.error('Error fetching campaign details:', error);
      throw error;
    }
  },

  getCampaignMetrics: async id => {
    try {
      const { data } = await apiRequest(`${API_BASE_URL}/api/campaigns/${id}/metrics`, {
        method: 'GET'
      });
      return data;
    } catch (error) {
      console.error('Error fetching campaign metrics:', error);
      throw error;
    }
  },

  getFeaturedCampaigns: async (options = {}) => {
    try {
      const { limit = 5, status } = options;
      const params = new URLSearchParams();
      if (limit) params.append('limit', limit.toString());
      if (status) params.append('status', status);
      
      const { data } = await apiRequest(`${API_BASE_URL}/api/campaigns/featured?${params.toString()}`, {
        method: 'GET'
      });
      return data;
    } catch (error) {
      console.error('Error fetching featured campaigns:', error);
      throw error;
    }
  },

  addCampaign: async campaign => {
    try {
      const { data } = await apiRequest(`${API_BASE_URL}/api/campaigns`, {
        method: 'POST',
        body: JSON.stringify({
          name: campaign.name,
          status: campaign.status,
          channelId: campaign.channelId,
          ownerStaffId: campaign.ownerStaffId,
          budget: campaign.budget,
          spend: campaign.spend,
          cost: campaign.cost,
          revenue: campaign.revenue,
          channels: campaign.channels || []
        })
      });
      return data;
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  },

  updateCampaign: async (id, updates) => {
    try {
      const { data } = await apiRequest(`${API_BASE_URL}/api/campaigns/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      return data;
    } catch (error) {
      console.error('Error updating campaign:', error);
      throw error;
    }
  },

  deleteCampaign: async id => {
    try {
      const { data } = await apiRequest(`${API_BASE_URL}/api/campaigns/${id}`, {
        method: 'DELETE'
      });
      return data;
    } catch (error) {
      console.error('Error deleting campaign:', error);
      throw error;
    }
  }
};

