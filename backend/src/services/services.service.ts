import type { Prisma, PrismaClient } from "@prisma/client";
import * as servicesRepo from "../repositories/services.repo.js";

export function listServices(prisma: PrismaClient) {
  return servicesRepo.listServices(prisma);
}

export function createService(prisma: PrismaClient, data: Prisma.ServiceCreateInput) {
  return servicesRepo.createService(prisma, data);
}

export function updateService(
  prisma: PrismaClient,
  serviceId: string,
  data: Prisma.ServiceUpdateInput
) {
  return servicesRepo.updateService(prisma, serviceId, data);
}

export function deleteService(prisma: PrismaClient, serviceId: string) {
  return servicesRepo.deleteService(prisma, serviceId);
}
