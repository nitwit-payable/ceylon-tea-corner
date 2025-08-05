import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ReportsService from '../services/reportsService';
import SalesService from '../services/salesService';
import TeaService from '../services/teaService';
import { formatCurrency, formatDate } from '../utils/helpers';

const ReportsScreen = ({ navigation }) => {
  const [reports, setReports] = useState(null);
  const [sales, setSales] = useState([]);
  const [teas, setTeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const [reportsResult, salesResult, teasResult] = await Promise.all([
        ReportsService.getDailySalesReport(),
        SalesService.getSales(),
        TeaService.getTeas()
      ]);

      if (reportsResult.success) {
        setReports(reportsResult.data);
      }

      let salesData = [];
      let teasData = [];

      if (salesResult.success) {
        salesData = salesResult.data.results || salesResult.data;
        setSales(salesData);
      }

      if (teasResult.success) {
        teasData = teasResult.data.results || teasResult.data;
        setTeas(teasData);
      }

      // Enrich sales data with tea information
      if (salesData.length > 0 && teasData.length > 0) {
        const enrichedSales = salesData.map(sale => {
          const tea = teasData.find(t => t.id === (sale.tea?.id || sale.tea));
          return {
            ...sale,
            tea_info: tea || { name: 'Unknown Tea', category: 'Unknown' }
          };
        });
        setSales(enrichedSales);
      }

    } catch (error) {
      Alert.alert('Error', 'Failed to load reports');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadReports();
  };

  const getTodaySales = () => {
    const today = new Date().toDateString();
    return sales.filter(sale => 
      new Date(sale.sold_at).toDateString() === today
    );
  };

  const getTotalRevenue = () => {
    return sales.reduce((total, sale) => {
      const teaPrice = sale.tea_info?.price || 0;
      const saleRevenue = teaPrice * sale.quantity;
      return total + saleRevenue;
    }, 0);
  };

  const getTopSellingTeas = () => {
    const teaSales = {};
    sales.forEach(sale => {
      const teaName = sale.tea_info?.name || sale.tea?.name || 'Unknown Tea';
      const teaPrice = sale.tea_info?.price || 0;
      const saleRevenue = teaPrice * sale.quantity;
      
      if (teaSales[teaName]) {
        teaSales[teaName].quantity += sale.quantity;
        teaSales[teaName].revenue += saleRevenue;
      } else {
        teaSales[teaName] = {
          name: teaName,
          quantity: sale.quantity,
          revenue: saleRevenue,
        };
      }
    });

    return Object.values(teaSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  };

  const getSalesByCategory = () => {
    const categorySales = {};
    sales.forEach(sale => {
      const category = sale.tea_info?.category || sale.tea?.category || 'Unknown';
      const teaPrice = sale.tea_info?.price || 0;
      const saleRevenue = teaPrice * sale.quantity;
      
      if (categorySales[category]) {
        categorySales[category].quantity += sale.quantity;
        categorySales[category].revenue += saleRevenue;
      } else {
        categorySales[category] = {
          name: category,
          quantity: sale.quantity,
          revenue: saleRevenue,
        };
      }
    });

    return Object.values(categorySales);
  };

  const renderOverviewTab = () => {
    const todaySales = getTodaySales();
    const totalRevenue = getTotalRevenue();
    const topTeas = getTopSellingTeas();

    return (
      <ScrollView 
        style={styles.tabContent} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {/* Summary Cards */}
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{sales.length}</Text>
            <Text style={styles.summaryLabel}>Total Sales</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{todaySales.length}</Text>
            <Text style={styles.summaryLabel}>Today's Sales</Text>
          </View>
          <View style={[styles.summaryCard, styles.fullWidth]}>
            <Text style={styles.summaryNumber}>{formatCurrency(totalRevenue)}</Text>
            <Text style={styles.summaryLabel}>Total Revenue</Text>
          </View>
        </View>

        {/* Top Selling Teas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Selling Teas</Text>
          {topTeas.length > 0 ? topTeas.map((tea, index) => (
            <View key={tea.name} style={styles.rankItem}>
              <View style={styles.rankBadge}>
                <Text style={styles.rankNumber}>{index + 1}</Text>
              </View>
              <View style={styles.rankInfo}>
                <Text style={styles.rankName}>{tea.name}</Text>
                <Text style={styles.rankDetails}>
                  {tea.quantity} units • {formatCurrency(tea.revenue)}
                </Text>
              </View>
            </View>
          )) : (
            <Text style={styles.noDataText}>No sales data available</Text>
          )}
        </View>
      </ScrollView>
    );
  };

  const renderSalesTab = () => {
    const recentSales = sales.slice(0, 10);

    return (
      <ScrollView 
        style={styles.tabContent} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Sales</Text>
          {recentSales.length > 0 ? recentSales.map((sale, index) => (
            <View key={sale.id || index} style={styles.saleItem}>
              <View style={styles.saleInfo}>
                <Text style={styles.saleTea}>
                  {sale.tea_info?.name || sale.tea?.name || 'Unknown Tea'}
                </Text>
                <Text style={styles.saleDetails}>
                  Qty: {sale.quantity} • {formatDate(sale.sold_at)}
                </Text>
              </View>
              <Text style={styles.saleAmount}>
                {formatCurrency((sale.tea_info?.price || 0) * sale.quantity)}
              </Text>
            </View>
          )) : (
            <Text style={styles.noDataText}>No sales data available</Text>
          )}
        </View>
      </ScrollView>
    );
  };

  const renderCategoryTab = () => {
    const categorySales = getSalesByCategory();

    return (
      <ScrollView 
        style={styles.tabContent} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sales by Category</Text>
          {categorySales.length > 0 ? categorySales.map((category, index) => (
            <View key={category.name} style={styles.categoryItem}>
              <View style={styles.categoryIcon}>
                <Text style={styles.categoryEmoji}>🍃</Text>
              </View>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryDetails}>
                  {category.quantity} units sold
                </Text>
              </View>
              <Text style={styles.categoryRevenue}>{formatCurrency(category.revenue)}</Text>
            </View>
          )) : (
            <Text style={styles.noDataText}>No sales data available</Text>
          )}
        </View>
      </ScrollView>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <StatusBar style="dark" backgroundColor="#F8FAFC" />
        <ActivityIndicator size="large" color="#059669" />
        <Text style={styles.loadingText}>Loading reports...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Sales Reports</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sales' && styles.activeTab]}
          onPress={() => setActiveTab('sales')}
        >
          <Text style={[styles.tabText, activeTab === 'sales' && styles.activeTabText]}>
            Sales
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'category' && styles.activeTab]}
          onPress={() => setActiveTab('category')}
        >
          <Text style={[styles.tabText, activeTab === 'category' && styles.activeTabText]}>
            Categories
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'sales' && renderSalesTab()}
        {activeTab === 'category' && renderCategoryTab()}
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  refreshButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#059669',
  },
  refreshText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#059669',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#059669',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 20,
    marginBottom: 24,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    width: '48%',
    marginRight: '2%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  fullWidth: {
    width: '100%',
    marginRight: 0,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#059669',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  noDataText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  rankItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F97316',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  rankInfo: {
    flex: 1,
  },
  rankName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  rankDetails: {
    fontSize: 14,
    color: '#6B7280',
  },
  saleItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  saleInfo: {
    flex: 1,
  },
  saleTea: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  saleDetails: {
    fontSize: 14,
    color: '#6B7280',
  },
  saleAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
  },
  categoryItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryEmoji: {
    fontSize: 20,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  categoryDetails: {
    fontSize: 14,
    color: '#6B7280',
  },
  categoryRevenue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
  },
});

export default ReportsScreen; 