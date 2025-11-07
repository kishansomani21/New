'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    businessType: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, you would send this data to your backend/email service
    console.log('Form submitted:', formData);
    setSubmitted(true);
    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        businessType: '',
        message: ''
      });
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

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
          <h1 className="text-6xl font-bold mb-6 animate-fade-in">
            Get in <span className="gradient-text">Touch</span>
          </h1>
          <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto">
            Have questions about our services? Ready to start working together? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="p-8 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-800">
            <h2 className="text-3xl font-bold mb-6">Send us a message</h2>

            {submitted ? (
              <div className="p-6 bg-white/10 rounded-lg border border-white/20">
                <p className="text-white text-lg">
                  Thank you for your message! We'll get back to you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg focus:border-white focus:outline-none transition"
                    placeholder="John Smith"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg focus:border-white focus:outline-none transition"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg focus:border-white focus:outline-none transition"
                    placeholder="07123 456789"
                  />
                </div>

                <div>
                  <label htmlFor="businessType" className="block text-sm font-semibold mb-2">
                    Business Type *
                  </label>
                  <select
                    id="businessType"
                    name="businessType"
                    required
                    value={formData.businessType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg focus:border-white focus:outline-none transition text-white"
                  >
                    <option value="">Select your business type</option>
                    <option value="sole-trader">Sole Trader</option>
                    <option value="limited-company">Limited Company</option>
                    <option value="partnership">Partnership</option>
                    <option value="individual">Individual</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg focus:border-white focus:outline-none transition resize-none"
                    placeholder="Tell us about your accounting needs..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-8 py-4 bg-white text-black rounded-lg font-semibold text-lg hover:bg-gray-200 transition transform hover:scale-105"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <div className="p-8 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-800">
              <h2 className="text-3xl font-bold mb-6">Contact Information</h2>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">✉️</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Email</h3>
                    <a href="mailto:info@929accountants.co.uk" className="text-gray-400 hover:text-white transition">
                      info@929accountants.co.uk
                    </a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">📞</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Phone</h3>
                    <p className="text-gray-400">
                      Available upon request
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">⏰</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Business Hours</h3>
                    <p className="text-gray-400">
                      Monday - Friday: 9:00 AM - 6:00 PM<br />
                      Saturday - Sunday: Closed
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">📍</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Location</h3>
                    <p className="text-gray-400">
                      Serving clients across the UK
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-800">
              <h3 className="text-2xl font-bold mb-4">Quick Response</h3>
              <p className="text-gray-400 mb-4">
                We aim to respond to all inquiries within 24 hours during business days. For urgent matters, please indicate this in your message.
              </p>
              <p className="text-gray-400">
                New clients are always welcome, and we offer a free initial consultation to discuss your needs.
              </p>
            </div>

            <div className="p-8 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-800">
              <h3 className="text-2xl font-bold mb-4">What Happens Next?</h3>
              <ul className="space-y-3 text-gray-400">
                <li className="flex gap-3">
                  <span className="text-white">1.</span>
                  <span>We'll review your inquiry and respond within 24 hours</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-white">2.</span>
                  <span>Schedule a free consultation to discuss your needs</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-white">3.</span>
                  <span>Receive a tailored proposal with transparent pricing</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-white">4.</span>
                  <span>Start working together to achieve your financial goals</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-6 bg-black/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">Common Questions</h2>
          <div className="space-y-6">
            <div className="p-6 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-800">
              <h3 className="text-xl font-bold mb-3">Do you offer free consultations?</h3>
              <p className="text-gray-400">
                Yes, we offer a free initial consultation to discuss your needs and how we can help. This gives us both the opportunity to see if we're a good fit.
              </p>
            </div>

            <div className="p-6 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-800">
              <h3 className="text-xl font-bold mb-3">How quickly can you start working with me?</h3>
              <p className="text-gray-400">
                We can typically onboard new clients within a few days, depending on the complexity of your needs. For urgent matters like upcoming tax deadlines, we'll do our best to accommodate you.
              </p>
            </div>

            <div className="p-6 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-800">
              <h3 className="text-xl font-bold mb-3">Do you work with clients remotely?</h3>
              <p className="text-gray-400">
                Yes, we work with clients across the UK. All our services can be delivered remotely using secure cloud-based accounting software and video calls.
              </p>
            </div>

            <div className="p-6 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-800">
              <h3 className="text-xl font-bold mb-3">What information do I need to provide?</h3>
              <p className="text-gray-400">
                During our initial consultation, we'll discuss your specific situation. Generally, we'll need access to your financial records, bank statements, and any previous tax returns or accounts.
              </p>
            </div>
          </div>
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
