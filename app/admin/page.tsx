'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import Card from '@/components/Card';
import NotificationBell from '@/components/NotificationBell';
import { InfoRequest, User, UploadedFile } from '@/lib/types';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<InfoRequest[]>([]);
  const [clients, setClients] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<InfoRequest | null>(null);
  const [requestFiles, setRequestFiles] = useState<UploadedFile[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Form state
  const [selectedClientId, setSelectedClientId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'admin') {
      router.push('/client');
      return;
    }

    setUser(parsedUser);
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const [requestsRes, clientsRes] = await Promise.all([
        fetch('/api/requests'),
        fetch('/api/clients'),
      ]);

      const requestsData = await requestsRes.json();
      if (requestsData.success) {
        setRequests(requestsData.requests);
      }

      const clientsData = await clientsRes.json();
      if (clientsData.success) {
        setClients(clientsData.clients);
      }

    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: selectedClientId,
          title,
          description,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setRequests([...requests, data.request]);
        setShowCreateModal(false);
        setSelectedClientId('');
        setTitle('');
        setDescription('');
      }
    } catch (error) {
      console.error('Failed to create request:', error);
    }
  };

  const viewRequestDetails = async (request: InfoRequest) => {
    setSelectedRequest(request);
    try {
      const response = await fetch(`/api/requests/${request.id}`);
      const data = await response.json();
      if (data.success) {
        setRequestFiles(data.files);
      }
    } catch (error) {
      console.error('Failed to fetch request details:', error);
    }
  };

  const handleViewNotifications = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/notifications?userId=${user.id}`);
      const data = await response.json();
      if (data.success) {
        setNotifications(data.notifications);
        setShowNotifications(true);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ClientHub Admin</h1>
              <p className="text-sm text-gray-600">Welcome back, {user?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationBell userId={user?.id || ''} onViewNotifications={handleViewNotifications} />
              <Button onClick={handleLogout} variant="secondary" size="sm">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="text-3xl font-bold text-blue-600">{requests.length}</div>
            <div className="text-sm text-gray-600">Total Requests</div>
          </Card>
          <Card>
            <div className="text-3xl font-bold text-yellow-600">
              {requests.filter(r => r.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </Card>
          <Card>
            <div className="text-3xl font-bold text-green-600">
              {requests.filter(r => r.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </Card>
        </div>

        {/* Actions */}
        <div className="mb-6">
          <Button onClick={() => setShowCreateModal(true)}>
            + Create New Request
          </Button>
        </div>

        {/* Requests List */}
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">All Requests</h2>
          {requests.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              No requests yet. Create your first request to get started!
            </p>
          ) : (
            <div className="space-y-3">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition"
                  onClick={() => viewRequestDetails(request)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{request.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{request.clientName}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Created {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>

      {/* Create Request Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-lg w-full">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Create New Request</h2>
            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Client
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose a client...</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name} ({client.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Request Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Tax Documents 2024"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Please provide..."
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <Button type="submit" fullWidth>
                  Create Request
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  variant="secondary"
                  fullWidth
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Request Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">{selectedRequest.title}</h2>
                <p className="text-sm text-gray-600 mt-1">{selectedRequest.clientName}</p>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedRequest.status)}`}>
                  {selectedRequest.status}
                </span>
              </div>
              {selectedRequest.description && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600">{selectedRequest.description}</p>
                </div>
              )}
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Uploaded Files ({requestFiles.length})</h3>
                {requestFiles.length === 0 ? (
                  <p className="text-gray-600 text-sm">No files uploaded yet.</p>
                ) : (
                  <div className="space-y-2">
                    {requestFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                          </svg>
                          <div>
                            <p className="font-medium text-gray-900">{file.originalName}</p>
                            <p className="text-xs text-gray-500">
                              {(file.fileSize / 1024).toFixed(2)} KB • {new Date(file.uploadedAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <a
                          href={`/api/files/${file.id}`}
                          download
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                          Download
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Notifications Modal */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-semibold text-gray-900">Notifications</h2>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3">
              {notifications.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No notifications</p>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 rounded-lg border ${notif.read ? 'bg-white' : 'bg-blue-50 border-blue-200'}`}
                  >
                    <h3 className="font-medium text-gray-900">{notif.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(notif.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
