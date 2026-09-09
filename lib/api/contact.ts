import axios from 'axios';

import { getApiUrl } from "@/lib/apiUrl";

const API_BASE_URL = getApiUrl();

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
  plan?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  count?: number;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token to all requests
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear invalid token
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        // Optional: redirect to login
        // window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// ============================================
// PUBLIC API - Submit Contact Form
// ============================================

export const sendContactMessage = async (data: ContactFormData): Promise<ApiResponse<ContactMessage>> => {
  try {
    // Use direct axios for public endpoint (no auth needed)
    const response = await axios.post(`${API_BASE_URL}/api/contact`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
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
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Authentication required. Please log in.');
    }

    const response = await apiClient.get('/api/contact');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Session expired. Please log in again.');
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch contacts');
    }
    throw new Error('An unexpected error occurred');
  }
};

// Get single contact message by ID (Admin)
export const getContactById = async (id: number): Promise<ApiResponse<ContactMessage>> => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Authentication required. Please log in.');
    }

    const response = await apiClient.get(`/api/contact/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Session expired. Please log in again.');
      }
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
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Authentication required. Please log in.');
    }

    const response = await apiClient.patch(`/api/contact/${id}/status`, { status });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Session expired. Please log in again.');
      }
      throw new Error(error.response?.data?.message || 'Failed to update status');
    }
    throw new Error('An unexpected error occurred');
  }
};

// Delete contact message (Admin)
export const deleteContact = async (id: number): Promise<ApiResponse> => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Authentication required. Please log in.');
    }

    const response = await apiClient.delete(`/api/contact/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Session expired. Please log in again.');
      }
      throw new Error(error.response?.data?.message || 'Failed to delete contact');
    }
    throw new Error('An unexpected error occurred');
  }
};


