import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roomApi } from '../services/api/roomApi';
import { debateApi } from '../services/api/debateApi';
import { voteApi } from '../services/api/voteApi';
import { useArenaSocket } from '../hooks/useArenaSocket';
import { Timer, MessageSquare, Users, Award, Shield, ArrowRight, Loader2, Send, AlertCircle, CheckCircle, Trophy, BarChart3, Play } from 'lucide-react';
import { cn } from '../utils/cn';
import { RoomStatus } from '../types/room';
import type { Room, Participant } from '../types/room';
import { FullPageLoader } from '../components/UIState';

const DebateRoomPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const roomId = id || '';
  const [argument, setArgument] = useState('');
  const [hasVoted, setHasVoted] = useState<boolean>(() => {
    return localStorage.getItem(`voted_${roomId}`) === 'true';
  });

  // Real-time synchronization
  useArenaSocket(roomId);

  // 1. Data Fetching
  const { data: room, isLoading: isLoadingRoom } = useQuery({
    queryKey: ['room', roomId],
    queryFn: () => roomApi.getById(roomId) as Promise<Room>,
    refetchInterval: 5000, 
  });

  const { data: participants } = useQuery({
    queryKey: ['participants', roomId],
    queryFn: () => roomApi.getParticipants(roomId) as Promise<Participant[]>,
  });

  const { data: timerData } = useQuery({
    queryKey: ['timer', roomId],
    queryFn: () => debateApi.getTimer(roomId),
    enabled: room?.status !== RoomStatus.WAITING && room?.status !== RoomStatus.ENDED,
    refetchInterval: 1000,
  });

  // 2. Mutations
  const { data: argumentsList = [] } = useQuery({
    queryKey: ['arguments', roomId],
    queryFn: () => debateApi.getArguments(roomId),
    enabled: !!roomId,
  });

  const submitArgumentMutation = useMutation({
    mutationFn: (content: string) => debateApi.submitArgument(roomId, content),
    onSuccess: () => {
      setArgument('');
      queryClient.invalidateQueries({ queryKey: ['arguments', roomId] });
    },
  });

  const castVoteMutation = useMutation({
    mutationFn: (candidateId: string) => voteApi.cast(roomId, candidateId),
    onSuccess: () => {
      setHasVoted(true);
      localStorage.setItem(`voted_${roomId}`, 'true');
      queryClient.invalidateQueries({ queryKey: ['room', roomId] });
    },
  });

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUserParticipant = participants?.find(p => p.userId === currentUser.id);
  const isModerator = currentUserParticipant?.role === 'MODERATOR' || room?.createdBy === currentUser.id;

  const isStateAllowingArguments = ([
    RoomStatus.OPENING,
    RoomStatus.REBUTTAL,
    RoomStatus.CLOSING
  ] as RoomStatus[]).includes(room?.status as RoomStatus);
  
  const isMyTurn = isStateAllowingArguments && room?.activeSpeakerId === currentUser.id;
  const canVote = room?.status === RoomStatus.VOTING;
  const isEnded = room?.status === RoomStatus.ENDED;
  const isDebateInProgress = isStateAllowingArguments;

  const nextPhaseMutation = useMutation({
    mutationFn: () => debateApi.nextPhase(roomId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['room', roomId] }),
  });

  // 4. Formatting Helpers
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (isLoadingRoom) {
    return <FullPageLoader />;
  }

  return (
    <div className="theme-app min-h-screen bg-[#020617] text-slate-200 overflow-hidden flex flex-col relative">
      
      {/* RESULT OVERLAY (Appears when status is ENDED) */}
      {isEnded && (
        <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-700">
          <div className="max-w-2xl w-full card-premium border-blue-500/50 bg-slate-900 p-12 text-center shadow-[0_0_50px_rgba(37,99,235,0.2)]">
            <div className="mb-8 relative">
              <Trophy className="w-20 h-20 text-yellow-500 mx-auto drop-shadow-[0_0_20px_rgba(234,179,8,0.5)]" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 flex gap-1">
                {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-ping" style={{animationDelay: `${i * 200}ms`}} />)}
              </div>
            </div>
            
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Verdict Finalized</h2>
            <h1 className="text-4xl font-black text-white mb-8">
              The <span className={cn(room?.winnerSide === 'PRO' ? "text-blue-500" : "text-red-500")}>
                {room?.winnerSide === 'PRO' ? 'Proposition' : 'Opposition'}
              </span> Wins!
            </h1>

            <div className="grid grid-cols-2 gap-4 mb-10">
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Margin of Victory</p>
                <p className="text-3xl font-black text-white italic">{room?.winningPercentage}%</p>
              </div>
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Total Discourse</p>
                <p className="text-3xl font-black text-white italic">24 <span className="text-xs text-slate-500 font-medium lowercase">Arguments</span></p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="w-full h-4 bg-slate-950 rounded-full overflow-hidden flex border border-slate-800 p-0.5">
                 <div className="h-full bg-blue-600 rounded-full transition-all duration-1000" style={{width: `${room?.winnerSide === 'PRO' ? (room?.winningPercentage || 50) : (100 - (room?.winningPercentage || 50))}%`}} />
                 <div className="h-full bg-red-600 rounded-full transition-all duration-1000" style={{width: `${room?.winnerSide === 'CON' ? (room?.winningPercentage || 50) : (100 - (room?.winningPercentage || 50))}%`}} />
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest px-1">
                <span className="text-blue-500">PRO Side</span>
                <span className="text-red-500">CON Side</span>
              </div>
            </div>

            <button 
              onClick={() => navigate('/dashboard')}
              className="mt-12 btn-primary w-full py-4 text-lg font-bold flex items-center justify-center gap-3 group"
            >
              Return to Dashboard <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}

      {/* TOP HEADER */}
      <header className="h-20 bg-slate-900/50 border-b border-slate-800 flex items-center justify-between px-8 backdrop-blur-xl z-20">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-lg">D</div>
             <h1 className="text-xl font-bold text-white tracking-tight hidden md:block">Arena: {room?.topic.substring(0, 30)}...</h1>
          </div>
          <div className="h-8 w-px bg-slate-800 mx-2 hidden md:block"></div>
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-950 border border-slate-800 rounded-full">
            <div className={cn("w-2 h-2 rounded-full animate-pulse", isEnded ? "bg-red-500" : "bg-green-500")} />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{room?.status}</span>
          </div>
        </div>

        {!isEnded && (
          <div className={cn(
            "flex items-center gap-3 px-6 py-2 rounded-2xl border transition-all duration-500 shadow-2xl",
            (timerData?.remainingTime || 0) < 10 && room?.status !== RoomStatus.WAITING ? "bg-red-900/20 border-red-500/50 text-red-500" : "bg-slate-950 border-slate-800 text-blue-500"
          )}>
            <Timer className={cn("w-5 h-5", (timerData?.remainingTime || 0) < 10 && room?.status !== RoomStatus.WAITING && "animate-bounce")} />
            <span className="text-2xl font-black font-mono tracking-tighter">
              {formatTime(timerData?.remainingTime || 0)}
            </span>
          </div>
        )}

        <div className="flex items-center gap-4">
          {isModerator && isDebateInProgress && (
            <button 
              onClick={() => nextPhaseMutation.mutate()}
              disabled={nextPhaseMutation.isPending}
              className="text-[10px] font-black uppercase text-blue-500 bg-blue-500/10 border border-blue-500/30 px-3 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2"
            >
              {nextPhaseMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
              Pass Gavel
            </button>
          )}
          <button onClick={() => navigate('/dashboard')} className="text-sm font-bold text-slate-500 hover:text-white transition-colors">Exit</button>
        </div>
      </header>

      {/* CORE LAYOUT */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT: Speakers */}
        <aside className="w-72 bg-slate-900/30 border-r border-slate-800 flex flex-col p-6 hidden lg:flex">
          <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-6">Speaker Corners</h3>
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="text-[10px] font-bold text-blue-500 uppercase tracking-widest flex items-center gap-2">
                <Shield className="w-3 h-3" /> Proposition
              </div>
              {participants?.filter(p => p.side === 'PRO' && p.role === 'SPEAKER').map(p => (
                <div key={p.userId} className={cn(
                  "p-4 rounded-xl border transition-all relative overflow-hidden",
                  room?.activeSpeakerId === p.userId 
                    ? "bg-blue-600/10 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.1)]" 
                    : "bg-slate-950 border-slate-800"
                )}>
                  {room?.activeSpeakerId === p.userId && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />}
                  <p className="text-sm font-bold text-white mb-1 truncate">{p.userId.substring(0, 12)}</p>
                  <p className="text-[10px] text-slate-500 font-medium">Principal Speaker</p>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div className="text-[10px] font-bold text-red-500 uppercase tracking-widest flex items-center gap-2">
                <Shield className="w-3 h-3" /> Opposition
              </div>
              {participants?.filter(p => p.side === 'CON' && p.role === 'SPEAKER').map(p => (
                <div key={p.userId} className={cn(
                  "p-4 rounded-xl border transition-all relative overflow-hidden",
                  room?.activeSpeakerId === p.userId 
                    ? "bg-red-600/10 border-red-500 shadow-[0_0_20px_rgba(239,44,44,0.1)]" 
                    : "bg-slate-950 border-slate-800"
                )}>
                  {room?.activeSpeakerId === p.userId && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />}
                  <p className="text-sm font-bold text-white mb-1 truncate">{p.userId.substring(0, 12)}</p>
                  <p className="text-[10px] text-slate-500 font-medium">Principal Speaker</p>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* CENTER: Formal Arguments */}
        <main className="flex-1 flex flex-col bg-slate-950 relative">
          <div className="flex-1 p-8 overflow-y-auto space-y-8 scrollbar-hide">
            <div className="max-w-2xl mx-auto text-center py-12 border-b border-slate-900">
               <MessageSquare className="w-12 h-12 text-slate-800 mx-auto mb-4" />
               <h2 className="text-2xl font-black text-white mb-2">Formal Record of Discourse</h2>
               <p className="text-slate-500 text-sm italic">All arguments are final and immutable once submitted to the floor.</p>
            </div>

            <div className="max-w-3xl mx-auto space-y-6">
              {argumentsList.length === 0 ? (
                <div className="text-center py-12 text-slate-600 italic text-sm">
                  No arguments submitted yet. The floor is open.
                </div>
              ) : (
                (argumentsList as Array<{ id: string; side: string; phase?: string; type?: string; submittedAt?: string; createdAt?: string; content: string }>).map((arg) => {
                  const isPro = arg.side === 'PRO';
                  return (
                    <div key={arg.id} className={cn(
                      "p-6 bg-slate-900 border rounded-3xl relative",
                      isPro ? "border-blue-500/20" : "border-red-500/20"
                    )}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-black",
                          isPro ? "bg-blue-600" : "bg-red-600"
                        )}>
                          {arg.side || '?'}
                        </div>
                        <p className="text-xs font-bold text-slate-400">
                          {arg.phase || arg.type || 'Statement'} | {new Date(arg.submittedAt || arg.createdAt || Date.now()).toLocaleTimeString()}
                        </p>
                      </div>
                      <p className={cn(
                        "text-slate-200 leading-relaxed italic border-l-2 pl-4 py-1",
                        isPro ? "border-blue-500" : "border-red-500"
                      )}>
                        "{arg.content}"
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <footer className="p-8 bg-slate-900/50 border-t border-slate-800 backdrop-blur-xl">
            <div className="max-w-3xl mx-auto">
              {!isMyTurn ? (
                <div className="flex items-center gap-3 p-4 bg-slate-950 border border-slate-800 rounded-2xl text-slate-500 italic">
                  <AlertCircle className="w-5 h-5 text-yellow-500/50" />
                  <span>The floor is currently {isEnded ? "closed (Debate Ended)" : "closed to your side"}.</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-black uppercase text-blue-500 tracking-widest pl-1">
                    <span>Active Session: Submit Argument</span>
                    <span className="text-slate-500 font-mono italic">Characters Remaining: {1000 - argument.length}</span>
                  </div>
                  <div className="relative">
                    <textarea
                      value={argument}
                      onChange={(e) => setArgument(e.target.value)}
                      className="w-full h-32 bg-slate-950 border border-blue-500/30 rounded-2xl p-4 text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                      placeholder="Compose your statement here..."
                    />
                    <button 
                      onClick={() => submitArgumentMutation.mutate(argument)}
                      disabled={!argument || submitArgumentMutation.isPending}
                      className="absolute bottom-4 right-4 btn-primary py-2 px-6 flex items-center gap-2"
                    >
                      {submitArgumentMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Submit to Floor
                    </button>
                  </div>
                </div>
              )}
            </div>
          </footer>
        </main>

        {/* RIGHT: Participants & Voting */}
        <aside className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col hidden xl:flex">
          <div className="p-6 flex-1">
             <div className="flex items-center justify-between mb-8">
               <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Live Audience</h3>
               <div className="px-2 py-0.5 bg-slate-800 rounded text-[10px] font-bold text-white">{participants?.length || 0}</div>
             </div>
             
             <div className="space-y-4">
               {participants?.filter(p => p.role === 'AUDIENCE').slice(0, 10).map((p, i) => (
                 <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center border border-slate-800">
                      <Users className="w-4 h-4 text-slate-600" />
                    </div>
                    <span className="text-xs text-slate-300 font-medium">{p.userId.substring(0, 10)}...</span>
                 </div>
               ))}
             </div>
          </div>

          <div className="p-6 bg-slate-950 border-t border-slate-800">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-6 flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-500" /> Casting Chamber
            </h3>
            
            {isEnded ? (
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-center">
                <BarChart3 className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <p className="text-[10px] text-slate-500 font-bold uppercase">Polls Closed</p>
              </div>
            ) : !canVote ? (
              <div className="p-6 bg-slate-900 rounded-2xl border border-dashed border-slate-800 text-center">
                <p className="text-xs text-slate-600 italic font-medium">The Voting Chamber is currently sealed.</p>
              </div>
            ) : hasVoted ? (
              <div className="p-6 bg-blue-600/10 border border-blue-500/30 rounded-2xl text-center space-y-3">
                <CheckCircle className="w-8 h-8 text-blue-500 mx-auto" />
                <p className="text-xs text-blue-500 font-bold uppercase tracking-widest">Decision Recorded</p>
              </div>
            ) : (
              <div className="space-y-3">
                <button 
                  onClick={() => castVoteMutation.mutate('PRO')}
                  className="w-full py-4 bg-blue-600/10 border border-blue-500/30 rounded-xl text-blue-500 font-bold hover:bg-blue-600 hover:text-white transition-all transform active:scale-95"
                >
                  Vote Proposition
                </button>
                <button 
                  onClick={() => castVoteMutation.mutate('CON')}
                  className="w-full py-4 bg-red-600/10 border border-red-500/30 rounded-xl text-red-500 font-bold hover:bg-red-600 hover:text-white transition-all transform active:scale-95"
                >
                  Vote Opposition
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default DebateRoomPage;
