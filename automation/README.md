# VT Transaction Plus Desktop Automation

Automate invoice creation in VT Transaction Plus using natural language commands!

## 🎯 Overview

This automation system allows you to create invoices in VT Transaction Plus by simply typing commands like:

```
create an invoice to GT Bar Services for £100
```

The system uses desktop automation to interact with VT Transaction Plus, just like a human would, but automatically!

## 🖥️ Requirements

### Software Requirements

1. **Windows** - VT Transaction Plus only runs on Windows
2. **VT Transaction Plus** - Must be installed and running
3. **Python 3.8+** - For the automation script
4. **Node.js 18+** - For the web interface (optional)

### Python Dependencies

Install the required Python packages:

```bash
cd automation
pip install -r requirements.txt
```

The required packages are:
- `pyautogui` - For GUI automation (mouse/keyboard control)
- `pywinauto` - For Windows application automation
- `Pillow` - For image processing
- `opencv-python` - For computer vision (optional, for image recognition)

## 🚀 Setup Instructions

### Step 1: Install Python Dependencies

```bash
cd automation
pip install -r requirements.txt
```

### Step 2: Test VT Connection

Make sure VT Transaction Plus is running, then test the connection:

```bash
python vt_automation.py --test-connection
```

You should see: `✓ Successfully connected to VT Transaction Plus`

### Step 3: Calibrate UI (IMPORTANT!)

The automation needs to know where buttons and fields are located in VT Transaction Plus. Run the calibration:

```bash
python vt_automation.py --calibrate
```

Follow the on-screen instructions:
1. Open VT Transaction Plus
2. For each element (SIN button, customer field, etc.), move your mouse to that element
3. Press Enter to record the position
4. Repeat for all elements

The positions will be saved to `vt_config.json`.

**Tips for calibration:**
- Make sure VT Transaction Plus window is in the same position you'll use it
- Maximize the window or use a consistent size
- Write down which button is which if you're unsure

### Step 4: Test Invoice Creation

Try creating a test invoice:

```bash
python vt_automation.py "create invoice to Test Customer for £10"
```

Watch as the automation clicks through VT Transaction Plus and creates the invoice!

## 📖 Usage

### Method 1: Command Line (Standalone)

Create invoices directly from the command line:

```bash
# Basic invoice
python vt_automation.py "create invoice to GT Bar Services for £100"

# With description
python vt_automation.py "create invoice to Acme Corp for £250.50 description: Consulting services"

# Alternative syntax
python vt_automation.py "invoice John Smith for £75.25"
```

### Method 2: Web Interface (Integrated)

Use the web interface for a better experience:

1. Start the Next.js development server:
   ```bash
   cd ..
   npm run dev
   ```

2. Open http://localhost:3000/dashboard

3. You'll see the "VT Transaction Plus - Invoice Creator" section

4. Type your command and press Enter!

### Method 3: API (Programmatic)

Call the API from your own applications:

```bash
curl -X POST http://localhost:3000/api/vt-invoice \
  -H "Content-Type: application/json" \
  -d '{"command": "create invoice to GT Bar Services for £100"}'
```

Or with structured data:

```bash
curl -X POST http://localhost:3000/api/vt-invoice \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "GT Bar Services",
    "amount": 100,
    "description": "Services rendered"
  }'
```

## 🎨 Natural Language Commands

The system understands various phrasings:

### Customer Name Extraction
- "create invoice to **GT Bar Services** for £100"
- "invoice **Acme Corp** for £250"
- "bill **John Smith** for £75"

### Amount Extraction
- "for **£100**"
- "for **$100**"
- "for **100 pounds**"
- "for **100.50**"

### Description (Optional)
- "description: **Consulting services**"
- "for **Web development services** for £100"
- "re: **Monthly subscription**"

## 🔧 Configuration

