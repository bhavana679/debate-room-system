import { UserRole } from '../domain/User';

export interface RegisterDTO {
  email: string;
  password: string;
  role?: UserRole;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
  token: string;
}
