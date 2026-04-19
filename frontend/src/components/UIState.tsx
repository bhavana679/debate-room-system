import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../utils/cn';

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, action, className }) => (
  <div className={cn("card-premium border-dashed border-2 border-slate-800/50 flex flex-col items-center justify-center py-16 px-6 text-center animate-in fade-in zoom-in duration-500", className)}>
    <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
      <Icon className="w-8 h-8 text-slate-700" />
    </div>
    <h3 className="text-lg font-bold text-slate-300 mb-2 tracking-tight">{title}</h3>
    <p className="text-sm text-slate-500 max-w-xs mb-8 italic">{description}</p>
    {action}
  </div>
);

export const LoadingSkeleton: React.FC<{ count?: number, height?: string }> = ({ count = 3, height = "h-24" }) => (
  <div className="space-y-4 w-full">
    {Array.from({ length: count }).map((_, i) => (
      <div 
        key={i} 
        className={cn("bg-slate-900 border border-slate-800 rounded-3xl animate-pulse", height)}
        style={{ animationDelay: `${i * 150}ms` }}
       />
    ))}
  </div>
);

export const FullPageLoader: React.FC = () => (
  <div className="theme-app min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
    <div className="relative">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      <div className="absolute inset-0 w-12 h-12 border-4 border-blue-500/10 rounded-full" />
    </div>
    <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 animate-pulse">Synchronizing Arena...</p>
  </div>
);
