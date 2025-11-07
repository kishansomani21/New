/**
 * VT Transaction Plus API - React/TypeScript Example
 *
 * This example demonstrates how to integrate the VT Transaction API
 * into a React application with TypeScript.
 */

import { useState, useEffect } from 'react';
import type {
  InvoiceRequest,
  InvoiceResponse,
  ConnectionStatusResponse,
  isSuccessResponse
} from '@/types/vt-transaction';

// Custom hook for VT Transaction API
export function useVTTransactionAPI() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check connection on mount
  useEffect(() => {
    checkConnection();
  }, []);

  /**
   * Check VT connection status
   */
  const checkConnection = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/vt-invoice');
      const data: ConnectionStatusResponse = await response.json();
      setIsConnected(data.connected);
      return data.connected;
    } catch (err) {
      setIsConnected(false);
      return false;
    }
  };

  /**
   * Create invoice with natural language command
   */
  const createInvoiceWithCommand = async (
    command: string
  ): Promise<InvoiceResponse> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/vt-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command }),
      });

      const data: InvoiceResponse = await response.json();

      if (!data.success) {
        setError(data.error || 'Unknown error');
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Request failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create invoice with structured data
   */
  const createInvoiceWithData = async (
    invoiceData: Omit<InvoiceRequest, 'command'>
  ): Promise<InvoiceResponse> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/vt-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      });

      const data: InvoiceResponse = await response.json();

      if (!data.success) {
        setError(data.error || 'Unknown error');
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Request failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    isConnected,
    loading,
    error,
    checkConnection,
    createInvoiceWithCommand,
    createInvoiceWithData,
  };
}

// Example Component: Simple Invoice Creator
export function SimpleInvoiceCreator() {
  const [command, setCommand] = useState('');
  const [result, setResult] = useState<InvoiceResponse | null>(null);
  const { loading, error, createInvoiceWithCommand, isConnected } =
    useVTTransactionAPI();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!command.trim()) return;

    try {
      const response = await createInvoiceWithCommand(command);
      setResult(response);

      if (response.success) {
        setCommand(''); // Clear on success
      }
    } catch (err) {
      // Error is handled by the hook
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Create Invoice</h2>
        <ConnectionStatus connected={isConnected} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Invoice Command
          </label>
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="e.g., create invoice to GT Bar Services for £100"
            className="w-full px-4 py-2 border rounded-lg"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !command.trim()}
          className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg disabled:bg-gray-300"
        >
          {loading ? 'Creating...' : 'Create Invoice'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {result && (
        <InvoiceResult result={result} />
      )}
    </div>
  );
}

