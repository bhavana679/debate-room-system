export const UserRole = {
  MODERATOR: 'MODERATOR',
  SPEAKER: 'SPEAKER',
  AUDIENCE: 'AUDIENCE'
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface User {
  id: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO extends LoginDTO {
  role?: UserRole;
}
