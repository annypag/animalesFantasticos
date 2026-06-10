/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import { randomUUID } from "node:crypto";
import { SignupResult } from "@/modules/auth-lite/domain/auth-lite";

export class PrismaAuthLiteRepository {
  async signup(email: string): Promise<SignupResult> {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await (prisma as any).appUser.upsert({
      where: { email: normalizedEmail },
      create: { email: normalizedEmail },
      update: {},
    });

    const token = randomUUID();
    await (prisma as any).emailVerificationToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 1000 * 60 * 30),
      },
    });

    return {
      userId: Number(user.id),
      email: user.email,
      verificationToken: token,
    };
  }

  async verifyEmail(token: string): Promise<boolean> {
    const verification = await (prisma as any).emailVerificationToken.findUnique({
      where: { token },
    });

    if (!verification || verification.usedAt || verification.expiresAt.getTime() < Date.now()) {
      return false;
    }

    await prisma.$transaction([
      (prisma as any).emailVerificationToken.update({
        where: { id: verification.id },
        data: { usedAt: new Date() },
      }),
      (prisma as any).appUser.update({
        where: { id: verification.userId },
        data: { emailVerified: true, verifiedAt: new Date() },
      }),
    ]);

    return true;
  }
}
