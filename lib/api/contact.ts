import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ============================================
// TYPES
// ============================================

export interface ContactFormData {
  fullName: string;
  email: string;
  phoneNumber?: string;
  website?: string;
  message: string;
}

export interface ContactMessage {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  website: string | null;
  message: string;
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'ARCHIVED';
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  count?: number;
}

// ============================================
// PUBLIC API - Submit Contact Form
// ============================================

export const sendContactMessage = async (data: ContactFormData): Promise<ApiResponse<ContactMessage>> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/contact`, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to send message');
    }
    throw new Error('An unexpected error occurred');
  }
};

// ============================================
// ADMIN API - Manage Contact Messages
// ============================================

// Get all contact messages (Admin)
export const getAllContacts = async (): Promise<ApiResponse<ContactMessage[]>> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/contact`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch contacts');
    }
    throw new Error('An unexpected error occurred');
  }
};

// Get single contact message by ID (Admin)
export const getContactById = async (id: number): Promise<ApiResponse<ContactMessage>> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/contact/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch contact');
    }
    throw new Error('An unexpected error occurred');
  }
};

// Update contact status (Admin)
export const updateContactStatus = async (
  id: number,
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'ARCHIVED'
): Promise<ApiResponse<ContactMessage>> => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/api/contact/${id}/status`, { status });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to update status');
    }
    throw new Error('An unexpected error occurred');
  }
};

// Delete contact message (Admin)
export const deleteContact = async (id: number): Promise<ApiResponse> => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/api/contact/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to delete contact');
    }
    throw new Error('An unexpected error occurred');
  }
};