import { apiRequest } from '../../lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const userService = {
  getAllUsers: async (search = '', state = '', page = 0, size = 10) => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (state) params.append('state', state);
      params.append('page', page.toString());
      params.append('size', size.toString());
      
      const { data } = await apiRequest(`${API_BASE_URL}/api/users?${params.toString()}`, {
        method: 'GET'
      });
      return data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  getUserById: async id => {
    try {
      const { data } = await apiRequest(`${API_BASE_URL}/api/users/${id}`, {
        method: 'GET'
      });
      return data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  addUser: async user => {
    try {
      const { data } = await apiRequest(`${API_BASE_URL}/api/users`, {
        method: 'POST',
        body: JSON.stringify({
          name: user.name,
          fullName: user.fullName,
          username: user.username,
          password: user.password,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
          state: user.state
        })
      });
      return data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  updateUser: async (id, updates) => {
    try {
      const { data } = await apiRequest(`${API_BASE_URL}/api/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      return data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  deleteUser: async id => {
    try {
      const { data } = await apiRequest(`${API_BASE_URL}/api/users/${id}`, {
        method: 'DELETE'
      });
      return data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
};

