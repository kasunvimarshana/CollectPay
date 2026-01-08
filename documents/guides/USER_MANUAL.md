# User Manual

## Data Collection and Payment Management System

A comprehensive guide for end users of the Ledger mobile application.

---

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [User Roles and Permissions](#user-roles-and-permissions)
4. [Core Features](#core-features)
5. [Daily Operations](#daily-operations)
6. [Reports and Analytics](#reports-and-analytics)
7. [Offline Mode](#offline-mode)
8. [Troubleshooting](#troubleshooting)
9. [FAQs](#faqs)

---

## Introduction

### What is Ledger?

Ledger is a mobile application designed to help businesses manage daily collection of products from suppliers, track payments, and maintain accurate financial records. It's particularly useful for agricultural businesses, tea collection centers, and similar operations.

### Key Features

- ✅ **Supplier Management**: Maintain detailed supplier profiles
- ✅ **Product Tracking**: Manage products with multiple units (kg, g, lbs, etc.)
- ✅ **Daily Collections**: Record quantities collected from suppliers
- ✅ **Payment Processing**: Track advance, partial, and full payments
- ✅ **Automatic Calculations**: System calculates amounts automatically
- ✅ **Balance Tracking**: Real-time supplier balance calculations
- ✅ **Offline Support**: Work without internet connection
- ✅ **Multi-device Sync**: Access data from any device

---

## Getting Started

### Installation

#### iOS
1. Open App Store
2. Search for "Ledger"
3. Tap "Get" or "Install"
4. Wait for installation to complete

#### Android
1. Open Google Play Store
2. Search for "Ledger"
3. Tap "Install"
4. Grant necessary permissions

### First-Time Setup

1. **Launch the App**
   - Tap the Ledger icon on your device

2. **Login**
   - Enter your email address
   - Enter your password
   - Tap "Login"

3. **Initial Sync**
   - The app will sync existing data
   - Wait for sync to complete

---

## User Roles and Permissions

### Administrator
**Can do everything:**
- Manage users and roles
- Add/edit/delete suppliers
- Add/edit/delete products
- Set product rates
- Record collections
- Process payments
- View all reports
- Configure system settings

### Manager
**Can manage operations:**
- View and edit suppliers
- View and edit products
- View and manage rates
- Record collections
- Process payments
- View all reports

### Collector
**Can record data:**
- View suppliers
- View products
- Record collections
- View collection history
- View supplier balances

### Viewer
**Can view only:**
- View suppliers
- View products
- View rates
- View collections
- View payments
- View reports

---

## Core Features

### 1. Supplier Management

#### Adding a New Supplier

1. Tap the **menu icon** (☰)
2. Select **"Suppliers"**
3. Tap the **"+"** button
4. Fill in the details:
   - **Code**: Unique supplier code (e.g., SUP001)
   - **Name**: Supplier's full name
   - **Contact Person**: Primary contact
   - **Phone**: Contact number
   - **Email**: Email address (optional)
   - **Address**: Full address
   - **Region**: Geographical region
   - **Active**: Toggle to enable/disable
5. Tap **"Save"**

#### Viewing Supplier Details

1. Go to **"Suppliers"**
2. Tap on any supplier from the list
3. View complete information:
   - Basic details
   - Current balance
   - Collection history
   - Payment history

#### Editing a Supplier

1. Open supplier details
2. Tap the **"Edit"** button (pencil icon)
3. Update information
4. Tap **"Save"**

### 2. Product Management

#### Adding a New Product

1. Tap the **menu icon** (☰)
2. Select **"Products"**
3. Tap the **"+"** button
4. Fill in the details:
   - **Code**: Unique product code (e.g., TEA001)
   - **Name**: Product name (e.g., "Tea Leaves - Grade A")
   - **Description**: Optional description
   - **Base Unit**: Primary unit (e.g., "kg")
   - **Allowed Units**: Select all allowed units
     - kg (kilograms)
     - g (grams)
     - lbs (pounds)
     - liters, etc.
   - **Active**: Toggle to enable/disable
5. Tap **"Save"**

#### Setting Product Rates

1. Open product details
2. Tap **"Rate History"**
3. Tap the **"+"** button
4. Enter:
   - **Rate**: Price per unit (e.g., 250.00)
   - **Unit**: Select unit (e.g., "kg")
   - **Effective From**: Start date for this rate
   - **Effective To**: End date (optional, leave blank for ongoing)
5. Tap **"Save"**

**Note**: Historical rates are preserved automatically. Collections always use the rate that was active on the collection date.

### 3. Recording Collections

#### Step-by-Step Collection Entry

1. From the home screen, tap **"New Collection"**
   
2. **Select Supplier**
   - Tap the supplier field
   - Search or scroll to find supplier
   - Tap to select

3. **Select Product**
   - Tap the product field
   - Choose the product being collected

4. **Enter Quantity**
   - Enter the amount collected
   - Select the unit (kg, g, lbs, etc.)

5. **Verify Rate**
   - The system shows the applicable rate
   - Rate is based on the collection date

6. **Add Notes** (optional)
   - Add any relevant notes or comments

7. **Review Total**
   - The app calculates: Quantity × Rate = Total Amount
   - Example: 50.5 kg × 250.00 = 12,625.00

8. **Save**
   - Tap **"Save"** to record the collection
   - Collection is saved to local storage
   - Will sync when online

### 4. Processing Payments

#### Recording a Payment

1. From the home screen, tap **"New Payment"**

2. **Select Supplier**
   - Choose the supplier receiving payment

3. **Enter Payment Details**
   - **Amount**: Payment amount
   - **Type**: Select payment type:
     - **Advance**: Payment before collection
     - **Partial**: Part payment against balance
     - **Full**: Complete balance settlement
     - **Adjustment**: Corrections or adjustments
   - **Payment Date**: Date of payment
   - **Reference Number**: Check/transaction number
   - **Payment Method**: Cash, Check, Bank Transfer, etc.
   - **Notes**: Optional notes

4. **Save**
   - Tap **"Save"** to record the payment
   - Balance is automatically updated

#### Checking Supplier Balance

1. Go to **"Suppliers"**
2. Tap on a supplier
3. View balance summary:
   - **Total Collected**: Sum of all collections
   - **Total Paid**: Sum of all payments
   - **Balance Due**: Total Collected - Total Paid

---

## Daily Operations

### Morning Routine

1. **Start the App**
   - Launch Ledger
   - Wait for sync to complete

2. **Review Schedule**
   - Check which suppliers to visit
   - Note any special instructions

3. **Prepare for Field Work**
   - Ensure device is charged
   - Check data/WiFi availability

### During Collections

1. **At Each Supplier Location**
   - Record the collection immediately
   - Verify quantity and unit
   - Check calculated amount
   - Get supplier confirmation if needed

2. **Handle Payments**
   - Record any payments made
   - Document reference numbers
   - Take photos of receipts (if possible)

### Evening Routine

1. **Review Day's Work**
   - Check all collections recorded
   - Verify all payments logged
   - Review any errors or issues

2. **Sync Data**
   - Connect to WiFi if available
   - Let app sync all data to server
   - Verify sync completed successfully

3. **Backup**
   - Data is automatically backed up during sync
   - Keep device charged for overnight sync

---

## Reports and Analytics

### Supplier Balance Report

1. Go to **"Suppliers"**
2. Select a supplier
3. Tap **"Balance"**
4. View detailed breakdown:
   - Total collections (by product)
   - Total payments (by type)
   - Current balance

### Collection History

1. Go to **"Collections"**
2. Use filters:
   - Date range
   - Supplier
   - Product
3. View results
4. Tap any collection for details

### Payment History

1. Go to **"Payments"**
2. Use filters:
   - Date range
   - Supplier
   - Payment type
3. View results
4. Tap any payment for details

---

## Offline Mode

### How Offline Mode Works

The app automatically handles network connectivity:
- ✅ **Works offline**: You can record collections and payments without internet
- ✅ **Stores locally**: All data saved to device storage
- ✅ **Auto-sync**: Data syncs automatically when online
- ✅ **Conflict resolution**: Server data always takes precedence

### Using Offline Mode

1. **No Special Setup Required**
   - App detects network status automatically
   - Shows offline indicator when disconnected

2. **Recording Data Offline**
   - Use app normally
   - All features available
   - Data saved locally

3. **Syncing When Online**
   - App syncs automatically
   - You'll see sync progress
   - Notification when sync completes

### Best Practices for Offline Use

1. **Regular Syncing**
   - Sync at least once daily
   - Sync before field work if possible
   - Sync in the evening after work

2. **Data Management**
   - Don't clear app data/cache
   - Keep app installed
   - Don't force-stop the app

3. **Device Care**
   - Keep device charged
   - Ensure sufficient storage space
   - Update app regularly

---

## Troubleshooting

### Login Issues

**Problem**: Can't login
- ✅ Check email and password spelling
- ✅ Ensure internet connection
- ✅ Verify account is active
- ✅ Contact administrator if forgotten password

**Problem**: "Invalid credentials" error
- ✅ Verify correct email and password
- ✅ Check caps lock is off
- ✅ Request password reset

### Sync Issues

**Problem**: Data not syncing
- ✅ Check internet connection
- ✅ Ensure app has network permissions
- ✅ Try manual sync (pull down to refresh)
- ✅ Restart app

**Problem**: "Sync failed" error
- ✅ Check server status
- ✅ Verify account permissions
- ✅ Contact support if persistent

### Calculation Issues

**Problem**: Wrong amount calculated
- ✅ Verify quantity entered correctly
- ✅ Check unit selection (kg vs g, etc.)
- ✅ Verify rate is correct for date
- ✅ Report issue to administrator

### App Performance

**Problem**: App is slow
- ✅ Close other apps
- ✅ Clear app cache (Settings → Apps → Ledger → Clear Cache)
- ✅ Ensure sufficient storage space
- ✅ Update to latest version

**Problem**: App crashes
- ✅ Restart device
- ✅ Update app
- ✅ Reinstall if necessary
- ✅ Contact support with error details

---

## FAQs

### General Questions

**Q: Can I use the app on multiple devices?**
A: Yes! Login with your credentials on any device. Data syncs across all devices.

**Q: What happens if I record data on two devices simultaneously?**
A: The system uses the server data as the source of truth. Always sync frequently to avoid conflicts.

**Q: Can I edit past collections?**
A: Yes, if you have appropriate permissions. Open the collection and tap "Edit".

**Q: Can I delete a collection or payment?**
A: Yes, if you have appropriate permissions. However, deletions are logged for audit purposes.

### Collection Questions

**Q: Which rate is used for a collection?**
A: The rate that was active on the collection date. The system automatically selects the correct rate.

**Q: Can I record collections in different units?**
A: Yes! You can record in any allowed unit (kg, g, lbs, etc.). The system handles conversions.

**Q: What if I make a mistake in quantity?**
A: Edit the collection and update the quantity. The total will recalculate automatically.

### Payment Questions

**Q: What's the difference between advance and partial payment?**
A: 
- **Advance**: Payment made before collection
- **Partial**: Payment against existing balance

**Q: Can I record a payment larger than the balance?**
A: Yes, this creates a credit balance for the supplier.

**Q: How do I handle refunds?**
A: Record a payment with negative amount or use the adjustment type.

### Data and Security

**Q: Is my data secure?**
A: Yes! All data is encrypted in transit and at rest. The app uses industry-standard security.

**Q: What happens if I lose my device?**
A: Your data is safe on the server. Login from a new device to access all your data.

**Q: Can I export data?**
A: Contact your administrator for data export options.

---

## Getting Help

### Support Channels

1. **In-App Help**
   - Tap menu icon (☰)
   - Select "Help & Support"

2. **Email Support**
   - support@your-domain.com
   - Include your user ID and description

3. **Phone Support**
   - Call: +1-XXX-XXX-XXXX
   - Business hours: Mon-Fri, 9 AM - 5 PM

4. **Training**
   - Request on-site training
   - Watch video tutorials
   - Access knowledge base

### Reporting Issues

When reporting an issue, please provide:
- Your username/email
- Device type and OS version
- App version
- Detailed description of the problem
- Steps to reproduce
- Screenshots if possible

---

## Tips for Success

### Data Entry Tips

1. ✅ **Be accurate**: Double-check quantities and units
2. ✅ **Be timely**: Record collections immediately
3. ✅ **Be consistent**: Use standard codes and formats
4. ✅ **Add notes**: Document special circumstances
5. ✅ **Verify calculations**: Always review totals

### Best Practices

1. ✅ **Sync regularly**: At least once daily
2. ✅ **Keep app updated**: Install updates promptly
3. ✅ **Backup device**: Enable device backup
4. ✅ **Protect credentials**: Don't share login details
5. ✅ **Report issues**: Help improve the system

### Avoiding Common Mistakes

1. ❌ **Don't skip sync**: This causes data conflicts
2. ❌ **Don't clear app data**: You'll lose offline data
3. ❌ **Don't share accounts**: Each user should have own login
4. ❌ **Don't ignore errors**: Report them immediately
5. ❌ **Don't modify dates**: Use actual collection dates

---

## Appendix

### Glossary

- **Supplier**: Person or business from whom you collect products
- **Collection**: Recording of products collected from a supplier
- **Payment**: Money paid to a supplier
- **Balance**: Amount owed to supplier (Collections - Payments)
- **Rate**: Price per unit of product
- **Unit**: Measurement unit (kg, g, lbs, etc.)
- **Sync**: Transferring data between device and server
- **Offline Mode**: Using app without internet connection

### Keyboard Shortcuts

- **Pull down**: Refresh/sync data
- **Swipe left**: Delete item (if permitted)
- **Long press**: View options menu

### Units Reference

| Unit | Description | Abbreviation |
|------|-------------|--------------|
| Kilogram | 1000 grams | kg |
| Gram | Base weight unit | g |
| Pound | ~453.6 grams | lbs |
| Liter | Volume | L |
| Milliliter | 1/1000 liter | ml |

---

**User Manual Version**: 1.0.0  
**Last Updated**: December 29, 2025  
**For Support**: support@your-domain.com
