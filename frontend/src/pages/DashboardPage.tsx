import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { roomApi } from '../services/api/roomApi';
import { useUIStore } from '../store/useUIStore';
import { cn } from '../utils/cn';
import { EmptyState, LoadingSkeleton } from '../components/UIState';
import { Plus, Trophy, Users, Timer, ArrowRight, LayoutDashboard, Settings, LogOut, MessageSquare, Menu, X } from 'lucide-react';

interface LeaderboardPreviewUser {
  name: string;
  wins: number;
}

interface MyStats {
  reputation: number;
  rank: string | number;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  
  const { data: rooms, isLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: roomApi.list,
  });

  const { data: leaderboard } = useQuery({
    queryKey: ['leaderboard', 'preview'],
    queryFn: () => roomApi.getLeaderboard(3) as Promise<LeaderboardPreviewUser[]>,
  });

  const { data: myStats } = useQuery({
    queryKey: ['stats', 'me'],
    queryFn: () => roomApi.getMyStats() as Promise<MyStats>,
  });

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const handleCreateRoom = () => navigate('/create-room');
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
               { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', active: true },
               { icon: MessageSquare, label: 'Debates', path: '/debates' },
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
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-16">
          <div>
            <h1 className="text-3xl lg:text-4xl font-black text-slate-950 mb-2 leading-tight">Welcome, {currentUser.email?.split('@')[0]}</h1>
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
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-950 uppercase tracking-widest flex items-center gap-3">
                Live Channels
                <span className="text-[10px] bg-slate-200 px-3 py-1 rounded-full text-slate-600 font-bold border border-slate-300/50">{rooms?.length || 0}</span>
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
                  <div key={room.id} className="card-premium bg-white border border-slate-200 hover:border-blue-600 hover:shadow-xl hover:shadow-blue-600/5 cursor-pointer" onClick={() => navigate(`/room/${room.id}`)}>
                    <div className="flex items-center justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className={cn(
                            "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                            room.status === 'WAITING' ? "bg-yellow-50 text-yellow-600 border-yellow-100" : "bg-green-50 text-green-600 border-green-100"
                          )}>
                            {room.status}
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1.5 font-bold uppercase tracking-widest">
                            <Timer className="w-3" /> Event #{room.id.substring(0, 4)}
                          </span>
                        </div>
                        <h3 className="text-xl lg:text-2xl font-black text-slate-950 group-hover:text-blue-600 transition-colors leading-snug">{room.topic}</h3>
                      </div>
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                        <ArrowRight className="w-6 h-6 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-950 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" /> Top Debaters
            </h2>
            <div className="card-premium bg-white border border-slate-200 space-y-4 shadow-sm">
              {!leaderboard || leaderboard.length === 0 ? (
                <p className="text-slate-600 text-sm italic p-4 text-center">No rankings yet.</p>
              ) : (
                leaderboard.map((user, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "font-bold",
                        i === 0 ? "text-yellow-500" : i === 1 ? "text-slate-400" : "text-orange-400"
                      )}>#{i + 1}</span>
                      <span className="text-slate-950 font-semibold truncate max-w-[120px] uppercase tracking-tighter text-xs">{user.name}</span>
                    </div>
                    <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{user.wins} Wins</span>
                  </div>
                ))
              )}
              <button 
                onClick={() => navigate('/rankings')}
                className="w-full py-3 text-sm font-black text-blue-600 hover:bg-blue-50 rounded-xl transition-all uppercase tracking-widest"
              >
                View Full Standings
              </button>
            </div>

            <div className="card-premium bg-blue-600 border-none p-6 text-white shadow-xl shadow-blue-600/30">
              <h3 className="font-bold text-lg mb-2">My Reputation</h3>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-4xl font-black">{myStats?.reputation || 0}</span>
                <span className="text-blue-100 text-xs mb-1 uppercase tracking-widest font-black">XP</span>
              </div>
              <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                   className="h-full bg-white rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(255,255,255,0.5)]" 
                   style={{ width: `${Math.min(((myStats?.reputation || 0) % 1000) / 10, 100)}%` }}
                ></div>
              </div>
              <p className="text-blue-100 text-[10px] mt-3 font-bold uppercase tracking-widest italic opacity-80">
                Rank: {myStats?.rank === 'Unranked' ? 'Novice' : `${myStats?.rank}th in the World`}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
