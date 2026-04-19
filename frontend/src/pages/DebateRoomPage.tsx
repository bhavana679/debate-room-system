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

  useArenaSocket(roomId);

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

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (isLoadingRoom) {
    return <FullPageLoader />;
  }

  return (
    <div className="theme-app min-h-screen bg-slate-50 text-slate-600 overflow-hidden flex flex-col relative">
      {isEnded && (
        <div className="absolute inset-0 z-50 bg-slate-100/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-700">
          <div className="max-w-2xl w-full card-premium border-blue-100 bg-white p-12 text-center shadow-[0_0_50px_rgba(0,0,0,0.05)]">
            <div className="mb-8 relative">
              <Trophy className="w-20 h-20 text-yellow-500 mx-auto drop-shadow-[0_0_20px_rgba(234,179,8,0.2)]" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 flex gap-1">
                {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping" style={{animationDelay: `${i * 200}ms`}} />)}
              </div>
            </div>
            
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Verdict Finalized</h2>
            <h1 className="text-4xl font-black text-slate-950 mb-8">
              The <span className={cn(room?.winnerSide === 'PRO' ? "text-blue-600" : "text-red-600")}>
                {room?.winnerSide === 'PRO' ? 'Proposition' : 'Opposition'}
              </span> Wins!
            </h1>

            <div className="grid grid-cols-2 gap-4 mb-10">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Margin of Victory</p>
                <p className="text-3xl font-black text-slate-950 italic">{room?.winningPercentage}%</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Total Discourse</p>
                <p className="text-3xl font-black text-slate-950 italic">24 <span className="text-xs text-slate-400 font-medium lowercase">Arguments</span></p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex border border-slate-200 p-0.5 shadow-inner">
                 <div className="h-full bg-blue-600 rounded-full transition-all duration-1000 shadow-lg" style={{width: `${room?.winnerSide === 'PRO' ? (room?.winningPercentage || 50) : (100 - (room?.winningPercentage || 50))}%`}} />
                 <div className="h-full bg-red-600 rounded-full transition-all duration-1000 shadow-lg" style={{width: `${room?.winnerSide === 'CON' ? (room?.winningPercentage || 50) : (100 - (room?.winningPercentage || 50))}%`}} />
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest px-1">
                <span className="text-blue-600">PRO Side</span>
                <span className="text-red-600">CON Side</span>
              </div>
            </div>

            <button 
              onClick={() => navigate('/dashboard')}
              className="mt-12 btn-primary w-full py-5 text-lg font-black flex items-center justify-center gap-3 group shadow-2xl shadow-blue-600/30"
            >
              Return to Dashboard <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}

      <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-20 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-lg">D</div>
             <h1 className="text-lg font-black text-slate-950 tracking-tight hidden md:block">Arena: {room?.topic.substring(0, 30)}...</h1>
          </div>
          <div className="h-8 w-px bg-slate-100 mx-2 hidden md:block"></div>
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg">
            <div className={cn("w-2 h-2 rounded-full", isEnded ? "bg-red-500" : "bg-green-500")} />
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">{room?.status}</span>
          </div>
        </div>

        {!isEnded && (
          <div className={cn(
            "flex items-center gap-3 px-6 py-2 rounded-2xl border transition-all duration-500 shadow-sm font-black",
            (timerData?.remainingTime || 0) < 10 && room?.status !== RoomStatus.WAITING ? "bg-red-50 border-red-200 text-red-600 animate-pulse" : "bg-white border-slate-200 text-blue-600"
          )}>
            <Timer className="w-5 h-5" />
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
              className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 border border-blue-200 px-4 py-2 rounded-xl hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2 tracking-widest shadow-sm"
            >
              {nextPhaseMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
              Gavel
            </button>
          )}
          <button onClick={() => navigate('/dashboard')} className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors">Exit Arena</button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-72 bg-white border-r border-slate-200 flex flex-col p-6 hidden lg:flex shadow-sm z-10">
          <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-6">Speaker Corners</h3>
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                <Shield className="w-3 h-3" /> Proposition
              </div>
              {participants?.filter(p => p.side === 'PRO' && p.role === 'SPEAKER').map(p => (
                <div key={p.userId} className={cn(
                  "p-4 rounded-xl border transition-all relative overflow-hidden",
                  room?.activeSpeakerId === p.userId 
                    ? "bg-blue-50 border-blue-200 shadow-sm" 
                    : "bg-slate-50 border-slate-100 opacity-60"
                )}>
                  {room?.activeSpeakerId === p.userId && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />}
                  <p className="text-sm font-black text-slate-950 mb-1 truncate">{p.userId.split('-')[0]}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Principal Speaker</p>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div className="text-[10px] font-black text-red-600 uppercase tracking-widest flex items-center gap-2">
                <Shield className="w-3 h-3" /> Opposition
              </div>
              {participants?.filter(p => p.side === 'CON' && p.role === 'SPEAKER').map(p => (
                <div key={p.userId} className={cn(
                  "p-4 rounded-xl border transition-all relative overflow-hidden",
                  room?.activeSpeakerId === p.userId 
                    ? "bg-red-50 border-red-200 shadow-sm" 
                    : "bg-slate-50 border-slate-100 opacity-60"
                )}>
                  {room?.activeSpeakerId === p.userId && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600" />}
                  <p className="text-sm font-black text-slate-950 mb-1 truncate">{p.userId.split('-')[0]}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Principal Speaker</p>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col bg-slate-50 relative">
          <div className="flex-1 p-8 overflow-y-auto space-y-8 scrollbar-hide">
            <div className="max-w-2xl mx-auto text-center py-12 border-b border-slate-200/50">
               <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-4" />
               <h2 className="text-2xl font-black text-slate-950 mb-2 uppercase tracking-tight">Floor Records</h2>
               <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Immutable Historical Discourse</p>
            </div>

            <div className="max-w-3xl mx-auto space-y-6">
              {argumentsList.length === 0 ? (
                <div className="text-center py-12 text-slate-400 italic text-sm font-medium">
                  The floor is silent. Waiting for the first opening statement...
                </div>
              ) : (
                (argumentsList as Array<{ id: string; side: string; phase?: string; type?: string; submittedAt?: string; createdAt?: string; content: string }>).map((arg) => {
                  const isPro = arg.side === 'PRO';
                  return (
                    <div key={arg.id} className={cn(
                      "p-8 bg-white border rounded-[2rem] relative shadow-sm hover:shadow-md transition-all",
                      isPro ? "border-blue-100" : "border-red-100"
                    )}>
                      <div className="flex items-center gap-3 mb-6">
                        <div className={cn(
                          "w-10 h-10 rounded-2xl flex items-center justify-center text-white text-[10px] font-black shadow-lg",
                          isPro ? "bg-blue-600 shadow-blue-600/20" : "bg-red-600 shadow-red-600/20"
                        )}>
                          {arg.side || '?'}
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {arg.phase || arg.type || 'Statement'} Protocol
                          </p>
                          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-tight">
                            {arg.submittedAt || arg.createdAt ? new Date((arg.submittedAt || arg.createdAt) as string).toLocaleTimeString() : 'Just now'}
                          </p>
                        </div>
                      </div>
                      <p className={cn(
                        "text-slate-700 leading-relaxed font-medium italic border-l-4 pl-6 py-1 text-lg",
                        isPro ? "border-blue-600" : "border-red-600"
                      )}>
                        "{arg.content}"
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <footer className="p-8 bg-white border-t border-slate-200 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] transition-all">
            <div className="max-w-3xl mx-auto">
              {!isMyTurn ? (
                <div className="flex items-center gap-4 p-5 bg-slate-50 border border-slate-200 rounded-3xl text-slate-400 italic font-medium">
                  <AlertCircle className="w-5 h-5 text-yellow-500/50" />
                  <span>The floor is currently {isEnded ? "closed (Debate Ended)" : "held by the opposing side or neutral party"}.</span>
                </div>
              ) : (
                <div className="space-y-4 animate-in slide-in-from-bottom-5 duration-500">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase text-blue-600 tracking-widest pl-1">
                    <span>Floor Access: Active Session</span>
                    <span className="text-slate-400 font-bold italic tracking-tighter">Budget: {1000 - argument.length} chars</span>
                  </div>
                  <div className="relative group">
                    <textarea
                      value={argument}
                      onChange={(e) => setArgument(e.target.value)}
                      className="w-full h-40 bg-slate-50 border border-slate-200 rounded-[2rem] p-6 text-slate-950 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all resize-none font-medium shadow-inner"
                      placeholder="Enter your formal statement here..."
                    />
                    <button 
                      onClick={() => submitArgumentMutation.mutate(argument)}
                      disabled={!argument || submitArgumentMutation.isPending}
                      className="absolute bottom-6 right-6 btn-primary py-3 px-8 flex items-center gap-2 shadow-2xl shadow-blue-600/30"
                    >
                      {submitArgumentMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                      Submit Statement
                    </button>
                  </div>
                </div>
              )}
            </div>
          </footer>
        </main>

        <aside className="w-80 bg-white border-l border-slate-200 flex flex-col hidden xl:flex shadow-sm z-10">
          <div className="p-8 flex-1">
             <div className="flex items-center justify-between mb-8">
               <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Live Audience</h3>
               <div className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-600">{participants?.length || 0}</div>
             </div>
             
             <div className="space-y-4">
               {participants?.filter(p => p.role === 'AUDIENCE').slice(0, 10).map((p, i) => (
                 <div key={i} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl transition-all cursor-default">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm">
                      <Users className="w-4 h-4 text-slate-400" />
                    </div>
                    <span className="text-sm text-slate-600 font-bold">{p.userId.split('-')[0]}</span>
                 </div>
               ))}
             </div>
          </div>

          <div className="p-8 bg-slate-50 border-t border-slate-200">
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-8 flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-500" /> Casting Chamber
            </h3>
            
            {isEnded ? (
              <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center shadow-sm">
                <BarChart3 className="w-8 h-8 text-blue-500 mx-auto mb-3 opacity-40" />
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Polls Terminated</p>
              </div>
            ) : !canVote ? (
              <div className="p-8 bg-white/50 rounded-3xl border-2 border-dashed border-slate-200 text-center">
                <p className="text-xs text-slate-400 italic font-black uppercase tracking-widest opacity-60">Chamber Sealed</p>
              </div>
            ) : hasVoted ? (
              <div className="p-8 bg-blue-50 border border-blue-100 rounded-3xl text-center space-y-4 shadow-sm animate-in zoom-in-95 duration-500">
                <CheckCircle className="w-10 h-10 text-blue-600 mx-auto" />
                <p className="text-[10px] text-blue-600 font-black uppercase tracking-[0.2em]">Decision Encrypted</p>
              </div>
            ) : (
              <div className="space-y-4">
                <button 
                  onClick={() => castVoteMutation.mutate('PRO')}
                  className="w-full py-5 bg-white border border-blue-200 rounded-2xl text-blue-600 font-black text-[10px] uppercase tracking-[0.15em] hover:bg-blue-600 hover:text-white transition-all shadow-sm hover:shadow-blue-600/20 active:scale-95"
                >
                  Vote Proposition
                </button>
                <button 
                  onClick={() => castVoteMutation.mutate('CON')}
                  className="w-full py-5 bg-white border border-red-200 rounded-2xl text-red-600 font-black text-[10px] uppercase tracking-[0.15em] hover:bg-red-600 hover:text-white transition-all shadow-sm hover:shadow-red-600/20 active:scale-95"
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
