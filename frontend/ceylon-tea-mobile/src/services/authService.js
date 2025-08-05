import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';
import { ENDPOINTS, STORAGE_KEYS } from '../utils/constants';

class AuthService {
  // Login user
  async login(username, password) {
    try {
      const response = await api.post(ENDPOINTS.LOGIN, {
        username,
        password,
      });

      const { access, refresh, user } = response.data;

      // Store tokens and user data
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, access);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

      return { success: true, user, token: access };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Login failed',
      };
    }
  }

  // Logout user
  async logout() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Logout failed' };
    }
  }

  // Check if user is authenticated
  async isAuthenticated() {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      return !!token;
    } catch (error) {
      return false;
    }
  }

  // Get current user data
  async getCurrentUser() {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      return null;
    }
  }

  // Get auth token
  async getToken() {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      return null;
    }
  }
}

export default new AuthService(); 