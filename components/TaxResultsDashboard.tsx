'use client';

/**
 * Tax Results Dashboard Component
 *
 * Displays extraction results, quarterly summaries, and tax calculations
 * in a simple, easy-to-understand format (grandad-friendly!)
 */

import React from 'react';
import {
  Transaction,
  QuarterlySummary,
  TaxCalculation,
  DocumentRecord,
} from '@/lib/mtd-types';
import { formatCurrency, formatPercentage } from '@/lib/tax-calculator';

interface TaxResultsDashboardProps {
  document: DocumentRecord;
  quarterlySummaries: QuarterlySummary[];
  taxCalculation: TaxCalculation;
}

export default function TaxResultsDashboard({
  document,
  quarterlySummaries,
  taxCalculation,
}: TaxResultsDashboardProps) {
  const transactions = document.extractedTransactions;
  const incomeTransactions = transactions.filter((t) => t.type === 'INCOME');
  const expenseTransactions = transactions.filter((t) => t.type === 'EXPENSE');

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl p-8 shadow-2xl">
        <h1 className="text-4xl font-bold mb-2">Your Tax Summary</h1>
        <p className="text-xl opacity-90">Tax Year {taxCalculation.taxYear}</p>
      </div>

      {/* Big Numbers - Tax to Pay */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-green-500">
          <p className="text-sm font-medium text-gray-600 uppercase mb-2">
            Total Income
          </p>
          <p className="text-4xl font-bold text-green-600">
            {formatCurrency(taxCalculation.totalIncome)}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-red-500">
          <p className="text-sm font-medium text-gray-600 uppercase mb-2">
            Tax to Pay
          </p>
          <p className="text-4xl font-bold text-red-600">
            {formatCurrency(taxCalculation.totalTax)}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Effective rate: {formatPercentage(taxCalculation.effectiveTaxRate)}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-blue-500">
          <p className="text-sm font-medium text-gray-600 uppercase mb-2">
            Take Home
          </p>
          <p className="text-4xl font-bold text-blue-600">
            {formatCurrency(taxCalculation.totalIncome - taxCalculation.totalTax)}
          </p>
          <p className="text-sm text-gray-500 mt-2">After tax</p>
        </div>
      </div>

      {/* Tax Breakdown */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Tax Breakdown</h2>

        <div className="space-y-4">
          {/* Income Tax */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Income Tax</h3>
            <div className="space-y-2 text-base">
              <div className="flex justify-between">
                <span className="text-gray-600">Personal Allowance</span>
                <span className="font-medium">
                  {formatCurrency(taxCalculation.personalAllowance)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Taxable Income</span>
                <span className="font-medium">
                  {formatCurrency(taxCalculation.taxableIncome)}
                </span>
              </div>
              {taxCalculation.basicRateTax > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Basic Rate (20%)</span>
                  <span className="font-medium">
                    {formatCurrency(taxCalculation.basicRateTax)}
                  </span>
                </div>
              )}
              {taxCalculation.higherRateTax > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Higher Rate (40%)</span>
                  <span className="font-medium">
                    {formatCurrency(taxCalculation.higherRateTax)}
                  </span>
                </div>
              )}
              {taxCalculation.additionalRateTax > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Additional Rate (45%)</span>
                  <span className="font-medium">
                    {formatCurrency(taxCalculation.additionalRateTax)}
                  </span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total Income Tax</span>
                <span className="text-purple-600">
                  {formatCurrency(taxCalculation.totalIncomeTax)}
                </span>
              </div>
            </div>
          </div>

          {/* National Insurance */}
          <div className="pt-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              National Insurance
            </h3>
            <div className="space-y-2 text-base">
              <div className="flex justify-between">
                <span className="text-gray-600">Class 2 NI (£3.45/week)</span>
                <span className="font-medium">
                  {formatCurrency(taxCalculation.class2NI)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Class 4 NI (9% / 2%)</span>
                <span className="font-medium">
                  {formatCurrency(taxCalculation.class4NI)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total National Insurance</span>
                <span className="text-purple-600">
                  {formatCurrency(taxCalculation.totalNI)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Summary */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Transactions from {document.fileName}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-green-50 rounded-lg p-6 border border-green-200">
            <p className="text-sm font-medium text-green-800 mb-2">Income</p>
            <p className="text-3xl font-bold text-green-600">
              {incomeTransactions.length}
            </p>
            <p className="text-sm text-green-700 mt-1">transactions found</p>
          </div>

          <div className="bg-red-50 rounded-lg p-6 border border-red-200">
            <p className="text-sm font-medium text-red-800 mb-2">Expenses</p>
            <p className="text-3xl font-bold text-red-600">
              {expenseTransactions.length}
            </p>
            <p className="text-sm text-red-700 mt-1">transactions found</p>
          </div>
        </div>

        {/* Transaction List */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {transactions.map((txn, index) => (
            <div
              key={txn.id}
              className={`p-4 rounded-lg border-l-4 ${
                txn.type === 'INCOME'
                  ? 'bg-green-50 border-green-500'
                  : 'bg-red-50 border-red-500'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{txn.description}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {txn.businessPurpose}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {txn.date} • {txn.category.replace(/_/g, ' ')}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <p
                    className={`text-xl font-bold ${
                      txn.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {txn.type === 'INCOME' ? '+' : '-'}
                    {formatCurrency(txn.amount)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.round(txn.confidence * 100)}% confident
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quarterly Summaries */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Quarterly Updates (MTD ITSA)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quarterlySummaries.map((summary) => (
            <div
              key={summary.quarter}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-bold text-purple-600 mb-4">
                {summary.quarter} {summary.taxYear}
              </h3>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">Income</p>
                  <p className="text-lg font-semibold text-green-600">
                    {formatCurrency(summary.totalIncome)}
                  </p>
                </div>

                <div>
                  <p className="text-gray-600">Expenses</p>
                  <p className="text-lg font-semibold text-red-600">
                    {formatCurrency(summary.totalExpenses)}
                  </p>
                </div>

                <div className="pt-3 border-t">
                  <p className="text-gray-600">Profit</p>
                  <p className="text-lg font-bold text-blue-600">
                    {formatCurrency(summary.profit)}
                  </p>
                </div>

                <div className="text-xs text-gray-500 pt-2 border-t">
                  <p>Due: {summary.period.dueDate}</p>
                  <p>{summary.transactionCount} transactions</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Google Drive Link */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          Document Saved
        </h3>
        <p className="text-blue-800 mb-4">
          Your document has been securely stored in Google Drive for MTD ITSA compliance.
        </p>
        <a
          href={document.googleDriveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
          </svg>
          View in Google Drive
        </a>
      </div>
    </div>
  );
}
