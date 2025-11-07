'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ManageWorkersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  // Sign In Worker
  const [showSignIn, setShowSignIn] = useState(false);
  const [signInData, setSignInData] = useState({
    workerEmail: '',
    jobTitle: '',
    description: '',
  });
  const [signInLoading, setSignInLoading] = useState(false);

  // Leave Review
  const [showReview, setShowReview] = useState(false);
  const [reviewData, setReviewData] = useState({
    workerEmail: '',
    rating: 5,
    comment: '',
    workQuality: 5,
    reliability: 5,
    communication: 5,
  });
  const [reviewLoading, setReviewLoading] = useState(false);

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

  const fetchProfile = async (userId: string) => {
    try {
      const response = await fetch('/api/company/profile', {
        headers: {
          'x-user-id': userId,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSignInWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInLoading(true);

    try {
      const response = await fetch('/api/company/employment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify(signInData),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to sign in worker');
        setSignInLoading(false);
        return;
      }

      alert(
        `Successfully signed in ${data.worker.name}! They now have verified employment history with ${profile.companyName}.`
      );
      setShowSignIn(false);
      setSignInData({ workerEmail: '', jobTitle: '', description: '' });
      setSignInLoading(false);
    } catch (error) {
      console.error('Error signing in worker:', error);
      alert('Failed to sign in worker');
      setSignInLoading(false);
    }
  };

  const handleLeaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewLoading(true);

    try {
      // First, find the worker by email
      const searchResponse = await fetch(
        `/api/company/search?skill=&location=&available=false`,
        {
          headers: {
            'x-user-id': user.id,
          },
        }
      );

      if (!searchResponse.ok) {
        throw new Error('Failed to find worker');
      }

      const searchData = await searchResponse.json();
      const worker = searchData.workers.find(
        (w: any) =>
          w.email?.toLowerCase() === reviewData.workerEmail.toLowerCase()
      );

      if (!worker) {
        alert('Worker not found. Make sure you have purchased their contact info.');
        setReviewLoading(false);
        return;
      }

      const response = await fetch('/api/company/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({
          workerId: worker.id,
          ...reviewData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to leave review');
        setReviewLoading(false);
        return;
      }

      alert(
        `Review submitted! You earned ${data.pointsAwarded} points. Total points: ${data.newTotalPoints}`
      );

      // Refresh profile to show new points
      fetchProfile(user.id);

      setShowReview(false);
      setReviewData({
        workerEmail: '',
        rating: 5,
        comment: '',
        workQuality: 5,
        reliability: 5,
        communication: 5,
      });
      setReviewLoading(false);
    } catch (error) {
      console.error('Error leaving review:', error);
      alert('Failed to leave review');
      setReviewLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold gradient-text">
            SkillSync
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/company/dashboard"
              className="px-4 py-2 border border-gray-700 rounded-lg hover:border-purple-500 transition"
            >
              Back to Search
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
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Manage Workers</h1>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Current Points */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div className="text-3xl font-bold text-indigo-500">
                {profile?.points || 0} Points
              </div>
              <div className="text-gray-400 mt-1">
                Total Reviews: {profile?.totalReviews || 0}
              </div>
              <div className="text-sm text-gray-500 mt-2">
                Earn 10 points per review. More points = cheaper contact access!
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 rounded-xl p-6 border border-purple-500/30">
              <div className="font-semibold mb-2">How it works:</div>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Sign in workers when they start</li>
                <li>• Sign out when they leave</li>
                <li>• Leave reviews to earn points</li>
                <li>• More points = cheaper access</li>
              </ul>
            </div>
          </div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Sign In Worker */}
            <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700">
              <div className="text-3xl mb-4">✓</div>
              <h2 className="text-2xl font-bold mb-3">Sign In Worker</h2>
              <p className="text-gray-400 mb-6">
                Verify a new employee by signing them in. This creates a verified employment
                record on their profile.
              </p>
              <button
                onClick={() => setShowSignIn(true)}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition"
              >
                Sign In Worker
              </button>
            </div>

            {/* Leave Review */}
            <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700">
              <div className="text-3xl mb-4">⭐</div>
              <h2 className="text-2xl font-bold mb-3">Leave Review</h2>
              <p className="text-gray-400 mb-6">
                Review a worker you've worked with. Earn 10 points per review to get cheaper
                contact access!
              </p>
              <button
                onClick={() => setShowReview(true)}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition"
              >
                Leave Review
              </button>
            </div>
          </div>

          {/* Information Section */}
          <div className="mt-12 bg-gray-800/50 rounded-xl p-8 border border-gray-700">
            <h3 className="text-xl font-bold mb-4">Employment Verification System</h3>
            <div className="space-y-4 text-gray-400">
              <p>
                The employment verification system creates an unbreakable chain of verified work
                history for workers:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Sign In:</strong> When a worker starts with your company, sign them in
                  with their email and job title. This creates a verified "signed in" record.
                </li>
                <li>
                  <strong>Sign Out:</strong> When they leave, sign them out. This marks the
                  employment as "past" and shows the duration.
                </li>
                <li>
                  <strong>Benefits:</strong> Workers build a verified employment history. Future
                  employers can see real, verified work records instead of unverified CVs.
                </li>
                <li>
                  <strong>Your Benefit:</strong> Leave reviews to earn points. More points =
                  permanent discounts on contact purchases!
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Sign In Worker Modal */}
      {showSignIn && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6">
          <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full border border-gray-700">
            <h3 className="text-2xl font-bold mb-6">Sign In Worker</h3>

            <form onSubmit={handleSignInWorker} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Worker Email</label>
                <input
                  type="email"
                  required
                  value={signInData.workerEmail}
                  onChange={(e) =>
                    setSignInData({ ...signInData, workerEmail: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
                  placeholder="worker@example.com"
                />
                <div className="text-xs text-gray-500 mt-1">
                  The worker must be registered on SkillSync
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Job Title</label>
                <input
                  type="text"
                  required
                  value={signInData.jobTitle}
                  onChange={(e) =>
                    setSignInData({ ...signInData, jobTitle: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
                  placeholder="e.g., Pizza Chef, Carpenter"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={signInData.description}
                  onChange={(e) =>
                    setSignInData({ ...signInData, description: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
                  rows={3}
                  placeholder="Brief description of the role..."
                />
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  type="submit"
                  disabled={signInLoading}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition disabled:opacity-50"
                >
                  {signInLoading ? 'Signing In...' : 'Sign In Worker'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSignIn(false)}
                  className="flex-1 py-3 bg-gray-600 rounded-lg hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Leave Review Modal */}
      {showReview && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6 overflow-y-auto">
          <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full border border-gray-700 my-8">
            <h3 className="text-2xl font-bold mb-6">Leave Review</h3>

            <form onSubmit={handleLeaveReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Worker Email</label>
                <input
                  type="email"
                  required
                  value={reviewData.workerEmail}
                  onChange={(e) =>
                    setReviewData({ ...reviewData, workerEmail: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
                  placeholder="worker@example.com"
                />
                <div className="text-xs text-gray-500 mt-1">
                  You must have purchased their contact info
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Overall Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewData({ ...reviewData, rating: star })}
                      className="text-3xl focus:outline-none"
                    >
                      {star <= reviewData.rating ? '★' : '☆'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Work Quality</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={reviewData.workQuality}
                  onChange={(e) =>
                    setReviewData({
                      ...reviewData,
                      workQuality: parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                />
                <div className="text-sm text-gray-400 text-center">
                  {reviewData.workQuality}/5
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Reliability</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={reviewData.reliability}
                  onChange={(e) =>
                    setReviewData({
                      ...reviewData,
                      reliability: parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                />
                <div className="text-sm text-gray-400 text-center">
                  {reviewData.reliability}/5
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Communication</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={reviewData.communication}
                  onChange={(e) =>
                    setReviewData({
                      ...reviewData,
                      communication: parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                />
                <div className="text-sm text-gray-400 text-center">
                  {reviewData.communication}/5
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Comment (Optional)
                </label>
                <textarea
                  value={reviewData.comment}
                  onChange={(e) =>
                    setReviewData({ ...reviewData, comment: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
                  rows={4}
                  placeholder="Share your experience working with this person..."
                />
              </div>

              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                <div className="text-sm text-gray-300">
                  By leaving this review, you'll earn <strong>10 points</strong> which will
                  permanently reduce your contact purchase costs!
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  type="submit"
                  disabled={reviewLoading}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition disabled:opacity-50"
                >
                  {reviewLoading ? 'Submitting...' : 'Submit Review'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowReview(false)}
                  className="flex-1 py-3 bg-gray-600 rounded-lg hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
