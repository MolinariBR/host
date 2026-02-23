import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { config } from "dotenv";

config();

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || "admin@hotelsantoantonio.com.br";
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD;
  if (!adminPassword) {
    throw new Error("DEFAULT_ADMIN_PASSWORD must be configured to run seed.");
  }

  await prisma.hotelProfile.upsert({
    where: { id: "default" },
    update: {
      legalName: "TERESINHA DE JESUS SANTOS NOLETO",
      tradeName: "Hotel Santo Antonio",
      cnpj: "33.568.908/0001-55",
      phone: "+55 63 8121-7810",
      email: "contato@hotelsantoantonio.com.br",
      city: "Itaguatins",
      state: "TO",
      addressLine: "Centro, Itaguatins - TO",
      googleMapsUrl:
        "https://www.google.com/maps/search/?api=1&query=Hotel+Santo+Antonio+Itaguatins+TO",
      googleBusinessUrl: "https://www.google.com/search?q=Hotel+Santo+Antonio+Itaguatins",
    },
    create: {
      id: "default",
      legalName: "TERESINHA DE JESUS SANTOS NOLETO",
      tradeName: "Hotel Santo Antonio",
      cnpj: "33.568.908/0001-55",
      phone: "+55 63 8121-7810",
      email: "contato@hotelsantoantonio.com.br",
      city: "Itaguatins",
      state: "TO",
      addressLine: "Centro, Itaguatins - TO",
      googleMapsUrl:
        "https://www.google.com/maps/search/?api=1&query=Hotel+Santo+Antonio+Itaguatins+TO",
      googleBusinessUrl: "https://www.google.com/search?q=Hotel+Santo+Antonio+Itaguatins",
    },
  });

  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {
      name: "Administrador",
      passwordHash: adminPasswordHash,
      isActive: true,
    },
    create: {
      name: "Administrador",
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: "OWNER",
      isActive: true,
    },
  });

  const room101 = await prisma.room.upsert({
    where: { number: "101" },
    update: {
      status: "AVAILABLE",
      basePriceCents: 18000,
      seasonalPriceCents: 15000,
    },
    create: {
      number: "101",
      name: "Quarto Standard",
      type: "STANDARD",
      capacity: 2,
      description: "Quarto confortavel para ate 2 pessoas.",
      basePriceCents: 18000,
      seasonalPriceCents: 15000,
      status: "AVAILABLE",
    },
  });

  const room205 = await prisma.room.upsert({
    where: { number: "205" },
    update: {
      status: "MAINTENANCE",
      basePriceCents: 28000,
      seasonalPriceCents: 24000,
    },
    create: {
      number: "205",
      name: "Quarto Deluxe",
      type: "DELUXE",
      capacity: 3,
      description: "Quarto amplo com varanda.",
      basePriceCents: 28000,
      seasonalPriceCents: 24000,
      status: "MAINTENANCE",
    },
  });

  const room308 = await prisma.room.upsert({
    where: { number: "308" },
    update: {
      status: "OCCUPIED",
      basePriceCents: 38000,
      seasonalPriceCents: 32000,
    },
    create: {
      number: "308",
      name: "Suite Premium",
      type: "PREMIUM",
      capacity: 4,
      description: "Suite premium com mais espaco interno.",
      basePriceCents: 38000,
      seasonalPriceCents: 32000,
      status: "OCCUPIED",
    },
  });

  const breakfast = await prisma.service.upsert({
    where: { name: "Cafe da Manha" },
    update: {
      priceCents: 3500,
      isActive: true,
    },
    create: {
      name: "Cafe da Manha",
      description: "Cafe da manha completo servido das 7h as 10h.",
      category: "FOOD",
      priceCents: 3500,
      isActive: true,
    },
  });

  await prisma.service.upsert({
    where: { name: "Transfer Local" },
    update: {
      priceCents: 8000,
      isActive: true,
    },
    create: {
      name: "Transfer Local",
      description: "Transporte de ida e volta em horarios combinados.",
      category: "TRANSPORT",
      priceCents: 8000,
      isActive: true,
    },
  });

  const guestJoao = await prisma.guest.upsert({
    where: { email: "joao.silva@email.com" },
    update: {
      name: "Joao Silva",
      phone: "+55 11 98765-4321",
    },
    create: {
      name: "Joao Silva",
      email: "joao.silva@email.com",
      phone: "+55 11 98765-4321",
      document: "123.456.789-00",
      address: "Sao Paulo - SP",
    },
  });

  const guestMaria = await prisma.guest.upsert({
    where: { email: "maria.santos@email.com" },
    update: {
      name: "Maria Santos",
      phone: "+55 21 99876-5432",
    },
    create: {
      name: "Maria Santos",
      email: "maria.santos@email.com",
      phone: "+55 21 99876-5432",
      document: "987.654.321-00",
      address: "Rio de Janeiro - RJ",
    },
  });

  const booking1 = await prisma.booking.upsert({
    where: { bookingCode: "HSA-20260223-001" },
    update: {
      status: "CONFIRMED",
      paymentStatus: "PENDING_WHATSAPP",
      totalCents: 39500,
    },
    create: {
      bookingCode: "HSA-20260223-001",
      guestId: guestJoao.id,
      roomId: room101.id,
      status: "CONFIRMED",
      paymentStatus: "PENDING_WHATSAPP",
      source: "WEB",
      checkIn: new Date("2026-03-15"),
      checkOut: new Date("2026-03-17"),
      guestsCount: 2,
      nightlyRateCents: 18000,
      extraServicesCents: 3500,
      totalCents: 39500,
      notes: "Chegada prevista apos 20h.",
    },
  });

  const booking2 = await prisma.booking.upsert({
    where: { bookingCode: "HSA-20260223-002" },
    update: {
      status: "PENDING",
      paymentStatus: "PENDING_WHATSAPP",
      totalCents: 56000,
    },
    create: {
      bookingCode: "HSA-20260223-002",
      guestId: guestMaria.id,
      roomId: room205.id,
      status: "PENDING",
      paymentStatus: "PENDING_WHATSAPP",
      source: "WEB",
      checkIn: new Date("2026-04-01"),
      checkOut: new Date("2026-04-03"),
      guestsCount: 2,
      nightlyRateCents: 28000,
      extraServicesCents: 0,
      totalCents: 56000,
      notes: "Aguardando confirmacao com a administracao.",
    },
  });

  await prisma.bookingService.upsert({
    where: {
      bookingId_serviceId: {
        bookingId: booking1.id,
        serviceId: breakfast.id,
      },
    },
    update: {
      quantity: 1,
      unitPriceCents: 3500,
      totalCents: 3500,
    },
    create: {
      bookingId: booking1.id,
      serviceId: breakfast.id,
      quantity: 1,
      unitPriceCents: 3500,
      totalCents: 3500,
    },
  });

  // Room 308 fica sem reserva seed para aparecer como ocupado por bloqueio manual.
  await prisma.room.update({
    where: { id: room308.id },
    data: { status: "OCCUPIED" },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
