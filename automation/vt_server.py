"""
VT Transaction Plus Automation Server
Run this on your Windows machine where VT Transaction Plus is installed.
It will listen for commands from your main application and execute them locally.

Usage:
    python vt_server.py

The server will start on http://0.0.0.0:5050
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
from vt_automation import VTTransactionAutomation, parse_invoice_command

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('vt_server.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Allow requests from your main app

# Initialize automation
automation = VTTransactionAutomation()


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "ok",
        "service": "VT Transaction Plus Automation Server",
        "version": "1.0.0"
    })


@app.route('/test-connection', methods=['GET'])
def test_connection():
    """Test connection to VT Transaction Plus"""
    try:
        success = automation.connect_to_vt()
        return jsonify({
            "connected": success,
            "message": "Successfully connected" if success else "Failed to connect"
        })
    except Exception as e:
        logger.error(f"Connection test failed: {str(e)}")
        return jsonify({
            "connected": False,
            "error": str(e)
        }), 500


@app.route('/create-invoice', methods=['POST'])
def create_invoice():
    """Create an invoice in VT Transaction Plus"""
    try:
        data = request.json

        # Parse command if provided
        if 'command' in data:
            invoice_data = parse_invoice_command(data['command'])
            if not invoice_data:
                return jsonify({
                    "success": False,
                    "error": "Could not parse invoice command"
                }), 400
        else:
            # Use structured data
            invoice_data = {
                "customer_name": data.get('customer_name'),
                "amount": data.get('amount'),
                "description": data.get('description', ''),
                "vat_rate": data.get('vat_rate', 20.0),
                "invoice_date": data.get('invoice_date')
            }

            if not invoice_data['customer_name'] or not invoice_data['amount']:
                return jsonify({
                    "success": False,
                    "error": "customer_name and amount are required"
                }), 400

        # Create the invoice
        result = automation.create_invoice(**invoice_data)

        return jsonify(result)

    except Exception as e:
        logger.error(f"Error creating invoice: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route('/calibrate', methods=['POST'])
def calibrate():
    """Start calibration mode"""
    try:
        # Note: This won't work well via API since it needs interactive input
        # Better to run calibration directly on Windows
        return jsonify({
            "success": False,
            "error": "Calibration must be run directly on Windows machine",
            "instructions": "Run: python vt_automation.py --calibrate"
        }), 400
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


if __name__ == '__main__':
    logger.info("Starting VT Transaction Plus Automation Server...")
    logger.info("Make sure VT Transaction Plus is running!")
    logger.info("Server will be available at http://0.0.0.0:5050")
    logger.info("API Endpoints:")
    logger.info("  GET  /health - Health check")
    logger.info("  GET  /test-connection - Test VT connection")
    logger.info("  POST /create-invoice - Create an invoice")
    logger.info("")
    logger.info("Press Ctrl+C to stop the server")

    # Run the server
    app.run(host='0.0.0.0', port=5050, debug=False)
