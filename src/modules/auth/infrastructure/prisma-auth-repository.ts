import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { AuthRepository, AuthUser, RegisterInput } from "@/modules/auth/domain/auth";

export class PrismaAuthRepository implements AuthRepository {
  async findByEmail(email: string): Promise<(AuthUser & { passwordHash: string | null }) | null> {
    const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!user) return null;
    return {
      id: Number(user.id),
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      passwordHash: user.passwordHash,
    };
  }

  async findByGoogleId(googleId: string): Promise<AuthUser | null> {
    const user = await prisma.user.findUnique({ where: { googleId } });
    if (!user) return null;
    return {
      id: Number(user.id),
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
    };
  }

  async create(input: RegisterInput): Promise<AuthUser> {
    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await prisma.user.create({
      data: {
        fullName: input.fullName.trim(),
        email: input.email.trim().toLowerCase(),
        passwordHash,
        phone: input.phone?.trim() ?? null,
      },
    });
    return {
      id: Number(user.id),
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
    };
  }

  async createGoogleUser(input: { fullName: string; email: string; googleId: string }): Promise<AuthUser> {
    const user = await prisma.user.create({
      data: {
        fullName: input.fullName.trim(),
        email: input.email.trim().toLowerCase(),
        googleId: input.googleId,
        passwordHash: null,
      },
    });
    return {
      id: Number(user.id),
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
    };
  }

  async linkGoogleAccount(userId: number, googleId: string): Promise<void> {
    await prisma.user.update({
      where: { id: BigInt(userId) },
      data: { googleId },
    });
  }

  async validatePassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
