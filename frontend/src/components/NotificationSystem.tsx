import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { X, CheckCircle, AlertCircle, Info, WifiOff, Loader2 } from 'lucide-react';
import { cn } from '../utils/cn';

export const NotificationSystem: React.FC = () => {
  const { notifications, removeNotification, socketStatus } = useAppStore();

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 w-80 pointer-events-none">
      {/* Network Status Banner */}
      {(socketStatus === 'DISCONNECTED' || socketStatus === 'ERROR' || socketStatus === 'CONNECTING') && (
        <div className={cn(
          "pointer-events-auto p-4 rounded-2xl border shadow-2xl flex items-center gap-4 animate-in slide-in-from-right-full duration-500",
          socketStatus === 'ERROR' || socketStatus === 'DISCONNECTED' ? 'bg-red-950 border-red-500/50 text-red-500' : 'bg-slate-900 border-blue-500/50 text-blue-500'
        )}>
          {socketStatus === 'CONNECTING' ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <WifiOff className="w-5 h-5" />
          )}
          <div className="flex-1">
            <p className="text-xs font-black uppercase tracking-widest">
              {socketStatus === 'CONNECTING' ? 'Reconnecting...' : 'Network Offline'}
            </p>
            <p className="text-[10px] opacity-80 italic">
              {socketStatus === 'CONNECTING' ? 'Attempting to restore session' : 'Real-time features paused'}
            </p>
          </div>
        </div>
      )}

      {/* Global Notifications */}
      {notifications.map((n) => (
        <div 
          key={n.id}
          className={cn(
            "pointer-events-auto p-4 rounded-2xl border shadow-2xl flex items-start gap-3 animate-in slide-in-from-right-full duration-300",
            n.type === 'success' && "bg-slate-900 border-green-500/50 text-green-500",
            n.type === 'error' && "bg-slate-900 border-red-500/50 text-red-500",
            n.type === 'info' && "bg-slate-900 border-blue-500/50 text-blue-500"
          )}
        >
          {n.type === 'success' && <CheckCircle className="w-5 h-5 mt-0.5" />}
          {n.type === 'error' && <AlertCircle className="w-5 h-5 mt-0.5" />}
          {n.type === 'info' && <Info className="w-5 h-5 mt-0.5" />}
          
          <div className="flex-1">
             <p className="text-sm font-medium text-slate-200">{n.message}</p>
          </div>
          
          <button 
            onClick={() => removeNotification(n.id)}
            className="text-slate-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
