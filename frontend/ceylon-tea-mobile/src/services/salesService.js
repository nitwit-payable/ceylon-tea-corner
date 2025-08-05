import api from './api';
import { ENDPOINTS } from '../utils/constants';

class SalesService {
  // Record a new sale
  async recordSale(teaId, quantity) {
    try {
      const response = await api.post(ENDPOINTS.SALES, {
        tea: teaId,
        quantity,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to record sale',
      };
    }
  }

  // Get sales history
  async getSales() {
    try {
      const response = await api.get(ENDPOINTS.SALES);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch sales',
      };
    }
  }
}

export default new SalesService(); 