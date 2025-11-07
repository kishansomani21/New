'use client';

import Link from 'next/link';

export default function About() {
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
            <Link href="/about" className="text-white font-semibold">
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
            About <span className="gradient-text">929 Accountants</span>
          </h1>
          <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto">
            Your trusted partner for professional accounting services in the UK.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-8">Our Story</h2>
          <div className="space-y-6 text-gray-400 text-lg">
            <p>
              At 929 Accountants, we understand that managing your finances can be overwhelming. That's why we've dedicated ourselves to providing clear, professional accounting services that give you peace of mind and help your business thrive.
            </p>
            <p>
              Our team of qualified accountants brings years of experience across various industries, ensuring we can provide tailored solutions that meet your specific needs. Whether you're a sole trader just starting out or an established business looking to grow, we have the expertise to support you.
            </p>
            <p>
              We pride ourselves on building long-term relationships with our clients, becoming a trusted partner in their business journey. Our approach combines technical excellence with genuine care for your success.
            </p>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 px-6 bg-black/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-800">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold mb-4">Excellence</h3>
              <p className="text-gray-400">
                We maintain the highest standards in everything we do, staying current with tax laws and accounting best practices to deliver exceptional service.
              </p>
            </div>

            <div className="p-8 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-800">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-2xl font-bold mb-4">Integrity</h3>
              <p className="text-gray-400">
                Honesty and transparency are at the core of our business. We provide clear advice and keep you informed every step of the way.
              </p>
            </div>

            <div className="p-8 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-800">
              <div className="text-4xl mb-4">💡</div>
              <h3 className="text-2xl font-bold mb-4">Innovation</h3>
              <p className="text-gray-400">
                We embrace modern technology and cloud accounting solutions to make your financial management more efficient and accessible.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">What We Do</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-800">
              <h3 className="text-2xl font-bold mb-4">For Individuals</h3>
              <p className="text-gray-400 mb-4">
                We help self-employed individuals and freelancers navigate the complexities of self-assessment tax returns, ensuring you claim all eligible deductions and stay compliant with HMRC.
              </p>
              <ul className="space-y-2 text-gray-400">
                <li>• Self Assessment tax returns</li>
                <li>• Tax planning and optimization</li>
                <li>• Capital gains tax advice</li>
                <li>• Rental income management</li>
              </ul>
            </div>

            <div className="p-8 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-800">
              <h3 className="text-2xl font-bold mb-4">For Businesses</h3>
              <p className="text-gray-400 mb-4">
                From startups to established companies, we provide comprehensive accounting services that help you make informed decisions and achieve sustainable growth.
              </p>
              <ul className="space-y-2 text-gray-400">
                <li>• Bookkeeping and accounts</li>
                <li>• VAT and corporation tax</li>
                <li>• Payroll management</li>
                <li>• Business advisory services</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 px-6 bg-black/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">Why Choose Us</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">✓</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Qualified Professionals</h3>
                <p className="text-gray-400">
                  Our team consists of qualified accountants with extensive experience across multiple industries and business types.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">✓</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Personalized Service</h3>
                <p className="text-gray-400">
                  We take the time to understand your unique situation and provide tailored advice that works for you.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">✓</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Transparent Pricing</h3>
                <p className="text-gray-400">
                  Clear, competitive fees with no hidden charges. You'll always know exactly what you're paying for.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">✓</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Proactive Communication</h3>
                <p className="text-gray-400">
                  We keep you informed with regular updates and are always available when you need us.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">✓</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Modern Technology</h3>
                <p className="text-gray-400">
                  We utilize cloud accounting software like Xero and QuickBooks for real-time financial visibility.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">✓</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">HMRC Compliance</h3>
                <p className="text-gray-400">
                  Stay compliant with Making Tax Digital and all HMRC requirements with our expert guidance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Commitment */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-8 text-center">Our Commitment</h2>
          <div className="p-8 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-800">
            <p className="text-gray-400 text-lg mb-6">
              We are committed to providing the highest quality accounting services while making them accessible and affordable for businesses of all sizes. Your success is our success, and we're here to support you every step of the way.
            </p>
            <p className="text-gray-400 text-lg">
              Whether you need help with a one-time tax return or ongoing accounting support, we're ready to help. Get in touch today to discover how we can support your financial goals.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-black/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6">Ready to work with us?</h2>
          <p className="text-xl text-gray-400 mb-8">
            Contact us today for a free consultation.
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
