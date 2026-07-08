export interface AuthUser {
  id: number;
  email: string;
  fullName: string;
  phone: string | null;
  createdAt?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthRepository {
  findByEmail(email: string): Promise<(AuthUser & { passwordHash: string | null }) | null>;
  findByGoogleId(googleId: string): Promise<AuthUser | null>;
  create(input: RegisterInput): Promise<AuthUser>;
  createGoogleUser(input: { fullName: string; email: string; googleId: string }): Promise<AuthUser>;
  linkGoogleAccount(userId: number, googleId: string): Promise<void>;
  validatePassword(plain: string, hash: string): Promise<boolean>;
}
