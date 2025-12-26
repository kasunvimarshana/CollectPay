# Request ID Troubleshooting Guide

## Overview

The Paywise application implements a request tracking system that assigns a unique Request ID to every API request. This guide explains how to use Request IDs for debugging and troubleshooting.

## What is a Request ID?

A Request ID is a unique identifier assigned to each API request, similar to Cloudflare Ray IDs. The format is:

```
XXXX:XXXXXX:XXXXXX:XXXXXXX:XXXXXXXX
```

**Example Request IDs:**
- `E803:33695F:FEBB20:159AC8B:694D82DD`
- `680A:D3130:281DFF:3C34BC:694D9588`
- `1415:3E295F:1160323:17C0935:694D9795`
- `47F0:6B87BA:BDD8DD:049924E:5974BF87`

## Why Request IDs Matter

Request IDs help you:

1. **Track Requests Across Systems**: Follow a single request through multiple services and logs
2. **Debug Issues**: Identify exactly which request caused a problem
3. **Report Bugs**: Provide precise information when reporting issues
4. **Correlate Events**: Match client-side errors with server-side logs
5. **Multi-User Debugging**: Distinguish between requests from different users/devices

## How to Find Request IDs

### In API Responses

Every API response includes the Request ID in the `X-Request-ID` header:

```bash
curl -i http://localhost:8000/api/user
```

Response headers:
```
HTTP/1.1 200 OK
X-Request-ID: 47F0:6B87BA:BDD8DD:049924E:5974BF87
Content-Type: application/json
...
```

### In Error Responses

Error responses include the Request ID in both the header and the JSON body:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email field is required."]
  },
  "request_id": "47F0:6B87BA:BDD8DD:049924E:5974BF87"
}
```

### In Application Logs

Server logs automatically include the Request ID in the context:

```
[2025-12-25 20:21:21] local.ERROR: Database connection failed {"request_id":"47F0:6B87BA:BDD8DD:049924E:5974BF87"}
```

### In Frontend (React Native)

The frontend automatically captures and logs Request IDs:

```javascript
// In development mode, check console logs
[Request ID: 47F0:6B87BA:BDD8DD:049924E:5974BF87] GET /api/suppliers

// Error logs include Request ID
[Request ID: 47F0:6B87BA:BDD8DD:049924E:5974BF87] Error: {
  status: 422,
  message: "Validation failed"
}
```

## Using Request IDs for Troubleshooting

### Scenario 1: User Reports an Error

**User says:** "I got an error when trying to add a supplier."

**Ask for the Request ID:**
1. Have the user check the error message on screen
2. The Request ID should be displayed in the error message or available in app logs

**With the Request ID, you can:**
1. Search server logs: `grep "47F0:6B87BA:BDD8DD:049924E:5974BF87" storage/logs/laravel.log`
2. Find the exact request, parameters, and error
3. See the full stack trace and context

### Scenario 2: Intermittent Issue

**Problem:** "Sometimes collections fail to save, but I can't reproduce it."

**Solution:**
1. Collect Request IDs from both successful and failed requests
2. Compare the logs for differences
3. Identify patterns (specific users, times, data)

**Example:**
```bash
# Successful request
grep "A1B2:3C4D5E:6F7890:1234567:89ABCDEF" storage/logs/laravel.log

# Failed request
grep "B2C3:4D5E6F:789012:2345678:9ABCDEF0" storage/logs/laravel.log
```

### Scenario 3: Multi-User Conflict

**Problem:** "Two users updated the same supplier, and one of the updates was lost."

**Solution:**
1. Get Request IDs from both users' actions
2. Check logs to see the order of requests
3. Verify optimistic locking worked correctly
4. See which version was used by each request

### Scenario 4: Performance Issue

**Problem:** "One API request is very slow."

**Solution:**
1. Note the Request ID of the slow request
2. Search logs for timing information
3. Identify which database queries or operations took longest

## Searching Logs with Request IDs

### Search in Laravel Logs

```bash
# Find all logs for a specific request
cd backend
grep "REQUEST_ID" storage/logs/laravel.log

# Search with context (5 lines before and after)
grep -C 5 "REQUEST_ID" storage/logs/laravel.log

# Count occurrences
grep -c "REQUEST_ID" storage/logs/laravel.log
```

### Using Laravel Pail (Real-time Logs)

```bash
cd backend
php artisan pail --filter="REQUEST_ID"
```

### Search in Multiple Log Files

```bash
cd backend/storage/logs
grep -r "REQUEST_ID" .
```

## Providing Request IDs in Bug Reports

When reporting a bug, always include:

1. **Request ID**: The exact ID from the failed request
2. **Timestamp**: When the error occurred
3. **User Action**: What the user was trying to do
4. **Expected vs Actual**: What should have happened vs what actually happened

**Good Bug Report Example:**

```
Title: Failed to create supplier

Description:
When creating a supplier with code "SUP123", the API returned a 500 error.

Request ID: 47F0:6B87BA:BDD8DD:049924E:5974BF87
Timestamp: 2025-12-25 20:21:21 UTC
User: admin@paywise.com
Action: POST /api/suppliers

Request Body:
{
  "name": "New Supplier",
  "code": "SUP123",
  "email": "supplier@example.com"
}

Error Response:
{
  "message": "Server Error",
  "request_id": "47F0:6B87BA:BDD8DD:049924E:5974BF87"
}

Expected: Supplier created successfully
Actual: 500 Internal Server Error
```

## Advanced: Custom Request IDs

For advanced debugging, clients can provide their own Request IDs:

```javascript
// React Native example
const customRequestId = generateCustomId();

axios.get('/api/suppliers', {
  headers: {
    'X-Request-ID': customRequestId
  }
});

// Now you can correlate client-side and server-side events
console.log(`Sent request with ID: ${customRequestId}`);
```

This is useful for:
- End-to-end tracing across multiple services
- Correlating mobile app events with API calls
- A/B testing and analytics

## Request ID Format Specification

The Request ID format follows this pattern:

- **Segment 1**: 4 hex characters (16 bits)
- **Segment 2**: 6 hex characters (24 bits)
- **Segment 3**: 6 hex characters (24 bits)
- **Segment 4**: 7 hex characters (28 bits)
- **Segment 5**: 8 hex characters (32 bits)

**Total**: 31 hex characters = 124 bits of entropy

This provides:
- ~2.1×10³⁷ possible unique IDs
- Virtually no collision risk
- Easy to read and communicate
- Compatible with log parsing tools

## Best Practices

1. **Always Log Request IDs**: Include them in all log messages
2. **Display in Errors**: Show Request IDs to users in error messages
3. **Store for Analytics**: Consider storing Request IDs with important events
4. **Correlate Events**: Use Request IDs to link related operations
5. **Include in Support**: Always ask for Request IDs when helping users

## Security Considerations

Request IDs are **not sensitive** and can be safely:
- Displayed to users
- Logged in plain text
- Shared in bug reports
- Used in analytics

Request IDs do **not** contain:
- User information
- Authentication tokens
- Business data
- Personally identifiable information (PII)

## Conclusion

Request IDs are a powerful tool for debugging, troubleshooting, and supporting users. By consistently using Request IDs, you can:

- Reduce debugging time
- Improve issue reproduction
- Better understand system behavior
- Provide better user support

**Remember**: When in doubt, always ask for the Request ID!
