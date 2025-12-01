'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  type: 'individual' | 'business';
  status: string;
  folderId?: string;
  folderUrl?: string;
}

interface RequiredDocument {
  id: string;
  name: string;
  description: string;
  category: string;
  required: boolean;
  received: boolean;
  receivedDate?: string;
  notes?: string;
}

interface EmailTemplate {
  subject: string;
  body: string;
}

type TabType = 'new-client' | 'parse-data' | 'generate-email' | 'checklist';

export default function OnboardingPage() {
  const [activeTab, setActiveTab] = useState<TabType>('new-client');

  // New Client Form State
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientType, setClientType] = useState<'individual' | 'business'>('individual');
  const [createFolder, setCreateFolder] = useState(true);
  const [shareWithClient, setShareWithClient] = useState(false);

  // Current Client State
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [documents, setDocuments] = useState<RequiredDocument[]>([]);
  const [pendingDocuments, setPendingDocuments] = useState<RequiredDocument[]>([]);
  const [receivedDocuments, setReceivedDocuments] = useState<RequiredDocument[]>([]);

  // Parse Data State
  const [pastedData, setPastedData] = useState('');
  const [parsedSummary, setParsedSummary] = useState('');
  const [followUpNeeds, setFollowUpNeeds] = useState<string[]>([]);

  // Email State
  const [emailType, setEmailType] = useState('welcome');
  const [generatedEmail, setGeneratedEmail] = useState<EmailTemplate | null>(null);
  const [daysSinceContact, setDaysSinceContact] = useState(7);
  const [companyName, setCompanyName] = useState('');
  const [senderName, setSenderName] = useState('');

  // UI State
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/onboarding/create-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: clientName,
          email: clientEmail,
          phone: clientPhone,
          company: clientCompany,
          type: clientType,
          createFolder,
          shareWithClient,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCurrentClient(data.client);
        setDocuments(data.checklist.documents);
        setPendingDocuments(data.checklist.documents.filter((d: RequiredDocument) => !d.received));
        setReceivedDocuments(data.checklist.documents.filter((d: RequiredDocument) => d.received));
        showMessage('success', `Client "${clientName}" created successfully!`);

        // Reset form
        setClientName('');
        setClientEmail('');
        setClientPhone('');
        setClientCompany('');

        // Switch to checklist tab
        setActiveTab('checklist');
      } else {
        showMessage('error', data.error || 'Failed to create client');
      }
    } catch (error: any) {
      showMessage('error', error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleParseData = async () => {
    if (!pastedData.trim()) {
      showMessage('error', 'Please paste some data to analyze');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/onboarding/parse-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: pastedData,
          clientType: currentClient?.type || clientType,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setParsedSummary(data.summary);
        setFollowUpNeeds(data.followUpNeeds);
        setPendingDocuments(data.documents.pending);
        setReceivedDocuments(data.documents.received);

        // Update client info if parsed
        if (data.parsed.client) {
          if (data.parsed.client.name && !currentClient?.name) {
            setClientName(data.parsed.client.name);
          }
          if (data.parsed.client.email && !currentClient?.email) {
            setClientEmail(data.parsed.client.email);
          }
          if (data.parsed.client.phone) {
            setClientPhone(data.parsed.client.phone);
          }
          if (data.parsed.client.company) {
            setClientCompany(data.parsed.client.company);
            setClientType('business');
          }
        }

        showMessage('success', 'Data parsed successfully!');
      } else {
        showMessage('error', data.error || 'Failed to parse data');
      }
    } catch (error: any) {
      showMessage('error', error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateEmail = async () => {
    if (!currentClient && !clientEmail) {
      showMessage('error', 'Please create a client or enter client email first');
      return;
    }

    setLoading(true);
    try {
      const client = currentClient || {
        id: 'temp',
        name: clientName || 'Client',
        email: clientEmail,
        type: clientType,
        status: 'new',
      };

      const response = await fetch('/api/onboarding/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: emailType,
          client,
          pendingDocuments,
          receivedDocuments,
          folderUrl: currentClient?.folderUrl,
          daysSinceLastContact: daysSinceContact,
          companyName: companyName || undefined,
          senderName: senderName || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedEmail(data.email);
        showMessage('success', 'Email generated!');
      } else {
        showMessage('error', data.error || 'Failed to generate email');
      }
    } catch (error: any) {
      showMessage('error', error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDocument = async (docId: string, received: boolean) => {
    try {
      const response = await fetch('/api/onboarding/update-documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientType: currentClient?.type || clientType,
          currentDocuments: documents,
          updates: [{ documentId: docId, received, receivedDate: received ? new Date().toISOString() : null }],
        }),
      });

      const data = await response.json();

      if (data.success) {
        setDocuments(data.documents);
        setPendingDocuments(data.pendingDocs);
        setReceivedDocuments(data.receivedDocs);
      }
    } catch (error) {
      console.error('Error updating document:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showMessage('success', 'Copied to clipboard!');
  };

  const TabButton = ({ tab, label }: { tab: TabType; label: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-6 py-3 text-sm font-medium rounded-lg transition-all ${
        activeTab === tab
          ? 'bg-purple-600 text-white'
          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors">
              ← Back
            </Link>
            <h1 className="text-2xl font-bold gradient-text">Client Onboarding</h1>
          </div>
          {currentClient && (
            <div className="text-sm text-gray-400">
              Current: <span className="text-white font-medium">{currentClient.name}</span>
              {currentClient.folderUrl && (
                <a
                  href={currentClient.folderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-3 text-purple-400 hover:text-purple-300"
                >
                  View Folder →
                </a>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Message Toast */}
      {message && (
        <div
          className={`fixed top-20 right-6 z-50 px-6 py-3 rounded-lg shadow-lg ${
            message.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-3 mb-8 flex-wrap">
          <TabButton tab="new-client" label="New Client" />
          <TabButton tab="parse-data" label="Parse Data" />
          <TabButton tab="generate-email" label="Generate Email" />
          <TabButton tab="checklist" label="Document Checklist" />
        </div>

        {/* Tab Content */}
        <div className="bg-gray-900 rounded-xl p-8 border border-gray-800">
          {/* New Client Tab */}
          {activeTab === 'new-client' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Create New Client</h2>
              <form onSubmit={handleCreateClient} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Client Name *
                    </label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="John Smith"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={clientCompany}
                      onChange={(e) => setClientCompany(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Acme Inc."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Client Type
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="clientType"
                        value="individual"
                        checked={clientType === 'individual'}
                        onChange={() => setClientType('individual')}
                        className="text-purple-500"
                      />
                      <span>Individual</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="clientType"
                        value="business"
                        checked={clientType === 'business'}
                        onChange={() => setClientType('business')}
                        className="text-purple-500"
                      />
                      <span>Business</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={createFolder}
                      onChange={(e) => setCreateFolder(e.target.checked)}
                      className="w-5 h-5 rounded text-purple-500"
                    />
                    <span>Create Google Drive folder structure</span>
                  </label>
                  {createFolder && (
                    <label className="flex items-center gap-3 cursor-pointer ml-8">
                      <input
                        type="checkbox"
                        checked={shareWithClient}
                        onChange={(e) => setShareWithClient(e.target.checked)}
                        className="w-5 h-5 rounded text-purple-500"
                      />
                      <span>Share folder with client</span>
                    </label>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
                >
                  {loading ? 'Creating...' : 'Create Client'}
                </button>
              </form>
            </div>
          )}

          {/* Parse Data Tab */}
          {activeTab === 'parse-data' && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Parse Client Data</h2>
              <p className="text-gray-400 mb-6">
                Paste emails, notes, or any text containing client information. We&apos;ll extract
                relevant data and identify which documents have been received or are still pending.
              </p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Paste Data Here
                  </label>
                  <textarea
                    value={pastedData}
                    onChange={(e) => setPastedData(e.target.value)}
                    rows={12}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                    placeholder={`Example:
Client: John Smith
Email: john@example.com

Documents received:
- Passport (received)
- Proof of address - utility bill submitted
- Bank statements - still waiting

Sent initial email on 11/15/2024...`}
                  />
                </div>

                <button
                  onClick={handleParseData}
                  disabled={loading || !pastedData.trim()}
                  className="px-8 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
                >
                  {loading ? 'Analyzing...' : 'Analyze Data'}
                </button>

                {parsedSummary && (
                  <div className="mt-8 p-6 bg-gray-800 rounded-lg border border-gray-700">
                    <h3 className="text-lg font-semibold mb-4">Analysis Results</h3>
                    <div className="prose prose-invert prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap text-gray-300">{parsedSummary}</pre>
                    </div>
                    {followUpNeeds.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <h4 className="font-medium text-yellow-400 mb-2">Follow-up Needed:</h4>
                        <ul className="list-disc list-inside text-gray-300">
                          {followUpNeeds.map((need, i) => (
                            <li key={i}>{need}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Generate Email Tab */}
          {activeTab === 'generate-email' && (
            <div>
              <h2 className="text-xl font-semibold mb-6">Generate Email</h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Type
                    </label>
                    <select
                      value={emailType}
                      onChange={(e) => setEmailType(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="welcome">Welcome / Initial Request</option>
                      <option value="followup">Follow Up</option>
                      <option value="thankyou">Thank You (Documents Received)</option>
                      <option value="completion">Onboarding Complete</option>
                      <option value="document_request">Specific Document Request</option>
                    </select>
                  </div>

                  {emailType === 'followup' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Days Since Last Contact
                      </label>
                      <input
                        type="number"
                        value={daysSinceContact}
                        onChange={(e) => setDaysSinceContact(parseInt(e.target.value) || 0)}
                        min={1}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Affects tone: 1-14 days = gentle, 15-30 = firm, 30+ = urgent
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Company Name (optional)
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="Your Company Name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Sender Name (optional)
                    </label>
                    <input
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="Your Name"
                    />
                  </div>

                  <button
                    onClick={handleGenerateEmail}
                    disabled={loading}
                    className="px-8 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
                  >
                    {loading ? 'Generating...' : 'Generate Email'}
                  </button>
                </div>

                <div>
                  {generatedEmail ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Generated Email</h3>
                        <button
                          onClick={() =>
                            copyToClipboard(`Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`)
                          }
                          className="text-sm text-purple-400 hover:text-purple-300"
                        >
                          Copy All
                        </button>
                      </div>

                      <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-400">Subject:</span>
                          <button
                            onClick={() => copyToClipboard(generatedEmail.subject)}
                            className="text-xs text-purple-400 hover:text-purple-300"
                          >
                            Copy
                          </button>
                        </div>
                        <p className="font-medium">{generatedEmail.subject}</p>
                      </div>

                      <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-400">Body:</span>
                          <button
                            onClick={() => copyToClipboard(generatedEmail.body)}
                            className="text-xs text-purple-400 hover:text-purple-300"
                          >
                            Copy
                          </button>
                        </div>
                        <pre className="whitespace-pre-wrap text-sm text-gray-300 font-sans">
                          {generatedEmail.body}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <p>Generated email will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Checklist Tab */}
          {activeTab === 'checklist' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Document Checklist</h2>
                {documents.length > 0 && (
                  <div className="text-sm text-gray-400">
                    Progress:{' '}
                    <span className="text-white font-medium">
                      {receivedDocuments.length} / {documents.length}
                    </span>
                    <span className="ml-2 text-purple-400">
                      (
                      {Math.round(
                        (receivedDocuments.length / documents.length) * 100
                      )}
                      %)
                    </span>
                  </div>
                )}
              </div>

              {documents.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="mb-4">No documents loaded yet.</p>
                  <p className="text-sm">
                    Create a new client or parse existing data to see the document checklist.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Progress Bar */}
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-600 transition-all duration-300"
                      style={{
                        width: `${(receivedDocuments.length / documents.length) * 100}%`,
                      }}
                    />
                  </div>

                  {/* Required Documents */}
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                      Required Documents
                    </h3>
                    <div className="space-y-2">
                      {documents
                        .filter((d) => d.required)
                        .map((doc) => (
                          <div
                            key={doc.id}
                            className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                              doc.received
                                ? 'bg-green-900/20 border-green-800'
                                : 'bg-gray-800 border-gray-700'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={doc.received}
                              onChange={(e) =>
                                handleToggleDocument(doc.id, e.target.checked)
                              }
                              className="w-5 h-5 rounded text-purple-500"
                            />
                            <div className="flex-1">
                              <p className="font-medium">{doc.name}</p>
                              <p className="text-sm text-gray-400">
                                {doc.description}
                              </p>
                            </div>
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                doc.received
                                  ? 'bg-green-600 text-white'
                                  : 'bg-yellow-600 text-white'
                              }`}
                            >
                              {doc.received ? 'Received' : 'Pending'}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Optional Documents */}
                  <div className="mt-8">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                      Optional Documents
                    </h3>
                    <div className="space-y-2">
                      {documents
                        .filter((d) => !d.required)
                        .map((doc) => (
                          <div
                            key={doc.id}
                            className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                              doc.received
                                ? 'bg-green-900/20 border-green-800'
                                : 'bg-gray-800 border-gray-700'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={doc.received}
                              onChange={(e) =>
                                handleToggleDocument(doc.id, e.target.checked)
                              }
                              className="w-5 h-5 rounded text-purple-500"
                            />
                            <div className="flex-1">
                              <p className="font-medium">{doc.name}</p>
                              <p className="text-sm text-gray-400">
                                {doc.description}
                              </p>
                            </div>
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                doc.received
                                  ? 'bg-green-600 text-white'
                                  : 'bg-gray-600 text-gray-300'
                              }`}
                            >
                              {doc.received ? 'Received' : 'Optional'}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
