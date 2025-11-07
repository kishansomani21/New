'use client';

import { useState } from 'react';

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

export default function VTInvoiceCreator() {
  const [command, setCommand] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InvoiceResult | null>(null);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  // Check VT connection status
  const checkConnection = async () => {
    try {
      const response = await fetch('/api/vt-invoice');
      const data = await response.json();
      setIsConnected(data.connected);
    } catch (error) {
      setIsConnected(false);
    }
  };

  // Create invoice with natural language command
  const createInvoice = async () => {
    if (!command.trim()) {
      setResult({
        success: false,
        error: 'Please enter a command',
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/vt-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command }),
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        // Clear command on success
        setCommand('');
      }
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create invoice',
      });
    } finally {
      setLoading(false);
    }
  };

  // Example commands
  const exampleCommands = [
    'create an invoice to GT Bar Services for £100',
    'invoice Acme Corp for £250.50',
    'bill John Smith for £75.25 description: Consulting services',
  ];

  const useExample = (example: string) => {
    setCommand(example);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold gradient-text">
            VT Transaction Plus - Invoice Creator
          </h2>
          <button
            onClick={checkConnection}
            className="px-4 py-2 text-sm rounded bg-gray-100 hover:bg-gray-200 transition"
          >
            {isConnected === null && 'Check Connection'}
            {isConnected === true && '✓ Connected'}
            {isConnected === false && '✗ Disconnected'}
          </button>
        </div>

        {/* Natural Language Input */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tell me what invoice to create:
            </label>
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !loading) {
                  createInvoice();
                }
              }}
              placeholder="e.g., create an invoice to GT Bar Services for £100"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          <button
            onClick={createInvoice}
            disabled={loading || !command.trim()}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition ${
              loading || !command.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700'
            }`}
          >
            {loading ? 'Creating Invoice...' : 'Create Invoice'}
          </button>
        </div>

        {/* Example Commands */}
        <div className="mt-6">
          <p className="text-sm font-medium text-gray-600 mb-2">Example commands:</p>
          <div className="space-y-2">
            {exampleCommands.map((example, idx) => (
              <button
                key={idx}
                onClick={() => useExample(example)}
                className="block w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded transition"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* Result Display */}
        {result && (
          <div
            className={`mt-6 p-4 rounded-lg ${
              result.success
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            <p
              className={`font-semibold ${
                result.success ? 'text-green-800' : 'text-red-800'
              }`}
            >
              {result.success ? '✓ Success' : '✗ Error'}
            </p>
            <p className={result.success ? 'text-green-700' : 'text-red-700'}>
              {result.message || result.error}
            </p>

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
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">How to use:</h3>
        <ol className="list-decimal list-inside space-y-1 text-blue-800 text-sm">
          <li>Make sure VT Transaction Plus is running on your Windows machine</li>
          <li>
            Complete the setup steps in{' '}
            <code className="bg-blue-100 px-1 rounded">automation/README.md</code>
          </li>
          <li>Type your invoice command in natural language (see examples above)</li>
          <li>Press Enter or click "Create Invoice"</li>
          <li>The automation will create the invoice in VT Transaction Plus</li>
        </ol>
      </div>

      {/* Advanced Form */}
      <details className="bg-gray-50 rounded-lg p-6">
        <summary className="cursor-pointer font-semibold text-gray-700">
          Advanced: Use Structured Form
        </summary>
        <div className="mt-4 space-y-4">
          <StructuredInvoiceForm onResult={setResult} />
        </div>
      </details>
    </div>
  );
}

// Structured form for precise control
function StructuredInvoiceForm({
  onResult,
}: {
  onResult: (result: InvoiceResult) => void;
}) {
  const [customerName, setCustomerName] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await fetch('/api/vt-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_name: customerName,
          amount: parseFloat(amount),
          description,
        }),
      });

      const data = await response.json();
      onResult(data);

      if (data.success) {
        setCustomerName('');
        setAmount('');
        setDescription('');
      }
    } catch (error) {
      onResult({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create invoice',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Customer Name *
        </label>
        <input
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Amount (£) *
        </label>
        <input
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description (optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-2 px-4 rounded font-semibold text-white transition ${
          loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700'
        }`}
      >
        {loading ? 'Creating...' : 'Create Invoice'}
      </button>
    </form>
  );
}
