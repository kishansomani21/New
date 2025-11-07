# VT Transaction Plus API - Complete Guide

## 📋 Table of Contents

1. [Overview](#overview)
2. [What We Created](#what-we-created)
3. [API Architecture](#api-architecture)
4. [Quick Start](#quick-start)
5. [Files Created](#files-created)
6. [How to Use](#how-to-use)
7. [Testing](#testing)
8. [Examples](#examples)
9. [Next Steps](#next-steps)

---

## Overview

This guide documents the **complete VT Transaction Plus API** that has been analyzed, documented, and enhanced. The API allows you to automate invoice creation in VT Transaction Plus desktop software using natural language commands or structured data.

### What the API Does

✅ **Create Invoices** - Automate invoice creation in VT Transaction Plus
✅ **Natural Language** - Use commands like "create invoice to Customer for £100"
✅ **Structured Data** - Or use precise JSON data for programmatic access
✅ **Remote Support** - Run VT on Windows while using API from Mac/Linux
✅ **Type-Safe** - Full TypeScript types and validation
✅ **Tested** - Complete test suite and API test collection

---

## What We Created

Starting from your existing VT Transaction automation, we've created:

### ✅ Documentation
- **Complete API documentation** (`automation/API_DOCUMENTATION.md`)
- Detailed endpoint specifications
- Request/response examples
- Error handling guide
- Troubleshooting tips

### ✅ TypeScript Types
- **Type definitions** (`types/vt-transaction.ts`)
- Type-safe interfaces for all API operations
- Request/response types
- Validation functions
- Error message constants

### ✅ Enhanced API Route
- **Improved validation** (`app/api/vt-invoice/route.ts`)
- Better error handling
- Type-safe request processing
- Comprehensive error messages

### ✅ Tests
- **Integration tests** (`app/api/vt-invoice/__tests__/route.test.ts`)
- Tests for both local and remote modes
- Error case coverage
- Mock implementations for testing

### ✅ API Test Collection
- **REST Client file** (`automation/vt-api-tests.http`)
- 20+ pre-configured test requests
- Test all endpoints and scenarios
- Edge case testing
- Works with VS Code REST Client extension

### ✅ Code Examples
- **JavaScript example** (`automation/examples/javascript-example.js`)
- **Python example** (`automation/examples/python-example.py`)
- **React/TypeScript example** (`automation/examples/typescript-react-example.tsx`)
- Complete implementations with batch processing
- Error handling patterns
- Ready to use in your projects

---

## API Architecture

### System Flow

```
┌─────────────────────────────────────────────────────────┐
│  Your Application (Browser, Node.js, Python, etc.)     │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP POST/GET
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Next.js API Route (/api/vt-invoice)                    │
│  - Validates requests                                   │
│  - Type checking                                        │
│  - Routes to local or remote                            │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
┌──────────────────┐   ┌──────────────────┐
│  Local Mode      │   │  Remote Mode     │
│  (Windows only)  │   │  (Any OS)        │
│                  │   │                  │
│  Spawns Python   │   │  HTTP to Windows │
│  vt_automation   │   │  vt_server.py    │
└────────┬─────────┘   └────────┬─────────┘
         │                      │
         └──────────┬───────────┘
                    ▼
          ┌──────────────────┐
          │  Python Script   │
          │  vt_automation   │
          │  - GUI automation│
          └────────┬─────────┘
                   ▼
          ┌──────────────────┐
          │ VT Transaction+  │
          │   (Windows)      │
          └──────────────────┘
```

### Components

1. **Frontend API** (`app/api/vt-invoice/route.ts`)
   - Next.js API route
   - Handles POST (create invoice) and GET (check connection)
   - Type-safe request validation

2. **Python Automation** (`automation/vt_automation.py`)
   - GUI automation using pyautogui + pywinauto
   - Connects to VT Transaction Plus
   - Creates invoices by simulating user actions

3. **Remote Server** (`automation/vt_server.py`)
   - Flask server for Windows
   - Allows remote API access
   - Runs on port 5050

4. **Type System** (`types/vt-transaction.ts`)
   - Complete TypeScript definitions
   - Validation functions
   - Type guards

---

## Quick Start

### 1. Check Existing Setup

Your project already has:
- ✅ Python automation script
- ✅ Flask server for remote mode
- ✅ Next.js API endpoint
- ✅ React component for UI

### 2. What's New

We've added:
- ✅ Complete documentation
- ✅ TypeScript types
- ✅ Tests
- ✅ API test collection
- ✅ Code examples
- ✅ Better validation

### 3. Test the API

#### Option 1: Use VS Code REST Client

1. Install "REST Client" extension in VS Code
2. Open `automation/vt-api-tests.http`
3. Click "Send Request" above any test
4. View results inline

#### Option 2: Use curl

```bash
# Check connection
curl http://localhost:3000/api/vt-invoice

# Create invoice
curl -X POST http://localhost:3000/api/vt-invoice \
  -H "Content-Type: application/json" \
  -d '{"command": "create invoice to Test Customer for £0.01"}'
```

#### Option 3: Run Tests

```bash
# Install test dependencies (if not already)
npm install --save-dev jest @types/jest

# Run tests
npm test app/api/vt-invoice/__tests__/route.test.ts
```

---

## Files Created

### Documentation
```
automation/API_DOCUMENTATION.md          # Complete API reference
VT_API_COMPLETE_GUIDE.md                 # This file
```

### Types & Validation
```
types/vt-transaction.ts                  # TypeScript types & validation
```

### Tests
```
app/api/vt-invoice/__tests__/route.test.ts   # Integration tests
automation/vt-api-tests.http                  # REST Client test collection
```

### Examples
```
automation/examples/javascript-example.js          # JavaScript/Node.js
automation/examples/python-example.py              # Python
automation/examples/typescript-react-example.tsx   # React/TypeScript
```

### Modified Files
```
app/api/vt-invoice/route.ts             # Enhanced with validation
```

---

## How to Use

### Method 1: Natural Language API

**Simple and intuitive for human-readable commands:**

```typescript
const response = await fetch('/api/vt-invoice', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    command: 'create invoice to GT Bar Services for £100'
  })
});

const result = await response.json();
// { success: true, message: "...", details: {...} }
```

### Method 2: Structured Data API

**Precise control for programmatic use:**

```typescript
const response = await fetch('/api/vt-invoice', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    customer_name: 'GT Bar Services',
    amount: 100.00,
    description: 'Website development',
    vat_rate: 20
  })
});

const result = await response.json();
```

### Method 3: Check Connection

```typescript
const response = await fetch('/api/vt-invoice');
const status = await response.json();
// { connected: true, message: "Successfully connected" }
```

---

## Testing

### 1. Manual Testing with REST Client

Open `automation/vt-api-tests.http` in VS Code:

```http
### Test 1: Check Connection
GET http://localhost:3000/api/vt-invoice

### Test 2: Create Invoice
POST http://localhost:3000/api/vt-invoice
Content-Type: application/json

{
  "command": "create invoice to Test Customer for £0.01"
}
```

Click "Send Request" and view results inline!

### 2. Automated Tests

Run the test suite:

```bash
npm test app/api/vt-invoice/__tests__/route.test.ts
```

Tests cover:
- ✅ Request validation
- ✅ Local mode execution
- ✅ Remote mode execution
- ✅ Error handling
- ✅ Edge cases

### 3. Python Script Testing

Test directly with Python:

```bash
cd automation

# Test connection
python vt_automation.py --test-connection

# Create test invoice
python vt_automation.py "create invoice to Test for £0.01"
```

---

## Examples

### JavaScript/Node.js

See `automation/examples/javascript-example.js`:

```javascript
const { createInvoiceWithCommand } = require('./examples/javascript-example');

// Create invoice
await createInvoiceWithCommand('create invoice to Customer for £100');
```

Features:
- Natural language support
- Structured data support
- Batch processing
- Connection checking
- Error handling

### Python

See `automation/examples/python-example.py`:

```python
from examples.python_example import VTTransactionAPI

api = VTTransactionAPI()

# Create invoice
api.create_invoice_with_data(
    customer_name="Customer Name",
    amount=100.00,
    description="Services"
)

# Batch import from CSV
api.create_batch_invoices(invoices_list)
```

Features:
- Class-based API client
- Type hints
- CSV import support
- Batch processing

### React/TypeScript

See `automation/examples/typescript-react-example.tsx`:

```tsx
import { useVTTransactionAPI } from './examples/typescript-react-example';

function MyComponent() {
  const { createInvoiceWithCommand, isConnected } = useVTTransactionAPI();

  const handleCreate = async () => {
    const result = await createInvoiceWithCommand(
      'create invoice to Customer for £100'
    );

    if (result.success) {
      console.log('Created:', result.details);
    }
  };

  return <button onClick={handleCreate}>Create Invoice</button>;
}
```

Features:
- Custom React hook
- TypeScript types
- Connection status
- Loading states
- Error handling
- Batch invoice creator

---

## API Endpoints Reference

### POST /api/vt-invoice

**Create an invoice**

**Request:**
```json
{
  "command": "create invoice to Customer for £100"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Invoice created successfully",
  "details": {
    "customer": "Customer",
    "amount": 100.00,
    "vat_rate": 20,
    "description": ""
  }
}
```

### GET /api/vt-invoice

**Check VT connection**

**Response:**
```json
{
  "connected": true,
  "message": "Successfully connected to VT Transaction Plus"
}
```

---

## Configuration

### Environment Variables

Add to `.env`:

```bash
# Python path (Windows)
PYTHON_PATH=python

# Remote server (optional)
VT_REMOTE_SERVER_URL=http://192.168.1.100:5050
```

### VT Configuration

Edit `automation/vt_config.json`:

```json
{
  "window_title": "VT Transaction+",
  "delays": {
    "short": 0.5,
    "medium": 1.0,
    "long": 2.0
  },
  "coordinates": {
    "sin_button": [100, 200],
    "customer_field": [150, 300],
    ...
  }
}
```

**Important:** Run calibration first:
```bash
python automation/vt_automation.py --calibrate
```

---

## Error Handling

The API provides detailed error messages:

```typescript
{
  "success": false,
  "error": "Failed to connect to VT Transaction Plus",
  "details": ["VT not running", "Check window title in config"]
}
```

**Common Errors:**

| Error | Solution |
|-------|----------|
| Connection failed | Start VT Transaction Plus |
| Failed to click SIN button | Run calibration |
| Could not parse command | Use structured format |
| Remote server unavailable | Start vt_server.py |

---

## Best Practices

### 1. Use Type-Safe Clients

```typescript
import type { InvoiceRequest, InvoiceResponse } from '@/types/vt-transaction';
import { validateInvoiceRequest } from '@/types/vt-transaction';

// Validate before sending
const validation = validateInvoiceRequest(data);
if (!validation.valid) {
  console.error(validation.errors);
}
```

### 2. Handle Errors Gracefully

```typescript
try {
  const result = await createInvoice(data);
  if (!result.success) {
    // Show user-friendly error
    showError(result.error);
  }
} catch (error) {
  // Network error
  showError('Connection failed');
}
```

### 3. Batch Processing

```typescript
// Wait between requests
for (const invoice of invoices) {
  await createInvoice(invoice);
  await sleep(2000); // 2 second delay
}
```

### 4. Check Connection First

```typescript
const connected = await checkConnection();
if (!connected) {
  alert('VT Transaction Plus is not running');
  return;
}
```

---

## Troubleshooting

### API Returns 404

✅ Start Next.js dev server: `npm run dev`
✅ Check route exists: `app/api/vt-invoice/route.ts`

### API Returns 500

✅ Check Python is installed: `python --version`
✅ Install dependencies: `pip install -r automation/requirements.txt`
✅ Check VT is running
✅ View logs: `automation/vt_automation.log`

### Invoices Have Wrong Amounts

✅ Check VAT rate in `vt_config.json`
✅ VT expects net amount (before VAT)
✅ API calculates: net = amount / (1 + vat_rate/100)

### Automation Too Fast/Slow

✅ Adjust delays in `vt_config.json`:
```json
{
  "delays": {
    "short": 1.0,    // Increase if too fast
    "medium": 2.0,
    "long": 3.0
  }
}
```

---

## Next Steps

### 1. Start Testing

```bash
# Start dev server
npm run dev

# Open REST Client tests
code automation/vt-api-tests.http

# Run a test!
```

### 2. Try Examples

```bash
# JavaScript
node automation/examples/javascript-example.js

# Python
python automation/examples/python-example.py
```

### 3. Integrate Into Your App

Choose the example that matches your stack:
- JavaScript/Node.js → `javascript-example.js`
- Python → `python-example.py`
- React/TypeScript → `typescript-react-example.tsx`

### 4. Deploy to Production

**For Local Mode (Windows):**
- Deploy Next.js app on Windows server
- Ensure VT Transaction Plus is always running
- Use Windows Task Scheduler for auto-start

**For Remote Mode (Mac/Linux):**
- Deploy Next.js app anywhere
- Run `vt_server.py` on Windows machine
- Set `VT_REMOTE_SERVER_URL` in `.env`
- Use static IP or VPN for Windows machine

### 5. Add Authentication

```typescript
// Add API key middleware
export async function POST(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key');

  if (apiKey !== process.env.VT_API_KEY) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // ... rest of code
}
```

---

## Resources

### Documentation
- **API Reference:** `automation/API_DOCUMENTATION.md`
- **Setup Guide:** `automation/README.md`
- **This Guide:** `VT_API_COMPLETE_GUIDE.md`

### Code Examples
- **JavaScript:** `automation/examples/javascript-example.js`
- **Python:** `automation/examples/python-example.py`
- **React/TypeScript:** `automation/examples/typescript-react-example.tsx`

### Testing
- **API Tests:** `automation/vt-api-tests.http`
- **Integration Tests:** `app/api/vt-invoice/__tests__/route.test.ts`

### Types
- **TypeScript Types:** `types/vt-transaction.ts`

---

## Summary

You now have a **complete, production-ready VT Transaction Plus API** with:

✅ **Complete documentation** - Every endpoint, parameter, and error code documented
✅ **Type safety** - Full TypeScript types and validation
✅ **Comprehensive tests** - Integration tests and API test collection
✅ **Code examples** - JavaScript, Python, and React implementations
✅ **Error handling** - Detailed error messages and troubleshooting guide
✅ **Best practices** - Validation, batch processing, connection checks

**Everything you need to integrate VT Transaction Plus into your application!**

---

## Questions?

1. Check `automation/API_DOCUMENTATION.md` for detailed API reference
2. Review `automation/README.md` for setup instructions
3. Try the examples in `automation/examples/`
4. Test with `automation/vt-api-tests.http`
5. Run the test suite to verify everything works

**Happy automating! 🚀**
