"""
VT Transaction Plus API - Python Example

This example demonstrates how to use the VT Transaction API
from a Python application.

Requirements:
    pip install requests
"""

import requests
import time
from typing import Dict, List, Optional


class VTTransactionAPI:
    """Client for VT Transaction Plus API"""

    def __init__(self, base_url: str = "http://localhost:3000/api"):
        """
        Initialize API client

        Args:
            base_url: Base URL of the API (default: http://localhost:3000/api)
        """
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json'
        })

    def check_connection(self) -> bool:
        """
        Check if VT Transaction Plus is connected

        Returns:
            bool: True if connected, False otherwise
        """
        try:
            response = self.session.get(f"{self.base_url}/vt-invoice")
            response.raise_for_status()
            result = response.json()

            if result.get('connected'):
                print("✓ Connected to VT Transaction Plus")
                return True
            else:
                print("✗ Not connected to VT Transaction Plus")
                return False

        except requests.exceptions.RequestException as e:
            print(f"Error checking connection: {e}")
            return False

    def create_invoice_with_command(self, command: str) -> Dict:
        """
        Create an invoice using natural language command

        Args:
            command: Natural language command (e.g., "create invoice to Customer for £100")

        Returns:
            Dict: API response with invoice details

        Raises:
            Exception: If invoice creation fails
        """
        try:
            response = self.session.post(
                f"{self.base_url}/vt-invoice",
                json={'command': command}
            )
            response.raise_for_status()
            result = response.json()

            if result.get('success'):
                print("✓ Invoice created successfully!")
                details = result.get('details', {})
                print(f"Customer: {details.get('customer')}")
                print(f"Amount: £{details.get('amount', 0):.2f}")
                if details.get('description'):
                    print(f"Description: {details.get('description')}")
                return result
            else:
                error = result.get('error', 'Unknown error')
                print(f"✗ Failed to create invoice: {error}")
                raise Exception(error)

        except requests.exceptions.RequestException as e:
            print(f"Error: {e}")
            raise

    def create_invoice_with_data(
        self,
        customer_name: str,
        amount: float,
        description: Optional[str] = None,
        vat_rate: float = 20.0,
        invoice_date: Optional[str] = None
    ) -> Dict:
        """
        Create an invoice using structured data

        Args:
            customer_name: Customer name
            amount: Invoice amount in pounds
            description: Optional description
            vat_rate: VAT rate percentage (default: 20)
            invoice_date: Optional invoice date in DD/MM/YYYY format

        Returns:
            Dict: API response with invoice details

        Raises:
            Exception: If invoice creation fails
        """
        invoice_data = {
            'customer_name': customer_name,
            'amount': amount,
            'vat_rate': vat_rate
        }

        if description:
            invoice_data['description'] = description

        if invoice_date:
            invoice_data['invoice_date'] = invoice_date

        try:
            response = self.session.post(
                f"{self.base_url}/vt-invoice",
                json=invoice_data
            )
            response.raise_for_status()
            result = response.json()

            if result.get('success'):
                print("✓ Invoice created successfully!")
                print(f"Details: {result.get('details')}")
                return result
            else:
                error = result.get('error', 'Unknown error')
                print(f"✗ Failed to create invoice: {error}")
                raise Exception(error)

        except requests.exceptions.RequestException as e:
            print(f"Error: {e}")
            raise

    def create_batch_invoices(
        self,
        invoices: List[Dict],
        delay_seconds: float = 2.0
    ) -> Dict:
        """
        Create multiple invoices from a list

        Args:
            invoices: List of invoice dictionaries
            delay_seconds: Delay between requests (default: 2.0)

        Returns:
            Dict: Summary of batch operation
        """
        print(f"Creating {len(invoices)} invoices...")

        results = {
            'successful': 0,
            'failed': 0,
            'errors': []
        }

        for idx, invoice in enumerate(invoices, 1):
            print(f"\nProcessing invoice {idx}/{len(invoices)}...")

            try:
                self.create_invoice_with_data(**invoice)
                results['successful'] += 1

                # Wait between requests
                if idx < len(invoices):
                    time.sleep(delay_seconds)

            except Exception as e:
                results['failed'] += 1
                results['errors'].append({
                    'invoice': invoice,
                    'error': str(e)
                })

        # Print summary
        print("\n=== Batch Results ===")
        print(f"Successful: {results['successful']}")
        print(f"Failed: {results['failed']}")

        if results['errors']:
            print("\nErrors:")
            for idx, err in enumerate(results['errors'], 1):
                customer = err['invoice'].get('customer_name', 'Unknown')
                print(f"{idx}. {customer}: {err['error']}")

        return results


def main():
    """Example usage of VT Transaction API"""
    print("=== VT Transaction Plus API Examples ===\n")

    # Initialize API client
    api = VTTransactionAPI()

    # Example 1: Check connection
    print("Example 1: Checking connection...")
    api.check_connection()
    print()

    # Example 2: Create invoice with natural language
    print("Example 2: Creating invoice with natural language...")
    api.create_invoice_with_command(
        "create invoice to GT Bar Services for £100"
    )
    print()

    # Example 3: Create invoice with structured data
    print("Example 3: Creating invoice with structured data...")
    api.create_invoice_with_data(
        customer_name="Acme Corporation Ltd",
        amount=250.50,
        description="Website development services",
        vat_rate=20
    )
    print()

    # Example 4: Batch create invoices
    print("Example 4: Creating batch invoices...")
    invoices_to_create = [
        {
            'customer_name': 'Customer A',
            'amount': 100.00,
            'description': 'Monthly subscription'
        },
        {
            'customer_name': 'Customer B',
            'amount': 200.00,
            'description': 'Consulting services'
        },
        {
            'customer_name': 'Customer C',
            'amount': 150.00,
            'description': 'Support services'
        }
    ]

    api.create_batch_invoices(invoices_to_create)


def example_csv_import():
    """Example: Import invoices from CSV file"""
    import csv

    api = VTTransactionAPI()

    # Read invoices from CSV
    with open('invoices.csv', 'r') as f:
        reader = csv.DictReader(f)
        invoices = []

        for row in reader:
            invoices.append({
                'customer_name': row['customer'],
                'amount': float(row['amount']),
                'description': row.get('description', '')
            })

    # Create all invoices
    results = api.create_batch_invoices(invoices)

    print(f"\nImported {results['successful']} invoices from CSV")


if __name__ == "__main__":
    main()

    # Uncomment to test CSV import
    # example_csv_import()
