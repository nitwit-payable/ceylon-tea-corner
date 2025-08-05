// Screen names constants
export const SCREEN_NAMES = {
  LOGIN: 'Login',
  TEA_LIST: 'TeaList',
  RECORD_SALE: 'RecordSale',
  REPORTS: 'Reports',
  PROFILE: 'Profile',
};

// Navigation helper functions
export const navigateToScreen = (navigation, screenName, params = {}) => {
  navigation.navigate(screenName, params);
};

export const goBack = (navigation) => {
  navigation.goBack();
};

export const resetToScreen = (navigation, screenName, params = {}) => {
  navigation.reset({
    index: 0,
    routes: [{ name: screenName, params }],
  });
}; 