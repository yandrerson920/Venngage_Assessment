import axios from 'axios';
import { GenerationRequest, GenerationResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function generateIcons(request: GenerationRequest): Promise<GenerationResponse> {
  try {
    const response = await api.post<GenerationResponse>('/generate-icons', request);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data?.error?.message || 'Failed to generate icons');
    } else if (error.request) {
      throw new Error('No response from server. Please check your connection.');
    } else {
      throw new Error('Failed to make request. Please try again.');
    }
  }
}

export async function healthCheck(): Promise<boolean> {
  try {
    const response = await api.get('/health');
    return response.data.status === 'ok';
  } catch (error) {
    return false;
  }
}

export default api;
