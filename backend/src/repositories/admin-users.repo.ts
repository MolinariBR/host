import type { AdminUser } from "@prisma/client";
import type { DbClient } from "./types.js";

export async function findActiveAdminByEmail(
  prisma: DbClient,
  email: string
): Promise<AdminUser | null> {
  return prisma.adminUser.findFirst({
    where: {
      email,
      isActive: true,
    },
  });
}
