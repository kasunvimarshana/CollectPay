# Product Rate Management - Quick Reference Guide

## For Administrators and Managers

### Accessing Rate Management
1. Login to TransacTrack mobile app
2. Look for "Rate Mgmt" tab at the bottom (only visible to admins/managers)
3. Tap to open Product Rate Management screen

### Adding a New Product Rate

**When to use:**
- Product price has changed
- Seasonal price adjustment
- Market rate update

**Steps:**
1. Tap "Rate Mgmt" tab
2. Select the product from the list
3. Tap "Add New Rate" button
4. Fill in the form:
   - **Rate**: Enter the new price (e.g., 12.50)
   - **Effective From**: Start date in YYYY-MM-DD format (e.g., 2024-12-01)
   - **Effective To**: End date (optional, leave empty for ongoing rates)
5. Tap "Save"

**Important:**
- System will prevent overlapping date ranges
- New rate takes effect immediately for new collections
- Existing collections keep their original rates

### Editing an Existing Rate

**Steps:**
1. Navigate to Rate Mgmt → Select product
2. Find the rate you want to edit
3. Tap "Edit" button
4. Modify the fields
5. Tap "Save"

**Warning:** Be careful when editing rates that are currently in use. Consider creating a new rate instead.

### Deleting a Rate

**Steps:**
1. Navigate to Rate Mgmt → Select product
2. Find the rate to delete
3. Tap "Delete" button
4. Confirm deletion

**Note:** Existing collections using this rate will retain their values.

### Viewing Rate History

**Steps:**
1. Navigate to Rate Mgmt
2. Select a product
3. View all rates listed by effective date
4. See who created each rate and when

## For Collectors

### Creating a Collection with Current Rate

**Automatic Rate Application:**
When you create a collection, the system automatically uses the current product rate. You don't need to enter it manually.

**Steps:**
1. Navigate to Collections screen
2. Create new collection
3. Select supplier and product
4. Enter quantity
5. Rate is automatically filled with current rate
6. Complete and save

**What happens:**
- System checks the current date
- Finds the active rate for selected product
- Applies that rate to your collection
- Rate is locked and won't change

### Understanding Rate Warnings

On the Collections screen, you might see:
```
Rate at collection: $10.00
⚠ Current rate: $12.00
```

**What this means:**
- Your collection was created when the rate was $10.00
- The current rate has changed to $12.00
- Your collection's value remains $10.00 (unchanged)
- This is normal and expected behavior

## Common Scenarios

### Scenario 1: Seasonal Price Change

**Example:** Rubber prices increase during harvest season (June-August)

**Solution:**
1. Create rate for high season:
   - Rate: $12.00
   - Effective From: 2024-06-01
   - Effective To: 2024-08-31

2. Create rate for normal season:
   - Rate: $10.00
   - Effective From: 2024-09-01
   - Effective To: (leave empty)

### Scenario 2: Permanent Price Increase

**Example:** Market rate increased, effective immediately

**Solution:**
1. Create new rate:
   - Rate: $15.00
   - Effective From: (today's date)
   - Effective To: (leave empty for ongoing)

Old collections keep their rates, new ones use $15.00

### Scenario 3: Correcting a Wrong Rate

**Example:** Entered $10.00 but meant $12.00

**Options:**

**Option A - Edit (if no collections created yet):**
1. Edit the rate
2. Change value to $12.00
3. Save

**Option B - Delete and recreate (if collections exist):**
1. Create new rate with correct value
2. Delete the incorrect rate
3. Note: Existing collections retain their values

## Tips and Best Practices

### For Administrators

✅ **DO:**
- Document rate changes with notes
- Plan rate changes in advance
- Inform collectors of upcoming changes
- Review rate history regularly
- Use specific effective dates

❌ **DON'T:**
- Create overlapping rate periods (system prevents this)
- Delete rates currently in use without planning
- Change historical rates arbitrarily
- Forget to set effective dates

### For Collectors

✅ **DO:**
- Check current rate before creating collections
- Note any rate warnings on collections screen
- Create collections promptly to use current rates
- Sync regularly when online

❌ **DON'T:**
- Worry about rate warnings on old collections (expected)
- Try to manually change rates (automatic application is best)
- Delay syncing pending collections

## Offline Functionality

### How Rates Work Offline

**When you go offline:**
- Last synced product rates are cached locally
- You can view rate history
- Collections use cached current rates
- Rate management screen still accessible (admin/manager)

**When you come back online:**
- System automatically syncs
- Updated product rates are fetched
- Local cache is refreshed
- All pending collections are synced with their rates

### Important Notes

- **Collections created offline** use the last known current rate
- **Rate changes while offline** won't affect your device until next sync
- **Pending collections** will sync with the rate they were created with
- **Always sync** when possible to get latest rates

## Troubleshooting

### "A rate already exists for the specified date range"

**Cause:** Trying to create a rate that overlaps with an existing one.

**Solution:**
1. Check existing rates for the product
2. Adjust dates to avoid overlap
3. Or edit/delete the conflicting rate first

### "Permission Denied"

**Cause:** Your user role doesn't have access to rate management.

**Solution:**
- Check with administrator about your role
- Only admin and manager roles can manage rates
- Collectors and viewers have read-only access

### Rate Not Showing in Collections

**Cause:** Collections use the rate from when they were created.

**Expected Behavior:** This is intentional. Collections are historical records.

**Explanation:** Each collection is a snapshot. If rate changed after creation, the collection keeps its original rate for accuracy.

### "Rate Mgmt" Tab Not Visible

**Cause:** Your user role is not admin or manager.

**Solution:**
- Only admins and managers can access rate management
- Contact your administrator if you need access
- Collectors can still view rates in Products screen

## Quick Reference Chart

| Task | Who Can Do It | Where | Result |
|------|---------------|-------|--------|
| Add rate | Admin, Manager | Rate Mgmt tab | New rate created |
| Edit rate | Admin, Manager | Rate Mgmt tab | Rate updated |
| Delete rate | Admin, Manager | Rate Mgmt tab | Rate removed |
| View rates | Everyone | Products or Rate Mgmt | See rate info |
| Create collection | Collector, Admin, Manager | Collections tab | Uses current rate |
| View rate warnings | Everyone | Collections screen | See rate changes |

## Support

If you encounter issues:

1. **Check this guide first** for common solutions
2. **Review error messages** - they often explain the problem
3. **Contact your administrator** for permission issues
4. **Check your connection** for sync problems
5. **Submit feedback** through the app or GitHub

## Summary

**Key Points to Remember:**

📌 **For Admins/Managers:**
- Use Rate Mgmt tab to manage product rates
- Rates have effective date ranges
- System prevents overlapping rates
- Changes apply to new collections immediately

📌 **For Collectors:**
- System automatically applies current rates
- Collections lock in their rate at creation
- Rate warnings are normal for old collections
- Sync regularly to get latest rates

📌 **General:**
- Works offline with cached rates
- Historical data is preserved
- Role-based access control
- Automatic synchronization

---

**Version:** 1.1.0  
**Last Updated:** December 2024  
**For Technical Details:** See PRODUCT_RATE_MANAGEMENT.md
