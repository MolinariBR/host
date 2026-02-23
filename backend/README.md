# Backend - Hotel Santo Antonio

## Requisitos
- Node.js 20+
- npm 10+

## Setup rapido
1. Instalar dependencias:
```bash
npm install
```
2. Ajustar variaveis de ambiente em `.env` (ou copiar de `.env.example`).
   - Obrigatorias para seed: `DEFAULT_ADMIN_EMAIL`, `DEFAULT_ADMIN_PASSWORD`.
   - Configuracao Prisma central: `prisma.config.ts`.
   - Opcionais para avaliacoes reais do Google na home:
     - `GOOGLE_MAPS_API_KEY`
     - `HOTEL_GOOGLE_PLACE_ID`
     - `GOOGLE_REVIEWS_LANGUAGE`
     - `GOOGLE_REVIEWS_MAX_ITEMS`
3. Gerar client Prisma:
```bash
npm run prisma:generate
```
4. Aplicar migracao:
```bash
npm run prisma:migrate
```
Se o engine de migracao falhar no ambiente, aplique o fallback:
```bash
sqlite3 prisma/dev.db < prisma/migrations/0001_init/migration.sql
```
5. Popular banco:
```bash
npm run prisma:seed
```
6. Subir servidor:
```bash
npm run dev
```

## Endpoints base
- Health: `GET /health`
- OpenAPI: `GET /openapi.yaml`
- Avaliacoes Google (publico): `GET /reviews/google`

## Observacoes
- O contrato da API esta em `backend/openapi/openapi.yaml`.
- O modelo de dados esta em `backend/prisma/schema.prisma`.
- O seed inicial esta em `backend/prisma/seed.ts`.