Edit `vt_config.json` to customize:

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
    "amount_field": [150, 350],
    "description_field": [150, 400],
    "save_button": [300, 500]
  },
  "vat_rate": 20.0
}
```

### Configuration Options

- **window_title**: Title of VT Transaction Plus window
- **delays**: Timing between actions (increase if automation is too fast)
- **coordinates**: UI element positions (set by calibration)
- **vat_rate**: Default VAT rate (20% for UK)

## 🐛 Troubleshooting

### "Could not find VT Transaction Plus"

**Solution:**
- Make sure VT Transaction Plus is running
- Check that the window title matches in `vt_config.json`
- Try running `--test-connection` to verify

### "Failed to click SIN button"

**Solution:**
- Run calibration again: `python vt_automation.py --calibrate`
- Make sure VT Transaction Plus window is in the same position
- Check that the button is visible (not hidden behind another window)

### Invoice created with wrong amount

**Solution:**
- The VAT calculation might be different than expected
- VT Transaction Plus expects net amount (before VAT)
- Check the `vat_rate` in `vt_config.json`

### Automation is too fast/slow

**Solution:**
- Adjust delays in `vt_config.json`:
  - Increase values if automation is too fast
  - Decrease values if it's too slow
- Values are in seconds (0.5 = 500ms)

### "Could not parse command"

**Solution:**
- Make sure your command includes both customer name and amount
- Use one of the supported formats (see examples above)
- Try the structured API format instead

## 🔒 Security Notes

- The automation script has FAILSAFE enabled - move mouse to top-left corner to abort
- Logs are written to `vt_automation.log` for debugging
- Never commit `vt_config.json` with sensitive coordinates to public repos
- Consider running this on a dedicated machine or VM for production use

## 🚀 Advanced Usage

### Keyboard Shortcuts

VT Transaction Plus supports keyboard shortcuts. You can modify the script to use them instead of mouse clicks:

```python
# Alt+S for Sales menu
self.window.type_keys("%S")
```

### Batch Processing

Create multiple invoices from a CSV file:

```python
import csv

with open('invoices.csv') as f:
    reader = csv.DictReader(f)
    for row in reader:
        automation.create_invoice(
            customer_name=row['customer'],
            amount=float(row['amount']),
            description=row['description']
        )
```

### Integration with Other Systems

The API endpoint can be called from:
- Zapier (via webhooks)
- Make.com (formerly Integromat)
- Custom scripts
- Other accounting software
- CRM systems

## 📊 System Architecture

```
┌─────────────────┐
│  Web Interface  │  ← You type commands here
│   (Next.js)     │
└────────┬────────┘
         │ HTTP POST
         ▼
┌─────────────────┐
│   API Endpoint  │  ← /api/vt-invoice
│  (Next.js API)  │
└────────┬────────┘
         │ Spawn process
         ▼
┌─────────────────┐
│ Python Script   │  ← vt_automation.py
│   (PyAutoGUI)   │
└────────┬────────┘
         │ GUI automation
         ▼
┌─────────────────┐
│ VT Transaction+ │  ← Desktop software
│   (Windows)     │
└─────────────────┘
```

## 📝 Logging

Check logs for debugging:

```bash
# View last 50 lines
tail -n 50 vt_automation.log

# Monitor in real-time
tail -f vt_automation.log
```

Log levels:
- INFO: Normal operations
- WARNING: Non-critical issues
- ERROR: Failed operations

## 🎓 Learning Resources

- [PyAutoGUI Documentation](https://pyautogui.readthedocs.io/)
- [PyWinAuto Documentation](https://pywinauto.readthedocs.io/)
- [VT Transaction Plus Help](https://www.vtsoftware.co.uk/transplushelp/)

## 🤝 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review `vt_automation.log` for errors
3. Run calibration again if UI positions changed
4. Ensure VT Transaction Plus is up to date

## 📄 License

MIT License - feel free to modify and use for your business!

---

**Pro Tip:** Create a desktop shortcut to the Python script for quick access, or set up voice commands using Windows Speech Recognition to create invoices hands-free!
