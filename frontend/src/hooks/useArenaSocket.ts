import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { socketService } from '../services/socket/socket';

/**
 * Socket events handled by the arena
 */
export const ArenaEvents = {
  STATE_CHANGED: 'STATE_CHANGED',
  TIMER_TICK: 'TIMER_TICK',
  ARGUMENT_SUBMITTED: 'ARGUMENT_SUBMITTED',
  VOTE_UPDATED: 'VOTE_UPDATED',
  RESULT_DECLARED: 'RESULT_DECLARED',
} as const;

export const useArenaSocket = (roomId: string) => {
  const queryClient = useQueryClient();
  const lastSequenceNumber = useRef<number>(0);

  useEffect(() => {
    if (!roomId) return;

    const token = localStorage.getItem('token') || '';
    socketService.connect(token);
    socketService.emit('join_room', roomId);

    // 1. Handlers
    const handleStateChange = (payload: { sequenceNumber: number; roomStatus: string }) => {
      // Respect sequence numbers to prevent jitter from out-of-order delivery
      if (payload.sequenceNumber <= lastSequenceNumber.current) return;
      lastSequenceNumber.current = payload.sequenceNumber;

      queryClient.invalidateQueries({ queryKey: ['room', roomId] });
      console.log('[Socket] State Changed:', payload.roomStatus);
    };

    const handleTimerTick = (payload: { remainingTime: number }) => {
      // Sequence numbers aren't typically used for timer ticks as they are too frequent,
      // but we update the cache for the timer specifically.
      queryClient.setQueryData(['timer', roomId], { remainingTime: payload.remainingTime });
    };

    const handleArgumentSubmitted = (payload: { sequenceNumber: number }) => {
      if (payload.sequenceNumber <= lastSequenceNumber.current) return;
      lastSequenceNumber.current = payload.sequenceNumber;

      queryClient.invalidateQueries({ queryKey: ['room', roomId] });
      queryClient.invalidateQueries({ queryKey: ['arguments', roomId] });
      console.log('[Socket] New Argument');
    };

    const handleVoteUpdated = () => {
      // Votes update the room's tally in real-time
      queryClient.invalidateQueries({ queryKey: ['room', roomId] });
    };

    // 2. Subscriptions
    const unsubs = [
      socketService.subscribe(ArenaEvents.STATE_CHANGED, handleStateChange),
      socketService.subscribe(ArenaEvents.TIMER_TICK, handleTimerTick),
      socketService.subscribe(ArenaEvents.ARGUMENT_SUBMITTED, handleArgumentSubmitted),
      socketService.subscribe(ArenaEvents.VOTE_UPDATED, handleVoteUpdated),
      socketService.subscribe(ArenaEvents.RESULT_DECLARED, () => {
         queryClient.invalidateQueries({ queryKey: ['room', roomId] });
         console.log('[Socket] Results Finalized');
      }),
    ];

    // 3. Cleanup
    return () => {
      socketService.emit('leave_room', roomId);
      unsubs.forEach(unsub => unsub());
    };
  }, [roomId, queryClient]);
};
