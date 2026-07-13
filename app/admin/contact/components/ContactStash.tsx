'use client';

import { ContactMessage } from '@/lib/api/contact';

interface ContactStatsProps {
  contacts: ContactMessage[];
}

export default function ContactStats({ contacts }: ContactStatsProps) {
  const total = contacts.length;
  const unsolved = contacts.filter(c => c.status === 'NEW' || c.status === 'IN_PROGRESS').length;
  const solved = contacts.filter(c => c.status === 'RESOLVED').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{total}</p>
      </div>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">Unsolved</p>
        <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{unsolved}</p>
      </div>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">Solved</p>
        <p className="text-2xl font-bold text-green-600 dark:text-green-400">{solved}</p>
      </div>
    </div>
  );
}