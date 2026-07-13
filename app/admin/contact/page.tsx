'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  getAllContacts, 
  deleteContact,
  ContactMessage 
} from '@/lib/api/contact';
import ContactTable from './components/ContactTable';
// Inlined ContactStats to avoid missing-module build error
function ContactStats({ contacts }: { contacts: any[] }) {
  const total = contacts.length;
  const unsolved = contacts.filter(c => c.status === 'NEW' || c.status === 'IN_PROGRESS').length;
  const solved = contacts.filter(c => c.status === 'RESOLVED').length;
  return (
    <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow">
        <div className="text-sm text-gray-500">Total</div>
        <div className="text-2xl font-bold">{total}</div>
      </div>
      <div className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow">
        <div className="text-sm text-gray-500">Unsolved</div>
        <div className="text-2xl font-bold">{unsolved}</div>
      </div>
      <div className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow">
        <div className="text-sm text-gray-500">Solved</div>
        <div className="text-2xl font-bold">{solved}</div>
      </div>
    </div>
  );
}

export default function AdminContactPage() {
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unsolved' | 'solved'>('all');

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await getAllContacts();
      if (response.success && response.data) {
        setContacts(response.data);
      } else {
        setError('Failed to fetch contacts');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await deleteContact(id);
      if (response.success) {
        setSuccessMessage('Contact deleted successfully');
        setContacts(prev => prev.filter(contact => contact.id !== id));
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete contact');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Filter logic
  const getFilteredContacts = () => {
    if (filter === 'all') return contacts;
    if (filter === 'unsolved') {
      return contacts.filter(c => c.status === 'NEW' || c.status === 'IN_PROGRESS');
    }
    if (filter === 'solved') {
      return contacts.filter(c => c.status === 'RESOLVED');
    }
    return contacts;
  };

  const getCounts = () => {
    const total = contacts.length;
    const unsolved = contacts.filter(c => c.status === 'NEW' || c.status === 'IN_PROGRESS').length;
    const solved = contacts.filter(c => c.status === 'RESOLVED').length;
    return { total, unsolved, solved };
  };

  const counts = getCounts();
  const displayContacts = getFilteredContacts();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Contact Messages
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Manage all contact form submissions
            </p>
          </div>
          <Link
            href="/admin/dashboard"
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            Back to Dashboard
          </Link>
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

      {/* Statistics Cards */}
      <ContactStats contacts={contacts} />

      {/* Filter Buttons */}
      <div className="mb-6 flex gap-2 flex-wrap items-center">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
          }`}
        >
          All ({counts.total})
        </button>
        
        <button
          onClick={() => setFilter('unsolved')}
          className={`px-4 py-2 rounded-lg transition ${
            filter === 'unsolved'
              ? 'bg-yellow-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
          }`}
        >
          ⏳ Unsolved ({counts.unsolved})
        </button>
        
        <button
          onClick={() => setFilter('solved')}
          className={`px-4 py-2 rounded-lg transition ${
            filter === 'solved'
              ? 'bg-green-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
          }`}
        >
          ✅ Solved ({counts.solved})
        </button>

        <button
          onClick={fetchContacts}
          className="ml-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Refresh
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <ContactTable
          contacts={displayContacts}
          onDelete={handleDelete}
          loading={loading}
        />
      </div>
    </div>
  );
}