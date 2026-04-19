import { apiClient } from './client';
import type { Room, Participant } from '../../types/room';

export const roomApi = {
  create: async (data: { 
    topic: string, 
    openingDuration?: number, 
    rebuttalDuration?: number, 
    closingDuration?: number 
  }): Promise<Room> => {
    const response = await apiClient.post('/rooms', data);
    return response.data.data;
  },

  list: async (): Promise<Room[]> => {
    const response = await apiClient.get('/rooms');
    return response.data.data;
  },

  getById: async (id: string): Promise<Room> => {
    const response = await apiClient.get(`/rooms/${id}`);
    return response.data.data;
  },

  getParticipants: async (roomId: string): Promise<Participant[]> => {
    const response = await apiClient.get(`/rooms/${roomId}/participants`);
    return response.data.data;
  },

  join: async (roomId: string, side: string): Promise<Participant> => {
    const response = await apiClient.post(`/rooms/${roomId}/join`, { side });
    return response.data.data;
  },

  assignRole: async (roomId: string, data: { userId: string, role: string, side: string }): Promise<Participant> => {
    const response = await apiClient.post(`/rooms/${roomId}/assign-role`, data);
    return response.data.data;
  },

  getLeaderboard: async (limit: number = 10): Promise<unknown[]> => {
    const response = await apiClient.get(`/rooms/leaderboard?limit=${limit}`);
    return response.data.data;
  },

  getMyStats: async (): Promise<unknown> => {
    const response = await apiClient.get('/rooms/stats/me');
    return response.data.data;
  }
};
