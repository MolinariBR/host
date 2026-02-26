import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { config } from "dotenv";
config();
const prisma = new PrismaClient();
function roomDescription(bedConfig, hasBathroom) {
    const bathroomText = hasBathroom
        ? "Com banheiro privativo."
        : "Sem banheiro privativo (banheiro coletivo).";
    return `${bedConfig} Todos os quartos possuem armadores de redes. ${bathroomText}`;
}
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
            email: "jorgecynoleto@hotmail.com",
            city: "Itaguatins",
            state: "TO",
            addressLine: "Centro, Itaguatins - TO",
            googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Hotel+Santo+Antonio+Itaguatins+TO",
            googleBusinessUrl: "https://www.google.com/search?q=Hotel+Santo+Antonio+Itaguatins",
        },
        create: {
            id: "default",
            legalName: "TERESINHA DE JESUS SANTOS NOLETO",
            tradeName: "Hotel Santo Antonio",
            cnpj: "33.568.908/0001-55",
            phone: "+55 63 8121-7810",
            email: "jorgecynoleto@hotmail.com",
            city: "Itaguatins",
            state: "TO",
            addressLine: "Centro, Itaguatins - TO",
            googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Hotel+Santo+Antonio+Itaguatins+TO",
            googleBusinessUrl: "https://www.google.com/search?q=Hotel+Santo+Antonio+Itaguatins",
        },
    });
    const adminPasswordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.adminUser.upsert({
        where: { email: adminEmail },
        update: {
            name: "Administrador",
            isActive: true,
            passwordHash: adminPasswordHash,
            role: "OWNER",
        },
        create: {
            name: "Administrador",
            email: adminEmail,
            passwordHash: adminPasswordHash,
            role: "OWNER",
            isActive: true,
        },
    });
    // Compatibilidade com bases antigas antes da troca de RoomType.
    await prisma.$executeRawUnsafe(`UPDATE "Room" SET "type" = 'FAMILIA' WHERE "type" = 'STANDARD'`);
    await prisma.$executeRawUnsafe(`UPDATE "Room" SET "type" = 'CASAL' WHERE "type" = 'DELUXE'`);
    await prisma.$executeRawUnsafe(`UPDATE "Room" SET "type" = 'DUPLO' WHERE "type" = 'PREMIUM'`);
    await prisma.$executeRawUnsafe(`UPDATE "Room" SET "type" = 'INDIVIDUAL' WHERE "type" = 'SUITE'`);
    const roomDefinitions = [
        {
            number: "001",
            name: "Quarto Família",
            type: "FAMILIA",
            climatizacao: "CENTRAL_AR",
            hasBathroom: true,
            capacity: 4,
            basePriceCents: 30000,
            bedConfig: "4 camas de solteiro + armadores de redes.",
        },
    ];
    for (let i = 0; i < 8; i += 1) {
        roomDefinitions.push({
            number: String(2 + i).padStart(3, "0"),
            name: "Quarto Casal + Solteiro",
            type: "CASAL",
            climatizacao: "CENTRAL_AR",
            hasBathroom: true,
            capacity: 3,
            basePriceCents: 18000,
            bedConfig: "1 cama de casal + 1 cama de solteiro.",
        });
    }
    for (let i = 0; i < 7; i += 1) {
        roomDefinitions.push({
            number: String(10 + i).padStart(3, "0"),
            name: "Quarto Duplo",
            type: "DUPLO",
            climatizacao: "CENTRAL_AR",
            hasBathroom: true,
            capacity: 2,
            basePriceCents: 18000,
            bedConfig: "2 camas de solteiro.",
        });
    }
    for (let i = 0; i < 2; i += 1) {
        roomDefinitions.push({
            number: String(17 + i).padStart(3, "0"),
            name: "Quarto Individual (Ar)",
            type: "INDIVIDUAL",
            climatizacao: "CENTRAL_AR",
            hasBathroom: true,
            capacity: 1,
            basePriceCents: 9000,
            bedConfig: "1 cama de solteiro.",
        });
    }
    const economicRooms = ["019", "020", "021", "022"];
    economicRooms.forEach((number, index) => {
        roomDefinitions.push({
            number,
            name: "Quarto Econômico",
            type: "ECONOMICO",
            climatizacao: "VENTILADOR",
            hasBathroom: index < 2,
            capacity: 1,
            basePriceCents: 8000,
            bedConfig: "1 cama de solteiro.",
        });
    });
    if (roomDefinitions.length !== 22) {
        throw new Error(`Expected 22 rooms, received ${roomDefinitions.length}.`);
    }
    const targetRoomNumbers = roomDefinitions.map((room) => room.number);
    const roomsByNumber = new Map();
    for (const room of roomDefinitions) {
        const persisted = await prisma.room.upsert({
            where: { number: room.number },
            update: {
                name: room.name,
                type: room.type,
                climatizacao: room.climatizacao,
                hasBathroom: room.hasBathroom,
                capacity: room.capacity,
                description: roomDescription(room.bedConfig, room.hasBathroom),
                basePriceCents: room.basePriceCents,
                seasonalPriceCents: null,
                status: "AVAILABLE",
            },
            create: {
                number: room.number,
                name: room.name,
                type: room.type,
                climatizacao: room.climatizacao,
                hasBathroom: room.hasBathroom,
                capacity: room.capacity,
                description: roomDescription(room.bedConfig, room.hasBathroom),
                basePriceCents: room.basePriceCents,
                seasonalPriceCents: null,
                status: "AVAILABLE",
            },
        });
        roomsByNumber.set(room.number, persisted);
    }
    const room001 = roomsByNumber.get("001");
    const room002 = roomsByNumber.get("002");
    if (!room001 || !room002) {
        throw new Error("Failed to create seed rooms 001 and 002.");
    }
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
            guestId: guestJoao.id,
            roomId: room001.id,
            status: "CONFIRMED",
            paymentStatus: "PENDING_WHATSAPP",
            checkIn: new Date("2026-03-15"),
            checkOut: new Date("2026-03-17"),
            guestsCount: 2,
            nightlyRateCents: 30000,
            extraServicesCents: 3500,
            totalCents: 63500,
            notes: "Chegada prevista apos 20h.",
        },
        create: {
            bookingCode: "HSA-20260223-001",
            guestId: guestJoao.id,
            roomId: room001.id,
            status: "CONFIRMED",
            paymentStatus: "PENDING_WHATSAPP",
            source: "WEB",
            checkIn: new Date("2026-03-15"),
            checkOut: new Date("2026-03-17"),
            guestsCount: 2,
            nightlyRateCents: 30000,
            extraServicesCents: 3500,
            totalCents: 63500,
            notes: "Chegada prevista apos 20h.",
        },
    });
    const booking2 = await prisma.booking.upsert({
        where: { bookingCode: "HSA-20260223-002" },
        update: {
            guestId: guestMaria.id,
            roomId: room002.id,
            status: "PENDING",
            paymentStatus: "PENDING_WHATSAPP",
            checkIn: new Date("2026-04-01"),
            checkOut: new Date("2026-04-03"),
            guestsCount: 2,
            nightlyRateCents: 18000,
            extraServicesCents: 0,
            totalCents: 36000,
            notes: "Aguardando confirmacao com a administracao.",
        },
        create: {
            bookingCode: "HSA-20260223-002",
            guestId: guestMaria.id,
            roomId: room002.id,
            status: "PENDING",
            paymentStatus: "PENDING_WHATSAPP",
            source: "WEB",
            checkIn: new Date("2026-04-01"),
            checkOut: new Date("2026-04-03"),
            guestsCount: 2,
            nightlyRateCents: 18000,
            extraServicesCents: 0,
            totalCents: 36000,
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
    // Remove quartos antigos que nao fazem parte da numeracao final (001-022),
    // inclusive suas reservas historicas para nao bloquear por FK.
    const staleRooms = await prisma.room.findMany({
        where: { number: { notIn: targetRoomNumbers } },
        select: { id: true },
    });
    const staleRoomIds = staleRooms.map((room) => room.id);
    if (staleRoomIds.length > 0) {
        const staleBookings = await prisma.booking.findMany({
            where: { roomId: { in: staleRoomIds } },
            select: { id: true },
        });
        const staleBookingIds = staleBookings.map((booking) => booking.id);
        if (staleBookingIds.length > 0) {
            await prisma.bookingService.deleteMany({
                where: { bookingId: { in: staleBookingIds } },
            });
            await prisma.booking.deleteMany({
                where: { id: { in: staleBookingIds } },
            });
        }
        await prisma.room.deleteMany({
            where: { id: { in: staleRoomIds } },
        });
    }
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