// Example Component: Structured Form
export function StructuredInvoiceForm() {
  const [formData, setFormData] = useState({
    customer_name: '',
    amount: '',
    description: '',
    vat_rate: '20',
  });

  const [result, setResult] = useState<InvoiceResponse | null>(null);
  const { loading, error, createInvoiceWithData } = useVTTransactionAPI();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await createInvoiceWithData({
        customer_name: formData.customer_name,
        amount: parseFloat(formData.amount),
        description: formData.description,
        vat_rate: parseFloat(formData.vat_rate),
      });

      setResult(response);

      if (response.success) {
        // Clear form on success
        setFormData({
          customer_name: '',
          amount: '',
          description: '',
          vat_rate: '20',
        });
      }
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Create Invoice</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Customer Name *
          </label>
          <input
            type="text"
            name="customer_name"
            value={formData.customer_name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Amount (£) *</label>
          <input
            type="number"
            name="amount"
            step="0.01"
            value={formData.amount}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">VAT Rate (%)</label>
          <input
            type="number"
            name="vat_rate"
            step="0.1"
            value={formData.vat_rate}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg disabled:bg-gray-300"
        >
          {loading ? 'Creating...' : 'Create Invoice'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {result && <InvoiceResult result={result} />}
    </div>
  );
}

// Example Component: Batch Invoice Creator
export function BatchInvoiceCreator() {
  const [invoices, setInvoices] = useState<
    Array<{
      customer_name: string;
      amount: number;
      description: string;
    }>
  >([]);

  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<{
    successful: number;
    failed: number;
    errors: Array<{ customer: string; error: string }>;
  } | null>(null);

  const { createInvoiceWithData } = useVTTransactionAPI();

  const addInvoice = () => {
    setInvoices([
      ...invoices,
      { customer_name: '', amount: 0, description: '' },
    ]);
  };

  const removeInvoice = (index: number) => {
    setInvoices(invoices.filter((_, i) => i !== index));
  };

  const updateInvoice = (index: number, field: string, value: any) => {
    const updated = [...invoices];
    updated[index] = { ...updated[index], [field]: value };
    setInvoices(updated);
  };

  const processBatch = async () => {
    setProcessing(true);
    const results = {
      successful: 0,
      failed: 0,
      errors: [] as Array<{ customer: string; error: string }>,
    };

    for (const invoice of invoices) {
      try {
        await createInvoiceWithData(invoice);
        results.successful++;

        // Wait 2 seconds between requests
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (err) {
        results.failed++;
        results.errors.push({
          customer: invoice.customer_name,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    setResults(results);
    setProcessing(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Batch Invoice Creator</h2>

      <div className="space-y-4 mb-4">
        {invoices.map((invoice, index) => (
          <div key={index} className="flex gap-2 items-start">
            <input
              type="text"
              placeholder="Customer name"
              value={invoice.customer_name}
              onChange={(e) =>
                updateInvoice(index, 'customer_name', e.target.value)
              }
              className="flex-1 px-3 py-2 border rounded-lg"
            />
            <input
              type="number"
              placeholder="Amount"
              value={invoice.amount || ''}
              onChange={(e) =>
                updateInvoice(index, 'amount', parseFloat(e.target.value))
              }
              className="w-32 px-3 py-2 border rounded-lg"
            />
            <input
              type="text"
              placeholder="Description"
              value={invoice.description}
              onChange={(e) =>
                updateInvoice(index, 'description', e.target.value)
              }
              className="flex-1 px-3 py-2 border rounded-lg"
            />
            <button
              onClick={() => removeInvoice(index)}
              className="px-3 py-2 bg-red-500 text-white rounded-lg"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={addInvoice}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg"
        >
          Add Invoice
        </button>

        <button
          onClick={processBatch}
          disabled={processing || invoices.length === 0}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300"
        >
          {processing ? 'Processing...' : 'Create All Invoices'}
        </button>
      </div>

      {results && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-bold mb-2">Results</h3>
          <p>Successful: {results.successful}</p>
          <p>Failed: {results.failed}</p>

          {results.errors.length > 0 && (
            <div className="mt-2">
              <p className="font-semibold">Errors:</p>
              <ul className="list-disc list-inside">
                {results.errors.map((err, idx) => (
                  <li key={idx}>
                    {err.customer}: {err.error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Helper Components

function ConnectionStatus({ connected }: { connected: boolean | null }) {
  if (connected === null) {
    return (
      <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">
        Checking...
      </span>
    );
  }

  if (connected) {
    return (
      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
        ✓ Connected
      </span>
    );
  }

  return (
    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
      ✗ Disconnected
    </span>
  );
}

function InvoiceResult({ result }: { result: InvoiceResponse }) {
  if (!result.success) {
    return (
      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="font-semibold text-red-800">✗ Error</p>
        <p className="text-red-700">{result.error}</p>
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
      <p className="font-semibold text-green-800">✓ Success</p>
      <p className="text-green-700">{result.message}</p>

      {result.details && (
        <div className="mt-3 pt-3 border-t border-green-200 text-sm text-green-700">
          <p>
            <strong>Customer:</strong> {result.details.customer}
          </p>
          <p>
            <strong>Amount:</strong> £{result.details.amount.toFixed(2)}
          </p>
          {result.details.description && (
            <p>
              <strong>Description:</strong> {result.details.description}
            </p>
          )}
          <p>
            <strong>VAT Rate:</strong> {result.details.vat_rate}%
          </p>
        </div>
      )}
    </div>
  );
}
