# VT Transaction Plus API Documentation

## Overview

The VT Transaction Plus API provides a RESTful interface to automate invoice creation in VT Transaction Plus desktop software. The API accepts both natural language commands and structured data formats.

**Base URL (Local):** `http://localhost:3000/api`

**Base URL (Remote Server):** `http://<windows-machine-ip>:5050`

---

## API Endpoints

### 1. Create Invoice

Create a new invoice in VT Transaction Plus.

**Endpoint:** `POST /api/vt-invoice`

**Content-Type:** `application/json`

#### Request Format 1: Natural Language Command

```json
{
  "command": "create invoice to GT Bar Services for £100"
}
```

**Supported Command Patterns:**
- `"create invoice to [Customer Name] for £[Amount]"`
- `"invoice [Customer Name] for £[Amount]"`
- `"bill [Customer Name] for £[Amount]"`
- `"create invoice to [Customer Name] for £[Amount] description: [Description]"`

**Command Examples:**
```json
{
  "command": "create invoice to GT Bar Services for £100"
}

{
  "command": "invoice Acme Corp for £250.50 description: Consulting services"
}

{
  "command": "bill John Smith for £75.25"
}
```

#### Request Format 2: Structured Data

```json
{
  "customer_name": "GT Bar Services",
  "amount": 100.00,
  "description": "Services rendered",
  "vat_rate": 20,
  "invoice_date": "15/11/2025"
}
```

**Fields:**
- `customer_name` (string, required): Customer name
- `amount` (number, required): Invoice amount in pounds (£)
- `description` (string, optional): Invoice description/line items
- `vat_rate` (number, optional): VAT rate percentage (default: 20)
- `invoice_date` (string, optional): Invoice date in DD/MM/YYYY format

#### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Invoice created successfully for GT Bar Services - £100",
  "details": {
    "customer": "GT Bar Services",
    "amount": 100.00,
    "vat_rate": 20,
    "description": "Services rendered"
  }
}
```

#### Error Response

**Status Code:** `400 Bad Request` or `500 Internal Server Error`

```json
{
  "success": false,
  "error": "Either 'command' or 'customer_name' and 'amount' are required"
}
```

**Common Error Messages:**
- `"Either 'command' or 'customer_name' and 'amount' are required"` - Missing required fields
- `"Could not parse invoice command"` - Invalid command format
- `"Failed to connect to VT Transaction Plus"` - VT software not running
- `"Failed to click SIN button"` - UI automation failed (needs recalibration)

---

### 2. Check VT Connection Status

Test the connection to VT Transaction Plus.

**Endpoint:** `GET /api/vt-invoice`

#### Success Response

**Status Code:** `200 OK`

```json
{
  "connected": true,
  "message": "Successfully connected to VT Transaction Plus"
}
```

#### Disconnected Response

**Status Code:** `200 OK`

```json
{
  "connected": false,
  "message": "Failed to connect to VT Transaction Plus"
}
```

---

## Remote Server API (Windows)

If running the Python server on a separate Windows machine, use these endpoints:

### Base URL
`http://<windows-machine-ip>:5050`

### 1. Health Check

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok",
  "service": "VT Transaction Plus Automation Server",
  "version": "1.0.0"
}
```

### 2. Test VT Connection

**Endpoint:** `GET /test-connection`

**Response:**
```json
{
  "connected": true,
  "message": "Successfully connected"
}
```

### 3. Create Invoice

**Endpoint:** `POST /create-invoice`

**Request & Response:** Same as main API `/api/vt-invoice`

---

## Example API Calls

### Using cURL

#### Create invoice with natural language:
```bash
curl -X POST http://localhost:3000/api/vt-invoice \
  -H "Content-Type: application/json" \
  -d '{"command": "create invoice to GT Bar Services for £100"}'
```

#### Create invoice with structured data:
```bash
curl -X POST http://localhost:3000/api/vt-invoice \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "GT Bar Services",
    "amount": 100.00,
    "description": "Website development",
    "vat_rate": 20
  }'
```

#### Check connection:
```bash
curl http://localhost:3000/api/vt-invoice
```

### Using JavaScript/TypeScript

```typescript
// Create invoice
const response = await fetch('http://localhost:3000/api/vt-invoice', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    command: 'create invoice to GT Bar Services for £100'
  })
});

const result = await response.json();

if (result.success) {
  console.log('Invoice created:', result.details);
} else {
  console.error('Error:', result.error);
}
```

### Using Python

```python
import requests

# Create invoice
response = requests.post(
    'http://localhost:3000/api/vt-invoice',
    json={
        'customer_name': 'GT Bar Services',
        'amount': 100.00,
        'description': 'Services rendered'
    }
)

result = response.json()
print(result)
```

---

## Configuration

### Environment Variables

Set these in your `.env` file:

```bash
# Python path (Windows)
PYTHON_PATH=python

