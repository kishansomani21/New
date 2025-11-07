# 🚀 Quick Start Guide - VT Transaction Plus Automation

Get up and running with automated invoice creation in 5 minutes!

## Prerequisites Check

Before you start, make sure you have:

- ✅ Windows machine (VT Transaction Plus only runs on Windows)
- ✅ VT Transaction Plus installed and activated
- ✅ Python 3.8 or higher installed ([Download Python](https://www.python.org/downloads/))
- ✅ This repository cloned to your machine

## Step-by-Step Setup

### 1. Install Python Dependencies (2 minutes)

Open Command Prompt or PowerShell and run:

```bash
cd automation
pip install -r requirements.txt
```

You should see packages being installed: pyautogui, pywinauto, Pillow, opencv-python

### 2. Open VT Transaction Plus (30 seconds)

1. Launch VT Transaction Plus on your Windows machine
2. Log in and make sure you're on the main screen
3. Leave it open in the background

### 3. Test Connection (30 seconds)

```bash
python vt_automation.py --test-connection
```

**Expected output:**
```
✓ Successfully connected to VT Transaction Plus
```

**If it fails:**
- Make sure VT Transaction Plus is running
- Check that the window title matches "VT Transaction+" (it usually does)

### 4. Calibrate UI Positions (2 minutes)

This is the most important step! The script needs to know where buttons are located.

```bash
python vt_automation.py --calibrate
```

**Follow the prompts:**

1. **"Move mouse to sin_button and press Enter..."**
   - Find the "SIN" button in VT Transaction Plus (Sales Invoice button)
   - Move your mouse directly over it
   - Press Enter

2. **"Move mouse to customer_field and press Enter..."**
   - This is where you would type the customer name when creating an invoice
   - Move your mouse to that field
   - Press Enter

3. **"Move mouse to amount_field and press Enter..."**
   - This is where you enter the invoice amount
   - Move your mouse there
   - Press Enter

4. **"Move mouse to description_field and press Enter..."**
   - Where you type the description of services/items
   - Move your mouse there
   - Press Enter

5. **"Move mouse to save_button and press Enter..."**
   - The button to save/finalize the invoice
   - Move your mouse there
   - Press Enter

**Result:** Positions saved to `vt_config.json`

### 5. Create Your First Invoice! (30 seconds)

```bash
python vt_automation.py "create invoice to Test Customer for £10"
```

Watch the magic happen! The automation will:
1. Focus VT Transaction Plus window
2. Click the SIN button
3. Type "Test Customer"
4. Enter £10 (minus VAT)
5. Save the invoice

**Success!** 🎉

## Using the Web Interface

Want a nicer interface? Start the web app:

```bash
cd ..
npm run dev
```

Then open http://localhost:3000/dashboard

You'll see the "VT Transaction Plus - Invoice Creator" section where you can type commands like:

- `create invoice to GT Bar Services for £100`
- `invoice Acme Corp for £250.50 description: Consulting services`

## Common Commands

### Basic Invoice
```bash
python vt_automation.py "create invoice to Company Name for £100"
```

### With Description
```bash
python vt_automation.py "create invoice to Company Name for £250 description: Web development services"
```

### Different Phrasings (all work!)
```bash
# These all do the same thing:
python vt_automation.py "invoice Acme Corp for £100"
python vt_automation.py "bill Acme Corp for £100"
python vt_automation.py "create invoice to Acme Corp for £100"
```

## Troubleshooting

### "Could not find VT Transaction Plus"
**Solution:** Make sure VT Transaction Plus is running and visible

### "Failed to click SIN button"
**Solution:** Run calibration again - the window might have moved

### Invoice created with wrong amount
**Solution:** Check the VAT rate in `vt_config.json` (default is 20% for UK)

### Too fast/slow
**Solution:** Edit `vt_config.json` and adjust the delay values

## Next Steps

- Read the full [README.md](README.md) for advanced features
- Set up the web interface for easier access
- Integrate with other systems via the API
- Batch process invoices from CSV files

## Tips & Tricks

1. **Keep VT in the same position** - The automation works best when the window is always in the same spot

2. **Use shortcuts** - Create a desktop shortcut to quickly create invoices

3. **Test with small amounts first** - Start with test invoices (£1, £10) before processing real ones

4. **Check the logs** - If something goes wrong, check `vt_automation.log` for details

5. **Backup your config** - Save a copy of `vt_config.json` after calibration

## Getting Help

- Check [README.md](README.md) for detailed documentation
- Review `vt_automation.log` for error details
- Ensure VT Transaction Plus is up to date

---

That's it! You're ready to automate invoice creation. Happy invoicing! 🚀
