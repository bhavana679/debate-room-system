import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { IUserRepository } from '../interfaces/IUserRepository';
import { User, UserRole } from '../domain/User';
import { RegisterDTO, LoginDTO, AuthResponse } from '../interfaces/IAuthService';

export class AuthService {
  constructor(private userRepository: IUserRepository) {}

  async register(data: RegisterDTO): Promise<AuthResponse> {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    
    const newUser = new User({
      id: Math.random().toString(36).substring(7),
      email: data.email,
      passwordHash,
      role: data.role || UserRole.AUDIENCE,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const savedUser = await this.userRepository.save(newUser);
    const token = this.generateToken(savedUser);

    return {
      user: {
        id: savedUser.id,
        email: savedUser.email,
        role: savedUser.role
      },
      token
    };
  }

  async login(data: LoginDTO): Promise<AuthResponse> {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      token
    };
  }

  private generateToken(user: User): string {
    const secret = process.env.JWT_SECRET || 'fallback_secret';
    return jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn: '24h' }
    );
  }
}
