import { create } from 'zustand';

/**
 * Socket specific status types
 */
export type SocketStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR';

interface AppState {
  // UI Flags
  isSidebarOpen: boolean;
  activeModal: string | null;
  notifications: Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>;
  
  // Socket State (UI only)
  socketStatus: SocketStatus;
  lastSocketError: string | null;

  // Actions
  toggleSidebar: () => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  
  addNotification: (message: string, type: 'success' | 'error' | 'info') => void;
  removeNotification: (id: string) => void;
  
  setSocketStatus: (status: SocketStatus, error?: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Defaults
  isSidebarOpen: false,
  activeModal: null,
  notifications: [],
  socketStatus: 'DISCONNECTED',
  lastSocketError: null,

  // UI Actions
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  openModal: (modalId) => set({ activeModal: modalId }),
  closeModal: () => set({ activeModal: null }),

  addNotification: (message, type) => {
    const id = Math.random().toString(36).substring(7);
    set((state) => ({ 
      notifications: [...state.notifications, { id, message, type }] 
    }));
    // Auto-remove after 5 seconds
    setTimeout(() => {
      set((state) => ({ 
        notifications: state.notifications.filter(n => n.id !== id) 
      }));
    }, 5000);
  },

  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),

  // Socket Actions
  setSocketStatus: (status, error = null) => set({ 
    socketStatus: status, 
    lastSocketError: error 
  }),
}));
