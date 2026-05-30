export interface AuthUser {
  id: number;
  email: string;
  fullName: string;
  phone: string | null;
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
  findByEmail(email: string): Promise<AuthUser & { passwordHash: string } | null>;
  create(input: RegisterInput): Promise<AuthUser>;
  validatePassword(plain: string, hash: string): Promise<boolean>;
}
