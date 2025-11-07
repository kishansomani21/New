/**
 * VT Transaction Plus API - JavaScript Example
 *
 * This example demonstrates how to use the VT Transaction API
 * from a Node.js or browser JavaScript application.
 */

// Configuration
const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Create an invoice using natural language command
 */
async function createInvoiceWithCommand(command) {
  try {
    const response = await fetch(`${API_BASE_URL}/vt-invoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ command })
    });

    const result = await response.json();

    if (result.success) {
      console.log('✓ Invoice created successfully!');
      console.log('Customer:', result.details.customer);
      console.log('Amount: £' + result.details.amount.toFixed(2));
      if (result.details.description) {
        console.log('Description:', result.details.description);
      }
      return result;
    } else {
      console.error('✗ Failed to create invoice:', result.error);
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}

/**
 * Create an invoice using structured data
 */
async function createInvoiceWithData(invoiceData) {
  try {
    const response = await fetch(`${API_BASE_URL}/vt-invoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invoiceData)
    });

    const result = await response.json();

    if (result.success) {
      console.log('✓ Invoice created successfully!');
      console.log('Details:', result.details);
      return result;
    } else {
      console.error('✗ Failed to create invoice:', result.error);
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}

/**
 * Check VT Transaction Plus connection status
 */
async function checkConnection() {
  try {
    const response = await fetch(`${API_BASE_URL}/vt-invoice`);
    const result = await response.json();

    if (result.connected) {
      console.log('✓ Connected to VT Transaction Plus');
    } else {
      console.log('✗ Not connected to VT Transaction Plus');
    }

    return result.connected;
  } catch (error) {
    console.error('Error checking connection:', error.message);
    return false;
  }
}

/**
 * Create multiple invoices from an array
 */
async function createBatchInvoices(invoices) {
  console.log(`Creating ${invoices.length} invoices...`);

  const results = {
    successful: 0,
    failed: 0,
    errors: []
  };

  for (const invoice of invoices) {
    try {
      await createInvoiceWithData(invoice);
      results.successful++;

      // Wait between requests to avoid overwhelming VT
      await sleep(2000);
    } catch (error) {
      results.failed++;
      results.errors.push({
        invoice,
        error: error.message
      });
    }
  }

  console.log('\n=== Batch Results ===');
  console.log(`Successful: ${results.successful}`);
  console.log(`Failed: ${results.failed}`);

  if (results.errors.length > 0) {
    console.log('\nErrors:');
    results.errors.forEach((err, idx) => {
      console.log(`${idx + 1}. ${err.invoice.customer_name}: ${err.error}`);
    });
  }

  return results;
}

/**
 * Helper function to sleep/delay
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ===== USAGE EXAMPLES =====

async function main() {
  console.log('=== VT Transaction Plus API Examples ===\n');

  // Example 1: Check connection
  console.log('Example 1: Checking connection...');
  await checkConnection();
  console.log('');

  // Example 2: Create invoice with natural language
  console.log('Example 2: Creating invoice with natural language...');
  await createInvoiceWithCommand('create invoice to GT Bar Services for £100');
  console.log('');

  // Example 3: Create invoice with structured data
  console.log('Example 3: Creating invoice with structured data...');
  await createInvoiceWithData({
    customer_name: 'Acme Corporation Ltd',
    amount: 250.50,
    description: 'Website development services',
    vat_rate: 20
  });
  console.log('');

  // Example 4: Batch create invoices
  console.log('Example 4: Creating batch invoices...');
  const invoicesToCreate = [
    {
      customer_name: 'Customer A',
      amount: 100,
      description: 'Monthly subscription'
    },
    {
      customer_name: 'Customer B',
      amount: 200,
      description: 'Consulting services'
    },
    {
      customer_name: 'Customer C',
      amount: 150,
      description: 'Support services'
    }
  ];

  await createBatchInvoices(invoicesToCreate);
}

// Run examples (uncomment to execute)
// main().catch(console.error);

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createInvoiceWithCommand,
    createInvoiceWithData,
    checkConnection,
    createBatchInvoices
  };
}
