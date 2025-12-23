# Product Rate Change Management - Implementation Guide

## Overview

This implementation adds comprehensive product rate change management capabilities to TransacTrack, enabling administrators and managers to:
- Define historical rate tracking for products
- Manage multiple rate periods with effective dates
- Ensure collections use the correct rate at the time of collection
- View rate history and current rates across the system

## Architecture

### Backend Changes

#### 1. ProductRateController (`backend/app/Http/Controllers/Api/ProductRateController.php`)

A new controller that handles all product rate operations:

**Key Features:**
- **CRUD Operations**: Create, read, update, and delete product rates
- **Validation**: Prevents overlapping rate periods
- **Rate History**: Retrieves all rates for a product
- **Current Rate**: Gets the currently active rate
- **Rate at Date**: Retrieves the rate that was effective at a specific date

**Key Methods:**
- `index()` - List all rates for a product (with optional active_only filter)
- `store()` - Create a new product rate with validation
- `show()` - Get details of a specific rate
- `update()` - Update an existing rate with overlap validation
- `destroy()` - Delete a product rate
- `getCurrentRate()` - Get the current active rate for a product
- `getRateAtDate()` - Get the rate effective at a specific date

**Validation Rules:**
- Rate must be positive
- effective_from is required
- effective_to must be after effective_from
- No overlapping rate periods allowed

#### 2. Updated ProductController

**Changes:**
- `index()` method now includes `current_rate` for each product
- This ensures the frontend always has access to current rate information

#### 3. API Routes (`backend/routes/api.php`)

New endpoints added:
```
GET    /api/products/{product}/rates              - List rates
POST   /api/products/{product}/rates              - Create rate
GET    /api/products/{product}/rates/current      - Get current rate
GET    /api/products/{product}/rates/at-date      - Get rate at date
GET    /api/products/{product}/rates/{rate}       - Get specific rate
PUT    /api/products/{product}/rates/{rate}       - Update rate
DELETE /api/products/{product}/rates/{rate}       - Delete rate
```

### Frontend Changes

#### 1. Type Definitions (`mobile/src/types/index.ts`)

Added `ProductRate` interface:
```typescript
export interface ProductRate {
  id: number;
  product_id: number;
  rate: number;
  effective_from: string;
  effective_to?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  creator?: User;
}
```

Updated `Product` interface to include:
- `rates?: ProductRate[]` - Full rate history
- `current_rate?: number` - Current active rate

#### 2. Redux State Management

**New Slice** (`mobile/src/store/slices/productRatesSlice.ts`):
- Manages product rates state
- Tracks selected product for rate management
- Handles loading and error states

**Actions:**
- `setProductRates` - Set all rates for a product
- `addProductRate` - Add new rate
- `updateProductRate` - Update existing rate
- `deleteProductRate` - Remove rate
- `setSelectedProductId` - Select product for rate management
- `setLoading` - Update loading state
- `setError` - Set error message
- `clearProductRates` - Clear rates data

#### 3. API Service (`mobile/src/services/api.ts`)

New methods added:
- `getProductRates(productId, params?)` - Fetch rates for a product
- `getProductRate(productId, rateId)` - Get specific rate
- `createProductRate(productId, data)` - Create new rate
- `updateProductRate(productId, rateId, data)` - Update rate
- `deleteProductRate(productId, rateId)` - Delete rate
- `getCurrentProductRate(productId)` - Get current rate
- `getProductRateAtDate(productId, date)` - Get historical rate

#### 4. UI Components

**ProductRateManagementScreen** (`mobile/src/screens/ProductRateManagementScreen.tsx`):
- Full-featured rate management interface
- Two-step navigation: Select product → Manage rates
- Role-based access control (admin/manager only)
- Add, edit, delete rate functionality
- Modal-based form for rate entry
- Date validation for effective periods

**Updated ProductsScreen**:
- Now displays `current_rate` alongside `base_rate`
- Highlights when current rate differs from base rate
- Color-coded display (blue for current rate)

**Updated CollectionsScreen**:
- Shows the rate used for each collection
- Displays warning if rate differs from current rate
- Helps identify collections using outdated rates

## Usage Guide

### For Administrators/Managers

#### Adding a New Product Rate

1. Navigate to Product Rate Management screen
2. Select the product you want to manage
3. Click "Add New Rate" button
4. Enter rate details:
   - **Rate**: The new price (e.g., 12.50)
   - **Effective From**: Start date (YYYY-MM-DD)
   - **Effective To**: Optional end date (YYYY-MM-DD)
5. Click "Save"

The system will:
- Validate the date range doesn't overlap with existing rates
- Track who created the rate
- Make the rate available immediately for new collections

#### Editing a Rate

1. Navigate to Product Rate Management screen
2. Select the product
3. Find the rate to edit
4. Click "Edit" button
5. Modify the details
6. Click "Save"

**Note**: Be cautious when editing rates that are already in use by collections.

#### Viewing Rate History

1. Navigate to Product Rate Management screen
2. Select a product
3. View the list of all rates, ordered by effective date
4. See who created each rate and when

### For Collectors

When creating a collection:
- The system automatically uses the current rate for the product
- The rate is locked at the time of collection creation
- Even if the rate changes later, the collection retains its original rate

### Rate Selection Logic

