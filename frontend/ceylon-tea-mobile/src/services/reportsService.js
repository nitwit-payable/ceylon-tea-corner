import api from './api';
import { ENDPOINTS } from '../utils/constants';

class ReportsService {
  // Get daily sales report
  async getDailySalesReport(date = null) {
    try {
      const params = date ? { date } : {};
      const response = await api.get(ENDPOINTS.REPORTS, { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch reports',
      };
    }
  }

  // Get sales by category report
  async getSalesByCategory() {
    try {
      const response = await api.get(`${ENDPOINTS.REPORTS}category/`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch category reports',
      };
    }
  }

  // Get top selling teas
  async getTopSellingTeas() {
    try {
      const response = await api.get(`${ENDPOINTS.REPORTS}top-selling/`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to fetch top selling teas',
      };
    }
  }
}

export default new ReportsService(); 