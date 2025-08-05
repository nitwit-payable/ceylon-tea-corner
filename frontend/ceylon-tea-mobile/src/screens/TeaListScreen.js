import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import TeaService from '../services/teaService';
import { TEA_CATEGORIES, TEA_IMAGE_URL } from '../utils/constants';
import { formatCurrency } from '../utils/helpers';

const TeaListScreen = ({ navigation }) => {
  const [teas, setTeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const { user, logout } = useAuth();
  const { addToCart, getCartItemsCount } = useCart();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadTeas();
  }, [selectedCategory]);

  const loadTeas = async () => {
    try {
      const result = await TeaService.getTeas(selectedCategory);
      if (result.success) {
        setTeas(result.data.results || result.data);
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load teas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadTeas();
  };

  const handleAddToCart = (tea) => {
    addToCart(tea, 1);
    Alert.alert(
      'Added to Cart',
      `${tea.name} has been added to your cart`,
      [{ text: 'OK' }]
    );
  };

  const handleGoToCart = () => {
    navigation.navigate('RecordSale');
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await logout();
          }
        },
      ]
    );
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        selectedCategory === item.value && styles.categoryChipActive
      ]}
      onPress={() => setSelectedCategory(item.value)}
    >
      <Text style={[
        styles.categoryText,
        selectedCategory === item.value && styles.categoryTextActive
      ]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  const renderTeaItem = ({ item }) => (
    <TouchableOpacity style={styles.teaCard} onPress={() => handleAddToCart(item)}>
      <View style={styles.teaImagePlaceholder}>
        <Image 
          source={{ uri: TEA_IMAGE_URL }}
          style={styles.teaImage}
          resizeMode="cover"
        />
      </View>
      <View style={styles.teaInfo}>
        <Text style={styles.teaName}>{item.name}</Text>
        <Text style={styles.teaCategory}>{item.category}</Text>
        <Text style={styles.teaPrice}>{formatCurrency(item.price)}</Text>
      </View>
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => handleAddToCart(item)}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <StatusBar style="dark" backgroundColor="#F8FAFC" />
        <ActivityIndicator size="large" color="#059669" />
        <Text style={styles.loadingText}>Loading teas...</Text>
      </View>
    );
  }

  const cartItemsCount = getCartItemsCount();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.username || 'User'}! 👋</Text>
          <Text style={styles.subtitle}>Ceylon Tea Corner Inventory</Text>
        </View>
        <View style={styles.headerActions}>
          {cartItemsCount > 0 && (
            <TouchableOpacity onPress={handleGoToCart} style={styles.cartButton}>
              <Text style={styles.cartIcon}>🛒</Text>
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartItemsCount}</Text>
              </View>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Categories */}
      <View style={styles.categoriesSection}>
        <FlatList
          data={TEA_CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.value}
          contentContainerStyle={styles.categoriesContainer}
        />
      </View>

      {/* Tea List */}
      <View style={styles.teasSection}>
        <Text style={styles.sectionTitle}>
          {selectedCategory ? `${selectedCategory} Teas` : 'All Teas'} ({teas.length})
        </Text>
        <FlatList
          data={teas}
          renderItem={renderTeaItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          contentContainerStyle={[styles.teasContainer, { paddingBottom: insets.bottom + 20 }]}
          numColumns={2}
          columnWrapperStyle={styles.row}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  greeting: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartButton: {
    position: 'relative',
    marginRight: 12,
    padding: 8,
  },
  cartIcon: {
    fontSize: 24,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
  categoriesSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
  },
  categoryChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  categoryChipActive: {
    backgroundColor: '#059669',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  teasSection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  teasContainer: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
  },
  teaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  teaImagePlaceholder: {
    width: '100%',
    height: 80,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  teaImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  teaInfo: {
    flex: 1,
  },
  teaName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  teaCategory: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  teaPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
  },
  addButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#F97316',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TeaListScreen; 