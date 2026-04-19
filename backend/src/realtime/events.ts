// All event names as constants to ensure consistency across the system
export const SocketEvents = {
  ROOM_JOINED: 'ROOM_JOINED',
  DEBATE_STARTED: 'DEBATE_STARTED',
  STATE_CHANGED: 'STATE_CHANGED',
  TIMER_TICK: 'TIMER_TICK',
  ARGUMENT_SUBMITTED: 'ARGUMENT_SUBMITTED',
  VOTE_UPDATED: 'VOTE_UPDATED',
  RESULT_DECLARED: 'RESULT_DECLARED'
} as const;

export type SocketEvent = (typeof SocketEvents)[keyof typeof SocketEvents];
