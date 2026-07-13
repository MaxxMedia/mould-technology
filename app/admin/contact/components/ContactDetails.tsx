'use client';

import { useState } from 'react';
import { ContactMessage } from '@/lib/api/contact';
import DeleteConfirmDialog from './DeleteConfirmDialog';

interface ContactDetailsProps {
  contact: ContactMessage;
  onStatusUpdate: (status: 'RESOLVED' | 'NEW') => void;
  onDelete: () => void;
  onReply?: () => void;
}

export default function ContactDetails({ 
  contact, 
  onStatusUpdate, 
  onDelete,
  onReply 
}: ContactDetailsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const isSolved = contact.status === 'RESOLVED';

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

  const toggleSolved = () => {
    if (isSolved) {
      onStatusUpdate('NEW');
    } else {
      onStatusUpdate('RESOLVED');
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    await onDelete();
    setIsDeleting(false);
    setShowDeleteDialog(false);
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {contact.fullName}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              From: {contact.email}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Solved/Unsolved Toggle Button */}
            <button
              onClick={toggleSolved}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                isSolved
                  ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800'
                  : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:hover:bg-yellow-800'
              }`}
            >
              {isSolved ? '✅ Solved' : '⏳ Mark as Solved'}
            </button>
          </div>
        </div>

        {/* Contact Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Full Name
            </p>
            <p className="text-sm text-gray-900 dark:text-white">
              {contact.fullName}
            </p>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Email
            </p>
            <a 
              href={`mailto:${contact.email}`}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              {contact.email}
            </a>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Phone
            </p>
            <p className="text-sm text-gray-900 dark:text-white">
              {contact.phoneNumber || 'Not provided'}
            </p>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Website
            </p>
            {contact.website ? (
              <a 
                href={contact.website.startsWith('http') ? contact.website : `https://${contact.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                {contact.website}
              </a>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">Not provided</p>
            )}
          </div>
          
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Status
            </p>
            <p className={`text-sm font-medium ${isSolved ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
              {isSolved ? '✅ Solved' : '⏳ Unsolved'}
            </p>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Received
            </p>
            <p className="text-sm text-gray-900 dark:text-white">
              {formatDate(contact.createdAt)}
            </p>
          </div>
        </div>

        {/* Message Content */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Message
          </h3>
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 min-h-[150px]">
            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
              {contact.message}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          {onReply && (
            <button
              onClick={onReply}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Reply via Email
            </button>
          )}
          
          <button
            onClick={handleDeleteClick}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Message
          </button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        contactName={contact.fullName}
        loading={isDeleting}
      />
    </>
  );
}