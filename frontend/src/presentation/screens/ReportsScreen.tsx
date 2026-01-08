/**
 * Reports Screen
 * Display analytics and summary reports for collections and payments
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import apiClient from '../../infrastructure/api/apiClient';
import { useAuth } from '../contexts/AuthContext';
import { TOKEN_STORAGE_KEY, API_BASE_URL } from '../../core/constants/api';
import { ScreenHeader, DateTimePicker } from '../components';
import THEME from '../../core/constants/theme';

interface ReportSummary {
  totalSuppliers: number;
  activeSuppliers: number;
  totalProducts: number;
  activeProducts: number;
  totalCollections: number;
  totalCollectionAmount: number;
  totalPayments: number;
  totalPaymentAmount: number;
  outstandingBalance: number;
  collectionsThisMonth: number;
  paymentsThisMonth: number;
}

interface SupplierBalance {
  supplier_id: number;
  supplier_name: string;
  supplier_code: string;
  total_collections: number;
  total_payments: number;
  balance: number;
  collection_count?: number;
  payment_count?: number;
}

interface DateFilter {
  startDate: string;
  endDate: string;
}

export const ReportsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [topBalances, setTopBalances] = useState<SupplierBalance[]>([]);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateFilter>({
    startDate: '',
    endDate: '',
  });
  const [activeFilter, setActiveFilter] = useState<DateFilter | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadSummary(),
        loadTopBalances(),
      ]);
    } catch (error) {
      console.error('Error loading reports:', error);
      Alert.alert('Error', 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      // Use the new dedicated summary endpoint
      const response = await apiClient.get<any>('/reports/summary');
      
      setSummary({
        totalSuppliers: response.data?.totalSuppliers || 0,
        activeSuppliers: response.data?.activeSuppliers || 0,
        totalProducts: response.data?.totalProducts || 0,
        activeProducts: response.data?.activeProducts || 0,
        totalCollections: response.data?.totalCollections || 0,
        totalCollectionAmount: response.data?.totalCollectionAmount || 0,
        totalPayments: response.data?.totalPayments || 0,
        totalPaymentAmount: response.data?.totalPaymentAmount || 0,
        outstandingBalance: response.data?.outstandingBalance || 0,
        collectionsThisMonth: response.data?.collectionsThisMonth || 0,
        paymentsThisMonth: response.data?.paymentsThisMonth || 0,
      });
    } catch (error) {
      console.error('Error loading summary:', error);
    }
  };

  const loadTopBalances = async () => {
    try {
      // Use the new dedicated supplier balances endpoint
      const response = await apiClient.get<any>('/reports/supplier-balances?limit=5&sort=desc');
      const balances = response.data || [];
      
      setTopBalances(balances);
    } catch (error) {
      console.error('Error loading top balances:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  };

  const goBack = () => {
    navigation.goBack();
  };

  const handleDateFilterApply = () => {
    setActiveFilter(dateFilter);
    setShowDateFilter(false);
    loadReports();
  };

  const handleDateFilterClear = () => {
    setDateFilter({ startDate: '', endDate: '' });
    setActiveFilter(null);
    setShowDateFilter(false);
    loadReports();
  };

  const handleQuickFilter = (filter: 'today' | 'week' | 'month' | 'all') => {
    const today = new Date();
    let startDate = '';
    let endDate = today.toISOString().split('T')[0];

    switch (filter) {
      case 'today':
        startDate = endDate;
        break;
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        startDate = weekAgo.toISOString().split('T')[0];
        break;
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        startDate = monthAgo.toISOString().split('T')[0];
        break;
      case 'all':
        startDate = '';
        endDate = '';
        break;
    }

    setDateFilter({ startDate, endDate });
    setActiveFilter({ startDate, endDate });
    loadReports();
  };

  const generateHTMLReport = () => {
    // Use theme colors for consistency
    const primaryColor = THEME.colors.reportPrimary;
    const successColor = THEME.colors.reportSuccess;
    const dangerColor = THEME.colors.reportDanger;
    const secondaryColor = THEME.colors.reportSecondary;
    const backgroundColor = THEME.colors.reportBackground;
    const borderColor = THEME.colors.reportBorder;
    const textColor = THEME.colors.textPrimary;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>System Summary Report</title>
        <style>
          body {
            font-family: 'Helvetica', Arial, sans-serif;
            font-size: ${THEME.typography.fontSize.base}px;
            line-height: ${THEME.typography.lineHeight.normal};
            color: ${textColor};
            padding: ${THEME.spacing.lg}px;
          }
          .header {
            text-align: center;
            margin-bottom: ${THEME.spacing.xxxl}px;
            border-bottom: 3px solid ${primaryColor};
            padding-bottom: ${THEME.spacing.base}px;
          }
          h1 {
            font-size: ${THEME.typography.fontSize.xxl}px;
            color: ${primaryColor};
            margin: 0 0 ${THEME.spacing.xs}px 0;
          }
          h2 {
            font-size: ${THEME.typography.fontSize.lg}px;
            color: ${secondaryColor};
            font-weight: normal;
            margin: 0;
          }
          .meta-info {
            margin-bottom: ${THEME.spacing.lg}px;
            padding: ${THEME.spacing.sm}px;
            background-color: ${backgroundColor};
            border-left: 4px solid ${primaryColor};
          }
          .section {
            margin-bottom: ${THEME.spacing.xl}px;
          }
          .section-title {
            font-size: ${THEME.typography.fontSize.lg}px;
            font-weight: bold;
            color: ${textColor};
            margin-bottom: ${THEME.spacing.base}px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: ${THEME.spacing.lg}px;
          }
          th, td {
            padding: ${THEME.spacing.sm}px;
            text-align: left;
            border: 1px solid ${borderColor};
          }
          th {
            background-color: ${primaryColor};
            color: white;
            font-weight: bold;
          }
          tr:nth-child(even) {
            background-color: ${backgroundColor};
          }
          .text-right {
            text-align: right;
          }
          .text-success {
            color: ${successColor};
          }
          .text-danger {
            color: ${dangerColor};
          }
          .footer {
            margin-top: ${THEME.spacing.xxxl}px;
            padding-top: ${THEME.spacing.base}px;
            border-top: 1px solid ${borderColor};
            text-align: center;
            font-size: ${THEME.typography.fontSize.sm}px;
            color: ${secondaryColor};
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Data Collection & Payment Management</h1>
          <h2>System Summary Report</h2>
        </div>
        
        <div class="meta-info">
          <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
          ${activeFilter ? `<p><strong>Period:</strong> ${activeFilter.startDate} to ${activeFilter.endDate}</p>` : '<p><strong>Period:</strong> All Time</p>'}
        </div>
        
        <div class="section">
          <div class="section-title">System Overview</div>
          <table>
            <tbody>
              <tr>
                <td><strong>Total Suppliers</strong></td>
                <td class="text-right">${summary?.totalSuppliers || 0}</td>
                <td><strong>Active Suppliers</strong></td>
                <td class="text-right">${summary?.activeSuppliers || 0}</td>
              </tr>
              <tr>
                <td><strong>Total Products</strong></td>
                <td class="text-right">${summary?.totalProducts || 0}</td>
                <td><strong>Active Products</strong></td>
                <td class="text-right">${summary?.activeProducts || 0}</td>
              </tr>
              <tr>
                <td><strong>Total Collections</strong></td>
                <td class="text-right">${summary?.totalCollections || 0}</td>
                <td><strong>Total Payments</strong></td>
                <td class="text-right">${summary?.totalPayments || 0}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="section">
          <div class="section-title">Financial Summary</div>
          <table>
            <tbody>
              <tr>
                <td><strong>Total Collections Amount</strong></td>
                <td class="text-right">$${(summary?.totalCollectionAmount || 0).toFixed(2)}</td>
              </tr>
              <tr>
                <td><strong>Total Payments Amount</strong></td>
                <td class="text-right text-success">$${(summary?.totalPaymentAmount || 0).toFixed(2)}</td>
              </tr>
              <tr style="background-color: #e9ecef;">
                <td><strong>Outstanding Balance</strong></td>
                <td class="text-right ${(summary?.outstandingBalance || 0) > 0 ? 'text-danger' : 'text-success'}">
                  <strong>$${Math.abs(summary?.outstandingBalance || 0).toFixed(2)}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="section">
          <div class="section-title">Top Supplier Balances</div>
          <table>
            <thead>
              <tr>
                <th>Supplier Code</th>
                <th>Supplier Name</th>
                <th class="text-right">Collections</th>
                <th class="text-right">Payments</th>
                <th class="text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              ${topBalances.map(balance => `
                <tr>
                  <td>${balance.supplier_code}</td>
                  <td>${balance.supplier_name}</td>
                  <td class="text-right">$${balance.total_collections.toFixed(2)}</td>
                  <td class="text-right">$${balance.total_payments.toFixed(2)}</td>
                  <td class="text-right ${balance.balance > 0 ? 'text-danger' : 'text-success'}">
                    $${Math.abs(balance.balance).toFixed(2)}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div class="footer">
          <p>This is a system-generated report. For official purposes only.</p>
          <p>&copy; ${new Date().getFullYear()} Data Collection & Payment Management System</p>
        </div>
      </body>
      </html>
    `;
  };

  const handlePrint = async () => {
    try {
      const html = generateHTMLReport();
      await Print.printAsync({
        html,
      });
    } catch (error) {
      console.error('Error printing report:', error);
      Alert.alert('Error', 'Failed to print report');
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const html = generateHTMLReport();
      const { uri } = await Print.printToFileAsync({
        html,
      });

      // Share the PDF file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Save System Summary Report',
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('Success', `PDF saved to: ${uri}`);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'Failed to generate PDF');
    }
  };

  const handleDownloadFromBackend = async () => {
    try {
      Alert.alert(
        'Download PDF',
        'Choose PDF download option:',
        [
          {
            text: 'System Summary',
            onPress: () => downloadPDFFromBackend('/reports/summary/pdf'),
          },
          {
            text: 'Supplier Balances',
            onPress: () => downloadPDFFromBackend('/reports/supplier-balances/pdf'),
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const downloadPDFFromBackend = async (endpoint: string) => {
    try {
      // Get the auth token from AsyncStorage
      const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
      if (!token) {
        Alert.alert('Error', 'Authentication required');
        return;
      }

      // Construct URL with query parameters using URLSearchParams
      const baseURL = API_BASE_URL;
      let url = `${baseURL}${endpoint}`;
      
      if (activeFilter && activeFilter.startDate && activeFilter.endDate) {
        const params = new URLSearchParams({
          start_date: activeFilter.startDate,
          end_date: activeFilter.endDate,
        });
        url += `?${params.toString()}`;
      }

      // Download the PDF
      const filename = `report-${Date.now()}.pdf`;
      const downloadDest = `${FileSystem.documentDirectory}${filename}`;

      const downloadResumable = FileSystem.createDownloadResumable(
        url,
        downloadDest,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await downloadResumable.downloadAsync();
      if (result && result.uri) {
        // Share the downloaded PDF
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(result.uri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Save Report',
            UTI: 'com.adobe.pdf',
          });
        } else {
          Alert.alert('Success', `PDF saved to: ${result.uri}`);
        }
      }
    } catch (error) {
      console.error('Error downloading PDF from backend:', error);
      Alert.alert('Error', 'Failed to download PDF from server');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader 
        title="Reports & Analytics"
        showBackButton={true}
        variant="light"
      />

      {/* Quick Filters */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity 
            style={[styles.filterButton, !activeFilter && styles.filterButtonActive]}
            onPress={() => handleQuickFilter('all')}
          >
            <Text style={[styles.filterButtonText, !activeFilter && styles.filterButtonTextActive]}>
              All Time
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => handleQuickFilter('today')}
          >
            <Text style={styles.filterButtonText}>Today</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => handleQuickFilter('week')}
          >
            <Text style={styles.filterButtonText}>Last 7 Days</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => handleQuickFilter('month')}
          >
            <Text style={styles.filterButtonText}>Last 30 Days</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, styles.filterButtonCustom]}
            onPress={() => setShowDateFilter(true)}
          >
            <Text style={styles.filterButtonText}>Custom Range</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Action Buttons for Print and PDF */}
      <View style={styles.actionBar}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handlePrint}
        >
          <Text style={styles.actionButtonText}>🖨️ Print</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.actionButtonPrimary]}
          onPress={handleDownloadPDF}
        >
          <Text style={styles.actionButtonTextWhite}>📄 Export PDF</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.actionButtonSuccess]}
          onPress={handleDownloadFromBackend}
        >
          <Text style={styles.actionButtonTextWhite}>⬇️ Download</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Summary Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Overview</Text>
          
          <View style={styles.cardRow}>
            <View style={[styles.card, styles.cardBlue]}>
              <Text style={styles.cardValue}>{summary?.totalSuppliers || 0}</Text>
              <Text style={styles.cardLabel}>Total Suppliers</Text>
            </View>
            <View style={[styles.card, styles.cardGreen]}>
              <Text style={styles.cardValue}>{summary?.totalProducts || 0}</Text>
              <Text style={styles.cardLabel}>Total Products</Text>
            </View>
          </View>

          <View style={styles.cardRow}>
            <View style={[styles.card, styles.cardOrange]}>
              <Text style={styles.cardValue}>{summary?.totalCollections || 0}</Text>
              <Text style={styles.cardLabel}>Total Collections</Text>
            </View>
            <View style={[styles.card, styles.cardPurple]}>
              <Text style={styles.cardValue}>{summary?.totalPayments || 0}</Text>
              <Text style={styles.cardLabel}>Total Payments</Text>
            </View>
          </View>
        </View>

        {/* Financial Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial Summary</Text>
          
          <View style={styles.financialCard}>
            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>Total Collections:</Text>
              <Text style={styles.financialValue}>
                ${summary?.totalCollectionAmount.toFixed(2) || '0.00'}
              </Text>
            </View>
            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>Total Payments:</Text>
              <Text style={[styles.financialValue, styles.textGreen]}>
                ${summary?.totalPaymentAmount.toFixed(2) || '0.00'}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.financialRow}>
              <Text style={styles.financialLabelBold}>Outstanding Balance:</Text>
              <Text style={[styles.financialValueBold, 
                (summary?.outstandingBalance || 0) > 0 ? styles.textRed : styles.textGreen
              ]}>
                ${Math.abs(summary?.outstandingBalance || 0).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* This Month */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Month</Text>
          
          <View style={styles.cardRow}>
            <View style={[styles.card, styles.cardInfo]}>
              <Text style={styles.cardValue}>{summary?.collectionsThisMonth || 0}</Text>
              <Text style={styles.cardLabel}>Collections</Text>
            </View>
            <View style={[styles.card, styles.cardInfo]}>
              <Text style={styles.cardValue}>{summary?.paymentsThisMonth || 0}</Text>
              <Text style={styles.cardLabel}>Payments</Text>
            </View>
          </View>
        </View>

        {/* Top Supplier Balances */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Supplier Balances</Text>
          
          {topBalances.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No supplier data available</Text>
            </View>
          ) : (
            topBalances.map((balance) => (
              <View key={balance.supplier_id} style={styles.balanceCard}>
                <View style={styles.balanceHeader}>
                  <Text style={styles.balanceName}>{String(balance.supplier_name)}</Text>
                  <Text style={styles.balanceCode}>{String(balance.supplier_code)}</Text>
                </View>
                <View style={styles.balanceDetails}>
                  <Text style={styles.balanceDetailText}>
                    Collections: ${typeof balance.total_collections === 'number' ? balance.total_collections.toFixed(2) : '0.00'}
                  </Text>
                  <Text style={styles.balanceDetailText}>
                    Payments: ${typeof balance.total_payments === 'number' ? balance.total_payments.toFixed(2) : '0.00'}
                  </Text>
                </View>
                <Text style={[
                  styles.balanceAmount,
                  balance.balance > 0 ? styles.textRed : styles.textGreen
                ]}>
                  Balance: ${typeof balance.balance === 'number' ? Math.abs(balance.balance).toFixed(2) : '0.00'}
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Last updated: {new Date().toLocaleString()}</Text>
        </View>
      </ScrollView>

      {/* Date Filter Modal */}
      <Modal
        visible={showDateFilter}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDateFilter(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Custom Date Range</Text>
            
            <DateTimePicker
              label="Start Date"
              value={dateFilter.startDate}
              onChange={(date) => setDateFilter({...dateFilter, startDate: date})}
              mode="date"
              placeholder="Select start date"
              containerStyle={styles.datePickerContainer}
            />
            
            <DateTimePicker
              label="End Date"
              value={dateFilter.endDate}
              onChange={(date) => setDateFilter({...dateFilter, endDate: date})}
              mode="date"
              placeholder="Select end date"
              containerStyle={styles.datePickerContainer}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={handleDateFilterClear}
              >
                <Text style={styles.modalButtonTextSecondary}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowDateFilter(false)}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleDateFilterApply}
              >
                <Text style={styles.modalButtonTextPrimary}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.colors.background,
  },
  header: {
    backgroundColor: THEME.colors.primary,
    padding: THEME.spacing.lg,
  },
  backButton: {
    marginBottom: THEME.spacing.sm,
  },
  backButtonText: {
    color: THEME.colors.white,
    fontSize: THEME.typography.fontSize.md,
  },
  title: {
    fontSize: THEME.typography.fontSize.xxl,
    fontWeight: THEME.typography.fontWeight.bold,
    color: THEME.colors.white,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: THEME.spacing.base,
  },
  sectionTitle: {
    fontSize: THEME.typography.fontSize.lg,
    fontWeight: THEME.typography.fontWeight.bold,
    color: THEME.colors.textPrimary,
    marginBottom: THEME.spacing.base,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.base,
  },
  card: {
    flex: 1,
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
    marginHorizontal: THEME.spacing.xs,
    ...THEME.shadows.base,
  },
  cardBlue: {
    borderLeftWidth: 4,
    borderLeftColor: THEME.colors.primary,
  },
  cardGreen: {
    borderLeftWidth: 4,
    borderLeftColor: THEME.colors.success,
  },
  cardOrange: {
    borderLeftWidth: 4,
    borderLeftColor: THEME.colors.warning,
  },
  cardPurple: {
    borderLeftWidth: 4,
    borderLeftColor: THEME.colors.info,
  },
  cardInfo: {
    borderLeftWidth: 4,
    borderLeftColor: THEME.colors.info,
  },
  cardValue: {
    fontSize: THEME.typography.fontSize.huge,
    fontWeight: THEME.typography.fontWeight.bold,
    color: THEME.colors.textPrimary,
    marginBottom: THEME.spacing.xs,
  },
  cardLabel: {
    fontSize: THEME.typography.fontSize.sm,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
  },
  financialCard: {
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.lg,
    borderRadius: THEME.borderRadius.md,
    ...THEME.shadows.base,
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.sm,
  },
  financialLabel: {
    fontSize: THEME.typography.fontSize.base,
    color: THEME.colors.textSecondary,
  },
  financialLabelBold: {
    fontSize: THEME.typography.fontSize.md,
    fontWeight: THEME.typography.fontWeight.bold,
    color: THEME.colors.textPrimary,
  },
  financialValue: {
    fontSize: THEME.typography.fontSize.md,
    color: THEME.colors.textPrimary,
  },
  financialValueBold: {
    fontSize: THEME.typography.fontSize.lg,
    fontWeight: THEME.typography.fontWeight.bold,
  },
  divider: {
    height: 1,
    backgroundColor: THEME.colors.border,
    marginVertical: THEME.spacing.sm,
  },
  textGreen: {
    color: THEME.colors.success,
  },
  textRed: {
    color: THEME.colors.error,
  },
  balanceCard: {
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.base,
    borderRadius: THEME.borderRadius.base,
    marginBottom: THEME.spacing.sm,
    ...THEME.shadows.sm,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.sm,
  },
  balanceName: {
    fontSize: THEME.typography.fontSize.md,
    fontWeight: THEME.typography.fontWeight.bold,
    color: THEME.colors.textPrimary,
    flex: 1,
  },
  balanceCode: {
    fontSize: THEME.typography.fontSize.sm,
    color: THEME.colors.textSecondary,
    backgroundColor: THEME.colors.gray100,
    paddingHorizontal: THEME.spacing.sm,
    paddingVertical: THEME.spacing.xs,
    borderRadius: THEME.borderRadius.sm,
  },
  balanceDetails: {
    marginBottom: THEME.spacing.sm,
  },
  balanceDetailText: {
    fontSize: THEME.typography.fontSize.sm,
    color: THEME.colors.textSecondary,
    marginBottom: 2,
  },
  balanceAmount: {
    fontSize: THEME.typography.fontSize.base,
    fontWeight: THEME.typography.fontWeight.bold,
  },
  emptyState: {
    backgroundColor: THEME.colors.surface,
    padding: THEME.spacing.xxxl,
    borderRadius: THEME.borderRadius.md,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: THEME.typography.fontSize.base,
    color: THEME.colors.textTertiary,
  },
  footer: {
    padding: THEME.spacing.lg,
    alignItems: 'center',
  },
  footerText: {
    fontSize: THEME.typography.fontSize.sm,
    color: THEME.colors.textTertiary,
    fontStyle: 'italic',
  },
  filterBar: {
    backgroundColor: THEME.colors.surface,
    paddingVertical: THEME.spacing.sm,
    paddingHorizontal: THEME.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  filterButton: {
    paddingHorizontal: THEME.spacing.base,
    paddingVertical: THEME.spacing.sm,
    marginHorizontal: THEME.spacing.xs,
    borderRadius: 20,
    backgroundColor: THEME.colors.gray100,
  },
  filterButtonActive: {
    backgroundColor: THEME.colors.primary,
  },
  filterButtonCustom: {
    backgroundColor: THEME.colors.gray500,
  },
  filterButtonText: {
    fontSize: THEME.typography.fontSize.base,
    color: THEME.colors.textPrimary,
  },
  filterButtonTextActive: {
    color: THEME.colors.white,
    fontWeight: THEME.typography.fontWeight.bold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.borderRadius.md,
    padding: THEME.spacing.lg,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: THEME.typography.fontSize.xl,
    fontWeight: THEME.typography.fontWeight.bold,
    color: THEME.colors.textPrimary,
    marginBottom: THEME.spacing.lg,
    textAlign: 'center',
  },
  datePickerContainer: {
    marginBottom: THEME.spacing.md,
  },
  inputLabel: {
    fontSize: THEME.typography.fontSize.base,
    color: THEME.colors.textSecondary,
    marginBottom: THEME.spacing.sm,
    marginTop: THEME.spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.base,
    padding: THEME.spacing.md,
    fontSize: THEME.typography.fontSize.md,
    color: THEME.colors.textPrimary,
    backgroundColor: THEME.colors.surface,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: THEME.spacing.lg,
  },
  modalButton: {
    flex: 1,
    paddingVertical: THEME.spacing.md,
    borderRadius: THEME.borderRadius.base,
    marginHorizontal: THEME.spacing.xs,
    alignItems: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: THEME.colors.primary,
  },
  modalButtonSecondary: {
    backgroundColor: THEME.colors.gray500,
  },
  modalButtonCancel: {
    backgroundColor: THEME.colors.error,
  },
  modalButtonTextPrimary: {
    color: THEME.colors.white,
    fontSize: THEME.typography.fontSize.md,
    fontWeight: THEME.typography.fontWeight.bold,
  },
  modalButtonTextSecondary: {
    color: THEME.colors.white,
    fontSize: THEME.typography.fontSize.md,
    fontWeight: THEME.typography.fontWeight.bold,
  },
  modalButtonTextCancel: {
    color: THEME.colors.white,
    fontSize: THEME.typography.fontSize.md,
    fontWeight: THEME.typography.fontWeight.bold,
  },
  actionBar: {
    backgroundColor: THEME.colors.surface,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: THEME.spacing.md,
    paddingHorizontal: THEME.spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  actionButton: {
    flex: 1,
    paddingVertical: THEME.spacing.sm,
    paddingHorizontal: THEME.spacing.md,
    marginHorizontal: THEME.spacing.xs,
    borderRadius: THEME.borderRadius.base,
    backgroundColor: THEME.colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonPrimary: {
    backgroundColor: THEME.colors.primary,
  },
  actionButtonSuccess: {
    backgroundColor: THEME.colors.success,
  },
  actionButtonText: {
    fontSize: THEME.typography.fontSize.sm,
    color: THEME.colors.textPrimary,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
  actionButtonTextWhite: {
    fontSize: THEME.typography.fontSize.sm,
    color: THEME.colors.white,
    fontWeight: THEME.typography.fontWeight.semibold,
  },
});
