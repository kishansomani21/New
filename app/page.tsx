'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold gradient-text">BankSync</div>
          <div className="flex gap-6 items-center">
            <Link href="#features" className="text-gray-300 hover:text-white transition">
              Features
            </Link>
            <Link href="/onboarding" className="text-gray-300 hover:text-white transition">
              Client Onboarding
            </Link>
            <Link href="#pricing" className="text-gray-300 hover:text-white transition">
              Pricing
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-7xl font-bold mb-6 animate-fade-in">
            Banking data in
            <span className="gradient-text"> Google Sheets</span>
          </h1>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto animate-slide-up">
            Connect your bank accounts seamlessly through Plaid, GoCardless, or TrueLayer.
            Automatically sync transactions to Google Sheets in real-time.
          </p>
          <div className="flex gap-4 justify-center animate-slide-up">
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg font-semibold text-lg hover:shadow-2xl hover:shadow-purple-500/50 transition transform hover:scale-105"
            >
              Start Free Trial
            </Link>
            <button className="px-8 py-4 border border-gray-700 rounded-lg font-semibold text-lg hover:border-purple-500 transition">
              Watch Demo
            </button>
          </div>
        </div>

        {/* Feature Preview */}
        <div className="max-w-5xl mx-auto mt-20 animate-slide-up">
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-8 border border-gray-700 backdrop-blur">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div className="p-6">
                <div className="text-4xl mb-3">🏦</div>
                <h3 className="text-xl font-semibold mb-2">Multiple Providers</h3>
                <p className="text-gray-400">Plaid, GoCardless & TrueLayer support</p>
              </div>
              <div className="p-6">
                <div className="text-4xl mb-3">🔄</div>
                <h3 className="text-xl font-semibold mb-2">Real-time Sync</h3>
                <p className="text-gray-400">Automatic transaction synchronization</p>
              </div>
              <div className="p-6">
                <div className="text-4xl mb-3">📊</div>
                <h3 className="text-xl font-semibold mb-2">Google Sheets</h3>
                <p className="text-gray-400">Direct integration with your spreadsheets</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-black/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-16">
            Everything you need to manage <span className="gradient-text">banking data</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-800 hover:border-purple-500/50 transition">
              <h3 className="text-2xl font-bold mb-4">🔐 Bank-level Security</h3>
              <p className="text-gray-400">
                All connections use OAuth 2.0 and bank-grade encryption. We never store your banking credentials.
              </p>
            </div>
            <div className="p-8 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-800 hover:border-purple-500/50 transition">
              <h3 className="text-2xl font-bold mb-4">⚡ Lightning Fast</h3>
              <p className="text-gray-400">
                Transactions sync in real-time. See your latest banking data the moment it happens.
              </p>
            </div>
            <div className="p-8 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-800 hover:border-purple-500/50 transition">
              <h3 className="text-2xl font-bold mb-4">🌍 Global Coverage</h3>
              <p className="text-gray-400">
                Support for thousands of banks across North America, Europe, and beyond.
              </p>
            </div>
            <div className="p-8 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-800 hover:border-purple-500/50 transition">
              <h3 className="text-2xl font-bold mb-4">📈 Custom Analytics</h3>
              <p className="text-gray-400">
                Use Google Sheets formulas and pivot tables to analyze your financial data your way.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6">Ready to get started?</h2>
          <p className="text-xl text-gray-400 mb-8">
            Connect your first bank account in under 2 minutes.
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg font-semibold text-lg hover:shadow-2xl hover:shadow-purple-500/50 transition transform hover:scale-105"
          >
            Start Syncing Now →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-6 text-center text-gray-500">
        <p>&copy; 2024 BankSync. Built with security and privacy in mind.</p>
      </footer>
    </div>
  );
}
