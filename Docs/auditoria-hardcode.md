# Auditoria de Hardcode

## Objetivo
Registrar a revisao final de hardcodes sensiveis e parametros de negocio, com as centralizacoes aplicadas.

## Frontend (T16.1)
- Placeholders sensiveis e formatos fixos foram movidos para `src/config/app-config.ts`.
- Itens centralizados:
  - Prefixo de codigo de reserva (`VITE_BOOKING_CODE_PREFIX` com fallback).
  - Placeholder de codigo de reserva.
  - Placeholder de email admin.
  - Placeholder de telefone do hospede.
  - Fallbacks de nome/cidade/estado do hotel.
- Arquivos atualizados:
  - `src/pages/UserLogin.tsx`
  - `src/pages/AdminLogin.tsx`
  - `src/pages/BookingPage.tsx`
  - `src/pages/LandingPage.tsx`
  - `src/components/Navbar.tsx`

## Backend (T16.2)
- Parametros de negocio movidos para configuracao central em `backend/src/config/business.ts`.
- Itens centralizados:
  - Prefixo de `bookingCode` (via env `BOOKING_CODE_PREFIX`).
  - Status inicial da reserva e pagamento.
  - Status de quarto indisponivel para reserva publica.
  - Matriz de transicao valida de status de reserva.
- Aplicado em:
  - `backend/src/utils/booking-code.ts`
  - `backend/src/services/public-bookings.service.ts`
  - `backend/src/services/admin-bookings.service.ts`

## Configuracao (T16.3)
- Variaveis adicionadas/ajustadas em `backend/src/env.ts` e `backend/.env.example`:
  - `DEFAULT_ADMIN_EMAIL`
  - `DEFAULT_ADMIN_PASSWORD` (sem default inseguro em runtime)
  - `BOOKING_CODE_PREFIX`
- Seed atualizado para usar env no admin padrao:
  - `backend/prisma/seed.ts`

## Validacao
- Build frontend: `npm run build` (ok)
- Build backend: `npm run build` (ok)
- Integracao backend: `npm run test:integration` (ok)
