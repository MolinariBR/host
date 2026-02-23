import bcrypt from "bcryptjs";
import type { PrismaClient } from "@prisma/client";
import { findActiveAdminByEmail } from "../repositories/admin-users.repo.js";
import { signAdminToken } from "../plugins/auth.js";

export class AuthError extends Error {}

export async function loginAdmin(
  prisma: PrismaClient,
  input: { email: string; password: string }
): Promise<{
  token: string;
  admin: { id: string; name: string; email: string; role: string };
}> {
  const admin = await findActiveAdminByEmail(prisma, input.email);
  if (!admin) throw new AuthError("Invalid credentials.");

  const isValid = await bcrypt.compare(input.password, admin.passwordHash);
  if (!isValid) throw new AuthError("Invalid credentials.");

  const token = signAdminToken({
    sub: admin.id,
    email: admin.email,
    role: admin.role,
  });

  return {
    token,
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
  };
}
