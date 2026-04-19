export const RoomStatus = {
  WAITING: 'WAITING',
  OPENING: 'OPENING',
  REBUTTAL: 'REBUTTAL',
  CLOSING: 'CLOSING',
  VOTING: 'VOTING',
  ENDED: 'ENDED'
} as const;

export type RoomStatus = (typeof RoomStatus)[keyof typeof RoomStatus];

export interface Room {
  id: string;
  topic: string;
  status: RoomStatus;
  createdBy: string;
  activeSpeakerId: string | null;
  votingStartTime: Date | null;
  votingEndTime: Date | null;
  winnerSide: string | null;
  winningPercentage: number | null;
  eventSequence: number;
}

export interface Participant {
  userId: string;
  roomId: string;
  role: string;
  side: string;
  joinedAt: Date;
}
