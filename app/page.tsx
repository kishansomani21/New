'use client';

import Link from 'next/link';

export default function Home() {
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
          <h1 className="text-7xl font-bold mb-6 animate-fade-in">
            Expert Accounting for
            <span className="gradient-text"> Your Business</span>
          </h1>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto animate-slide-up">
            Professional accounting, tax planning, and business advisory services tailored to your needs.
            Let us handle your finances while you focus on growing your business.
          </p>
          <div className="flex gap-4 justify-center animate-slide-up">
            <Link
              href="/contact"
              className="px-8 py-4 bg-white text-black rounded-lg font-semibold text-lg hover:bg-gray-200 transition transform hover:scale-105"
            >
              Get Started
            </Link>
            <Link
              href="/services"
              className="px-8 py-4 border border-gray-700 rounded-lg font-semibold text-lg hover:border-white transition"
            >
              Our Services
            </Link>
          </div>
        </div>

        {/* Key Services Preview */}
        <div className="max-w-5xl mx-auto mt-20 animate-slide-up">
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-8 border border-gray-700 backdrop-blur">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div className="p-6">
                <div className="text-4xl mb-3">📊</div>
                <h3 className="text-xl font-semibold mb-2">Bookkeeping</h3>
                <p className="text-gray-400">Accurate financial records</p>
              </div>
              <div className="p-6">
                <div className="text-4xl mb-3">📋</div>
                <h3 className="text-xl font-semibold mb-2">Tax Returns</h3>
                <p className="text-gray-400">VAT & Self Assessment</p>
              </div>
              <div className="p-6">
                <div className="text-4xl mb-3">💼</div>
                <h3 className="text-xl font-semibold mb-2">Advisory</h3>
                <p className="text-gray-400">Strategic business guidance</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-6 bg-black/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-16">
            Why Choose <span className="gradient-text">929 Accountants</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-800 hover:border-white/50 transition">
              <h3 className="text-2xl font-bold mb-4">Expert Knowledge</h3>
              <p className="text-gray-400">
                Our qualified accountants stay up-to-date with the latest tax laws and regulations to ensure your compliance.
              </p>
            </div>
            <div className="p-8 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-800 hover:border-white/50 transition">
              <h3 className="text-2xl font-bold mb-4">Personalized Service</h3>
              <p className="text-gray-400">
                We take time to understand your business and provide tailored solutions that meet your specific needs.
              </p>
            </div>
            <div className="p-8 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-800 hover:border-white/50 transition">
              <h3 className="text-2xl font-bold mb-4">Cost Effective</h3>
              <p className="text-gray-400">
                Competitive pricing with transparent fees. No hidden charges, just honest accounting services.
              </p>
            </div>
            <div className="p-8 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-800 hover:border-white/50 transition">
              <h3 className="text-2xl font-bold mb-4">Timely Support</h3>
              <p className="text-gray-400">
                Quick response times and proactive communication to keep you informed every step of the way.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-16">Our Services</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-800">
              <h3 className="text-2xl font-bold mb-4">Tax Services</h3>
              <ul className="space-y-3 text-gray-400">
                <li>• Self Assessment Tax Returns</li>
                <li>• Corporation Tax</li>
                <li>• VAT Returns & Registration</li>
                <li>• Tax Planning & Advice</li>
              </ul>
            </div>
            <div className="p-8 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-800">
              <h3 className="text-2xl font-bold mb-4">Accounting</h3>
              <ul className="space-y-3 text-gray-400">
                <li>• Bookkeeping Services</li>
                <li>• Year-End Accounts</li>
                <li>• Management Accounts</li>
                <li>• Financial Reporting</li>
              </ul>
            </div>
            <div className="p-8 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-800">
              <h3 className="text-2xl font-bold mb-4">Business Services</h3>
              <ul className="space-y-3 text-gray-400">
                <li>• Company Formation</li>
                <li>• Payroll Management</li>
                <li>• Business Advisory</li>
                <li>• Cloud Accounting Setup</li>
              </ul>
            </div>
          </div>
          <div className="text-center mt-12">
            <Link
              href="/services"
              className="inline-block px-8 py-4 bg-white text-black rounded-lg font-semibold text-lg hover:bg-gray-200 transition transform hover:scale-105"
            >
              View All Services →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-black/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6">Ready to get started?</h2>
          <p className="text-xl text-gray-400 mb-8">
            Contact us today for a free consultation and discover how we can help your business thrive.
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
