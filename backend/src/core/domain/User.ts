export enum UserRole {
  MODERATOR = 'MODERATOR',
  SPEAKER = 'SPEAKER',
  AUDIENCE = 'AUDIENCE'
}

export class User {
  id!: string;
  email!: string;
  passwordHash!: string;
  role!: UserRole;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(data: Partial<User>) {
    Object.assign(this, data);
    if (this.createdAt) this.createdAt = new Date(this.createdAt);
    if (this.updatedAt) this.updatedAt = new Date(this.updatedAt);
  }
}
