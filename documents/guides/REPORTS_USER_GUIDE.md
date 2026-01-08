# Reports User Guide

## Overview

The Ledger application provides comprehensive reporting capabilities that help you analyze your collection and payment data. This guide explains how to use the various reporting features available in both the mobile app and API.

---

## Table of Contents

1. [Accessing Reports](#accessing-reports)
2. [Report Types](#report-types)
3. [Using Date Filters](#using-date-filters)
4. [Understanding Report Data](#understanding-report-data)
5. [API Integration](#api-integration)
6. [Best Practices](#best-practices)

---

## Accessing Reports

### Mobile App

1. Navigate to the **Home Screen**
2. Tap on **Reports & Analytics**
3. The Reports Screen will load with the latest data

### API Access

All report endpoints are available under `/api/reports/` and require authentication:

```bash
GET /api/reports/summary
GET /api/reports/supplier-balances
GET /api/reports/collections-summary
GET /api/reports/payments-summary
GET /api/reports/product-performance
GET /api/reports/financial-summary
```

---

## Report Types

### 1. System Overview

Displays high-level metrics about your entire system:

- **Total Suppliers**: Total number of suppliers in the system
- **Active Suppliers**: Number of currently active suppliers
- **Total Products**: Total number of products
- **Active Products**: Number of currently active products
- **Total Collections**: Total number of collection records
- **Total Payments**: Total number of payment records

**Use Case**: Get a quick snapshot of your system's scale and activity.

---

### 2. Financial Summary

Shows financial metrics and outstanding balances:

- **Total Collections Amount**: Sum of all collection amounts
- **Total Payments Amount**: Sum of all payments made
- **Outstanding Balance**: Difference between collections and payments
- **This Month's Collections**: Number and amount of collections this month
- **This Month's Payments**: Number and amount of payments this month

**Use Case**: Monitor overall financial health and track month-to-month performance.

---

### 3. Top Supplier Balances

Lists suppliers with the highest outstanding balances:

- Supplier name and code
- Total collections amount
- Total payments amount
- Current balance (collections - payments)
- Number of collections
- Number of payments

**Use Case**: Identify which suppliers have the highest outstanding balances requiring payment.

---

### 4. Collections Summary

Detailed breakdown of collections:

**Overall Summary:**
- Total count of collections
- Total collection amount
- Total quantity collected

**By Product:**
- Collections grouped by product
- Quantity and amount per product

**By Supplier:**
- Collections grouped by supplier
- Quantity and amount per supplier

**Use Case**: Analyze which products are most collected and which suppliers are most active.

---

### 5. Payments Summary

Detailed breakdown of payments:

**Overall Summary:**
- Total count of payments
- Total payment amount

**By Type:**
- Advance payments
- Partial payments
- Full payments

**By Supplier:**
- Payments grouped by supplier

**Use Case**: Track payment patterns and see how payments are distributed across suppliers.

---

### 6. Product Performance

Analyze product-level metrics:

- Collection count per product
- Total quantity collected
- Total amount generated
- Number of unique suppliers
- Average rate applied

**Use Case**: Identify top-performing products and trends in pricing.

---

### 7. Financial Summary with Monthly Breakdown

Comprehensive financial analysis:

**Summary:**
- Total collections
- Total payments
- Net balance

**Monthly Breakdown:**
- Collections per month
- Payments per month
- Net balance per month

**Use Case**: Track financial trends over time and identify seasonal patterns.

---

## Using Date Filters

### Quick Filters (Mobile App)

The Reports Screen provides convenient quick filters:

1. **All Time**: Show all data (default)
2. **Today**: Show only today's data
3. **Last 7 Days**: Show data from the past week
4. **Last 30 Days**: Show data from the past month
5. **Custom Range**: Specify exact start and end dates

### Custom Date Range

To use a custom date range:

1. Tap **Custom Range** button
2. Enter start date in YYYY-MM-DD format (e.g., 2025-01-01)
3. Enter end date in YYYY-MM-DD format (e.g., 2025-12-31)
4. Tap **Apply** to filter the reports
5. Tap **Clear** to reset to all-time view

### API Date Filters

When using the API, add date parameters to your requests:

```bash
# Example: Get collections summary for January 2025
GET /api/reports/collections-summary?start_date=2025-01-01&end_date=2025-01-31

# Example: Get financial summary for Q1 2025
GET /api/reports/financial-summary?start_date=2025-01-01&end_date=2025-03-31
```

---

## Understanding Report Data

### Color Coding

The mobile app uses color coding to help you quickly interpret data:

- **Blue**: Suppliers
- **Green**: Products and positive balances
- **Orange**: Collections
- **Purple**: Payments
- **Red**: Outstanding balances (money owed)

### Balance Calculations

**Outstanding Balance** = Total Collections - Total Payments

- **Positive balance (Red)**: Money owed to suppliers
- **Zero balance (Green)**: All collections paid
- **Negative balance**: Advance payment made (rare)

### This Month vs All Time

- **All Time metrics**: Aggregate all data from the beginning
- **This Month metrics**: Only data from the current calendar month

---

## API Integration

### Authentication

All report endpoints require JWT authentication:

```javascript
const response = await fetch('http://localhost:8000/api/reports/summary', {
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN',
    'Content-Type': 'application/json'
  }
});
```

### Example: Get Supplier Balances

```javascript
// Get top 10 suppliers with highest balances
const response = await fetch(
  'http://localhost:8000/api/reports/supplier-balances?limit=10&sort=desc',
  {
    headers: {
      'Authorization': 'Bearer YOUR_JWT_TOKEN'
    }
  }
);

const balances = await response.json();
console.log(balances);
```

### Example: Get Collections by Date Range

```javascript
// Get collections for specific date range
const startDate = '2025-01-01';
const endDate = '2025-01-31';

const response = await fetch(
  `http://localhost:8000/api/reports/collections-summary?start_date=${startDate}&end_date=${endDate}`,
  {
    headers: {
      'Authorization': 'Bearer YOUR_JWT_TOKEN'
    }
  }
);

const summary = await response.json();
console.log('Total Collections:', summary.summary.total_amount);
console.log('By Product:', summary.by_product);
console.log('By Supplier:', summary.by_supplier);
```

### Example: Get Financial Trends

```javascript
// Get monthly financial breakdown
const response = await fetch(
  'http://localhost:8000/api/reports/financial-summary',
  {
    headers: {
      'Authorization': 'Bearer YOUR_JWT_TOKEN'
    }
  }
);

const financial = await response.json();

// Analyze monthly trends
financial.monthly_breakdown.forEach(month => {
  console.log(`${month.month}:`);
  console.log(`  Collections: $${month.collections}`);
  console.log(`  Payments: $${month.payments}`);
  console.log(`  Net: $${month.net}`);
});
```

---

## Best Practices

### 1. Regular Monitoring

- Check reports daily to stay updated on collections and payments
- Review supplier balances weekly to plan payments
- Analyze monthly trends at the end of each month

### 2. Use Date Filters Effectively

- Use **Today** filter for daily operations
- Use **Last 7 Days** for weekly reviews
- Use **Custom Range** for specific reporting periods (monthly, quarterly)

### 3. Focus on Key Metrics

**Daily Focus:**
- Today's collections count and amount
- Outstanding balances requiring attention

**Weekly Focus:**
- Top supplier balances
- Product performance trends

**Monthly Focus:**
- Financial summary with monthly breakdown
- Product performance analysis
- Payment patterns

### 4. Data-Driven Decisions

- Identify suppliers with consistently high balances and prioritize payments
- Analyze product performance to optimize collection rates
- Use monthly trends to predict future collection patterns

### 5. API Integration

When building custom reports:
- Cache report data to reduce API calls
- Use date filters to limit data transfer
- Implement pagination for large datasets
- Handle errors gracefully

### 6. Export and Share

For reporting to stakeholders:
- Take screenshots of mobile reports
- Use API to generate custom CSV/PDF reports
- Schedule regular report emails using API integration

---

## Troubleshooting

### Reports Not Loading

1. **Check internet connection**: Reports require online access
2. **Verify authentication**: Ensure you're logged in
3. **Refresh the screen**: Pull down to refresh
4. **Check date filters**: Invalid dates can cause errors

### Incorrect Data

1. **Verify date range**: Ensure filters are set correctly
2. **Check timezone**: Data is stored in UTC
3. **Refresh data**: Pull down to refresh
4. **Contact support**: If data appears inconsistent

### Performance Issues

1. **Limit date ranges**: Shorter date ranges load faster
2. **Use pagination**: For API calls with large datasets
3. **Close other apps**: Free up device memory
4. **Check network**: Slow networks affect load times

---

## Support

For additional help:

- **Documentation**: See [API_REFERENCE.md](./API_REFERENCE.md)
- **Technical Issues**: Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **Feature Requests**: Submit via GitHub Issues

---

## Version History

- **v1.0.0** (2025-12-30): Initial reports implementation
  - Summary reports
  - Supplier balance reports
  - Collections/Payments summaries
  - Product performance
  - Financial summaries
  - Date filtering
  - Mobile UI with quick filters

---

**Last Updated**: December 30, 2025
**Document Version**: 1.0.0
