import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { roomApi } from '../services/api/roomApi';
import { useUIStore } from '../store/useUIStore';
import { useAppStore } from '../store/useAppStore';
import { cn } from '../utils/cn';
import { EmptyState, LoadingSkeleton } from '../components/UIState';
import { Plus, Trophy, Users, Timer, ArrowRight, LayoutDashboard, Settings, LogOut, MessageSquare, Menu, X } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  
  const { data: rooms, isLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: roomApi.list,
  });

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const handleCreateRoom = () => navigate('/create-room');
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="theme-app min-h-screen bg-slate-950 flex transition-colors duration-500 overflow-hidden">
      {/* Mobile Header Overlay */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button onClick={toggleSidebar} className="p-3 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl text-white">
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 transition-transform duration-500 lg:translate-x-0 lg:static lg:inset-0",
        !isSidebarOpen && "-translate-x-full"
      )}>
        <div className="flex flex-col h-full p-8">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20 flex items-center justify-center text-white font-black text-2xl">D</div>
            <span className="text-2xl font-black text-white tracking-tighter">Arena.</span>
          </div>

          <nav className="flex-1 space-y-3">
             {[
               { icon: LayoutDashboard, label: 'Dashboard', active: true },
               { icon: MessageSquare, label: 'Debates', active: false },
               { icon: Trophy, label: 'Rankings', active: false },
               { icon: Settings, label: 'Settings', active: false },
             ].map((item, i) => (
               <button
                 key={i}
                 onClick={() => {
                   if (!item.active) {
                     useAppStore.getState().addNotification(`The ${item.label} feature is coming soon!`, 'info');
                   }
                 }}
                 className={cn(
                   "w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all text-sm",
                   item.active ? "bg-blue-600 text-white shadow-xl shadow-blue-600/30" : "text-slate-500 hover:text-white hover:bg-white/5"
                 )}
               >
                 <item.icon className="w-5 h-5" />
                 {item.label}
               </button>
             ))}
          </nav>

          <button onClick={handleLogout} className="flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-red-400 hover:bg-red-500/5 transition-all mt-auto text-sm group">
            <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={cn(
        "flex-1 p-6 lg:p-12 overflow-y-auto transition-all duration-500",
        isSidebarOpen && "blur-sm lg:blur-none opacity-50 lg:opacity-100"
      )}>
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-16">
          <div>
            <h1 className="text-3xl lg:text-4xl font-black text-white mb-2 leading-tight">Welcome, {currentUser.email?.split('@')[0]}</h1>
            <p className="text-slate-500 font-medium italic tracking-wide">Enter the field of intellectual combat.</p>
          </div>
          <button 
            onClick={handleCreateRoom}
            className="btn-primary w-full sm:w-auto py-4 px-10 flex items-center justify-center gap-3 shadow-2xl shadow-blue-600/20"
          >
            <Plus className="w-6 h-6" /> Launch Arena
          </button>
        </header>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Active Rooms List */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                Live Channels
                <span className="text-[10px] bg-slate-800 px-3 py-1 rounded-full text-slate-400 font-bold border border-slate-700/50">{rooms?.length || 0}</span>
              </h2>
            </div>
            
            {isLoading ? (
              <LoadingSkeleton count={3} height="h-32" />
            ) : rooms?.length === 0 ? (
              <EmptyState 
                icon={Users}
                title="No Open Channels"
                description="The parliament is currently in recess. Be the first to initiate a new session of discourse."
                action={<button onClick={handleCreateRoom} className="btn-primary">Initiate Session</button>}
              />
            ) : (
              <div className="grid gap-4">
                {rooms?.map((room) => (
                  <div key={room.id} className="card-premium group hover:border-blue-600/50 hover:bg-slate-900/50 hover:shadow-blue-900/10 cursor-pointer" onClick={() => navigate(`/room/${room.id}`)}>
                    <div className="flex items-center justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className={cn(
                            "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                            room.status === 'WAITING' ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" : "bg-green-500/10 text-green-500 border-green-500/20"
                          )}>
                            {room.status}
                          </span>
                          <span className="text-[10px] text-slate-500 flex items-center gap-1.5 font-mono">
                            <Timer className="w-3 h-3" /> Event #{room.id.substring(0, 4)}
                          </span>
                        </div>
                        <h3 className="text-xl lg:text-2xl font-black text-white group-hover:text-blue-400 transition-colors leading-snug">{room.topic}</h3>
                      </div>
                      <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center border border-slate-800 group-hover:border-blue-500/50 group-hover:bg-blue-600/10 transition-all">
                        <ArrowRight className="w-6 h-6 text-slate-700 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Leaderboard Preview (Side) */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" /> Top Debaters
            </h2>
            <div className="card-premium bg-slate-900 space-y-4">
              {[
                { name: 'Socrates.eth', wins: 42, color: 'text-yellow-500' },
                { name: 'Athenian_Owl', wins: 38, color: 'text-slate-300' },
                { name: 'LogicMaster', wins: 35, color: 'text-orange-400' },
              ].map((user, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-950/50 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className={cn("font-bold", user.color)}>#{i + 1}</span>
                    <span className="text-white font-medium">{user.name}</span>
                  </div>
                  <span className="text-slate-500 text-sm font-bold">{user.wins} Wins</span>
                </div>
              ))}
              <button className="w-full py-3 text-sm font-bold text-blue-500 hover:bg-blue-500/5 rounded-xl transition-all">
                View Full Standings
              </button>
            </div>

            {/* Quick Stats Card */}
            <div className="card-premium bg-gradient-to-br from-indigo-600 to-blue-700 border-none p-6 text-white shadow-xl shadow-blue-900/20">
              <h3 className="font-bold text-lg mb-2">My Reputation</h3>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-4xl font-black">740</span>
                <span className="text-blue-200 text-sm mb-1">XP Points</span>
              </div>
              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white w-3/4 rounded-full"></div>
              </div>
              <p className="text-blue-100 text-xs mt-3">250 XP until next rank (Advocate)</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
