# Plano de Refatoracao

## Objetivo
Refatorar o projeto para sair de telas com dados mockados e evoluir para uma base simples, consistente e orientada por contrato, sem hardcode espalhado no frontend e no backend.

## Fontes de Verdade
- `backend/openapi/openapi.yaml`
- `backend/prisma/schema.prisma`
- `backend/prisma/seed.ts`
- `Docs/IMPLEMENT.md`
- `Docs/historia.md`

## Principios
- Simplicidade primeiro: implementar o minimo necessario para o MVP funcionar bem.
- Contrato primeiro: toda API deve seguir `openapi.yaml`.
- Banco como fonte oficial: entidades e relacoes seguem `schema.prisma`.
- Sem hardcode em tela: telefone, CNPJ, links, textos institucionais e regras operacionais devem vir de configuracao centralizada.
- Evolucao incremental: pequenas entregas verificaveis por fase.

## Escopo da Refatoracao
- Backend com persistencia SQLite via Prisma.
- Endpoints minimos para reserva publica e administracao.
- Login administrativo simples.
- Fluxo de pagamento via WhatsApp apos reserva.
- CRUDs administrativos: quartos, reservas, hospedes, servicos.
- Relatorio resumido para dashboard.
- Conteudo institucional alinhado com `historia.md` e `IMPLEMENT.md`.

## Fora de Escopo (agora)
- Integracao com gateway de pagamento.
- Motor avancado de disponibilidade com regras complexas.
- RBAC completo com multiplos perfis finos.
- Auditoria completa e trilha de alteracoes.

## Fases e Metas

## Fase 1 - Fundacao Tecnica
Meta: projeto executando com backend funcional, schema aplicado e seed consistente.
- Definir estrutura minima de backend (server, rotas, camada de dados).
- Aplicar migracoes a partir de `schema.prisma`.
- Executar `seed.ts` sem erro.
- Garantir contrato OpenAPI valido.

## Fase 2 - Fluxo Publico de Reserva
Meta: cliente criar e consultar reserva sem login, com link de WhatsApp para pagamento.
- Criar reserva publica (`POST /bookings`).
- Consulta por email/codigo (`GET /bookings/lookup`).
- Geracao de link WhatsApp (`GET /bookings/{bookingCode}/whatsapp-link`).
- Validar regras basicas de datas e capacidade.

## Fase 3 - Acesso Administrativo
Meta: proteger rotas administrativas com autenticacao simples.
- Login admin (`POST /admin/auth/login`).
- Middleware de autenticacao.
- Bloquear rotas `/admin/*` sem token valido.

## Fase 4 - Gestao Administrativa
Meta: CRUDs essenciais funcionando com persistencia real.
- Quartos (`/admin/rooms`).
- Hospedes (`/admin/guests`).
- Servicos (`/admin/services`).
- Reservas (`/admin/bookings`), incluindo mudanca de status.

## Fase 5 - Relatorios e Dashboard
Meta: dashboard sem numeros fixos e com resumo real do periodo.
- Endpoint `/admin/reports/summary`.
- Calculos de receita, ocupacao e desempenho por quarto.
- Integrar dashboard admin com dados reais.

## Fase 6 - Conteudo e UX sem Hardcode
Meta: landing e fluxos com dados institucionais corretos e centralizados.
- Remover valores fixos de contato/localizacao/CNPJ das telas.
- Popular conteudo institucional via configuracao (perfil do hotel).
- Atualizar footer, telefone, links Google e historico institucional.

## Criterios de Conclusao (Definition of Done)
- Endpoints implementados e aderentes ao `openapi.yaml`.
- Dados persistidos no SQLite via Prisma, sem mocks em producao.
- Sem informacoes institucionais hardcoded em componentes principais.
- Fluxo publico e admin funcionando ponta a ponta.
- Checklist de `Docs/tasks.md` com itens criticos concluidos.

## Riscos e Mitigacoes
- Risco: quebra de contrato entre frontend e backend.
  Mitigacao: validar sempre contra `openapi.yaml`.
- Risco: regressao por troca de dados mockados para reais.
  Mitigacao: migracao por modulo e testes de regressao por fluxo.
- Risco: proliferacao de hardcode em novas telas.
  Mitigacao: policy de configuracao centralizada e revisao de PR.

## Entregaveis
- Backend funcional com SQLite + Prisma.
- Contrato OpenAPI em uso.
- Frontend integrado a API real.
- Conteudo institucional alinhado com documentos.
