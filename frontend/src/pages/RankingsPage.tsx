import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { roomApi } from '../services/api/roomApi';
import { useUIStore } from '../store/useUIStore';
import { cn } from '../utils/cn';
import { LayoutDashboard, MessageSquare, Trophy, Settings, LogOut, Menu, X, Medal, TrendingUp, Search } from 'lucide-react';

const RankingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isSidebarOpen, toggleSidebar } = useUIStore();

  const { data: leaderBoardData, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => roomApi.getLeaderboard(20),
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
               { icon: MessageSquare, label: 'Debates', path: '/debates' },
               { icon: Trophy, label: 'Rankings', path: '/rankings', active: true },
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
        "flex-1 p-6 lg:p-12 overflow-y-auto transition-all duration-500 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.05),transparent_40%)]",
        isSidebarOpen && "blur-sm lg:blur-none opacity-50 lg:opacity-100"
      )}>
        <header className="mb-12">
          <h1 className="text-3xl lg:text-4xl font-black text-slate-950 mb-2 leading-tight">Global Hall of Fame</h1>
          <p className="text-slate-500 font-medium italic tracking-wide">The definitive ranking of intellectual superiority.</p>
        </header>

        {isLoading ? (
          <div className="h-96 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : !leaderBoardData || leaderBoardData.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center text-slate-500">
             <Trophy className="w-16 h-16 mb-4 opacity-20" />
             <p className="font-bold italic">The podium is currently unclaimed.</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-3 gap-8 mb-16 items-end">
              <div className="order-2 md:order-1">
                {leaderBoardData[1] && (
                  <div className="relative group text-center">
                    <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 border-4 border-slate-300 flex items-center justify-center text-3xl font-black text-slate-950 shadow-2xl shadow-slate-200/50 uppercase">{leaderBoardData[1].avatar}</div>
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-400 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg">Silver</div>
                    <h3 className="text-xl font-bold text-slate-950 mb-1 truncate">{leaderBoardData[1].name}</h3>
                    <p className="text-slate-500 text-sm font-bold mb-4">{leaderBoardData[1].wins} Wins • {leaderBoardData[1].votes} Votes</p>
                    <div className="h-32 bg-gradient-to-t from-slate-200/50 to-transparent rounded-t-3xl border-x border-t border-slate-200/50"></div>
                  </div>
                )}
              </div>

              <div className="order-1 md:order-2">
                {leaderBoardData[0] && (
                  <div className="relative group text-center">
                    <div className="absolute -inset-4 bg-yellow-500/10 blur-3xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
                    <div className="w-32 h-32 bg-white rounded-full mx-auto mb-6 border-4 border-yellow-500 flex items-center justify-center text-4xl font-black text-slate-950 shadow-2xl shadow-yellow-500/10 relative z-10 scale-110 uppercase">{leaderBoardData[0].avatar}</div>
                    <Medal className="absolute top-0 right-1/4 w-8 h-8 text-yellow-500 z-20 drop-shadow-lg" />
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-yellow-500 text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-tighter shadow-lg z-20">Grandmaster</div>
                    <h3 className="text-2xl font-black text-slate-950 mb-1 relative z-10 truncate">{leaderBoardData[0].name}</h3>
                    <p className="text-yellow-600/80 text-sm font-black mb-6 relative z-10 flex items-center justify-center gap-2">
                      <TrendingUp className="w-4 h-4" /> {leaderBoardData[0].wins} Wins • {leaderBoardData[0].votes} Votes
                    </p>
                    <div className="h-48 bg-gradient-to-t from-yellow-500/10 to-transparent rounded-t-3xl border-x border-t border-yellow-500/20"></div>
                  </div>
                )}
              </div>

              <div className="order-3">
                {leaderBoardData[2] && (
                  <div className="relative group text-center">
                    <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 border-4 border-orange-200 flex items-center justify-center text-3xl font-black text-slate-950 shadow-2xl shadow-orange-100 uppercase">{leaderBoardData[2].avatar}</div>
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-400 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg">Bronze</div>
                    <h3 className="text-xl font-bold text-slate-950 mb-1 truncate">{leaderBoardData[2].name}</h3>
                    <p className="text-slate-500 text-sm font-bold mb-4">{leaderBoardData[2].wins} Wins • {leaderBoardData[2].votes} Votes</p>
                    <div className="h-24 bg-gradient-to-t from-orange-100/50 to-transparent rounded-t-3xl border-x border-t border-orange-100/50"></div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search for a debater..." 
                  className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-6 text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all font-medium shadow-sm"
                />
              </div>
            </div>

            <div className="card-premium overflow-hidden border-slate-200 p-0 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Rank</th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Debater</th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Victories</th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Reputation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {leaderBoardData.slice(3).map((user) => (
                      <tr key={user.userId} className="group hover:bg-slate-50/80 transition-colors cursor-pointer">
                        <td className="px-6 py-5">
                          <span className="text-lg font-black text-slate-400">#{user.rank}</span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-950 group-hover:border-blue-500 border border-slate-200 transition-all uppercase">{user.avatar}</div>
                            <span className="text-slate-950 font-bold text-sm group-hover:text-blue-600 transition-colors uppercase tracking-tight">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="text-slate-950 font-mono font-bold">{user.wins}</span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <span className="text-blue-600 font-mono font-black">{user.votes.toLocaleString()} XP</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default RankingsPage;
