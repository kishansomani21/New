# 🖥️ VT Automation with Parallels Desktop / Windows VM

This guide explains how to set up VT Transaction Plus automation when it's running in a Windows VM (Parallels Desktop, VMware, VirtualBox, etc.) and your main application is on macOS/Linux.

## 🎯 Architecture Overview

```
┌─────────────────────────────────────┐
│  macOS / Linux (Host)               │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  Next.js App                 │  │
│  │  (http://localhost:3000)     │  │
│  │                              │  │
│  │  Sends HTTP request to  ───────────┐
│  │  Windows VM server           │  │  │
│  └──────────────────────────────┘  │  │
└─────────────────────────────────────┘  │
                                         │
         ┌───────────────────────────────┘
         │ Network (HTTP)
         ▼
┌─────────────────────────────────────┐
│  Windows VM (Parallels Desktop)     │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  Python Flask Server         │  │
│  │  (http://0.0.0.0:5050)      │  │
│  │                              │  │
│  │  ▼                           │  │
│  │  vt_automation.py            │  │
│  │  (Desktop automation)        │  │
│  │                              │  │
│  │  ▼                           │  │
│  │  VT Transaction Plus         │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

## 📋 Setup Steps

### Step 1: Find Your Windows VM's IP Address

**In your Windows VM**, open PowerShell or Command Prompt:

```bash
ipconfig
```

Look for the IPv4 Address, something like:
- `192.168.1.xxx` (if using bridged networking)
- `10.211.55.xxx` (typical for Parallels shared networking)
- `192.168.64.xxx` (typical for Parallels host-only)

**Write this down!** You'll need it.

### Step 2: Install Python Dependencies on Windows

**In your Windows VM**:

1. Download Python from https://www.python.org/downloads/ (if not installed)
2. Open Command Prompt
3. Navigate to where you copied the automation folder
4. Install dependencies:

```bash
cd path\to\automation
pip install -r requirements.txt
```

### Step 3: Calibrate VT Transaction Plus on Windows

**In your Windows VM**, with VT Transaction Plus running:

```bash
python vt_automation.py --test-connection
python vt_automation.py --calibrate
```

Follow the calibration steps to record UI positions.

### Step 4: Start the VT Automation Server on Windows

**In your Windows VM**:

```bash
cd path\to\automation
python vt_server.py
```

You should see:
```
Starting VT Transaction Plus Automation Server...
Server will be available at http://0.0.0.0:5050
```

**Keep this running!** Minimize the window if you want.

### Step 5: Configure Your Host Machine (macOS/Linux)

**On your Mac/Linux (host)**:

1. Edit your `.env` file (create from `.env.example` if needed)

2. Add the Windows VM IP address:

```bash
# Replace with your Windows VM's IP from Step 1
VT_REMOTE_SERVER_URL=http://10.211.55.3:5050
```

3. Save the file

### Step 6: Test the Connection

**On your Mac/Linux (host)**:

Start your Next.js app:
```bash
npm run dev
```

Open http://localhost:3000/dashboard

Click "Check Connection" in the VT Invoice Creator section.

You should see "✓ Connected"!

### Step 7: Create Your First Invoice

Type in the web interface:
```
create invoice to GT Bar Services for £100
```

Watch it happen in your Windows VM! 🎉

## 🔧 Parallels Desktop Specific Settings

### Network Configuration

For best results with Parallels Desktop:

**Option A: Shared Network (Recommended)**
1. Parallels Desktop → Configure → Hardware → Network
2. Select "Shared Network"
3. Windows gets an IP like `10.211.55.xxx`
4. Use this IP in `VT_REMOTE_SERVER_URL`

**Option B: Bridged Network**
1. Parallels Desktop → Configure → Hardware → Network
2. Select "Bridged Network"
3. Windows gets an IP on your local network (e.g., `192.168.1.xxx`)
4. Use this IP in `VT_REMOTE_SERVER_URL`

### Firewall Settings

If connection fails, check Windows Firewall:

1. Windows → Settings → Update & Security → Windows Security
2. Firewall & network protection → Allow an app through firewall
3. Find Python or add it manually
4. Allow both Private and Public networks

Or temporarily disable firewall for testing (not recommended for production).

## 🚀 Running Automatically

### Auto-start Server on Windows Boot

**Option 1: Task Scheduler**

1. Open Task Scheduler (search in Start menu)
2. Create Basic Task
3. Trigger: "When I log on"
4. Action: Start a program
5. Program: `python.exe`
6. Arguments: `C:\path\to\automation\vt_server.py`

**Option 2: Create a .bat file**

Create `start_vt_server.bat`:
```batch
@echo off
cd C:\path\to\automation
python vt_server.py
pause
```

Put in your Startup folder:
`C:\Users\YourName\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup`

## 🐛 Troubleshooting

### "Failed to connect to remote VT server"

**Check 1: Is the server running?**
- Go to Windows VM, look for the Command Prompt with the server running
- Should say "Starting VT Transaction Plus Automation Server..."

**Check 2: Can you ping the Windows VM?**
On your Mac/Linux terminal:
```bash
ping 10.211.55.3  # Replace with your Windows IP
```

**Check 3: Test the server directly**
On your Mac/Linux terminal:
```bash
curl http://10.211.55.3:5050/health
```
Should return: `{"status":"ok",...}`

**Check 4: Firewall blocking?**
- Temporarily disable Windows Firewall to test
- Or add port 5050 to allowed ports

### "Connection successful but invoice not created"

**Check 1: Is VT Transaction Plus running?**
- Must be open and on main screen

**Check 2: Check server logs on Windows**
- Look at `vt_automation.log` in the automation folder
- Look at the Command Prompt where server is running

**Check 3: Re-calibrate**
- Window positions might have changed
- Run `python vt_automation.py --calibrate` again

### Windows VM goes to sleep

**Prevent sleep:**
1. Settings → System → Power & sleep
2. Set "When plugged in, PC goes to sleep after" to "Never"

## 📡 Alternative: Use Localhost (if supported)

Some VM software allows accessing host services via special addresses:

- **Parallels**: May work with `http://10.211.55.2:5050` (host IP)
- **VMware**: Try `http://host.docker.internal:5050`
- **VirtualBox**: Try `http://10.0.2.2:5050`

But generally, accessing Windows FROM Mac/Linux is easier (reverse direction).

## 🔐 Security Notes

- The Flask server has **no authentication** by default
- Only run on trusted networks (your local machine/VM)
- Do NOT expose port 5050 to the internet
- Consider adding API key authentication for production use

## 💡 Pro Tips

1. **Keep Windows VM running**: Use Parallels "Coherence Mode" to run Windows in the background

2. **Network stays stable**: Use "Shared Network" in Parallels (more stable than bridged)

3. **Multiple users**: Each user can have their own Windows VM with VT automation

4. **Testing**: Use `curl` to test the API directly:
   ```bash
   curl -X POST http://10.211.55.3:5050/create-invoice \
     -H "Content-Type: application/json" \
     -d '{"command": "create invoice to Test for £10"}'
   ```

## ✅ Quick Reference

**On Windows VM:**
```bash
# Start VT Transaction Plus
# Then start the automation server:
cd automation
python vt_server.py
```

**On Mac/Linux (Host):**
```bash
# Set in .env:
VT_REMOTE_SERVER_URL=http://10.211.55.3:5050

# Start Next.js:
npm run dev

# Open browser:
# http://localhost:3000/dashboard
```

---

**You're all set!** Now you can create VT Transaction Plus invoices from your Mac/Linux machine, even though VT only runs on Windows! 🎉
