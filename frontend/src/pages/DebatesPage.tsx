import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { roomApi } from '../services/api/roomApi';
import { useUIStore } from '../store/useUIStore';
import { cn } from '../utils/cn';
import { EmptyState, LoadingSkeleton } from '../components/UIState';
import { LayoutDashboard, MessageSquare, Trophy, Settings, LogOut, Menu, X, Calendar, User, History, Filter } from 'lucide-react';

const DebatesPage: React.FC = () => {
  const navigate = useNavigate();
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  
  const { data: rooms, isLoading } = useQuery({
    queryKey: ['rooms', 'history'],
    queryFn: roomApi.list,
  });

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="theme-app min-h-screen bg-slate-50 flex transition-colors duration-500 overflow-hidden">
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button onClick={toggleSidebar} className="p-3 bg-white border border-slate-200 rounded-2xl shadow-xl text-slate-950">
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transition-transform duration-500 lg:translate-x-0 lg:static lg:inset-0",
        !isSidebarOpen && "-translate-x-full"
      )}>
        <div className="flex flex-col h-full p-8">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20 flex items-center justify-center text-white font-black text-2xl">D</div>
            <span className="text-2xl font-black text-slate-950 tracking-tighter">Arena.</span>
          </div>

          <nav className="flex-1 space-y-3">
             {[
               { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
               { icon: MessageSquare, label: 'Debates', path: '/debates', active: true },
               { icon: Trophy, label: 'Rankings', path: '/rankings' },
               { icon: Settings, label: 'Settings', path: '/settings' },
             ].map((item, i) => (
               <button
                 key={i}
                 onClick={() => navigate(item.path)}
                 className={cn(
                   "w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all text-sm",
                   item.active ? "bg-blue-600 text-white shadow-xl shadow-blue-600/30" : "text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                 )}
               >
                 <item.icon className="w-5 h-5" />
                 {item.label}
               </button>
             ))}
          </nav>

          <button onClick={handleLogout} className="flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-red-500 hover:bg-red-50 transition-all mt-auto text-sm group">
            <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" /> Sign Out
          </button>
        </div>
      </aside>

      <main className={cn(
        "flex-1 p-6 lg:p-12 overflow-y-auto transition-all duration-500",
        isSidebarOpen && "blur-sm lg:blur-none opacity-50 lg:opacity-100"
      )}>
        <header className="mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-black text-slate-950 mb-2 leading-tight">Archives</h1>
            <p className="text-slate-500 font-medium italic tracking-wide">Relive the history of intellectual combat.</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-white border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all shadow-sm">
              <Filter className="w-4 h-4" /> Filter
            </button>
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20">
              <History className="w-4 h-4" /> My History
            </button>
          </div>
        </header>

        {isLoading ? (
          <LoadingSkeleton count={4} height="h-32" />
        ) : !rooms || rooms.length === 0 ? (
          <EmptyState 
            icon={History}
            title="Archives Empty"
            description="No records found in the library. Join or create a debate to record history."
          />
        ) : (
          <div className="grid gap-6">
            {rooms.map((room) => (
              <div 
                key={room.id}
                onClick={() => navigate(`/arena/${room.id}`)}
                className="card-premium bg-white border-slate-200 hover:border-blue-600 hover:shadow-xl hover:shadow-blue-600/5 cursor-pointer group transition-all"
              >
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                        room.status === 'ENDED' ? "bg-purple-50 text-purple-600 border-purple-100" : "bg-blue-50 text-blue-600 border-blue-100"
                      )}>
                        {room.status}
                      </span>
                      <span className="text-slate-400 text-[10px] flex items-center gap-1.5 font-bold uppercase tracking-widest">
                        <Calendar className="w-3 h-3" /> {new Date(room.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-xl lg:text-2xl font-black text-slate-950 group-hover:text-blue-600 transition-all leading-tight">{room.topic}</h3>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-slate-100 rounded-md border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">M</div>
                        <span className="text-xs text-slate-500 font-medium tracking-tight">Hosted by Moderator</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <span className="text-xs text-slate-500 font-medium tracking-tight">2 Speakers</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center md:flex-col justify-between md:justify-center gap-4 md:border-l border-slate-100 md:pl-12">
                     <div className="text-center">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Outcome</p>
                       <p className="text-slate-950 font-black text-lg">{room.status === 'ENDED' ? 'Resolved' : 'In Progress'}</p>
                     </div>
                     <button className="px-6 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 text-[10px] font-black uppercase tracking-widest group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 transition-all">
                       Review
                     </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default DebatesPage;
