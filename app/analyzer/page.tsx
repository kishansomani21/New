'use client';

/**
 * Main Analyzer Page
 *
 * This is where users upload documents, see extraction results, and view tax calculations
 */

import React, { useState } from 'react';
import DocumentUploader from '@/components/DocumentUploader';
import TaxResultsDashboard from '@/components/TaxResultsDashboard';
import { DocumentRecord, QuarterlySummary, TaxCalculation } from '@/lib/mtd-types';

export default function AnalyzerPage() {
  const [documentRecord, setDocumentRecord] = useState<DocumentRecord | null>(null);
  const [quarterlySummaries, setQuarterlySummaries] = useState<QuarterlySummary[]>([]);
  const [taxCalculation, setTaxCalculation] = useState<TaxCalculation | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleUploadComplete = async (document: DocumentRecord) => {
    setDocumentRecord(document);
    setError('');
    setLoading(true);

    try {
      // Calculate tax from extracted transactions
      const response = await fetch('/api/calculate-tax', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactions: document.extractedTransactions,
          taxYear: document.taxYear,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate tax');
      }

      const result = await response.json();
      setQuarterlySummaries(result.data.quarterlySummaries);
      setTaxCalculation(result.data.taxCalculation);
    } catch (err: any) {
      setError(err.message || 'Failed to calculate tax');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleReset = () => {
    setDocumentRecord(null);
    setQuarterlySummaries([]);
    setTaxCalculation(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <a href="/" className="text-3xl font-bold text-purple-600">
            Tax Return Helper
          </a>
          <div className="text-sm text-gray-600">
            UK MTD ITSA Compliant
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Error Message */}
        {error && (
          <div className="mb-8 bg-red-50 border-2 border-red-300 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <span className="text-3xl">⚠️</span>
              <div>
                <h3 className="text-xl font-bold text-red-900 mb-2">Error</h3>
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Show uploader or results */}
        {!documentRecord ? (
          <div>
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Upload Your Financial Statement
              </h1>
              <p className="text-xl text-gray-700">
                Take a photo or upload a PDF of your bank statement or rental income statement
              </p>
            </div>

            <DocumentUploader
              onUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
            />
          </div>
        ) : loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-6" />
            <p className="text-2xl font-semibold text-gray-700">
              Calculating your tax...
            </p>
          </div>
        ) : taxCalculation && quarterlySummaries.length > 0 ? (
          <div>
            <div className="mb-8 flex justify-between items-center">
              <h1 className="text-4xl font-bold text-gray-900">Your Results</h1>
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
              >
                Upload Another Document
              </button>
            </div>

            <TaxResultsDashboard
              document={documentRecord}
              quarterlySummaries={quarterlySummaries}
              taxCalculation={taxCalculation}
            />
          </div>
        ) : null}

        {/* Info Box */}
        <div className="mt-16 bg-blue-50 border-2 border-blue-200 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-blue-900 mb-4">Need Help?</h3>
          <div className="space-y-3 text-lg text-blue-800">
            <p>
              <strong>What documents can I upload?</strong><br />
              Bank statements, rental income statements, business receipts, and estate agent statements.
            </p>
            <p>
              <strong>Is my data safe?</strong><br />
              Yes! All documents are encrypted and stored securely in your Google Drive.
            </p>
            <p>
              <strong>How accurate is the AI?</strong><br />
              Our AI is highly accurate, but always review the extracted transactions to ensure everything is correct.
            </p>
            <p>
              <strong>What about quarterly submissions?</strong><br />
              The app prepares your figures ready for MTD ITSA quarterly submissions to HMRC.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t py-8 px-6 text-center text-gray-600 mt-16">
        <p className="text-lg">
          MTD ITSA Financial Analyzer • Built for UK Self-Employed & Landlords
        </p>
        <p className="mt-2 text-sm">
          Making Tax Digital compliance made simple
        </p>
      </footer>
    </div>
  );
}
