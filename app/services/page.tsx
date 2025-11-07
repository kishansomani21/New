'use client';

import Link from 'next/link';

export default function Services() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-white hover:text-gray-300 transition">
            929 Accountants
          </Link>
          <div className="flex gap-6 items-center">
            <Link href="/services" className="text-white font-semibold">
              Services
            </Link>
            <Link href="/pricing" className="text-gray-300 hover:text-white transition">
              Pricing
            </Link>
            <Link href="/about" className="text-gray-300 hover:text-white transition">
              About
            </Link>
            <Link
              href="/contact"
              className="px-6 py-2 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-6xl font-bold mb-6 animate-fade-in">
            Our <span className="gradient-text">Services</span>
          </h1>
          <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto">
            Comprehensive accounting and business services to help you manage your finances and grow your business.
          </p>
        </div>
      </section>

      {/* Tax Services */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12">Tax Services</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-800">
              <h3 className="text-2xl font-bold mb-4">Self Assessment Tax Returns</h3>
              <p className="text-gray-400 mb-4">
                Complete and accurate tax return preparation for sole traders, partnerships, and individuals. We ensure you claim all eligible deductions and submit on time to avoid penalties.
              </p>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>• Personal tax returns</li>
                <li>• Rental income declarations</li>
                <li>• Capital gains tax reporting</li>
                <li>• Tax optimization strategies</li>
              </ul>
            </div>

            <div className="p-8 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-800">
              <h3 className="text-2xl font-bold mb-4">VAT Returns & Registration</h3>
              <p className="text-gray-400 mb-4">
                Professional VAT return preparation and submission. We handle standard, flat rate, and cash accounting schemes.
              </p>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>• VAT registration assistance</li>
                <li>• Quarterly VAT returns</li>
                <li>• Making Tax Digital (MTD) compliance</li>
                <li>• VAT scheme optimization</li>
              </ul>
            </div>

            <div className="p-8 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-800">
              <h3 className="text-2xl font-bold mb-4">Corporation Tax</h3>
              <p className="text-gray-400 mb-4">
                Expert corporation tax services for limited companies. We ensure compliance and identify tax-saving opportunities.
              </p>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>• Corporation tax returns (CT600)</li>
                <li>• Tax computations</li>
                <li>• R&D tax credit claims</li>
                <li>• Capital allowances advice</li>
              </ul>
            </div>

            <div className="p-8 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-800">
              <h3 className="text-2xl font-bold mb-4">Tax Planning & Advisory</h3>
              <p className="text-gray-400 mb-4">
                Strategic tax planning to minimize your tax liability legally and efficiently.
              </p>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>• Tax-efficient business structure advice</li>
                <li>• Dividend vs salary optimization</li>
                <li>• Inheritance tax planning</li>
                <li>• HMRC investigation support</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Accounting Services */}
      <section className="py-16 px-6 bg-black/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12">Accounting Services</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-800">
              <h3 className="text-2xl font-bold mb-4">Bookkeeping</h3>
              <p className="text-gray-400 mb-4">
                Professional bookkeeping services to keep your financial records accurate and up-to-date.
              </p>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>• Daily transaction recording</li>
                <li>• Bank reconciliation</li>
                <li>• Purchase and sales ledger management</li>
                <li>• Expense tracking and categorization</li>
              </ul>
            </div>

            <div className="p-8 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-800">
              <h3 className="text-2xl font-bold mb-4">Year-End Accounts</h3>
              <p className="text-gray-400 mb-4">
                Preparation of statutory accounts for Companies House and HMRC filing requirements.
              </p>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>• Annual accounts preparation</li>
                <li>• Companies House filing</li>
                <li>• Balance sheet and P&L statements</li>
                <li>• Directors' reports</li>
              </ul>
            </div>

            <div className="p-8 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-800">
              <h3 className="text-2xl font-bold mb-4">Management Accounts</h3>
              <p className="text-gray-400 mb-4">
                Regular financial reports to help you make informed business decisions.
              </p>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>• Monthly management reports</li>
                <li>• Cash flow forecasting</li>
                <li>• Budget vs actual analysis</li>
                <li>• KPI tracking and reporting</li>
              </ul>
            </div>

            <div className="p-8 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-800">
              <h3 className="text-2xl font-bold mb-4">Financial Reporting</h3>
              <p className="text-gray-400 mb-4">
                Comprehensive financial reports that provide insights into your business performance.
              </p>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>• Custom financial reports</li>
                <li>• Profitability analysis</li>
                <li>• Financial statement preparation</li>
                <li>• Ratio analysis</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Business Services */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12">Business Services</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-800">
              <h3 className="text-2xl font-bold mb-4">Company Formation</h3>
              <p className="text-gray-400 mb-4">
                Complete company registration services to get your business up and running quickly.
              </p>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>• Limited company registration</li>
                <li>• Company name search and reservation</li>
                <li>• Registered office address service</li>
                <li>• Articles of association drafting</li>
              </ul>
            </div>

            <div className="p-8 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-800">
              <h3 className="text-2xl font-bold mb-4">Payroll Management</h3>
              <p className="text-gray-400 mb-4">
                Efficient payroll processing to ensure your employees are paid accurately and on time.
              </p>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>• Weekly/monthly payroll processing</li>
                <li>• PAYE and NI calculations</li>
                <li>• RTI submissions to HMRC</li>
                <li>• Payslip generation and distribution</li>
              </ul>
            </div>

            <div className="p-8 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-800">
              <h3 className="text-2xl font-bold mb-4">Business Advisory</h3>
              <p className="text-gray-400 mb-4">
                Strategic business advice to help you grow and make better financial decisions.
              </p>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>• Business planning and strategy</li>
                <li>• Growth and expansion advice</li>
                <li>• Financial forecasting</li>
                <li>• Business structure optimization</li>
              </ul>
            </div>

            <div className="p-8 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-800">
              <h3 className="text-2xl font-bold mb-4">Cloud Accounting Setup</h3>
              <p className="text-gray-400 mb-4">
                Modern cloud accounting solutions for real-time financial visibility.
              </p>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>• Xero, QuickBooks, and Sage setup</li>
                <li>• Software training and support</li>
                <li>• Bank feed integration</li>
                <li>• Mobile app configuration</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-black/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6">Need help with your accounts?</h2>
          <p className="text-xl text-gray-400 mb-8">
            Contact us today to discuss how we can support your business.
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-4 bg-white text-black rounded-lg font-semibold text-lg hover:bg-gray-200 transition transform hover:scale-105"
          >
            Get in Touch →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">929 Accountants</h3>
            <p className="text-gray-400 text-sm">
              Professional accounting services you can trust.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link href="/services" className="hover:text-white transition">Tax Returns</Link></li>
              <li><Link href="/services" className="hover:text-white transition">Bookkeeping</Link></li>
              <li><Link href="/services" className="hover:text-white transition">Payroll</Link></li>
              <li><Link href="/services" className="hover:text-white transition">Business Advisory</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link href="/about" className="hover:text-white transition">About Us</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition">Pricing</Link></li>
              <li><Link href="/contact" className="hover:text-white transition">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>Email: info@929accountants.co.uk</li>
              <li>Phone: Available upon request</li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
          <p>&copy; 2024 929 Accountants. All rights reserved. Professional accounting services.</p>
        </div>
      </footer>
    </div>
  );
}
