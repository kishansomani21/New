'use client';

import { useState } from 'react';

export default function OnboardingPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/onboarding/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate onboarding');
      }

      setResult(data);
      setName('');
      setEmail('');
      setPhone('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent mb-2">
              Client Onboarding
            </h1>
            <p className="text-gray-600">
              Start the automated onboarding process for a new client
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Client Name *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                placeholder="John Smith"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                placeholder="+44 20 1234 5678"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Start Onboarding'}
            </button>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {result && (
            <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-green-800 font-semibold mb-3">
                Onboarding Initiated Successfully!
              </h3>
              <div className="space-y-2 text-sm text-green-700">
                <p><strong>Client ID:</strong> {result.clientId}</p>
                <p><strong>Status:</strong> {result.status}</p>
                <div className="mt-4">
                  <p className="font-medium mb-2">Next Steps:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {result.nextSteps?.map((step: string, index: number) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-3">What Happens Next?</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start">
                <span className="mr-2">1.</span>
                <span>Client receives Google Form via email to provide detailed information</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">2.</span>
                <span>Upon form completion, system automatically:</span>
              </li>
              <li className="ml-6 flex items-start">
                <span className="mr-2">•</span>
                <span>Generates 64-8 form for HMRC authorization</span>
              </li>
              <li className="ml-6 flex items-start">
                <span className="mr-2">•</span>
                <span>Sends engagement letter via Zoho Sign for signature</span>
              </li>
              <li className="ml-6 flex items-start">
                <span className="mr-2">•</span>
                <span>Creates GoCardless payment link for Direct Debit setup</span>
              </li>
              <li className="ml-6 flex items-start">
                <span className="mr-2">•</span>
                <span>Adds client to Google Contacts</span>
              </li>
              <li className="ml-6 flex items-start">
                <span className="mr-2">•</span>
                <span>Updates tracking spreadsheet</span>
              </li>
              <li className="ml-6 flex items-start">
                <span className="mr-2">•</span>
                <span>Generates BrightPay CSV (if PAYE registered)</span>
              </li>
              <li className="ml-6 flex items-start">
                <span className="mr-2">•</span>
                <span>Requests VAT agent authorization via HMRC API (if VAT registered)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
