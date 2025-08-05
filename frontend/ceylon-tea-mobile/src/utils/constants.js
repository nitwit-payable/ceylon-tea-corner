// API Configuration
export const API_BASE_URL = 'https://eeedf922968b.ngrok-free.app/api'; // Change this to your Django backend URL

// API Endpoints
export const ENDPOINTS = {
  LOGIN: '/login/',
  TEAS: '/teas/',
  SALES: '/sales/',
  REPORTS: '/reports/',
};

// AsyncStorage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
};

// Tea Categories
export const TEA_CATEGORIES = [
  { label: 'All', value: '' },
  { label: 'Black', value: 'Black' },
  { label: 'Green', value: 'Green' },
  { label: 'Herbal', value: 'Herbal' },
  { label: 'White', value: 'White' },
  { label: 'Oolong', value: 'Oolong' },
];

// Tea Image
export const TEA_IMAGE_URL = 'https://shop.dilmahtea.com/cdn/shop/files/Addaheading_18_1024x.png?v=1709178733'; 