# PayCore User Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [User Roles](#user-roles)
3. [Authentication](#authentication)
4. [Managing Suppliers](#managing-suppliers)
5. [Managing Products](#managing-products)
6. [Recording Collections](#recording-collections)
7. [Managing Payments](#managing-payments)
8. [Reports and Analytics](#reports-and-analytics)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

## Getting Started

### System Requirements
- **Mobile Device**: Android 8.0+ or iOS 13+
- **Internet Connection**: Required for all operations
- **Screen Size**: Minimum 5" display recommended

### First Time Setup
1. Download the PayCore app from your organization
2. Open the app
3. Register with your email and create a password
4. Wait for administrator approval (if required)
5. Login with your credentials

## User Roles

### Administrator
- Full system access
- User management
- All CRUD operations
- System configuration

### Manager
- View all data
- Generate reports
- Approve transactions
- Limited editing rights

### Collector
- Record collections
- View own collections
- Record payments
- View supplier information

## Authentication

### Registration
1. Tap "Don't have an account? Register"
2. Enter your full name
3. Enter work email address
4. Create strong password (min 8 characters)
5. Confirm password
6. Tap "Register"

### Login
1. Open PayCore app
2. Enter registered email
3. Enter password
4. Tap "Login"

### Logout
1. Navigate to Home/Dashboard
2. Scroll to bottom
3. Tap "Logout" button

### Password Requirements
- Minimum 8 characters
- Mix of letters and numbers recommended
- No special requirements

## Managing Suppliers

### Adding a New Supplier

1. Navigate to **Suppliers** tab
2. Tap **"+ Add Supplier"** button
3. Fill in required information:
   - **Name*** (Required): Supplier's business name
   - **Contact Person**: Main contact name
   - **Phone**: Contact number
   - **Email**: Supplier email
   - **Address**: Physical location
   - **Registration Number**: Business registration
4. Tap **"Save"**

### Viewing Supplier Details

1. Navigate to **Suppliers** tab
2. Tap on any supplier from the list
3. View complete information including:
   - Contact details
   - Total collections amount
   - Total payments made
   - Current balance owed
   - Recent activity

### Editing Supplier Information

1. Open supplier details
2. Tap **"Edit"** button
3. Modify information as needed
4. Tap **"Save Changes"**

### Deactivating a Supplier

1. Open supplier details
2. Tap **"More Options"** (⋮)
3. Select **"Deactivate"**
4. Confirm action

*Note: Deactivated suppliers are hidden but data is preserved*

## Managing Products

### Adding a Product

1. Navigate to **Products** tab
2. Tap **"+ Add Product"**
3. Enter product information:
   - **Name*** (Required): Product name (e.g., "Tea Leaves")
   - **Code*** (Required): Unique identifier (e.g., "TEA001")
   - **Description**: Additional details
   - **Default Unit***: Standard measurement (kg, g, l, ml, unit)
4. Tap **"Save"**

### Setting Product Rates

Product rates determine how much you pay per unit. Rates can change over time, and the system maintains history.

1. Navigate to **Products** tab
2. Tap on a product
3. Tap **"Rates"** or **"+ Add Rate"**
4. Enter rate information:
   - **Unit***: Measurement unit (must match product units)
   - **Rate***: Price per unit (e.g., 150.00)
   - **Effective From***: Start date for this rate
   - **Effective To**: End date (leave blank for ongoing)
5. Tap **"Save"**

**Important Notes:**
- Historical rates are never deleted
- New collections automatically use the current rate
- Old collections keep their original rate

### Example: Rate Changes
```
Tea Leaves (per kg)
├── Jan 1 - Mar 31: Rs. 150.00/kg
├── Apr 1 - Jun 30: Rs. 165.00/kg
└── Jul 1 - ongoing: Rs. 180.00/kg
```

Collections made in February will use Rs. 150/kg permanently, even after rates change.

## Recording Collections

### Daily Collection Entry

1. Navigate to **Collections** tab
2. Tap **"+ New Collection"**
3. Fill in collection details:
   - **Date***: Collection date (default: today)
   - **Supplier***: Select from dropdown
   - **Product***: Select product
   - **Quantity***: Amount collected
   - **Unit***: Measurement unit
   - **Notes**: Any additional information
4. Review calculated amount
5. Tap **"Save Collection"**

### How Automatic Calculation Works

When you enter a collection:
1. System finds the current rate for the product and unit
2. Calculates: Total = Quantity × Rate
3. Links the specific rate to this collection
4. Updates supplier's total amount owed

**Example:**
```
Date: Dec 25, 2025
Supplier: ABC Tea Estate
Product: Tea Leaves
Quantity: 45.5 kg
Rate: Rs. 180.00/kg (automatically applied)
---
Total Amount: Rs. 8,190.00
```

### Viewing Collections

**View All Collections:**
1. Navigate to **Collections** tab
2. Scroll through list
3. Use filters to narrow results:
   - By supplier
   - By product
   - By date range
   - By collector

**View Supplier's Collections:**
1. Navigate to **Suppliers** tab
2. Tap on supplier
3. Scroll to **Collections** section
4. View all collections for this supplier

### Editing Collections

*Note: Only recent collections can be edited (within 24 hours)*

1. Open collection details
2. Tap **"Edit"**
3. Modify information
4. Tap **"Save Changes"**

## Managing Payments

### Recording a Payment

1. Navigate to **Payments** tab
2. Tap **"+ New Payment"**
3. Fill in payment details:
   - **Date***: Payment date
   - **Supplier***: Select supplier
   - **Amount***: Payment amount
   - **Type***: 
     - Advance: Payment before collections
     - Partial: Partial settlement
     - Full: Complete settlement
   - **Method**: Cash, Bank Transfer, Cheque, etc.
   - **Reference Number**: Transaction reference
   - **Notes**: Additional information
4. Tap **"Save Payment"**

### Payment Types Explained

**Advance Payment:**
- Given before collections
- Creates negative balance (supplier owes you work)
- Example: Rs. 10,000 advance for future tea leaves

**Partial Payment:**
- Partial settlement of amount owed
- Reduces outstanding balance
- Most common type

**Full Payment:**
- Complete settlement
- Clears all outstanding amounts
- Balance becomes zero

### Understanding Balances

**Supplier Balance = Total Collections - Total Payments**

**Examples:**

*Scenario 1: Balance Owed to Supplier*
```
Total Collections: Rs. 50,000
Total Payments: Rs. 35,000
Balance: Rs. 15,000 (you owe supplier)
```

*Scenario 2: Advance Given*
```
Total Collections: Rs. 20,000
Total Payments: Rs. 30,000
Balance: Rs. -10,000 (supplier received advance)
```

### Viewing Payment History

**All Payments:**
1. Navigate to **Payments** tab
2. View all transactions
3. Filter by:
   - Supplier
   - Date range
   - Payment type

**Supplier Payments:**
1. Open supplier details
2. Scroll to **Payments** section
3. View payment history

## Reports and Analytics

### Dashboard Overview

Navigate to **Home** tab to see:
- Total number of suppliers
- Total products
- Today's collections
- Recent activity

### Supplier Reports

1. Open supplier details to view:
   - Total collections amount
   - Total payments made
   - Current balance
   - Collection history
   - Payment history

### Generating Period Reports

*Feature coming in future updates*

- Monthly summaries
- Product-wise reports
- Collector-wise reports
- Export to PDF/Excel

## Best Practices

### Daily Operations

1. **Record Collections Promptly**
   - Enter data same day
   - Don't rely on memory
   - Double-check quantities

2. **Verify Auto-Calculated Amounts**
   - Review rate before saving
   - Confirm total matches expectation
   - Report discrepancies immediately

3. **Add Meaningful Notes**
   - Quality observations
   - Special circumstances
   - Weather conditions affecting collection

### Data Accuracy

1. **Double-Check Entries**
   - Verify supplier selected correctly
   - Confirm product matches collected item
   - Check unit matches measurement

2. **Update Product Rates Timely**
   - Enter new rates before effective date
   - Communicate rate changes to team
   - Maintain rate history

3. **Regular Reconciliation**
   - Review balances weekly
   - Verify with physical records
   - Report discrepancies to manager

### Security

1. **Protect Your Login**
   - Don't share credentials
   - Use strong password
   - Logout when done

2. **Data Privacy**
   - Don't screenshot sensitive data
   - Don't share supplier information
   - Follow company policies

## Troubleshooting

### Common Issues

**Problem: Cannot login**
- **Solution 1**: Verify email and password
- **Solution 2**: Check internet connection
- **Solution 3**: Contact administrator for account status

**Problem: Collections not saving**
- **Solution 1**: Check internet connection
- **Solution 2**: Verify all required fields filled
- **Solution 3**: Ensure product has active rate

**Problem: Incorrect calculation**
- **Solution 1**: Verify current product rate
- **Solution 2**: Check unit matches rate unit
- **Solution 3**: Contact support if persists

**Problem: Supplier not appearing**
- **Solution 1**: Check if supplier is active
- **Solution 2**: Refresh supplier list
- **Solution 3**: Search by name

**Problem: App running slow**
- **Solution 1**: Close and reopen app
- **Solution 2**: Check internet speed
- **Solution 3**: Clear app cache (Settings > Apps)

### Getting Help

**Technical Support:**
- Email: support@paycore.com
- Phone: [Your support number]
- Hours: Monday-Friday, 9 AM - 5 PM

**Training:**
- Contact your manager for refresher training
- Request additional sessions as needed

## Appendix

### Glossary

- **Collection**: Record of quantity collected from supplier
- **Rate**: Price per unit for a product
- **Balance**: Amount owed to or by supplier
- **Advance Payment**: Payment before collections
- **Multi-Unit**: Support for different measurement units

### Quick Reference

**Common Units:**
- kg = Kilogram
- g = Gram
- l = Liter
- ml = Milliliter
- unit = Individual item count

**Payment Types:**
- Advance = Pre-payment
- Partial = Partial settlement
- Full = Complete settlement

---

**User Guide Version**: 1.0  
**Last Updated**: 2025-12-25  
**For App Version**: 1.0.0+

For technical documentation, see ARCHITECTURE.md and DEPLOYMENT.md
