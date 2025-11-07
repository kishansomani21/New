'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get('type');

  const [userType, setUserType] = useState<'WORKER' | 'COMPANY'>(
    typeParam === 'company' ? 'COMPANY' : 'WORKER'
  );
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    companyName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (userType === 'COMPANY' && !formData.companyName) {
      setError('Company name is required');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          userType,
          companyName: userType === 'COMPANY' ? formData.companyName : undefined,
          phone: formData.phone || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

      // Store user in localStorage (in a real app, use proper session management)
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect to appropriate dashboard
      if (userType === 'WORKER') {
        router.push('/worker/dashboard');
      } else {
        router.push('/company/dashboard');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold gradient-text">
            SkillSync
          </Link>
          <h1 className="text-3xl font-bold mt-6 mb-2">Create Your Account</h1>
          <p className="text-gray-400">Join the future of skills and hiring</p>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700">
          {/* User Type Selector */}
          <div className="flex gap-4 mb-6">
            <button
              type="button"
              onClick={() => setUserType('WORKER')}
              className={`flex-1 py-3 rounded-lg font-semibold transition ${
                userType === 'WORKER'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              I'm a Worker
            </button>
            <button
              type="button"
              onClick={() => setUserType('COMPANY')}
              className={`flex-1 py-3 rounded-lg font-semibold transition ${
                userType === 'COMPANY'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              I'm a Company
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-500 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {userType === 'COMPANY' ? 'Your Name' : 'Full Name'}
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 transition"
                placeholder="John Doe"
              />
            </div>

            {userType === 'COMPANY' && (
              <div>
                <label className="block text-sm font-medium mb-2">Company Name</label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 transition"
                  placeholder="Acme Corp"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 transition"
                placeholder="you@example.com"
              />
            </div>

            {userType === 'WORKER' && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Phone Number (optional)
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 transition"
                  placeholder="+1 234 567 8900"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 transition"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Confirm Password</label>
              <input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 transition"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-purple-400 hover:text-purple-300">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
