import axios from 'axios';
import { ContactFormData, ApiResponse } from './contact';

import { getApiUrl } from "@/lib/apiUrl";

const API_BASE_URL = getApiUrl();

export interface ContentGateFormData {
  firstName: string;
  lastName: string;
  jobTitle: string;
  company: string;
  email: string;
  subscribe: boolean;
}

// Submit content gate form using the existing contact endpoint
export const submitContentGateForm = async (data: ContentGateFormData): Promise<ApiResponse> => {
  try {
    // Map ContentGateFormData to ContactFormData format
    const contactData: ContactFormData = {
      fullName: `${data.firstName} ${data.lastName}`.trim(),
      email: data.email,
      phoneNumber: '', // Not collected in content gate
      website: '', // Not collected in content gate
      message: `Content Gate Registration:
      
Job Title: ${data.jobTitle || 'Not provided'}
Company: ${data.company || 'Not provided'}
Subscribe to Newsletter: ${data.subscribe ? 'Yes' : 'No'}

This submission came from the content gate modal requesting premium content access.`,
    };

    // Use direct axios for public endpoint (no auth needed)
    const response = await axios.post(`${API_BASE_URL}/api/contact`, contactData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to submit content gate form');
    }
    throw new Error('An unexpected error occurred');
  }
};