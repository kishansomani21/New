'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import Card from '@/components/Card';
import FileUpload from '@/components/FileUpload';
import NotificationBell from '@/components/NotificationBell';
import { InfoRequest, User, UploadedFile } from '@/lib/types';

export default function ClientPortal() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<InfoRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<InfoRequest | null>(null);
  const [requestFiles, setRequestFiles] = useState<UploadedFile[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'client') {
      router.push('/admin');
      return;
    }

    setUser(parsedUser);
    fetchRequests(parsedUser.id);
  }, [router]);

  const fetchRequests = async (clientId: string) => {
    try {
      const response = await fetch(`/api/requests?clientId=${clientId}`);
      const data = await response.json();

      if (data.success) {
        setRequests(data.requests);
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
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

  const handleUploadSuccess = async () => {
    if (selectedRequest && user) {
      // Refresh request details
      const response = await fetch(`/api/requests/${selectedRequest.id}`);
      const data = await response.json();
      if (data.success) {
        setRequestFiles(data.files);
      }
      // Refresh requests list
      fetchRequests(user.id);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'in_progress':
        return '📤';
      case 'completed':
        return '✅';
      default:
        return '📋';
    }
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
              <h1 className="text-2xl font-bold text-gray-900">ClientHub Portal</h1>
              <p className="text-sm text-gray-600">Welcome, {user?.name}</p>
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
            <div className="text-sm text-gray-600">Awaiting Upload</div>
          </Card>
          <Card>
            <div className="text-3xl font-bold text-green-600">
              {requests.filter(r => r.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </Card>
        </div>

        {/* Requests List */}
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Requests</h2>
          {requests.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-gray-600">No requests yet. You'll see them here when created.</p>
            </div>
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
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-2xl">{getStatusIcon(request.status)}</span>
                        <h3 className="font-semibold text-gray-900">{request.title}</h3>
                      </div>
                      {request.description && (
                        <p className="text-sm text-gray-600 mb-2">{request.description}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        Created {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(request.status)}`}>
                      {request.status === 'in_progress' ? 'In Progress' : request.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>

      {/* Request Details Modal */}
      {selectedRequest && user && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">{selectedRequest.title}</h2>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedRequest.status)}`}>
                  {selectedRequest.status === 'in_progress' ? 'In Progress' : selectedRequest.status}
                </span>
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

            <div className="space-y-6">
              {selectedRequest.description && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600">{selectedRequest.description}</p>
                </div>
              )}

              <div>
                <h3 className="font-medium text-gray-900 mb-3">Upload Files</h3>
                <FileUpload
                  requestId={selectedRequest.id}
                  userId={user.id}
                  onUploadSuccess={handleUploadSuccess}
                />
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-3">Your Uploaded Files ({requestFiles.length})</h3>
                {requestFiles.length === 0 ? (
                  <p className="text-gray-600 text-sm">No files uploaded yet.</p>
                ) : (
                  <div className="space-y-2">
                    {requestFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <div>
                            <p className="font-medium text-gray-900">{file.originalName}</p>
                            <p className="text-xs text-gray-500">
                              {(file.fileSize / 1024).toFixed(2)} KB • Uploaded {new Date(file.uploadedAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
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
