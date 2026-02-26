import assert from "node:assert/strict";
import test from "node:test";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../app.js";

let app: FastifyInstance;
const bookingCodePrefix = process.env.BOOKING_CODE_PREFIX || "HSA";
const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || "admin@hotelsantoantonio.com.br";
const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || "admin123";

type PublicRoom = {
  id: string;
  number: string;
  capacity: number;
};

async function getFirstAvailableRoom(): Promise<PublicRoom> {
  const roomsResponse = await app.inject({
    method: "GET",
    url: "/rooms",
  });
  assert.equal(roomsResponse.statusCode, 200);

  const body = roomsResponse.json() as { items: PublicRoom[] };
  assert.ok(body.items.length > 0, "expected at least one available room");

  return body.items[0];
}

async function createBookingForEmail(email: string) {
  const room = await getFirstAvailableRoom();
  const now = Date.now();
  const uniqueDocument = `${now}${Math.floor(Math.random() * 1000)}`
    .replace(/\D/g, "")
    .slice(-11)
    .padStart(11, "0");
  const response = await app.inject({
    method: "POST",
    url: "/bookings",
    payload: {
      guestName: "Teste Integracao",
      guestEmail: email,
      guestPhone: "+55 11 99999-0000",
      guestDocument: uniqueDocument,
      roomId: room.id,
      checkIn: "2026-12-10",
      checkOut: "2026-12-12",
      guestsCount: Math.min(2, room.capacity),
      notes: `Reserva de teste ${now}`,
    },
  });

  assert.equal(response.statusCode, 201);
  return response.json() as {
    bookingCode: string;
    status: string;
    paymentStatus: string;
    whatsappUrl: string;
  };
}

async function loginAsAdmin(): Promise<string> {
  const loginResponse = await app.inject({
    method: "POST",
    url: "/admin/auth/login",
    payload: {
      email: adminEmail,
      password: adminPassword,
    },
  });

  assert.equal(loginResponse.statusCode, 200);
  const loginBody = loginResponse.json() as { token: string };
  assert.ok(loginBody.token);
  return loginBody.token;
}

test.before(async () => {
  app = await buildApp({ logger: false });
});

test.after(async () => {
  await app.close();
});

test("health check responde 200", async () => {
  const response = await app.inject({
    method: "GET",
    url: "/health",
  });

  assert.equal(response.statusCode, 200);
  const body = response.json() as { status: string; timestamp: string };
  assert.equal(body.status, "ok");
  assert.ok(body.timestamp);
});

test("criacao de reserva publica retorna bookingCode e link de WhatsApp", async () => {
  const uniqueEmail = `teste.booking.${Date.now()}@example.com`;
  const booking = await createBookingForEmail(uniqueEmail);

  assert.match(
    booking.bookingCode,
    new RegExp(`^${bookingCodePrefix}-\\d{8}-\\d{3,}$`)
  );
  assert.equal(booking.status, "PENDING");
  assert.equal(booking.paymentStatus, "PENDING_WHATSAPP");
  assert.ok(booking.whatsappUrl.includes("wa.me"));
});

test("lookup de reservas por email retorna itens", async () => {
  const uniqueEmail = `teste.lookup.${Date.now()}@example.com`;
  const booking = await createBookingForEmail(uniqueEmail);

  const lookupResponse = await app.inject({
    method: "GET",
    url: `/bookings/lookup?email=${encodeURIComponent(uniqueEmail)}`,
  });

  assert.equal(lookupResponse.statusCode, 200);
  const body = lookupResponse.json() as {
    items: Array<{ bookingCode: string; status: string; paymentStatus: string }>;
  };
  assert.ok(body.items.length > 0);
  assert.ok(body.items.some((item) => item.bookingCode === booking.bookingCode));
});

test("login admin e acesso a rota protegida", async () => {
  const token = await loginAsAdmin();

  const protectedResponse = await app.inject({
    method: "GET",
    url: "/admin/rooms",
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  assert.equal(protectedResponse.statusCode, 200);
});

test("bloqueia transicao invalida de status da reserva", async () => {
  const uniqueEmail = `teste.transition.${Date.now()}@example.com`;
  const booking = await createBookingForEmail(uniqueEmail);
  const token = await loginAsAdmin();

  const adminListResponse = await app.inject({
    method: "GET",
    url: "/admin/bookings?status=PENDING",
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
  assert.equal(adminListResponse.statusCode, 200);
  const listBody = adminListResponse.json() as {
    items: Array<{ id: string; bookingCode: string }>;
  };
  const created = listBody.items.find((item) => item.bookingCode === booking.bookingCode);
  assert.ok(created, "expected booking to be listed in admin endpoint");

  const invalidTransitionResponse = await app.inject({
    method: "PATCH",
    url: `/admin/bookings/${created.id}`,
    headers: {
      authorization: `Bearer ${token}`,
    },
    payload: {
      status: "CHECKED_OUT",
    },
  });

  assert.equal(invalidTransitionResponse.statusCode, 400);
});

test("gera link de WhatsApp para bookingCode existente", async () => {
  const uniqueEmail = `teste.whatsapp.${Date.now()}@example.com`;
  const booking = await createBookingForEmail(uniqueEmail);

  const response = await app.inject({
    method: "GET",
    url: `/bookings/${booking.bookingCode}/whatsapp-link`,
  });

  assert.equal(response.statusCode, 200);
  const body = response.json() as { url: string };
  assert.ok(body.url.includes("wa.me"));
});

test("relatorio summary responde dados do periodo", async () => {
  const token = await loginAsAdmin();

  const response = await app.inject({
    method: "GET",
    url: "/admin/reports/summary?from=2026-01-01&to=2026-12-31",
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  assert.equal(response.statusCode, 200);
  const body = response.json() as {
    from: string;
    to: string;
    totalRevenueCents: number;
    totalBookings: number;
    occupancyRate: number;
    byRoom: unknown[];
  };
  assert.equal(body.from, "2026-01-01");
  assert.equal(body.to, "2026-12-31");
  assert.ok(typeof body.totalRevenueCents === "number");
  assert.ok(typeof body.totalBookings === "number");
  assert.ok(typeof body.occupancyRate === "number");
  assert.ok(Array.isArray(body.byRoom));
});
