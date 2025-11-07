'use client';

import Link from 'next/link';

export default function Pricing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-white hover:text-gray-300 transition">
            929 Accountants
          </Link>
          <div className="flex gap-6 items-center">
            <Link href="/services" className="text-gray-300 hover:text-white transition">
              Services
            </Link>
            <Link href="/pricing" className="text-white font-semibold">
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
            Transparent <span className="gradient-text">Pricing</span>
          </h1>
          <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto">
            Clear, competitive pricing with no hidden fees. Choose a package that suits your business needs.
          </p>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Sole Trader Package */}
            <div className="p-8 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-800 hover:border-white/50 transition">
              <h3 className="text-2xl font-bold mb-4">Sole Trader</h3>
              <p className="text-gray-400 mb-6">Perfect for self-employed individuals and freelancers</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">From £25</span>
                <span className="text-gray-400">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <span className="text-white mr-2">✓</span>
                  <span className="text-gray-300">Self Assessment tax return</span>
                </li>
                <li className="flex items-start">
                  <span className="text-white mr-2">✓</span>
                  <span className="text-gray-300">Annual accounts preparation</span>
                </li>
                <li className="flex items-start">
                  <span className="text-white mr-2">✓</span>
                  <span className="text-gray-300">Basic tax planning advice</span>
                </li>
                <li className="flex items-start">
                  <span className="text-white mr-2">✓</span>
                  <span className="text-gray-300">Email support</span>
                </li>
                <li className="flex items-start">
                  <span className="text-white mr-2">✓</span>
                  <span className="text-gray-300">HMRC correspondence support</span>
                </li>
              </ul>
              <Link
                href="/contact"
                className="block text-center px-6 py-3 border border-gray-700 rounded-lg font-semibold hover:border-white hover:bg-white/10 transition"
              >
                Get Started
              </Link>
            </div>

            {/* Small Business Package */}
            <div className="p-8 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border-2 border-white relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-white text-black px-4 py-1 rounded-full text-sm font-semibold">
                POPULAR
              </div>
              <h3 className="text-2xl font-bold mb-4">Small Business</h3>
              <p className="text-gray-400 mb-6">Ideal for small limited companies and growing businesses</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">From £75</span>
                <span className="text-gray-400">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <span className="text-white mr-2">✓</span>
                  <span className="text-gray-300">Monthly bookkeeping</span>
                </li>
                <li className="flex items-start">
                  <span className="text-white mr-2">✓</span>
                  <span className="text-gray-300">VAT returns (quarterly)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-white mr-2">✓</span>
                  <span className="text-gray-300">Year-end accounts & tax return</span>
                </li>
                <li className="flex items-start">
                  <span className="text-white mr-2">✓</span>
                  <span className="text-gray-300">Companies House filing</span>
                </li>
                <li className="flex items-start">
                  <span className="text-white mr-2">✓</span>
                  <span className="text-gray-300">Management accounts</span>
                </li>
                <li className="flex items-start">
                  <span className="text-white mr-2">✓</span>
                  <span className="text-gray-300">Tax planning & optimization</span>
                </li>
                <li className="flex items-start">
                  <span className="text-white mr-2">✓</span>
                  <span className="text-gray-300">Phone & email support</span>
                </li>
              </ul>
              <Link
                href="/contact"
                className="block text-center px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition"
              >
                Get Started
              </Link>
            </div>

            {/* Growing Business Package */}
            <div className="p-8 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-800 hover:border-white/50 transition">
              <h3 className="text-2xl font-bold mb-4">Growing Business</h3>
              <p className="text-gray-400 mb-6">Comprehensive support for established companies</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">From £150</span>
                <span className="text-gray-400">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <span className="text-white mr-2">✓</span>
                  <span className="text-gray-300">Everything in Small Business</span>
                </li>
                <li className="flex items-start">
                  <span className="text-white mr-2">✓</span>
                  <span className="text-gray-300">Dedicated accountant</span>
                </li>
                <li className="flex items-start">
                  <span className="text-white mr-2">✓</span>
                  <span className="text-gray-300">Payroll processing (up to 10 employees)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-white mr-2">✓</span>
                  <span className="text-gray-300">Quarterly business reviews</span>
                </li>
                <li className="flex items-start">
                  <span className="text-white mr-2">✓</span>
                  <span className="text-gray-300">Cash flow forecasting</span>
                </li>
                <li className="flex items-start">
                  <span className="text-white mr-2">✓</span>
                  <span className="text-gray-300">Strategic business advisory</span>
                </li>
                <li className="flex items-start">
                  <span className="text-white mr-2">✓</span>
                  <span className="text-gray-300">Priority support</span>
                </li>
              </ul>
              <Link
                href="/contact"
                className="block text-center px-6 py-3 border border-gray-700 rounded-lg font-semibold hover:border-white hover:bg-white/10 transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-16 px-6 bg-black/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">Additional Services</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-800">
              <h3 className="text-xl font-bold mb-2">Company Formation</h3>
              <p className="text-gray-400 mb-4">From £50 (one-time)</p>
              <p className="text-gray-300 text-sm">Complete company registration including Companies House filing</p>
            </div>

            <div className="p-6 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-800">
              <h3 className="text-xl font-bold mb-2">VAT Registration</h3>
              <p className="text-gray-400 mb-4">£75 (one-time)</p>
              <p className="text-gray-300 text-sm">VAT registration with HMRC and scheme selection advice</p>
            </div>

            <div className="p-6 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-800">
              <h3 className="text-xl font-bold mb-2">Payroll (Additional Employees)</h3>
              <p className="text-gray-400 mb-4">£5 per employee/month</p>
              <p className="text-gray-300 text-sm">For businesses with more than 10 employees</p>
            </div>

            <div className="p-6 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-800">
              <h3 className="text-xl font-bold mb-2">Cloud Accounting Setup</h3>
              <p className="text-gray-400 mb-4">£150 (one-time)</p>
              <p className="text-gray-300 text-sm">Xero, QuickBooks or Sage setup and training</p>
            </div>

            <div className="p-6 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-800">
              <h3 className="text-xl font-bold mb-2">Tax Investigation Support</h3>
              <p className="text-gray-400 mb-4">£100/hour</p>
              <p className="text-gray-300 text-sm">Expert representation during HMRC investigations</p>
            </div>

            <div className="p-6 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-800">
              <h3 className="text-xl font-bold mb-2">Custom Packages</h3>
              <p className="text-gray-400 mb-4">Contact us</p>
              <p className="text-gray-300 text-sm">Tailored solutions for unique business needs</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="p-6 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-800">
              <h3 className="text-xl font-bold mb-3">Are there any hidden fees?</h3>
              <p className="text-gray-400">
                No. Our pricing is completely transparent. The monthly fee covers the services listed in your package. Any additional services are clearly quoted upfront.
              </p>
            </div>

            <div className="p-6 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-800">
              <h3 className="text-xl font-bold mb-3">Can I change packages?</h3>
              <p className="text-gray-400">
                Yes, you can upgrade or downgrade your package at any time. We'll adjust your billing accordingly with no penalties.
              </p>
            </div>

            <div className="p-6 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-800">
              <h3 className="text-xl font-bold mb-3">What payment methods do you accept?</h3>
              <p className="text-gray-400">
                We accept bank transfers, standing orders, and direct debit. Monthly packages are billed at the start of each month.
              </p>
            </div>

            <div className="p-6 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-800">
              <h3 className="text-xl font-bold mb-3">Is there a contract or minimum term?</h3>
              <p className="text-gray-400">
                No long-term contracts required. We work on a month-to-month basis. You can cancel anytime with 30 days' notice.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-black/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6">Ready to get started?</h2>
          <p className="text-xl text-gray-400 mb-8">
            Contact us for a free consultation and we'll recommend the best package for your needs.
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-4 bg-white text-black rounded-lg font-semibold text-lg hover:bg-gray-200 transition transform hover:scale-105"
          >
            Contact Us Today →
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
