import { apiRequest } from '../../lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Helper to build query string from options
const buildQueryString = (options = {}) => {
  const {
    page = 1,
    size = 10,
    search = '',
    name = '',
    status,
    sortBy = 'createdAt',
    sortDirection = 'desc'
  } = options;

  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('size', size.toString());
  
  if (search) params.append('search', search);
  if (name) params.append('name', name);
  if (status) params.append('status', status);
  if (sortBy) params.append('sortBy', sortBy);
  if (sortDirection) params.append('sortDirection', sortDirection);

  return params.toString();
};

export const courseService = {
  getCourses: async (options = {}) => {
    try {
      const queryString = buildQueryString(options);
      const { data } = await apiRequest(`${API_BASE_URL}/api/courses?${queryString}`, {
        method: 'GET'
      });
      return data;
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  },

  getCourseById: async id => {
    try {
      const { data } = await apiRequest(`${API_BASE_URL}/api/courses/${id}`, {
        method: 'GET'
      });
      return data;
    } catch (error) {
      console.error('Error fetching course:', error);
      throw error;
    }
  },

  addCourse: async course => {
    try {
      const { data } = await apiRequest(`${API_BASE_URL}/api/courses`, {
        method: 'POST',
        body: JSON.stringify({
          name: course.name,
          description: course.description,
          price: course.price,
          status: course.status
        })
      });
      return data;
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  },

  updateCourse: async (id, updates) => {
    try {
      const { data } = await apiRequest(`${API_BASE_URL}/api/courses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      return data;
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  },

  deleteCourse: async id => {
    try {
      const { data } = await apiRequest(`${API_BASE_URL}/api/courses/${id}`, {
        method: 'DELETE'
      });
      return data;
    } catch (error) {
      console.error('Error deleting course:', error);
      throw error;
    }
  }
};

