# TrackVault - Quick Reference Guide

**Version:** 2.2.0  
**Last Updated:** December 26, 2025

---

## 🚀 Quick Start

### Installation

```bash
cd frontend
npm install
npm start
```

### Backend Setup

```bash
cd backend
composer install
php artisan migrate
php artisan db:seed
php artisan serve
```

---

## 📚 New Features Quick Reference

### 1. Date Range Filter

**Import:**
```tsx
import DateRangePicker, { DateRange } from '../components/DateRangePicker';
```

**Usage:**
```tsx
const [dateRange, setDateRange] = useState<DateRange>({ 
  startDate: '', 
  endDate: '' 
});

<DateRangePicker
  label="Filter by Date Range"
  value={dateRange}
  onChange={setDateRange}
/>
```

**Filtering:**
```tsx
if (dateRange.startDate && dateRange.endDate) {
  filtered = data.filter((item) => 
    item.date >= dateRange.startDate && 
    item.date <= dateRange.endDate
  );
}
```

---

### 2. Pagination Hook

**Import:**
```tsx
import { usePagination } from '../hooks/usePagination';
```

**Usage:**
```tsx
const pagination = usePagination<YourType>({ initialPerPage: 25 });

// Load data
const loadData = async (loadMore = false) => {
  const page = loadMore ? pagination.page + 1 : 1;
  const response = await service.getAll({ 
    page, 
    per_page: pagination.perPage 
  });
  
  loadMore ? pagination.appendItems(response.data)
           : pagination.setItems(response.data);
};

// FlatList setup
<FlatList
  data={pagination.items}
  onEndReached={handleLoadMore}
  onEndReachedThreshold={0.5}
  ListFooterComponent={
    pagination.isLoadingMore ? <LoadingIndicator /> : null
  }
/>
```

---

### 3. Offline Support

**Import:**
```tsx
import { OfflineIndicator } from '../components';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { addToSyncQueue, cacheData, getCachedData } from '../utils/offlineStorage';
```

**Network Status:**
```tsx
const { isConnected } = useNetworkStatus();
```

**Caching Data:**
```tsx
// Save
await cacheData('key', data);

// Load
const cached = await getCachedData('key');
```

**Queue Operations:**
```tsx
if (!isConnected) {
  await addToSyncQueue({
    type: 'create',
    entity: 'supplier',
    data: formData,
    timestamp: new Date().toISOString(),
    retryCount: 0,
  });
}
```

**UI Indicator:**
```tsx
<OfflineIndicator />
```

---

## 🛠️ API Reference

### usePagination Hook

```tsx
interface UsePaginationReturn<T> {
  items: T[];                      // Current items
  page: number;                    // Current page
  perPage: number;                 // Items per page
  hasMore: boolean;                // More items available?
  isLoadingMore: boolean;          // Loading state
  setItems: (items: T[]) => void;  // Set initial items
  appendItems: (items: T[]) => void; // Append items
  setPerPage: (n: number) => void; // Change page size
  loadMore: () => void;            // Trigger load
  reset: () => void;               // Reset state
}
```

### Offline Storage

```tsx
// Cache management
cacheData<T>(key: string, data: T[]): Promise<void>
getCachedData<T>(key: string): Promise<T[] | null>
clearCache(key: string): Promise<void>

// Sync queue
addToSyncQueue(operation: Omit<QueuedOperation, 'id'>): Promise<void>
getSyncQueue(): Promise<QueuedOperation[]>
removeFromSyncQueue(operationId: string): Promise<void>
clearSyncQueue(): Promise<void>

// Sync timestamps
setLastSyncTime(): Promise<void>
getLastSyncTime(): Promise<string | null>
```

### Storage Keys

```tsx
STORAGE_KEYS = {
  SUPPLIERS: 'offline_suppliers',
  PRODUCTS: 'offline_products',
  COLLECTIONS: 'offline_collections',
  PAYMENTS: 'offline_payments',
  PRODUCT_RATES: 'offline_product_rates',
  SYNC_QUEUE: 'offline_sync_queue',
  LAST_SYNC: 'offline_last_sync',
}
```

---

## 📝 Common Patterns

### Pattern 1: Screen with All Features

```tsx
import React, { useState, useEffect } from 'react';
import { 
  DateRangePicker, 
  OfflineIndicator 
} from '../components';
import { usePagination } from '../hooks/usePagination';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

const MyScreen = () => {
  // Pagination
  const pagination = usePagination<MyType>({ initialPerPage: 25 });
  
  // Date range
  const [dateRange, setDateRange] = useState<DateRange>({ 
    startDate: '', 
    endDate: '' 
  });
  
  // Network status
  const { isConnected } = useNetworkStatus();
  
  // Load function
  const loadData = async (loadMore = false) => {
    const page = loadMore ? pagination.page + 1 : 1;
    const params = {
      page,
      per_page: pagination.perPage,
      start_date: dateRange.startDate,
      end_date: dateRange.endDate,
    };
    
    const response = await service.getAll(params);
    loadMore ? pagination.appendItems(response.data)
             : pagination.setItems(response.data);
  };
  
  return (
    <View>
      <OfflineIndicator />
      <DateRangePicker value={dateRange} onChange={setDateRange} />
      <FlatList
        data={pagination.items}
        onEndReached={() => pagination.hasMore && loadData(true)}
      />
    </View>
  );
};
```

---

## 🔍 Troubleshooting

### Issue: Pagination not loading more items
**Solution:** Check `onEndReachedThreshold` value and `hasMore` flag

### Issue: Date filter not working
**Solution:** Ensure date format is YYYY-MM-DD

### Issue: Offline sync fails
**Solution:** Check network connection and retry count (max 3)

### Issue: Type errors
**Solution:** Run `npm install` and check TypeScript version

---

## 📚 Documentation Files

- `FUTURE_ENHANCEMENTS_COMPLETE.md` - Feature documentation
- `COMPLETE_APPLICATION_SUMMARY.md` - Implementation summary
- `README.md` - Project overview
- `API.md` - Backend API reference

---

## 🎯 Testing Checklist

- [ ] Date range filter functionality
- [ ] Pagination infinite scroll
- [ ] Offline mode indicator
- [ ] Sync queue operations
- [ ] Manual sync button
- [ ] Load more indicator
- [ ] Page size selector
- [ ] Network transitions

---

## 💡 Pro Tips

1. **Pagination:** Start with 25 items, increase if needed
2. **Date Filters:** Use presets for common ranges
3. **Offline:** Always check `isConnected` before API calls
4. **Caching:** Cache data on successful API responses
5. **Queue:** Queue operations instead of throwing errors
6. **Sync:** Auto-sync on app startup when online

---

## 🔗 Useful Links

- **React Native:** https://reactnative.dev/
- **Expo:** https://docs.expo.dev/
- **TypeScript:** https://www.typescriptlang.org/
- **AsyncStorage:** https://react-native-async-storage.github.io/
- **NetInfo:** https://github.com/react-native-netinfo/react-native-netinfo

---

**Need Help?**

Check the comprehensive documentation:
- `FUTURE_ENHANCEMENTS_COMPLETE.md` (380+ lines)
- `COMPLETE_APPLICATION_SUMMARY.md` (370+ lines)

Or review the code examples in the implemented screens:
- `CollectionsScreen.tsx` (date range example)
- `PaymentsScreen.tsx` (date range example)
- `SuppliersScreen.tsx` (pagination example)

---

**Quick Reference Guide**  
Version 2.2.0 | December 26, 2025
