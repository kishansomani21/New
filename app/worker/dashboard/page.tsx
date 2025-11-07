'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface WorkerProfile {
  id: string;
  bio?: string;
  location?: string;
  hourlyRate?: number;
  available: boolean;
  profileViews: number;
  contactPurchases: number;
  averageRating: number;
}

interface Skill {
  id: string;
  name: string;
  category: string;
}

interface WorkerSkill {
  id: string;
  skill: Skill;
  yearsExperience: number;
  verified: boolean;
}

interface Employment {
  id: string;
  jobTitle: string;
  status: 'CURRENT' | 'PAST';
  signedInAt: string;
  signedOutAt?: string;
  company: {
    companyName: string;
  } | null;
}

interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  company: {
    companyName: string;
  } | null;
}

export default function WorkerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<WorkerProfile | null>(null);
  const [skills, setSkills] = useState<WorkerSkill[]>([]);
  const [employmentHistory, setEmploymentHistory] = useState<Employment[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    bio: '',
    location: '',
    hourlyRate: '',
    available: true,
  });

  // Add skill modal
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [newSkill, setNewSkill] = useState({
    skillName: '',
    category: '',
    yearsExperience: 0,
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/auth/login');
      return;
    }

    const userData = JSON.parse(storedUser);
    if (userData.userType !== 'WORKER') {
      router.push('/company/dashboard');
      return;
    }

    setUser(userData);
    fetchProfile(userData.id);
  }, [router]);

  const fetchProfile = async (userId: string) => {
    try {
      const response = await fetch('/api/worker/profile', {
        headers: {
          'x-user-id': userId,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfile(data.profile);
      setSkills(data.skills);
      setEmploymentHistory(data.employmentHistory);
      setReviews(data.reviews);

      setEditData({
        bio: data.profile.bio || '',
        location: data.profile.location || '',
        hourlyRate: data.profile.hourlyRate?.toString() || '',
        available: data.profile.available,
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const response = await fetch('/api/worker/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify(editData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      setProfile(data.profile);
      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  const handleAddSkill = async () => {
    try {
      const response = await fetch('/api/worker/skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify(newSkill),
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || 'Failed to add skill');
        return;
      }

      const data = await response.json();
      setSkills([...skills, data.workerSkill]);
      setShowAddSkill(false);
      setNewSkill({ skillName: '', category: '', yearsExperience: 0 });
    } catch (error) {
      console.error('Error adding skill:', error);
      alert('Failed to add skill');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold gradient-text">
            SkillSync
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-gray-400">Welcome, {user?.name}!</span>
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
        <div className="max-w-6xl mx-auto">
          {/* Header Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div className="text-3xl font-bold text-purple-500">
                {profile?.profileViews || 0}
              </div>
              <div className="text-gray-400 mt-1">Profile Views</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div className="text-3xl font-bold text-indigo-500">
                {profile?.contactPurchases || 0}
              </div>
              <div className="text-gray-400 mt-1">Contact Purchases</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div className="text-3xl font-bold text-green-500">
                {profile?.averageRating.toFixed(1) || '0.0'}
              </div>
              <div className="text-gray-400 mt-1">Average Rating</div>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <div className="text-3xl font-bold text-orange-500">{skills.length}</div>
              <div className="text-gray-400 mt-1">Skills</div>
            </div>
          </div>

          {/* Profile Section */}
          <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700 mb-8">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold">Your Profile</h2>
              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdateProfile}
                    className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700 transition"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditMode(false)}
                    className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-700 transition"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {editMode ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Bio</label>
                  <textarea
                    value={editData.bio}
                    onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 transition"
                    rows={4}
                    placeholder="Tell companies about yourself..."
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Location</label>
                    <input
                      type="text"
                      value={editData.location}
                      onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 transition"
                      placeholder="City, Country"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Hourly Rate ($)
                    </label>
                    <input
                      type="number"
                      value={editData.hourlyRate}
                      onChange={(e) => setEditData({ ...editData, hourlyRate: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 transition"
                      placeholder="25.00"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editData.available}
                    onChange={(e) => setEditData({ ...editData, available: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label>Available for work</label>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Bio</div>
                  <div className="text-gray-200">
                    {profile?.bio || 'No bio added yet'}
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Location</div>
                    <div className="text-gray-200">
                      {profile?.location || 'Not specified'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Hourly Rate</div>
                    <div className="text-gray-200">
                      {profile?.hourlyRate ? `$${profile.hourlyRate}/hr` : 'Not specified'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Status</div>
                    <div className={profile?.available ? 'text-green-500' : 'text-red-500'}>
                      {profile?.available ? 'Available' : 'Not Available'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Skills Section */}
          <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700 mb-8">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold">Skills</h2>
              <button
                onClick={() => setShowAddSkill(true)}
                className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition"
              >
                + Add Skill
              </button>
            </div>

            {skills.length === 0 ? (
              <p className="text-gray-400">No skills added yet. Add your first skill!</p>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {skills.map((ws) => (
                  <div
                    key={ws.id}
                    className="bg-gray-900/50 rounded-lg p-4 border border-gray-700"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{ws.skill.name}</h3>
                      {ws.verified && (
                        <span className="text-green-500 text-xs">✓ Verified</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-400">
                      {ws.skill.category}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      {ws.yearsExperience} years experience
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Employment History */}
          <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700 mb-8">
            <h2 className="text-2xl font-bold mb-6">Employment History</h2>

            {employmentHistory.length === 0 ? (
              <p className="text-gray-400">
                No employment history yet. Ask your employer to sign you in!
              </p>
            ) : (
              <div className="space-y-4">
                {employmentHistory.map((emp) => (
                  <div
                    key={emp.id}
                    className="bg-gray-900/50 rounded-lg p-4 border border-gray-700"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{emp.jobTitle}</h3>
                        <div className="text-gray-400">
                          {emp.company?.companyName || 'Unknown Company'}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {new Date(emp.signedInAt).toLocaleDateString()} -{' '}
                          {emp.signedOutAt
                            ? new Date(emp.signedOutAt).toLocaleDateString()
                            : 'Present'}
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs ${
                          emp.status === 'CURRENT'
                            ? 'bg-green-500/20 text-green-500'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {emp.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reviews */}
          <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700">
            <h2 className="text-2xl font-bold mb-6">Reviews</h2>

            {reviews.length === 0 ? (
              <p className="text-gray-400">No reviews yet.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-gray-900/50 rounded-lg p-4 border border-gray-700"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-semibold">
                          {review.company?.companyName || 'Unknown Company'}
                        </div>
                        <div className="text-yellow-500">
                          {'★'.repeat(review.rating)}
                          {'☆'.repeat(5 - review.rating)}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-gray-400 text-sm mt-2">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Skill Modal */}
      {showAddSkill && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6">
          <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full border border-gray-700">
            <h3 className="text-2xl font-bold mb-4">Add New Skill</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Skill Name</label>
                <input
                  type="text"
                  value={newSkill.skillName}
                  onChange={(e) => setNewSkill({ ...newSkill, skillName: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
                  placeholder="e.g., Carpentry, Pizza Making"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={newSkill.category}
                  onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
                >
                  <option value="">Select category</option>
                  <option value="Construction">Construction</option>
                  <option value="Food Service">Food Service</option>
                  <option value="Technology">Technology</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Retail">Retail</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Years of Experience</label>
                <input
                  type="number"
                  min="0"
                  value={newSkill.yearsExperience}
                  onChange={(e) =>
                    setNewSkill({ ...newSkill, yearsExperience: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={handleAddSkill}
                  className="flex-1 py-3 bg-purple-600 rounded-lg hover:bg-purple-700 transition"
                >
                  Add Skill
                </button>
                <button
                  onClick={() => setShowAddSkill(false)}
                  className="flex-1 py-3 bg-gray-600 rounded-lg hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
