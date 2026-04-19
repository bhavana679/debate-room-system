import { apiClient } from './client';

export const voteApi = {
  // Backend: POST /api/rooms/:id/vote
  cast: async (roomId: string, candidateId: string): Promise<unknown> => {
    const response = await apiClient.post(`/rooms/${roomId}/vote`, { candidateId });
    return response.data.data;
  },

  // Backend: GET /api/rooms/:id/result
  getResult: async (roomId: string): Promise<unknown> => {
    const response = await apiClient.get(`/rooms/${roomId}/result`);
    return response.data.data;
  }
};
