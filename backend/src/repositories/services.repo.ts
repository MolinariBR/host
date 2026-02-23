import type { Service, Prisma } from "@prisma/client";
import type { DbClient } from "./types.js";

export async function listServices(prisma: DbClient): Promise<Service[]> {
  return prisma.service.findMany({
    orderBy: { name: "asc" },
  });
}

export async function listActiveServicesByIds(
  prisma: DbClient,
  ids: string[]
): Promise<Service[]> {
  return prisma.service.findMany({
    where: {
      id: { in: ids },
      isActive: true,
    },
  });
}

export async function createService(
  prisma: DbClient,
  data: Prisma.ServiceCreateInput
): Promise<Service> {
  return prisma.service.create({ data });
}

export async function updateService(
  prisma: DbClient,
  id: string,
  data: Prisma.ServiceUpdateInput
): Promise<Service> {
  return prisma.service.update({
    where: { id },
    data,
  });
}

export async function deleteService(prisma: DbClient, id: string): Promise<void> {
  await prisma.service.delete({
    where: { id },
  });
}
