import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roomApi } from '../services/api/roomApi';
import { debateApi } from '../services/api/debateApi';
import { useArenaSocket } from '../hooks/useArenaSocket';
import { Users, Shield, Play, ArrowLeft, Loader2, UserPlus, Info } from 'lucide-react';
import { FullPageLoader } from '../components/UIState';

const LobbyPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const roomId = id || '';

  // Real-time synchronization
  useArenaSocket(roomId);

  const { data: room, isLoading: isLoadingRoom } = useQuery({
    queryKey: ['room', roomId],
    queryFn: () => roomApi.getById(roomId),
    enabled: !!roomId,
  });

  const { data: participants, isLoading: isLoadingParticipants } = useQuery({
    queryKey: ['participants', roomId],
    queryFn: () => roomApi.getParticipants(roomId),
    enabled: !!roomId,
  });

  const startDebateMutation = useMutation({
    mutationFn: () => debateApi.start(roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['room', roomId] });
      // Logic for real-time transition will follow, for now just refresh
    },
  });

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUserParticipant = participants?.find(p => p.userId === currentUser.id);
  const isModerator = currentUserParticipant?.role === 'MODERATOR' || room?.createdBy === currentUser.id;

  const joinMutation = useMutation({
    mutationFn: (side: string) => roomApi.join(roomId, side),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participants', roomId] });
    },
  });

  // Auto-transition to Arena when status changes
  useEffect(() => {
    if (room && room.status !== 'WAITING') {
      navigate(`/arena/${roomId}`);
    }
  }, [room?.status, roomId, navigate, room]);

  if (isLoadingRoom || isLoadingParticipants) {
    return <FullPageLoader />;
  }

  if (!room) {
    return (
      <div className="theme-app min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Arena Not Found</h2>
        <button onClick={() => navigate('/dashboard')} className="btn-primary">Return to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="theme-app min-h-screen bg-slate-950 p-6 lg:p-10">
      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div className="space-y-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </button>
            <div className="flex items-center gap-3">
              <span className="bg-yellow-500/10 text-yellow-500 text-[10px] font-black px-2 py-0.5 rounded border border-yellow-500/20 uppercase tracking-widest">
                {room.status}
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white">{room.topic}</h1>
            </div>
          </div>

          {isModerator && (
            <div className="flex items-center gap-4 w-full md:w-auto">
               <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-xl border border-slate-800 text-slate-400 text-xs italic">
                <Info className="w-4 h-4 text-blue-500" />
                Waiting for participants to join...
              </div>
              <button 
                onClick={() => startDebateMutation.mutate()}
                disabled={startDebateMutation.isPending}
                className="btn-primary flex-1 md:flex-none py-3 px-10 flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20"
              >
                {startDebateMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                Start Debate
              </button>
            </div>
          )}
        </header>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Participants Columns */}
          <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
            {/* PRO SIDE */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-black uppercase text-blue-500 tracking-wider">
                <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                Proposition (PRO)
              </h3>
              <div className="space-y-3">
                {participants?.filter(p => p.side === 'PRO').map((p, i) => (
                  <div key={i} className="card-premium h-20 flex items-center justify-between group hover:bg-slate-900 border-blue-500/10">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-600/10 flex items-center justify-center border border-blue-500/20">
                        <Users className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-white font-bold">{p.userId === currentUser.id ? 'You' : p.userId.substring(0, 8)}</p>
                        <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">{p.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {participants?.filter(p => p.side === 'PRO').length === 0 && (
                  <button 
                    onClick={() => joinMutation.mutate('PRO')}
                    disabled={joinMutation.isPending}
                    className="w-full h-20 rounded-2xl border-2 border-dashed border-slate-900 flex items-center justify-center text-slate-700 font-bold italic text-sm hover:border-blue-500/50 hover:text-blue-500 transition-all group"
                  >
                    {joinMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Join Proposition'}
                  </button>
                )}
              </div>
            </div>

            {/* CON SIDE */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-black uppercase text-red-500 tracking-wider">
                <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,44,44,0.5)]"></div>
                Opposition (CON)
              </h3>
              <div className="space-y-3">
                {participants?.filter(p => p.side === 'CON').map((p, i) => (
                  <div key={i} className="card-premium h-20 flex items-center justify-between group hover:bg-slate-900 border-red-500/10">
                     <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-red-600/10 flex items-center justify-center border border-red-500/20">
                        <Users className="w-5 h-5 text-red-500" />
                      </div>
                      <div>
                        <p className="text-white font-bold">{p.userId === currentUser.id ? 'You' : p.userId.substring(0, 8)}</p>
                        <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">{p.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {participants?.filter(p => p.side === 'CON').length === 0 && (
                  <button 
                    onClick={() => joinMutation.mutate('CON')}
                    disabled={joinMutation.isPending}
                    className="w-full h-20 rounded-2xl border-2 border-dashed border-slate-900 flex items-center justify-center text-slate-700 font-bold italic text-sm hover:border-red-500/50 hover:text-red-500 transition-all group"
                  >
                   {joinMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Join Opposition'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Lobby Info / Moderator Section */}
          <div className="space-y-8">
            <div className="card-premium bg-slate-950 border-slate-800 p-8 text-center">
              <Shield className="w-12 h-12 text-blue-600 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(37,99,235,0.3)]" />
              <h3 className="text-white font-black uppercase text-sm tracking-widest mb-4">Lobby Status</h3>
              <div className="space-y-4 text-xs font-medium text-slate-500 leading-relaxed">
                <p>Welcome to the digital parliament. Please wait for the moderator to initiate the first round of opening statements.</p>
                <div className="h-px bg-slate-800 mx-auto w-1/2"></div>
                <div className="flex items-center justify-between text-white bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span>Participants</span>
                  <span className="font-black text-blue-500">{participants?.length || 0} / 20</span>
                </div>
              </div>
            </div>

            <div className="card-premium bg-gradient-to-br from-slate-900 to-black p-6 space-y-4">
              <h4 className="text-xs font-black text-slate-500 uppercase flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-blue-500" /> Invite Link
              </h4>
              <div className="flex gap-2">
                <input 
                  readOnly 
                  value={window.location.href}
                  className="flex-1 bg-black border border-slate-800 rounded-lg px-3 py-2 text-xs text-blue-500 font-mono focus:outline-none"
                />
                <button className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-blue-600/20">
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LobbyPage;
