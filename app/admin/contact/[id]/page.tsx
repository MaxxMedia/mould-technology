'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getContactById, updateContactStatus, deleteContact, ContactMessage } from '@/lib/api/contact';

function StatusBadge({ status }: { status: ContactMessage['status'] }) {
  const statusStyles = {
    NEW: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
    RESOLVED: 'bg-green-100 text-green-800',
    ARCHIVED: 'bg-gray-100 text-gray-800',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyles[status]}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.id as string);

  const [contact, setContact] = useState<ContactMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<ContactMessage['status']>('NEW');

  useEffect(() => {
    if (id) {
      fetchContact();
    }
  }, [id]);

  const fetchContact = async () => {
    try {
      setLoading(true);
      const response = await getContactById(id);
      if (response.success && response.data) {
        setContact(response.data);
        setStatus(response.data.status);
      } else {
        setError('Contact not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: ContactMessage['status']) => {
    try {
      const response = await updateContactStatus(id, newStatus);
      if (response.success) {
        setStatus(newStatus);
        setContact(prev => prev ? { ...prev, status: newStatus } : null);
        setSuccessMessage('Status updated successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const response = await deleteContact(id);
      if (response.success) {
        router.push('/admin/contact');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
      setTimeout(() => setError(null), 3000);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading contact details...</p>
        </div>
      </div>
    );
  }

  if (error || !contact) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error || 'Contact not found'}
          </div>
          <Link
            href="/admin/contact"
            className="mt-4 inline-block text-blue-600 hover:text-blue-800"
          >
            ← Back to contacts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/contact"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            ← Back to all messages
          </Link>
          <div className="flex justify-between items-start mt-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Contact Message
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                From: {contact.fullName}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Contact Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {contact.fullName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  <a href={`mailto:${contact.email}`} className="text-blue-600 hover:text-blue-800">
                    {contact.email}
                  </a>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {contact.phoneNumber || 'Not provided'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Website</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {contact.website ? (
                    <a href={contact.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                      {contact.website}
                    </a>
                  ) : 'Not provided'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                <div className="flex items-center gap-3">
                  <StatusBadge status={status} />
                  <select
                    value={status}
                    onChange={(e) => handleStatusUpdate(e.target.value as ContactMessage['status'])}
                    className="text-sm border rounded px-2 py-1 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  >
                    <option value="NEW">New</option>
                    <option value="RESOLVED">Resolved</option>
                  </select>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Received</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {formatDate(contact.createdAt)}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Message</p>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                {contact.message}
              </p>
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
            <Link
              href={`mailto:${contact.email}`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Reply via Email
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}