The system determines which rate to use based on this priority:

1. **For new collections**: 
   - If rate is provided explicitly → use that rate
   - Otherwise → use current rate (rate effective at current date)

2. **For existing collections**:
   - Rate is locked and doesn't change
   - Collections screen shows if rate differs from current

3. **Current rate determination**:
   - Find rate where `effective_from <= today`
   - And (`effective_to` is null OR `effective_to > today`)
   - Order by `effective_from` descending
   - If no rate found, use `product.base_rate`

## Database Schema

The `product_rates` table structure:
```sql
CREATE TABLE product_rates (
    id BIGINT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    rate DECIMAL(10,2) NOT NULL,
    effective_from TIMESTAMP NOT NULL,
    effective_to TIMESTAMP NULL,
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX (product_id, effective_from)
);
```

## Security Considerations

### Role-Based Access Control

- **Admin & Manager**: Full access to create, edit, delete rates
- **Collector**: Can view current rates, cannot modify
- **Viewer**: Read-only access

### Authorization Checks

- Backend validates user role for rate modifications
- Frontend hides management controls from unauthorized users
- API endpoints require authentication

### Data Integrity

- Overlapping rate validation prevents conflicts
- Foreign key constraints ensure data consistency
- Audit trail via `created_by` field

## Testing Guide

### Backend Testing

#### Test Rate Creation
```bash
# Create a rate
curl -X POST http://localhost:8000/api/products/1/rates \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rate": 12.50,
    "effective_from": "2024-02-01",
    "effective_to": null
  }'
```

#### Test Overlap Validation
```bash
# Try to create overlapping rate (should fail)
curl -X POST http://localhost:8000/api/products/1/rates \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rate": 13.00,
    "effective_from": "2024-01-15",
    "effective_to": "2024-02-15"
  }'
```

#### Test Current Rate
```bash
# Get current rate
curl -X GET http://localhost:8000/api/products/1/rates/current \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Test Historical Rate
```bash
# Get rate at specific date
curl -X GET "http://localhost:8000/api/products/1/rates/at-date?date=2024-01-15" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Frontend Testing

1. **Test Rate Management Screen**:
   - Login as admin/manager
   - Navigate to Product Rate Management
   - Select a product
   - Add a new rate
   - Edit existing rate
   - Delete a rate
   - Verify validation messages

2. **Test Products Screen**:
   - View products list
   - Verify current rate is displayed
   - Check highlighting when rate differs from base

3. **Test Collections Screen**:
   - View existing collections
   - Check rate display
   - Verify warning for outdated rates

## Common Scenarios

### Scenario 1: Seasonal Rate Change

**Problem**: Rubber prices increase during harvest season.

**Solution**:
1. Create rate with seasonal effective dates
2. Example: $10/kg (Jan-May), $12/kg (Jun-Aug), $10/kg (Sep-Dec)

```
Rate 1: $10.00, effective: 2024-01-01 to 2024-05-31
Rate 2: $12.00, effective: 2024-06-01 to 2024-08-31
Rate 3: $10.00, effective: 2024-09-01 to 2024-12-31
```

### Scenario 2: Permanent Rate Increase

**Problem**: Market rates increase, need to update going forward.

**Solution**:
1. Create new rate with current date as effective_from
2. Leave effective_to as null (open-ended)

```
Previous: $10.00, effective: 2024-01-01 to 2024-06-30
New: $12.00, effective: 2024-07-01 to null
```

### Scenario 3: Rate Correction

**Problem**: Wrong rate was entered.

**Solution**:
1. Edit the incorrect rate record
2. Or delete and create new rate with correct value
3. Note: Won't affect existing collections (they retain original rate)

## Troubleshooting

### "A rate already exists for the specified date range"

**Cause**: Trying to create a rate that overlaps with an existing rate.

**Solution**: 
- Check existing rates for the product
- Adjust effective dates to avoid overlap
- Or delete/edit the conflicting rate first

### "Permission Denied"

**Cause**: User doesn't have admin or manager role.

**Solution**:
- Verify user role in system
- Contact administrator to update role if needed

### Rate Not Updating in Collections

**Expected Behavior**: Collections retain their original rate when created.

**Explanation**: This is intentional to maintain historical accuracy. Each collection is a snapshot at the time it was created.

## Future Enhancements

Potential improvements for future versions:

1. **Rate Change Notifications**
   - Alert users when rates change
   - Email/push notifications for rate updates

2. **Bulk Rate Updates**
   - Update rates for multiple products at once
   - Import rates from CSV/Excel

3. **Rate Approval Workflow**
   - Require approval for rate changes
   - Multi-level authorization

4. **Rate Analytics**
   - Historical rate charts
   - Rate change impact analysis
   - Collection value comparison

5. **Automated Rate Updates**
   - Integration with market data feeds
   - Scheduled rate updates

6. **Rate Templates**
   - Seasonal patterns
   - Apply to multiple products

## Support

For issues or questions:
- Check API documentation: `/API.md`
- Review error messages in console
- Contact system administrator
- Submit issue on GitHub

## Changelog

### Version 1.0.0 (Current)
- Initial implementation of product rate management
- CRUD operations for product rates
- Historical rate tracking
- Current rate display in UI
- Rate validation and overlap prevention
- Role-based access control
