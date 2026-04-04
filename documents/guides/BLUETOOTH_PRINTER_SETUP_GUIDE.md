# Bluetooth Thermal Printer Setup Guide

## Overview

CollectPay now supports Bluetooth thermal printers with ESC/POS compatibility for printing invoices, receipts, and job summaries directly from the mobile app. This guide will walk you through setting up and using your thermal printer.

## Table of Contents

1. [Compatible Printers](#compatible-printers)
2. [Prerequisites](#prerequisites)
3. [Initial Setup](#initial-setup)
4. [Connecting a Printer](#connecting-a-printer)
5. [Printing Documents](#printing-documents)
6. [Managing Print Queue](#managing-print-queue)
7. [Offline Printing](#offline-printing)
8. [Troubleshooting](#troubleshooting)
9. [Best Practices](#best-practices)

## Compatible Printers

The app supports most Bluetooth thermal printers that use ESC/POS commands, including:

- **58mm thermal printers** (most common for receipts)
- **80mm thermal printers** (wider format for invoices)
- Popular brands: Zebra, Star Micronics, Epson TM-series, Bixolon, Generic ESC/POS printers

### Recommended Features
- Bluetooth 4.0 or higher
- ESC/POS command support
- Rechargeable battery (for mobile use)
- Auto-cut feature (optional but convenient)

## Prerequisites

### Mobile Device Requirements

**Android:**
- Android 6.0 or higher
- Bluetooth enabled
- Location permission (required for Bluetooth scanning on Android 6-11)

**iOS:**
- iOS 13.0 or higher
- Bluetooth enabled
- Bluetooth permission granted to CollectPay

### Printer Requirements
1. Printer should be charged and powered on
2. Bluetooth should be enabled on the printer
3. Paper roll should be properly loaded

## Initial Setup

### Step 1: Enable Bluetooth Permissions

**On First Launch:**
1. Open CollectPay app
2. The app will request Bluetooth permissions
3. Tap "Allow" to grant permissions

**If Permissions Denied:**
1. Go to device Settings
2. Navigate to Apps → CollectPay → Permissions
3. Enable Bluetooth and Location permissions

### Step 2: Prepare Your Printer

1. **Power on the printer**
   - Press and hold the power button
   - Wait for the indicator light to turn on

2. **Enable Bluetooth pairing mode**
   - Most printers auto-enter pairing mode when powered on
   - Some require holding the Bluetooth button
   - Look for a blinking blue LED indicating pairing mode

3. **Load paper**
   - Open the paper compartment
   - Insert thermal paper roll (thermal side facing up)
   - Pull out a small length of paper
   - Close the compartment securely

## Connecting a Printer

### Step 1: Access Printer Settings

1. Open CollectPay app
2. Navigate to **Settings** (from Home screen)
3. Tap on **🖨️ Printer Settings**

### Step 2: Scan for Devices

1. In Printer Settings screen, tap **Scan** button
2. App will scan for nearby Bluetooth printers (takes ~10 seconds)
3. Available printers will appear in the list

**Expected printer names might include:**
- "Printer-XXXX"
- "Thermal Printer"
- "POS-XXXX"
- Brand-specific names (e.g., "Zebra-1234")

### Step 3: Connect to Printer

1. Tap on your printer from the discovered devices list
2. Wait for connection (usually 2-5 seconds)
3. Connection success message will appear
4. Printer status will show "✓ Connected"

### Step 4: Test Print (Optional)

After connecting, you can test by:
1. Go to any Collection or Payment detail
2. Tap the **🖨️ Print** button
3. Check if the receipt prints correctly

## Printing Documents

### Print Collection Invoice

1. Navigate to **Collections** screen
2. Select a collection record
3. Tap **🖨️ Print Invoice** button
4. Invoice will print immediately if printer is connected
5. If offline, job will be queued for later

**What's Printed:**
- Company header
- Invoice number (COL-XXX)
- Supplier information
- Collection details (product, quantity, rate)
- Total amount
- Notes (if any)
- Date and time

### Print Payment Receipt

1. Navigate to **Payments** screen
2. Select a payment record
3. Tap **🖨️ Print Receipt** button
4. Receipt will print immediately if connected

**What's Printed:**
- Company header
- Receipt number (PAY-XXX)
- Supplier information
- Payment details (type, method, reference)
- Amount paid
- Notes (if any)
- Date and time

### Print Job Summary

1. Navigate to **Reports** screen
2. Generate desired report
3. Tap **🖨️ Print** button (if available)
4. Summary will print with all metrics

## Managing Print Queue

### View Pending Jobs

1. Go to **Settings** → **Printer Settings**
2. View "Print Queue" section
3. See count of pending jobs

### Process Queued Jobs

**Automatic Processing:**
- Jobs automatically process when printer connects
- Failed jobs retry automatically (up to 3 times)

**Manual Processing:**
1. Ensure printer is connected
2. Go to Printer Settings
3. Tap **Process Now** button
4. All pending jobs will be processed in order

### Cancel Print Job

Currently, jobs can be cancelled through the queue management system. Future updates may add individual job cancellation from the UI.

## Offline Printing

### How It Works

1. **When Printer Unavailable:**
   - Print jobs are automatically queued
   - Jobs persist in local storage
   - PDF fallback is generated (if enabled in settings)

2. **When Printer Reconnects:**
   - Queued jobs automatically process
   - Failed jobs retry with exponential backoff
   - You'll see notifications for job completion

### PDF Fallback

If printer is unavailable and **Fallback to PDF** is enabled:
1. Document generates as PDF automatically
2. Share dialog appears
3. Save or share PDF as needed
4. Print job still queues for thermal printing later

### Configuring Offline Behavior

1. Go to **Settings** → **Printer Settings**
2. Adjust these settings:
   - **Auto Retry Failed Jobs**: Automatically retry failed prints
   - **Fallback to PDF**: Generate PDF when printer unavailable
   - **Max Retries**: Number of retry attempts (default: 3)
   - **Retry Delay**: Time between retries (default: 2 seconds)

## Troubleshooting

### Printer Not Found During Scan

**Possible Causes & Solutions:**

1. **Printer not in pairing mode**
   - Turn off printer, wait 5 seconds, turn back on
   - Check if Bluetooth LED is blinking

2. **Bluetooth permissions not granted**
   - Go to device Settings → Apps → CollectPay → Permissions
   - Enable all Bluetooth-related permissions

3. **Printer already paired with another device**
   - Unpair printer from other devices
   - Or turn off Bluetooth on other devices

4. **Printer out of range**
   - Move closer to printer (within 10 meters)
   - Ensure no obstacles between device and printer

### Connection Fails

**Solutions:**

1. **Restart printer**
   - Power off, wait 10 seconds, power on
   - Try connecting again

2. **Restart Bluetooth**
   - Turn off Bluetooth on your device
   - Wait 5 seconds, turn back on
   - Scan and connect again

3. **Clear Bluetooth cache (Android)**
   - Go to Settings → Apps → Bluetooth
   - Clear cache and data
   - Restart device

4. **Forget device and re-pair**
   - Remove printer from saved devices
   - Scan and connect fresh

### Print Quality Issues

**Solutions:**

1. **Faint printing**
   - Replace thermal paper
   - Clean print head with alcohol swab
   - Check battery level

2. **Missing lines**
   - Clean print head
   - Ensure paper is loaded correctly
   - Check for paper jam

3. **Garbled output**
   - Ensure printer is ESC/POS compatible
   - Check paper width setting matches printer (58mm/80mm)
   - Update printer firmware if available

### Print Jobs Stuck in Queue

**Solutions:**

1. **Check printer connection**
   - Ensure printer shows "Connected" status
   - Reconnect if necessary

2. **Manually process queue**
   - Go to Printer Settings
   - Tap "Process Now"

3. **Check job error messages**
   - View print jobs in queue
   - Look for specific error messages
   - Address underlying issues

4. **Clear failed jobs**
   - Cancel obviously failed jobs
   - Retry individual jobs if needed

### Bluetooth Permission Issues (Android)

**Android 12+:**
- Requires BLUETOOTH_SCAN and BLUETOOTH_CONNECT permissions
- Also requires ACCESS_FINE_LOCATION for scanning
- Grant all when prompted

**Android 6-11:**
- Requires ACCESS_FINE_LOCATION
- Grant when prompted or in Settings

**Solution if permissions denied:**
1. Go to Settings → Apps → CollectPay
2. Tap Permissions
3. Enable all Bluetooth and Location permissions
4. Restart app

## Best Practices

### Daily Operations

1. **Start of Day:**
   - Power on printer
   - Connect in app
   - Print test receipt
   - Check paper level

2. **During Day:**
   - Keep printer charged
   - Stay within Bluetooth range
   - Process queue regularly if working offline

3. **End of Day:**
   - Process any pending jobs
   - Review printed records
   - Disconnect printer (optional)

### Maintenance

1. **Weekly:**
   - Clean print head with alcohol swab
   - Check paper supply
   - Charge printer fully

2. **Monthly:**
   - Update printer firmware if available
   - Check app for updates
   - Review and clear old queued jobs

### Battery Management

1. **For Mobile Printers:**
   - Charge overnight
   - Carry charging cable
   - Consider backup printer for high-volume days

2. **Battery Conservation:**
   - Disconnect when not in use
   - Reduce print density if possible
   - Power off during breaks

### Paper Management

1. **Always carry spare rolls**
2. **Load paper correctly:**
   - Thermal side faces print head
   - Paper feeds from bottom
   - Secure compartment latch

3. **Storage:**
   - Keep paper in cool, dry place
   - Avoid direct sunlight
   - Use within 1-2 years for best quality

## Advanced Settings

### Paper Width Configuration

1. Go to Printer Settings
2. Default: 58mm (most receipt printers)
3. Change to 80mm if using wider printer
4. App formats receipts accordingly

### Custom Retry Settings

1. **Max Retries:** 1-5 attempts (default: 3)
   - Increase for unstable connections
   - Decrease to fail faster

2. **Retry Delay:** 1-10 seconds (default: 2)
   - Increase for printers that need warmup
   - Decrease for faster retry cycles

### Encoding Settings

- Default: UTF-8
- Change only if experiencing character issues
- Consult printer manual for supported encodings

## Support

### Additional Help

If you continue experiencing issues:

1. **Check printer documentation**
   - Refer to manufacturer's manual
   - Look for ESC/POS command specifications

2. **Contact Support**
   - Email: support@collectpay.com
   - Include:
     - Printer model and brand
     - Android/iOS version
     - Error messages or screenshots
     - Steps to reproduce issue

3. **Community Resources**
   - Check documentation: `/documents/guides/`
   - Review FAQs
   - Search issue tracker on GitHub

## Frequently Asked Questions

**Q: Can I use multiple printers?**
A: Yes, you can save multiple printers. Switch between them in Printer Settings.

**Q: Does it work without internet?**
A: Yes! Bluetooth printing works completely offline. Jobs queue if printer is unavailable.

**Q: What if I don't have a thermal printer?**
A: The app automatically falls back to PDF generation. You can print PDFs on any printer.

**Q: Can I print on a regular printer?**
A: Yes, via PDF export. Tap print button, then save/share the PDF and print from any device.

**Q: How many jobs can be queued?**
A: No practical limit. Jobs persist in storage until printed or cancelled.

**Q: Will this drain my phone battery?**
A: Bluetooth uses minimal power. Print operations are very brief.

**Q: Can I customize the receipt layout?**
A: Currently not user-customizable. Contact support for custom requirements.

**Q: What happens if printer runs out of paper mid-print?**
A: Job will fail and re-queue. Load paper and retry from queue.

---

## Appendix: Supported ESC/POS Commands

The app uses standard ESC/POS commands:
- Text formatting (bold, underline, size)
- Text alignment (left, center, right)
- Line feeds and paper cuts
- QR codes
- Barcodes (Code128, EAN13, UPC-A, etc.)

For technical details, see `/documents/api/PRINTER_API.md`

---

**Version:** 1.0
**Last Updated:** January 2026
**Compatible with:** CollectPay v1.0.0+
