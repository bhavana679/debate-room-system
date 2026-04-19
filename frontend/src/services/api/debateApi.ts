import { apiClient } from './client';
import type { Room, Argument } from '../../types/room';

export const debateApi = {
  // Backend: POST /api/debate/:id/start
  start: async (roomId: string): Promise<Room> => {
    const response = await apiClient.post(`/debate/${roomId}/start`);
    return response.data.data;
  },

  // Backend: POST /api/debate/:id/next
  nextPhase: async (roomId: string): Promise<Room> => {
    const response = await apiClient.post(`/debate/${roomId}/next`);
    return response.data.data;
  },

  // Backend: GET /api/debate/:id/timer
  getTimer: async (roomId: string): Promise<{ remainingTime: number }> => {
    const response = await apiClient.get(`/debate/${roomId}/timer`);
    return response.data.data;
  },

  // Backend: POST /api/rooms/:id/argument
  submitArgument: async (roomId: string, content: string): Promise<Argument> => {
    const response = await apiClient.post(`/rooms/${roomId}/argument`, { content });
    return response.data.data;
  },

  // Backend: GET /api/rooms/:id/arguments
  getArguments: async (roomId: string): Promise<Argument[]> => {
    const response = await apiClient.get(`/rooms/${roomId}/arguments`);
    return response.data.data;
  }
};

