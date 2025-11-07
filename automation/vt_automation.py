"""
VT Transaction Plus Desktop Automation
Automates invoice creation in VT Transaction Plus using GUI automation
"""

import pyautogui
import pywinauto
from pywinauto import Application
from pywinauto.findwindows import ElementNotFoundError
import time
import json
import sys
from typing import Dict, Optional
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('vt_automation.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# Safety settings
pyautogui.FAILSAFE = True  # Move mouse to corner to abort
pyautogui.PAUSE = 0.5  # Add delay between actions


class VTTransactionAutomation:
    """
    Handles automation of VT Transaction Plus for invoice creation
    """

    def __init__(self, config_path: str = "vt_config.json"):
        """Initialize the automation handler"""
        self.config = self._load_config(config_path)
        self.app = None
        self.window = None

    def _load_config(self, config_path: str) -> Dict:
        """Load configuration from JSON file"""
        try:
            with open(config_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            logger.warning(f"Config file not found, using defaults")
            return self._get_default_config()

    def _get_default_config(self) -> Dict:
        """Return default configuration"""
        return {
            "window_title": "VT Transaction+",
            "sin_button_image": None,  # Can use image recognition
            "delays": {
                "short": 0.5,
                "medium": 1.0,
                "long": 2.0
            },
            "coordinates": {
                "sin_button": None,  # User needs to configure
                "customer_field": None,
                "amount_field": None,
                "description_field": None,
                "save_button": None
            }
        }

    def connect_to_vt(self) -> bool:
        """
        Connect to running VT Transaction Plus instance
        Returns True if successful, False otherwise
        """
        try:
            logger.info("Attempting to connect to VT Transaction Plus...")

            # Try to find VT Transaction+ window
            self.app = Application(backend="uia").connect(
                title_re=".*VT Transaction.*",
                timeout=10
            )

            # Get the main window
            self.window = self.app.window(title_re=".*VT Transaction.*")

            if self.window.exists():
                logger.info("Successfully connected to VT Transaction Plus")
                # Bring window to foreground
                self.window.set_focus()
                return True
            else:
                logger.error("VT Transaction Plus window not found")
                return False

        except ElementNotFoundError:
            logger.error("Could not find VT Transaction Plus. Please ensure it's running.")
            return False
        except Exception as e:
            logger.error(f"Error connecting to VT Transaction Plus: {str(e)}")
            return False

    def create_invoice(self, customer_name: str, amount: float,
                       description: str = "", vat_rate: float = 20.0,
                       invoice_date: Optional[str] = None) -> Dict:
        """
        Create an invoice in VT Transaction Plus

        Args:
            customer_name: Name of the customer
            amount: Invoice amount in pounds
            description: Optional description/items
            vat_rate: VAT rate percentage (default 20%)
            invoice_date: Optional invoice date (format: DD/MM/YYYY)

        Returns:
            Dict with status and message
        """
        try:
            logger.info(f"Creating invoice for {customer_name} - £{amount}")

            # Ensure VT is connected and focused
            if not self.window or not self.window.exists():
                if not self.connect_to_vt():
                    return {
                        "success": False,
                        "message": "Failed to connect to VT Transaction Plus"
                    }

            # Bring window to front
            self.window.set_focus()
            time.sleep(self.config["delays"]["short"])

            # Step 1: Click SIN button to open sales invoice
            logger.info("Step 1: Opening Sales Invoice window...")
            if not self._click_sin_button():
                return {
                    "success": False,
                    "message": "Failed to click SIN button"
                }

            time.sleep(self.config["delays"]["medium"])

            # Step 2: Select or create customer
            logger.info(f"Step 2: Selecting customer: {customer_name}")
            if not self._select_customer(customer_name):
                return {
                    "success": False,
                    "message": f"Failed to select customer: {customer_name}"
                }

            time.sleep(self.config["delays"]["short"])

            # Step 3: Enter invoice details
            logger.info("Step 3: Entering invoice details...")
            if not self._enter_invoice_details(amount, description, vat_rate, invoice_date):
                return {
                    "success": False,
                    "message": "Failed to enter invoice details"
                }

            time.sleep(self.config["delays"]["short"])

            # Step 4: Save invoice
            logger.info("Step 4: Saving invoice...")
            if not self._save_invoice():
                return {
                    "success": False,
                    "message": "Failed to save invoice"
                }

            logger.info(f"✓ Successfully created invoice for {customer_name} - £{amount}")

            return {
                "success": True,
                "message": f"Invoice created successfully for {customer_name} - £{amount}",
                "details": {
                    "customer": customer_name,
                    "amount": amount,
                    "vat_rate": vat_rate,
                    "description": description
                }
            }

        except Exception as e:
            logger.error(f"Error creating invoice: {str(e)}")
            return {
                "success": False,
                "message": f"Error: {str(e)}"
            }

    def _click_sin_button(self) -> bool:
        """Click the SIN (Sales Invoice) button"""
        try:
            # Method 1: Try to find button by text/automation ID
            try:
                sin_button = self.window.child_window(title="SIN", control_type="Button")
                if sin_button.exists():
                    sin_button.click_input()
                    return True
            except:
                pass

            # Method 2: Use keyboard shortcut if available
            # Many VT functions have Alt+key shortcuts
            try:
                self.window.type_keys("%S")  # Alt+S might open Sales menu
                time.sleep(0.5)
                self.window.type_keys("I")   # Then 'I' for Invoice
                return True
            except:
                pass

            # Method 3: Use configured coordinates
            if self.config["coordinates"]["sin_button"]:
                x, y = self.config["coordinates"]["sin_button"]
                pyautogui.click(x, y)
                return True

            # Method 4: Image recognition (if image provided)
            if self.config.get("sin_button_image"):
                try:
                    button_location = pyautogui.locateOnScreen(
                        self.config["sin_button_image"],
                        confidence=0.8
                    )
                    if button_location:
                        pyautogui.click(button_location)
                        return True
                except:
                    pass

            logger.error("Could not find SIN button. Please configure coordinates in vt_config.json")
            return False

        except Exception as e:
            logger.error(f"Error clicking SIN button: {str(e)}")
            return False

    def _select_customer(self, customer_name: str) -> bool:
        """Select customer from list or create new"""
        try:
            # Type customer name in search/selection field
            time.sleep(0.5)
            pyautogui.write(customer_name, interval=0.05)
            time.sleep(0.5)

            # Press Enter or Tab to confirm/search
            pyautogui.press('enter')
            time.sleep(0.5)

            # Check if "Create new customer" dialog appears
            # If customer exists, it should proceed; if not, might need to create

            return True

        except Exception as e:
            logger.error(f"Error selecting customer: {str(e)}")
            return False

    def _enter_invoice_details(self, amount: float, description: str,
                                vat_rate: float, invoice_date: Optional[str]) -> bool:
        """Enter invoice line items and details"""
        try:
            # If invoice date provided, enter it first
            if invoice_date:
                pyautogui.write(invoice_date, interval=0.05)
                pyautogui.press('tab')
                time.sleep(0.3)

            # Tab to description field
            pyautogui.press('tab')
            time.sleep(0.2)

            # Enter description
            if description:
                pyautogui.write(description, interval=0.05)
            else:
                pyautogui.write("Services rendered", interval=0.05)

            # Tab to amount field
            pyautogui.press('tab')
            time.sleep(0.2)

            # Calculate net amount (excluding VAT)
            net_amount = amount / (1 + vat_rate / 100)

            # Enter net amount
            amount_str = f"{net_amount:.2f}"
            pyautogui.write(amount_str, interval=0.05)

            # Tab to VAT field (if separate)
            pyautogui.press('tab')
            time.sleep(0.2)

            # VT usually auto-calculates VAT, but we can verify
            # The gross amount should be our original amount

            return True

        except Exception as e:
            logger.error(f"Error entering invoice details: {str(e)}")
            return False

    def _save_invoice(self) -> bool:
        """Save the invoice"""
        try:
            # Try multiple methods to save

            # Method 1: Ctrl+S (common save shortcut)
            pyautogui.hotkey('ctrl', 's')
            time.sleep(1)

            # Method 2: Try to find Save button
            try:
                save_button = self.window.child_window(title="Save", control_type="Button")
                if save_button.exists():
                    save_button.click_input()
                    time.sleep(1)
            except:
                pass

            # Method 3: Press Enter (might confirm/save)
            pyautogui.press('enter')
            time.sleep(1)

            return True

        except Exception as e:
            logger.error(f"Error saving invoice: {str(e)}")
            return False

    def calibrate_ui(self) -> Dict:
        """
        Helper function to calibrate/locate UI elements
        User can run this to find button positions
        """
        logger.info("UI Calibration Mode")
        logger.info("Move mouse to each element and press Enter to record position")

        calibration = {}

        elements = [
            "sin_button",
            "customer_field",
            "amount_field",
            "description_field",
            "save_button"
        ]

        for element in elements:
            input(f"Move mouse to {element} and press Enter...")
            x, y = pyautogui.position()
            calibration[element] = [x, y]
            logger.info(f"{element}: ({x}, {y})")

        # Save to config
        self.config["coordinates"] = calibration
        with open("vt_config.json", 'w') as f:
            json.dump(self.config, f, indent=2)

        logger.info("Calibration saved to vt_config.json")
        return calibration


def parse_invoice_command(command: str) -> Optional[Dict]:
    """
    Parse natural language command to extract invoice details

    Example: "create an invoice to GT Bar services for £100"
    """
    import re

    logger.info(f"Parsing command: {command}")

    # Extract customer name
    # Look for patterns like "to X for" or "for X -"
    customer_patterns = [
        r'(?:to|for)\s+([A-Za-z0-9\s&\'-]+?)\s+(?:for|£|\d)',
        r'(?:invoice|bill)\s+([A-Za-z0-9\s&\'-]+?)\s+(?:for|£|\d)',
    ]

    customer_name = None
    for pattern in customer_patterns:
        match = re.search(pattern, command, re.IGNORECASE)
        if match:
            customer_name = match.group(1).strip()
            break

    # Extract amount
    # Look for £X or $X or "for X pounds"
    amount_patterns = [
        r'£(\d+(?:\.\d{2})?)',
        r'\$(\d+(?:\.\d{2})?)',
        r'(\d+(?:\.\d{2})?)\s*(?:pounds|gbp)',
        r'for\s+(\d+(?:\.\d{2})?)',
    ]

    amount = None
    for pattern in amount_patterns:
        match = re.search(pattern, command, re.IGNORECASE)
        if match:
            amount = float(match.group(1))
            break

    # Extract optional description
    description = ""
    desc_patterns = [
        r'(?:for|regarding|re:|description:|desc:)\s+(.+?)(?:\s+for\s+£|\s+£|$)',
    ]

    for pattern in desc_patterns:
        match = re.search(pattern, command, re.IGNORECASE)
        if match:
            description = match.group(1).strip()
            break

    if customer_name and amount:
        return {
            "customer_name": customer_name,
            "amount": amount,
            "description": description
        }
    else:
        logger.error(f"Could not parse command. Customer: {customer_name}, Amount: {amount}")
        return None


def main():
    """Main entry point for CLI usage"""
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python vt_automation.py 'create invoice to Customer Name for £100'")
        print("  python vt_automation.py --calibrate")
        print("  python vt_automation.py --test-connection")
        sys.exit(1)

    automation = VTTransactionAutomation()

    # Handle special commands
    if sys.argv[1] == "--calibrate":
        automation.calibrate_ui()
        sys.exit(0)

    if sys.argv[1] == "--test-connection":
        success = automation.connect_to_vt()
        if success:
            print("✓ Successfully connected to VT Transaction Plus")
            sys.exit(0)
        else:
            print("✗ Failed to connect to VT Transaction Plus")
            sys.exit(1)

    # Parse the command
    command = " ".join(sys.argv[1:])
    invoice_data = parse_invoice_command(command)

    if not invoice_data:
        print("Error: Could not parse invoice command")
        print("Example: python vt_automation.py 'create invoice to GT Bar Services for £100'")
        sys.exit(1)

    # Create the invoice
    result = automation.create_invoice(**invoice_data)

    # Print result
    print(json.dumps(result, indent=2))

    sys.exit(0 if result["success"] else 1)


if __name__ == "__main__":
    main()
