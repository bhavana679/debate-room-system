import { apiClient } from './client';
import type { LoginDTO, RegisterDTO, AuthResponse } from '../../types/auth';

export const authApi = {
  login: async (data: LoginDTO): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', data);
    return response.data.data;
  },
  
  register: async (data: RegisterDTO): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register', data);
    return response.data.data;
  }
};