# Remote server URL (optional - for separate Windows machine)
VT_REMOTE_SERVER_URL=http://192.168.1.100:5050
```

### Modes of Operation

#### 1. Local Mode (Windows only)
- Run Next.js app on the same Windows machine as VT Transaction Plus
- Python script executes directly
- No `VT_REMOTE_SERVER_URL` needed

#### 2. Remote Mode (Mac/Linux → Windows)
- Run Next.js app on Mac/Linux
- Run `vt_server.py` on Windows machine
- Set `VT_REMOTE_SERVER_URL` to Windows machine IP

---

## Rate Limits

Currently no rate limiting is implemented. Consider these best practices:

- **Recommended:** Max 10 requests per minute
- **Sequential processing:** Wait for each invoice to complete before starting next
- **Automation delays:** Default 0.5-2 seconds between UI actions

---

## Error Handling

### Client-Side Error Handling

Always check the `success` field in the response:

```typescript
const result = await response.json();

if (!result.success) {
  // Handle error
  switch (result.error) {
    case 'Failed to connect to VT Transaction Plus':
      // VT not running - show user warning
      break;
    case 'Failed to click SIN button':
      // UI calibration needed
      break;
    default:
      // Generic error handling
      console.error(result.error);
  }
}
```

### Common Issues & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| Connection failed | VT not running | Start VT Transaction Plus |
| Failed to click SIN button | UI positions changed | Run calibration: `python vt_automation.py --calibrate` |
| Could not parse command | Invalid command format | Use structured data format or fix command syntax |
| Python script not found | Wrong PYTHON_PATH | Set correct path in .env |
| Remote server timeout | Server not running | Start vt_server.py on Windows |

---

## Response Time

Typical response times:

- **Connection check:** 1-2 seconds
- **Invoice creation:** 5-10 seconds (depends on VT UI response time)
- **Remote server:** +1-2 seconds network latency

---

## Security Considerations

### Authentication
⚠️ **Warning:** Currently no authentication is implemented.

**Recommendations for production:**
- Add API key authentication
- Use JWT tokens
- Implement IP whitelisting
- Run behind VPN or firewall

### Best Practices
- Only expose API on trusted networks
- Use HTTPS in production
- Log all API requests
- Validate all input data
- Sanitize customer names (avoid injection attacks)

---

## Logging

### API Logs
Next.js API logs are written to console:
```bash
npm run dev
# View logs in terminal
```

### Python Automation Logs
Check `automation/vt_automation.log`:
```bash
tail -f automation/vt_automation.log
```

### Server Logs (Remote mode)
Check `automation/vt_server.log`:
```bash
tail -f automation/vt_server.log
```

---

## Testing

### Manual Testing

1. **Test connection:**
```bash
curl http://localhost:3000/api/vt-invoice
```

2. **Create test invoice:**
```bash
curl -X POST http://localhost:3000/api/vt-invoice \
  -H "Content-Type: application/json" \
  -d '{"command": "create invoice to Test Customer for £0.01"}'
```

3. **Verify in VT Transaction Plus:**
   - Open VT
   - Check that invoice was created
   - Verify customer name and amount

### Python Script Testing

```bash
cd automation

# Test connection
python vt_automation.py --test-connection

# Create test invoice
python vt_automation.py "create invoice to Test Customer for £0.01"
```

---

## TypeScript Types

```typescript
// Request types
interface InvoiceRequest {
  command?: string;
  customer_name?: string;
  amount?: number;
  description?: string;
  vat_rate?: number;
  invoice_date?: string;
}

// Response types
interface InvoiceResult {
  success: boolean;
  message: string;
  details?: {
    customer: string;
    amount: number;
    vat_rate: number;
    description: string;
  };
  error?: string;
}

interface ConnectionStatus {
  connected: boolean;
  message: string;
  error?: string;
}
```

---

## Troubleshooting

### API returns 404
- Check that Next.js server is running: `npm run dev`
- Verify route file exists: `app/api/vt-invoice/route.ts`

### API returns 500
- Check Python is installed: `python --version`
- Check Python dependencies: `pip install -r automation/requirements.txt`
- Check VT Transaction Plus is running
- Review logs: `automation/vt_automation.log`

### Invoice created with wrong amount
- Check VAT calculation in vt_config.json
- VT expects net amount (before VAT)
- Amount shown in UI should be gross (including VAT)

### Slow response times
- Reduce delays in `vt_config.json`
- Check Windows machine performance
- Verify network latency (remote mode)

---

## Changelog

### Version 1.0.0 (Current)
- Initial API implementation
- Natural language command parsing
- Structured data support
- Remote server support
- Connection status checking

---

## Support

For issues and questions:
1. Check logs: `automation/vt_automation.log`
2. Review troubleshooting section
3. Run calibration: `python vt_automation.py --calibrate`
4. Test connection: `python vt_automation.py --test-connection`

---

## License

MIT License
