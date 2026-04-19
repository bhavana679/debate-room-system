import { PrismaClient } from '@prisma/client';
import { IUserRepository } from '../../core/interfaces/IUserRepository';
import { User, UserRole } from '../../core/domain/User';

export class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  private map(model: any): User {
    return new User({
      id: model.id,
      email: model.email,
      passwordHash: model.passwordHash,
      role: model.role as UserRole,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt
    });
  }

  async findById(id: string): Promise<User | null> {
    const model = await this.prisma.user.findUnique({ where: { id } });
    return model ? this.map(model) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const model = await this.prisma.user.findUnique({ where: { email } });
    return model ? this.map(model) : null;
  }

  async save(user: User): Promise<User> {
    const model = await this.prisma.user.upsert({
      where: { id: user.id },
      update: {
        email: user.email,
        passwordHash: user.passwordHash,
        role: user.role
      },
      create: {
        id: user.id,
        email: user.email,
        passwordHash: user.passwordHash,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
    return this.map(model);
  }
}
