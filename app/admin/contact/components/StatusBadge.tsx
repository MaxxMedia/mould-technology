'use client';

import { ContactMessage } from '@/lib/api/contact';

interface ContactStatsProps {
  contacts: ContactMessage[];
}

export default function ContactStats({ contacts }: ContactStatsProps) {
  const counts = {
    total: contacts.length,
    NEW: contacts.filter(c => c.status === 'NEW').length,
    RESOLVED: contacts.filter(c => c.status === 'RESOLVED').length,
  };

  const stats = [
    { label: 'Total', value: counts.total, color: 'text-gray-900 dark:text-white' },
    { label: 'New', value: counts.NEW, color: 'text-blue-600 dark:text-blue-400' },
    { label: 'Resolved', value: counts.RESOLVED, color: 'text-green-600 dark:text-green-400' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
          <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
        </div>
      ))}
    </div>
  );
}