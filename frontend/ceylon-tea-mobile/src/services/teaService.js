import api from './api';
import { ENDPOINTS } from '../utils/constants';

class TeaService {
  // Get all teas with optional category filter
  async getTeas(category = '') {
    try {
      const params = category ? { category } : {};
      const response = await api.get(ENDPOINTS.TEAS, { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch teas',
      };
    }
  }

  // Get a specific tea by ID
  async getTeaById(id) {
    try {
      const response = await api.get(`${ENDPOINTS.TEAS}${id}/`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch tea',
      };
    }
  }
}

export default new TeaService(); 