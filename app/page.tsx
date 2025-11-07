'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Simple Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="text-3xl font-bold text-purple-600">
            Tax Return Helper
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Hero - Simple Explanation */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Your Tax Return,<br />Made Simple
          </h1>
          <p className="text-2xl text-gray-700 mb-8 leading-relaxed">
            Just take a photo of your bank statement.<br />
            We'll work out your tax return for you.
          </p>
          <div className="inline-block bg-blue-100 border-2 border-blue-300 rounded-2xl p-6">
            <p className="text-xl text-blue-900 font-semibold">
              So easy, even grandad can do it!
            </p>
          </div>
        </div>

        {/* How It Works - BIG and SIMPLE */}
        <div className="bg-white rounded-3xl shadow-xl p-12 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            How It Works (3 Simple Steps)
          </h2>

          <div className="space-y-10">
            {/* Step 1 */}
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Upload Your Statement
                </h3>
                <p className="text-xl text-gray-700 leading-relaxed">
                  Take a photo with your phone, or upload a PDF from your computer.
                  We accept bank statements, rental income statements, and more.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  We Analyze Everything
                </h3>
                <p className="text-xl text-gray-700 leading-relaxed">
                  Our AI reads your documents and automatically categorizes your income
                  and expenses according to HMRC rules. Takes about 30 seconds.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Get Your Tax Figures
                </h3>
                <p className="text-xl text-gray-700 leading-relaxed">
                  See exactly how much tax you owe, broken down in plain English.
                  All your documents are saved in Google Drive for safe keeping.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* What We Do */}
        <div className="bg-purple-50 border-2 border-purple-200 rounded-3xl p-12 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            What We Calculate For You
          </h2>

          <div className="grid md:grid-cols-2 gap-8 text-lg">
            <div className="flex items-start gap-4">
              <span className="text-3xl">✅</span>
              <div>
                <p className="font-semibold text-gray-900 mb-2">Total Income</p>
                <p className="text-gray-700">From self-employment, rental properties, etc.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <span className="text-3xl">✅</span>
              <div>
                <p className="font-semibold text-gray-900 mb-2">Allowable Expenses</p>
                <p className="text-gray-700">What you can claim against your income</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <span className="text-3xl">✅</span>
              <div>
                <p className="font-semibold text-gray-900 mb-2">Income Tax</p>
                <p className="text-gray-700">How much Income Tax you'll pay</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <span className="text-3xl">✅</span>
              <div>
                <p className="font-semibold text-gray-900 mb-2">National Insurance</p>
                <p className="text-gray-700">Your Class 2 and Class 4 NI contributions</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <span className="text-3xl">✅</span>
              <div>
                <p className="font-semibold text-gray-900 mb-2">Quarterly Updates</p>
                <p className="text-gray-700">Ready for MTD ITSA submissions to HMRC</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <span className="text-3xl">✅</span>
              <div>
                <p className="font-semibold text-gray-900 mb-2">Total Tax Bill</p>
                <p className="text-gray-700">The final amount you need to pay</p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action - BIG Button */}
        <div className="text-center mb-16">
          <Link
            href="/analyzer"
            className="inline-block px-16 py-8 bg-gradient-to-r from-green-500 to-green-600 text-white text-3xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-200"
          >
            Start Your Tax Return Now →
          </Link>
          <p className="mt-6 text-xl text-gray-600">
            Free to try • No credit card needed • Takes 2 minutes
          </p>
        </div>

        {/* Trust Indicators */}
        <div className="bg-white rounded-3xl shadow-lg p-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Why You Can Trust Us
          </h3>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl mb-4">🔒</div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">
                Bank-Level Security
              </h4>
              <p className="text-gray-700">
                Your documents are encrypted and stored securely in Google Drive
              </p>
            </div>

            <div>
              <div className="text-5xl mb-4">🎯</div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">
                HMRC Compliant
              </h4>
              <p className="text-gray-700">
                Fully compliant with Making Tax Digital (MTD ITSA) requirements
              </p>
            </div>

            <div>
              <div className="text-5xl mb-4">✨</div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">
                AI-Powered Accuracy
              </h4>
              <p className="text-gray-700">
                Uses advanced AI to read and categorize transactions accurately
              </p>
            </div>
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
