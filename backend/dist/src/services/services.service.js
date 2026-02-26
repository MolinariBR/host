import * as servicesRepo from "../repositories/services.repo.js";
export function listServices(prisma) {
    return servicesRepo.listServices(prisma);
}
export function createService(prisma, data) {
    return servicesRepo.createService(prisma, data);
}
export function updateService(prisma, serviceId, data) {
    return servicesRepo.updateService(prisma, serviceId, data);
}
export function deleteService(prisma, serviceId) {
    return servicesRepo.deleteService(prisma, serviceId);
}
