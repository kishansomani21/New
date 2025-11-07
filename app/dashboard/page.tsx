'use client';

import { useState } from 'react';
import Link from 'next/link';
import PlaidLink from '@/components/PlaidLink';

interface BankAccount {
  id: string;
  provider: 'plaid' | 'gocardless' | 'truelayer';
  accountName: string;
  balance: string;
  lastSync: string;
}

export default function Dashboard() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<'plaid' | 'gocardless' | 'truelayer' | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  const handlePlaidSuccess = async (publicToken: string) => {
    try {
      setSyncStatus('syncing');
      const response = await fetch('/api/plaid/exchange-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicToken }),
      });

      if (response.ok) {
        const data = await response.json();
        // Add the new account
        setAccounts([...accounts, {
          id: data.accountId,
          provider: 'plaid',
          accountName: data.accountName || 'Checking Account',
          balance: data.balance || '$0.00',
          lastSync: new Date().toISOString(),
        }]);
        setSyncStatus('success');
        setSelectedProvider(null);
      } else {
        setSyncStatus('error');
      }
    } catch (error) {
      console.error('Error exchanging token:', error);
      setSyncStatus('error');
    }
  };

  const handleGoCardlessConnect = async () => {
    try {
      const response = await fetch('/api/gocardless/authorize');
      const data = await response.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error('GoCardless connection error:', error);
    }
  };

  const handleTrueLayerConnect = async () => {
    try {
      const response = await fetch('/api/truelayer/authorize');
      const data = await response.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error('TrueLayer connection error:', error);
    }
  };

  const syncToSheets = async (accountId: string) => {
    try {
      setSyncStatus('syncing');
      const response = await fetch('/api/sync-to-sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId }),
      });

      if (response.ok) {
        setSyncStatus('success');
        // Update last sync time
        setAccounts(accounts.map(acc =>
          acc.id === accountId
            ? { ...acc, lastSync: new Date().toISOString() }
            : acc
        ));
      } else {
        setSyncStatus('error');
      }
    } catch (error) {
      console.error('Sync error:', error);
      setSyncStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold gradient-text">
            BankSync
          </Link>
          <div className="flex gap-4 items-center">
            <span className="text-gray-400">Dashboard</span>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Your Bank Accounts</h1>
          <p className="text-gray-400">Connect and manage your banking data</p>
        </div>

        {/* Provider Selection */}
        {!selectedProvider && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Connect a Bank Account</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <button
                onClick={() => setSelectedProvider('plaid')}
                className="p-8 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700 hover:border-purple-500 transition text-left"
              >
                <div className="text-3xl mb-4">🏦</div>
                <h3 className="text-xl font-bold mb-2">Plaid</h3>
                <p className="text-gray-400 text-sm">
                  Connect 12,000+ banks in the US and Canada
                </p>
              </button>

              <button
                onClick={handleGoCardlessConnect}
                className="p-8 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700 hover:border-purple-500 transition text-left"
              >
                <div className="text-3xl mb-4">🌍</div>
                <h3 className="text-xl font-bold mb-2">GoCardless</h3>
                <p className="text-gray-400 text-sm">
                  European banking via Open Banking
                </p>
              </button>

              <button
                onClick={handleTrueLayerConnect}
                className="p-8 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700 hover:border-purple-500 transition text-left"
              >
                <div className="text-3xl mb-4">🔐</div>
                <h3 className="text-xl font-bold mb-2">TrueLayer</h3>
                <p className="text-gray-400 text-sm">
                  UK and European bank connections
                </p>
              </button>
            </div>
          </div>
        )}

        {/* Plaid Link Component */}
        {selectedProvider === 'plaid' && (
          <div className="mb-12 p-8 bg-gradient-to-br from-purple-900/20 to-indigo-900/20 rounded-xl border border-purple-500/50">
            <h3 className="text-xl font-bold mb-4">Connect with Plaid</h3>
            <p className="text-gray-400 mb-6">
              Click below to securely connect your bank account through Plaid
            </p>
            <div className="flex gap-4">
              <PlaidLink onSuccess={handlePlaidSuccess} />
              <button
                onClick={() => setSelectedProvider(null)}
                className="px-6 py-3 border border-gray-600 rounded-lg hover:border-gray-500 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Sync Status */}
        {syncStatus !== 'idle' && (
          <div className={`mb-8 p-4 rounded-lg ${
            syncStatus === 'syncing' ? 'bg-blue-900/20 border border-blue-500/50' :
            syncStatus === 'success' ? 'bg-green-900/20 border border-green-500/50' :
            'bg-red-900/20 border border-red-500/50'
          }`}>
            <p className="text-center">
              {syncStatus === 'syncing' && '⏳ Syncing data...'}
              {syncStatus === 'success' && '✅ Successfully synced to Google Sheets!'}
              {syncStatus === 'error' && '❌ Sync failed. Please try again.'}
            </p>
          </div>
        )}

        {/* Connected Accounts */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">Connected Accounts</h2>
          {accounts.length === 0 ? (
            <div className="p-12 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-800 text-center">
              <p className="text-gray-400 text-lg">No accounts connected yet</p>
              <p className="text-gray-500 text-sm mt-2">
                Connect your first bank account to get started
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700 hover:border-purple-500/50 transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold">{account.accountName}</h3>
                        <span className="px-3 py-1 bg-purple-900/30 text-purple-300 rounded-full text-xs uppercase">
                          {account.provider}
                        </span>
                      </div>
                      <p className="text-2xl font-semibold text-green-400 mb-2">
                        {account.balance}
                      </p>
                      <p className="text-gray-500 text-sm">
                        Last synced: {new Date(account.lastSync).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => syncToSheets(account.id)}
                      disabled={syncStatus === 'syncing'}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition disabled:opacity-50"
                    >
                      Sync to Sheets
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Google Sheets Setup Info */}
        <div className="mt-12 p-6 bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-xl border border-green-500/30">
          <h3 className="text-xl font-bold mb-3">📊 Google Sheets Setup</h3>
          <p className="text-gray-400 mb-3">
            Make sure you've configured your Google Sheets credentials in the environment variables.
          </p>
          <p className="text-sm text-gray-500">
            Your transactions will be automatically synced to the specified Google Sheet ID.
          </p>
        </div>
      </div>
    </div>
  );
}
