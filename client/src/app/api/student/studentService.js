import { apiRequest } from '../../lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Helper to build query string from options
const buildQueryString = (options = {}) => {
  const {
    page = 1,
    size = 10,
    search = '',
    status,
    enrollmentStatus,
    campaignId,
    channelId,
    assignedStaffId,
    newStudent,
    sortBy = 'fullName',
    sortDirection = 'asc'
  } = options;

  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('size', size.toString());
  
  if (search) params.append('search', search);
  if (status) params.append('status', status);
  if (enrollmentStatus) params.append('enrollmentStatus', enrollmentStatus);
  if (campaignId) params.append('campaignId', campaignId.toString());
  if (channelId) params.append('channelId', channelId.toString());
  if (assignedStaffId) params.append('assignedStaffId', assignedStaffId.toString());
  if (typeof newStudent === 'boolean') params.append('newStudent', newStudent.toString());
  if (sortBy) params.append('sortBy', sortBy);
  if (sortDirection) params.append('sortDirection', sortDirection);

  return params.toString();
};

export const studentService = {
  getStudents: async (options = {}) => {
    try {
      const queryString = buildQueryString(options);
      const { data } = await apiRequest(`${API_BASE_URL}/api/students?${queryString}`, {
        method: 'GET'
      });
      return data;
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  },

  getStudentSummary: async () => {
    try {
      const { data } = await apiRequest(`${API_BASE_URL}/api/students/summary`, {
        method: 'GET'
      });
      return data;
    } catch (error) {
      console.error('Error fetching student summary:', error);
      throw error;
    }
  },

  getStudentById: async id => {
    try {
      const { data } = await apiRequest(`${API_BASE_URL}/api/students/${id}`, {
        method: 'GET'
      });
      return data;
    } catch (error) {
      console.error('Error fetching student:', error);
      throw error;
    }
  },

  addStudent: async student => {
    try {
      const { data } = await apiRequest(`${API_BASE_URL}/api/students`, {
        method: 'POST',
        body: JSON.stringify({
          fullName: student.fullName,
          email: student.email,
          phone: student.phone,
          campaignId: student.campaignId,
          channelId: student.channelId,
          assignedStaffId: student.assignedStaffId,
          newStudent: student.newStudent
        })
      });
      return data;
    } catch (error) {
      console.error('Error creating student:', error);
      throw error;
    }
  },

  updateStudent: async (id, updates) => {
    try {
      const { data } = await apiRequest(`${API_BASE_URL}/api/students/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      return data;
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  },

  deleteStudent: async id => {
    try {
      const { data } = await apiRequest(`${API_BASE_URL}/api/students/${id}`, {
        method: 'DELETE'
      });
      return data;
    } catch (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  }
};

