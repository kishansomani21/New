'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { calculateContactPrice, formatPrice, getPricingTier } from '@/lib/pricing';

interface CompanyProfile {
  id: string;
  companyName: string;
  points: number;
  totalReviews: number;
}

interface Skill {
  id: string;
  name: string;
  category: string;
}

interface WorkerSkill {
  skill: Skill;
  yearsExperience: number;
  verified: boolean;
}

interface Worker {
  id: string;
  name: string;
  bio?: string;
  location?: string;
  hourlyRate?: number;
  available: boolean;
  averageRating: number;
  skills: WorkerSkill[];
  employmentCount: number;
  reviewCount: number;
  email?: string | null;
  phone?: string | null;
  contactPurchased?: boolean;
}

export default function CompanyDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);

  // Search filters
  const [skillFilter, setSkillFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [availableOnly, setAvailableOnly] = useState(true);

  // Purchase modal
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [purchaseType, setPurchaseType] = useState<'email' | 'phone' | 'both'>('both');
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/auth/login');
      return;
    }

    const userData = JSON.parse(storedUser);
    if (userData.userType !== 'COMPANY') {
      router.push('/worker/dashboard');
      return;
    }

    setUser(userData);
    fetchProfile(userData.id);
  }, [router]);

  useEffect(() => {
    if (user) {
      searchWorkers();
    }
  }, [user, skillFilter, locationFilter, availableOnly]);

  const fetchProfile = async (userId: string) => {
    try {
      const response = await fetch('/api/company/profile', {
        headers: {
          'x-user-id': userId,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfile(data.profile);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setLoading(false);
    }
  };

  const searchWorkers = async () => {
    try {
      const params = new URLSearchParams();
      if (skillFilter) params.append('skill', skillFilter);
      if (locationFilter) params.append('location', locationFilter);
      if (availableOnly) params.append('available', 'true');

      const response = await fetch(`/api/company/search?${params.toString()}`, {
        headers: {
          'x-user-id': user.id,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to search workers');
      }

      const data = await response.json();
      setWorkers(data.workers);
    } catch (error) {
      console.error('Error searching workers:', error);
    }
  };

  const handlePurchaseContact = async () => {
    if (!selectedWorker || !profile) return;

    setPurchasing(true);

    try {
      const response = await fetch('/api/company/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({
          workerId: selectedWorker.id,
          purchaseType,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || 'Failed to purchase contact');
        setPurchasing(false);
        return;
      }

      const data = await response.json();

      // Update the worker in the list with contact info
      setWorkers(
        workers.map(w =>
          w.id === selectedWorker.id
            ? {
                ...w,
                email: data.contact.email,
                phone: data.contact.phone,
                contactPurchased: true,
              }
            : w
        )
      );

      alert(
        `Contact purchased successfully! Price: ${formatPrice(data.pricing.finalPrice)}`
      );

      setSelectedWorker(null);
      setPurchasing(false);
    } catch (error) {
      console.error('Error purchasing contact:', error);
      alert('Failed to purchase contact');
      setPurchasing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const pricingTier = profile ? getPricingTier(profile.points) : null;
  const currentPrice = profile ? calculateContactPrice(profile.points) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold gradient-text">
            SkillSync
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-gray-400">{profile?.companyName}</span>
            <Link
              href="/company/manage-workers"
              className="px-4 py-2 border border-gray-700 rounded-lg hover:border-purple-500 transition"
            >
              Manage Workers
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-gray-700 rounded-lg hover:border-purple-500 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Company Stats & Pricing */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div className="text-3xl font-bold text-indigo-500">
                {profile?.points || 0}
              </div>
              <div className="text-gray-400 mt-1">Points</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div className="text-3xl font-bold text-purple-500">
                {profile?.totalReviews || 0}
              </div>
              <div className="text-gray-400 mt-1">Reviews Given</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div className="text-3xl font-bold text-green-500">
                {pricingTier?.tier || 'Starter'}
              </div>
              <div className="text-gray-400 mt-1">Tier</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div className="text-3xl font-bold text-orange-500">
                {currentPrice ? formatPrice(currentPrice.finalPrice) : '$5.00'}
              </div>
              <div className="text-gray-400 mt-1">Price Per Contact</div>
              {currentPrice && currentPrice.discountPercentage > 0 && (
                <div className="text-xs text-green-500 mt-1">
                  {currentPrice.discountPercentage.toFixed(0)}% discount!
                </div>
              )}
            </div>
          </div>

          {/* Pricing Info */}
          <div className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 rounded-xl p-6 border border-purple-500/30 mb-8">
            <h3 className="text-lg font-bold mb-2">How to Get Cheaper Access</h3>
            <p className="text-gray-300">
              Leave reviews to earn 10 points each. Every 10 points = 1% discount (max 50% off).
              {profile && profile.points < 500 && (
                <span className="text-purple-400">
                  {' '}
                  You need {500 - profile.points} more points to reach maximum discount!
                </span>
              )}
            </p>
          </div>

          {/* Search & Filter */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 mb-8">
            <h2 className="text-2xl font-bold mb-6">Find Workers</h2>

            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Search by Skill</label>
                <input
                  type="text"
                  value={skillFilter}
                  onChange={(e) => setSkillFilter(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 transition"
                  placeholder="e.g., Carpenter, Pizza"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <input
                  type="text"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 transition"
                  placeholder="City, Country"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={availableOnly}
                    onChange={(e) => setAvailableOnly(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span>Available only</span>
                </label>
              </div>
            </div>

            <div className="text-sm text-gray-400">
              Found {workers.length} worker{workers.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Workers List */}
          <div className="space-y-4">
            {workers.length === 0 ? (
              <div className="bg-gray-800/50 rounded-xl p-12 border border-gray-700 text-center">
                <p className="text-gray-400 text-lg">
                  No workers found. Try adjusting your filters.
                </p>
              </div>
            ) : (
              workers.map((worker) => (
                <div
                  key={worker.id}
                  className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-purple-500/50 transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-2xl font-bold">{worker.name}</h3>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="text-yellow-500">
                              {'★'.repeat(Math.round(worker.averageRating))}
                              {'☆'.repeat(5 - Math.round(worker.averageRating))}
                              <span className="text-gray-400 ml-2">
                                ({worker.reviewCount} reviews)
                              </span>
                            </div>
                            {worker.available && (
                              <span className="px-3 py-1 bg-green-500/20 text-green-500 rounded-full text-xs">
                                Available
                              </span>
                            )}
                          </div>
                        </div>
                        {worker.hourlyRate && (
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-500">
                              ${worker.hourlyRate}/hr
                            </div>
                          </div>
                        )}
                      </div>

                      {worker.bio && (
                        <p className="text-gray-400 mb-4">{worker.bio}</p>
                      )}

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-gray-500 mb-2">Skills</div>
                          <div className="flex flex-wrap gap-2">
                            {worker.skills.map((ws, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm"
                              >
                                {ws.skill.name}
                                {ws.verified && ' ✓'}
                                {ws.yearsExperience > 0 &&
                                  ` (${ws.yearsExperience}y)`}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500 mb-2">Details</div>
                          <div className="space-y-1 text-sm">
                            {worker.location && (
                              <div className="text-gray-400">
                                📍 {worker.location}
                              </div>
                            )}
                            <div className="text-gray-400">
                              💼 {worker.employmentCount} previous employment
                              {worker.employmentCount !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Contact Information */}
                      {worker.email || worker.phone ? (
                        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
                          <div className="font-semibold text-green-500 mb-2">
                            Contact Information (Purchased)
                          </div>
                          {worker.email && (
                            <div className="text-gray-300">
                              📧 {worker.email}
                            </div>
                          )}
                          {worker.phone && (
                            <div className="text-gray-300">
                              📱 {worker.phone}
                            </div>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedWorker(worker)}
                          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition"
                        >
                          Purchase Contact Info •{' '}
                          {currentPrice
                            ? formatPrice(currentPrice.finalPrice)
                            : '$5.00'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      {selectedWorker && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6">
          <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full border border-gray-700">
            <h3 className="text-2xl font-bold mb-4">Purchase Contact Info</h3>

            <div className="bg-gray-900/50 rounded-lg p-4 mb-6">
              <div className="font-semibold text-lg mb-2">{selectedWorker.name}</div>
              <div className="text-gray-400">
                {selectedWorker.skills
                  .map((ws) => ws.skill.name)
                  .join(', ')}
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">Base Price</span>
                  <span className="line-through text-gray-500">
                    {formatPrice(currentPrice?.basePrice || 5)}
                  </span>
                </div>
                {currentPrice && currentPrice.discountPercentage > 0 && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300">
                      Your Discount ({currentPrice.discountPercentage.toFixed(0)}%)
                    </span>
                    <span className="text-green-500">
                      -{formatPrice(currentPrice.discountAmount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center text-xl font-bold pt-2 border-t border-gray-700">
                  <span>Final Price</span>
                  <span className="text-green-500">
                    {formatPrice(currentPrice?.finalPrice || 5)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  What do you need?
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="purchaseType"
                      value="both"
                      checked={purchaseType === 'both'}
                      onChange={(e) =>
                        setPurchaseType(e.target.value as 'email' | 'phone' | 'both')
                      }
                    />
                    <span>Email & Phone (Recommended)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="purchaseType"
                      value="email"
                      checked={purchaseType === 'email'}
                      onChange={(e) =>
                        setPurchaseType(e.target.value as 'email' | 'phone' | 'both')
                      }
                    />
                    <span>Email Only</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="purchaseType"
                      value="phone"
                      checked={purchaseType === 'phone'}
                      onChange={(e) =>
                        setPurchaseType(e.target.value as 'email' | 'phone' | 'both')
                      }
                    />
                    <span>Phone Only</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handlePurchaseContact}
                disabled={purchasing}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition disabled:opacity-50"
              >
                {purchasing ? 'Processing...' : 'Purchase Now'}
              </button>
              <button
                onClick={() => setSelectedWorker(null)}
                className="flex-1 py-3 bg-gray-600 rounded-lg hover:bg-gray-700 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
