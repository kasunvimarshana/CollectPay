/**
 * Navigation Types
 * Type definitions for React Navigation
 */

import { StackNavigationProp } from '@react-navigation/stack';

export type RootStackParamList = {
  // Auth Screens
  Login: undefined;
  Register: undefined;
  
  // Main Screens
  Home: undefined;
  Reports: undefined;
  Settings: undefined;
  PrinterSettings: undefined;
  
  // User Screens
  UserList: undefined;
  UserDetail: { userId: number };
  UserForm: { userId?: number };
  
  // Role Screens
  RoleList: undefined;
  RoleDetail: { roleId: number };
  RoleForm: { roleId?: number };
  
  // Supplier Screens
  SupplierList: undefined;
  SupplierForm: { supplierId?: number };
  SupplierDetail: { supplierId: number };
  
  // Product Screens
  ProductList: undefined;
  ProductForm: { productId?: number };
  ProductDetail: { productId: number };
  RateHistory: { productId: number };
  
  // Rate Screens
  RateList: undefined;
  RateForm: { rateId?: number; productId?: number };
  RateDetail: { rateId: number };
  
  // Collection Screens
  CollectionList: undefined;
  CollectionForm: { collectionId?: number };
  CollectionDetail: { collectionId: number };
  
  // Payment Screens
  PaymentList: undefined;
  PaymentForm: { paymentId?: number };
  PaymentDetail: { paymentId: number };
};

export type NavigationProp = StackNavigationProp<RootStackParamList>;
