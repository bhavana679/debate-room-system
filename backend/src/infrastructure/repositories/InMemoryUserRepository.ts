import { User } from '../../core/domain/User';
import { IUserRepository } from '../../core/interfaces/IUserRepository';
import { logger } from '../../utils/logger';
import * as fs from 'fs';
import * as path from 'path';

export class InMemoryUserRepository implements IUserRepository {
  private users: User[] = [];
  private readonly filePath = path.join(process.cwd(), 'data', 'users.json');

  constructor() {
    this.ensureDirectory();
    this.loadData();
  }

  private ensureDirectory() {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private loadData() {
    if (fs.existsSync(this.filePath)) {
      try {
        const rawData = fs.readFileSync(this.filePath, 'utf-8');
        this.users = JSON.parse(rawData).map((u: any) => new User(u));
      } catch (err: any) {
        logger.error({
          event: 'PERSISTENCE_LOAD_ERROR',
          details: { error: err.message, source: 'users.json' }
        });
      }
    }
  }

  private saveData() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.users, null, 2));
    } catch (err: any) {
      logger.error({
        event: 'PERSISTENCE_SAVE_ERROR',
        details: { error: err.message, source: 'users.json' }
      });
    }
  }

  async findById(id: string): Promise<User | null> {
    const user = this.users.find(user => user.id === id);
    return user ? new User(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = this.users.find(user => user.email === email);
    return user ? new User(user) : null;
  }

  async save(user: User): Promise<User> {
    const index = this.users.findIndex(u => u.id === user.id);
    const userInstance = new User(user);
    
    if (index !== -1) {
      this.users[index] = userInstance;
    } else {
      this.users.push(userInstance);
    }
    
    this.saveData();
    return userInstance;
  }
}
