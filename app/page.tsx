'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold gradient-text">SkillSync</div>
          <div className="flex gap-6 items-center">
            <Link href="#how-it-works" className="text-gray-300 hover:text-white transition">
              How It Works
            </Link>
            <Link href="#features" className="text-gray-300 hover:text-white transition">
              Features
            </Link>
            <Link
              href="/auth/login"
              className="px-4 py-2 text-gray-300 hover:text-white transition"
            >
              Login
            </Link>
            <Link
              href="/auth/register"
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
            The Future of
            <span className="gradient-text"> Skills & Hiring</span>
          </h1>
          <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto animate-slide-up">
            No more CVs. Just verified skills, real work history, and direct connections.
            Workers showcase their talents. Companies find exactly who they need.
          </p>
          <div className="flex gap-4 justify-center animate-slide-up">
            <Link
              href="/auth/register?type=worker"
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg font-semibold text-lg hover:shadow-2xl hover:shadow-purple-500/50 transition transform hover:scale-105"
            >
              I'm a Worker
            </Link>
            <Link
              href="/auth/register?type=company"
              className="px-8 py-4 border border-gray-700 rounded-lg font-semibold text-lg hover:border-purple-500 transition"
            >
              I'm Hiring
            </Link>
          </div>
        </div>

        {/* Feature Preview */}
        <div className="max-w-5xl mx-auto mt-20 animate-slide-up">
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-8 border border-gray-700 backdrop-blur">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div className="p-6">
                <div className="text-4xl mb-3">✓</div>
                <h3 className="text-xl font-semibold mb-2">Verified Skills</h3>
                <p className="text-gray-400">Employers verify your work history</p>
              </div>
              <div className="p-6">
                <div className="text-4xl mb-3">💰</div>
                <h3 className="text-xl font-semibold mb-2">Pay Per Contact</h3>
                <p className="text-gray-400">Companies pay only for who they want</p>
              </div>
              <div className="p-6">
                <div className="text-4xl mb-3">⭐</div>
                <h3 className="text-xl font-semibold mb-2">Reviews = Savings</h3>
                <p className="text-gray-400">Leave reviews, get cheaper access</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6 bg-black/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-16">
            How <span className="gradient-text">SkillSync</span> Works
          </h2>

          {/* For Workers */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold mb-8 text-purple-400">For Workers</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-800">
                <div className="text-3xl font-bold text-purple-500 mb-4">1</div>
                <h4 className="text-xl font-bold mb-2">Create Your Profile</h4>
                <p className="text-gray-400">
                  List your skills, experience, and availability. No traditional CV needed.
                </p>
              </div>
              <div className="p-6 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-800">
                <div className="text-3xl font-bold text-purple-500 mb-4">2</div>
                <h4 className="text-xl font-bold mb-2">Get Verified</h4>
                <p className="text-gray-400">
                  Previous employers "sign you in/out" - creating a verified digital work record.
                </p>
              </div>
              <div className="p-6 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-800">
                <div className="text-3xl font-bold text-purple-500 mb-4">3</div>
                <h4 className="text-xl font-bold mb-2">Get Hired</h4>
                <p className="text-gray-400">
                  Companies find you, buy your contact info, and reach out directly.
                </p>
              </div>
            </div>
          </div>

          {/* For Companies */}
          <div>
            <h3 className="text-3xl font-bold mb-8 text-indigo-400">For Companies</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-800">
                <div className="text-3xl font-bold text-indigo-500 mb-4">1</div>
                <h4 className="text-xl font-bold mb-2">Search & Filter</h4>
                <p className="text-gray-400">
                  Find workers by skills - carpenters, pizza makers, laborers, anything.
                </p>
              </div>
              <div className="p-6 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-800">
                <div className="text-3xl font-bold text-indigo-500 mb-4">2</div>
                <h4 className="text-xl font-bold mb-2">Buy Contacts</h4>
                <p className="text-gray-400">
                  Pay to access phone/email of workers you want. Price drops as you review more!
                </p>
              </div>
              <div className="p-6 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-800">
                <div className="text-3xl font-bold text-indigo-500 mb-4">3</div>
                <h4 className="text-xl font-bold mb-2">Review & Save</h4>
                <p className="text-gray-400">
                  Leave reviews to earn points. More reviews = cheaper contact access!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-16">
            Why <span className="gradient-text">SkillSync</span> is Different
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-800 hover:border-purple-500/50 transition">
              <h3 className="text-2xl font-bold mb-4">✓ Employment Verification</h3>
              <p className="text-gray-400">
                Employers can "sign in" workers when they start and "sign out" when they leave.
                This creates an unbreakable chain of verified employment history.
              </p>
            </div>
            <div className="p-8 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-800 hover:border-purple-500/50 transition">
              <h3 className="text-2xl font-bold mb-4">💳 Pay-Per-Contact Model</h3>
              <p className="text-gray-400">
                Companies only pay for workers they're interested in. No subscription fees,
                no wasted money on job postings that don't work.
              </p>
            </div>
            <div className="p-8 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-800 hover:border-purple-500/50 transition">
              <h3 className="text-2xl font-bold mb-4">⭐ Review-to-Save System</h3>
              <p className="text-gray-400">
                Companies earn 10 points per review. These points give permanent discounts
                on contact purchases. More engagement = lower costs!
              </p>
            </div>
            <div className="p-8 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-800 hover:border-purple-500/50 transition">
              <h3 className="text-2xl font-bold mb-4">🎯 Skills-First Approach</h3>
              <p className="text-gray-400">
                No more parsing CVs. Search directly by skills: "cupboard carpenter",
                "Domino's pizza maker", "construction laborer" - find exactly what you need.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Example */}
      <section className="py-20 px-6 bg-black/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">
            Simple, Fair <span className="gradient-text">Pricing</span>
          </h2>
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-8 border border-gray-700">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold mb-4">For Workers</h3>
                <p className="text-3xl font-bold text-purple-500 mb-4">100% Free</p>
                <ul className="space-y-2 text-gray-400">
                  <li>✓ Unlimited profile views</li>
                  <li>✓ Verified employment history</li>
                  <li>✓ Skill management</li>
                  <li>✓ Review system</li>
                </ul>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-4">For Companies</h3>
                <p className="text-3xl font-bold text-indigo-500 mb-4">Pay Per Contact</p>
                <ul className="space-y-2 text-gray-400">
                  <li>• Base: $5.00 per contact</li>
                  <li>• 10 reviews: $4.50 (10% off)</li>
                  <li>• 50 reviews: $2.50 (50% off)</li>
                  <li>• Earn 10 pts per review</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6">Ready to revolutionize hiring?</h2>
          <p className="text-xl text-gray-400 mb-8">
            Join workers and companies building the future of verified employment.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/auth/register?type=worker"
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg font-semibold text-lg hover:shadow-2xl hover:shadow-purple-500/50 transition transform hover:scale-105"
            >
              Join as Worker →
            </Link>
            <Link
              href="/auth/register?type=company"
              className="px-8 py-4 border border-gray-700 rounded-lg font-semibold text-lg hover:border-purple-500 transition"
            >
              Join as Company →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-6 text-center text-gray-500">
        <p>&copy; 2024 SkillSync. The skills marketplace of the future.</p>
      </footer>
    </div>
  );
}
